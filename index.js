import express from "express";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CLINIC_INFO } from "./clinic-info.js";

const app = express();
app.use(express.json());

// ─── Config ────────────────────────────────────────────────────────────────────
const {
  GEMINI_API_KEY,
  WHATSAPP_TOKEN,
  WHATSAPP_PHONE_ID,
  WEBHOOK_VERIFY_TOKEN,
  RECEPTIONIST_PHONE,   // your staff WhatsApp number e.g. 923001234567
  PORT = 3000,
} = process.env;

// ─── Gemini setup ──────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `
You are a helpful receptionist assistant for ${CLINIC_INFO.clinicName}.
Your ONLY job is to answer patient questions using the clinic information provided below.

STRICT RULES:
1. ONLY use information from the clinic data below. Never make up or guess any information.
2. If a question is not covered in the clinic data, say exactly:
   "I don't have that information. Please call us at ${CLINIC_INFO.phone} or visit us at ${CLINIC_INFO.address}."
3. Be polite, short, and clear. Use simple language.
4. Do NOT discuss anything unrelated to the clinic (no politics, general advice, etc.).
5. If a patient seems to have an emergency, always say: "Please call emergency services (115) immediately."
6. Respond in the same language the patient writes in (Urdu or English).
7. At the end of every first reply to a new patient, add this line:
   "💬 Type *Talk to a Person* anytime to speak with our receptionist."

━━━━━━━━━━━━━━━━━━━━━━━━━━
CLINIC INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(CLINIC_INFO, null, 2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━
`,
});

// ─── State tracking ────────────────────────────────────────────────────────────
const conversations = new Map();  // phone → chat history
const humanMode = new Set();      // phones currently in human handoff mode
const MAX_HISTORY = 10;

function getHistory(phone) {
  if (!conversations.has(phone)) conversations.set(phone, []);
  return conversations.get(phone);
}

function addToHistory(phone, role, text) {
  const history = getHistory(phone);
  history.push({ role, parts: [{ text }] });
  if (history.length > MAX_HISTORY * 2) history.splice(0, 2);
}

// ─── Detect "Talk to a Person" trigger ────────────────────────────────────────
function isHandoffRequest(text) {
  const triggers = [
    "talk to a person",
    "talk to person",
    "speak to a person",
    "speak to person",
    "human",
    "real person",
    "receptionist",
    "انسان سے بات",
    "آدمی سے بات",
    "staff",
  ];
  const normalized = text.toLowerCase().trim();
  return triggers.some(t => normalized.includes(t));
}

// ─── Detect receptionist "Done" command ───────────────────────────────────────
// Receptionist sends: DONE:923001234567 to release a patient back to AI
function isDoneCommand(text) {
  return text.trim().toUpperCase().startsWith("DONE:");
}

// ─── WhatsApp webhook verification ────────────────────────────────────────────
app.get("/webhook", (req, res) => {
  const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ─── Incoming WhatsApp messages ────────────────────────────────────────────────
app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message || message.type !== "text") return;

    const from = message.from;
    const text = message.text.body.trim();

    console.log(`📩 From ${from}: ${text}`);

    // ── Receptionist sends DONE command to release patient back to AI ──────────
    if (from === RECEPTIONIST_PHONE && isDoneCommand(text)) {
      const patientPhone = text.split(":")[1].trim();
      if (humanMode.has(patientPhone)) {
        humanMode.delete(patientPhone);
        await sendWhatsAppMessage(patientPhone,
          `✅ Our receptionist has finished. I'm your AI assistant again!\n\nHow can I help you? 😊`
        );
        await sendWhatsAppMessage(RECEPTIONIST_PHONE,
          `✅ Patient ${patientPhone} returned to AI mode.`
        );
        console.log(`🔄 ${patientPhone} returned to AI mode`);
      }
      return;
    }

    // ── Patient in human mode → forward their messages to receptionist ─────────
    if (humanMode.has(from)) {
      await sendWhatsAppMessage(RECEPTIONIST_PHONE,
        `📨 *Patient message* (${from}):\n${text}\n\n_When finished, send:_\n*DONE:${from}*`
      );
      console.log(`👤 Forwarded ${from} message to receptionist`);
      return;
    }

    // ── Patient requests to talk to a person ───────────────────────────────────
    if (isHandoffRequest(text)) {
      humanMode.add(from);
      conversations.delete(from);

      await sendWhatsAppMessage(from,
        `👋 Sure! I'm connecting you to our receptionist now.\n\nPlease hold on — our team will reply to you shortly.\n\n🕐 *Clinic hours:* ${CLINIC_INFO.hours.monday} (Mon–Thu)`
      );

      await sendWhatsAppMessage(RECEPTIONIST_PHONE,
        `🔔 *Patient wants to talk to a person!*\n\n📱 *Patient number:* +${from}\n\nPlease reply to them directly in WhatsApp.\n\n_When done, send this message:_\n*DONE:${from}*`
      );

      console.log(`🤝 ${from} handed off to receptionist`);
      return;
    }

    // ── Normal AI reply ────────────────────────────────────────────────────────
    const history = getHistory(from);
    const chat = model.startChat({ history });

    const result = await chat.sendMessage(text);
    const reply = result.response.text();

    addToHistory(from, "user", text);
    addToHistory(from, "model", reply);

    await sendWhatsAppMessage(from, reply);
    console.log(`📤 AI replied to ${from}`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
});

// ─── Send a WhatsApp message ───────────────────────────────────────────────────
async function sendWhatsAppMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ─── Admin: view who is in human mode ─────────────────────────────────────────
app.get("/status", (_, res) => {
  res.json({
    humanMode: [...humanMode],
    activeConversations: conversations.size,
  });
});

app.get("/", (_, res) => res.send("✅ Clinic WhatsApp Bot is running."));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
