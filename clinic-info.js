// ════════════════════════════════════════════════════════════════════
//  CLINIC INFORMATION — Edit this file to update what the AI knows
//  The AI will ONLY answer based on what you write here.
// ════════════════════════════════════════════════════════════════════

export const CLINIC_INFO = {

  // ── Basic Info ─────────────────────────────────────────────────────
  clinicName: "Al-Shifa Medical Clinic",
  phone: "+92-51-1234567",
  whatsapp: "+92-300-1234567",
  email: "info@alshifaclinic.com",
  address: "House 12, Street 5, F-8/1, Islamabad",
  googleMapsLink: "https://maps.google.com/?q=F-8+Islamabad",

  // ── Hours ──────────────────────────────────────────────────────────
  hours: {
    monday:    "9:00 AM – 9:00 PM",
    tuesday:   "9:00 AM – 9:00 PM",
    wednesday: "9:00 AM – 9:00 PM",
    thursday:  "9:00 AM – 9:00 PM",
    friday:    "9:00 AM – 1:00 PM, 3:00 PM – 9:00 PM",  // Jumu'ah break
    saturday:  "9:00 AM – 6:00 PM",
    sunday:    "Closed",
  },

  // ── Doctors & Schedules ────────────────────────────────────────────
  doctors: [
    {
      name: "Dr. Ayesha Khan",
      specialty: "General Physician",
      qualification: "MBBS, FCPS",
      availableDays: "Monday – Saturday",
      timing: "9:00 AM – 2:00 PM",
      fee: "Rs. 1,500",
    },
    {
      name: "Dr. Usman Malik",
      specialty: "Cardiologist",
      qualification: "MBBS, FCPS (Cardiology)",
      availableDays: "Tuesday, Thursday, Saturday",
      timing: "3:00 PM – 7:00 PM",
      fee: "Rs. 3,000",
    },
    {
      name: "Dr. Sana Rauf",
      specialty: "Gynecologist",
      qualification: "MBBS, FCPS (Gynae)",
      availableDays: "Monday, Wednesday, Friday",
      timing: "10:00 AM – 2:00 PM",
      fee: "Rs. 2,500",
    },
    {
      name: "Dr. Tariq Hussain",
      specialty: "Pediatrician (Child Specialist)",
      qualification: "MBBS, DCH",
      availableDays: "Monday – Friday",
      timing: "5:00 PM – 9:00 PM",
      fee: "Rs. 2,000",
    },
  ],

  // ── Services ───────────────────────────────────────────────────────
  services: [
    "General checkup & consultation",
    "Blood tests & lab reports",
    "ECG (heart test)",
    "Ultrasound",
    "Blood pressure & diabetes monitoring",
    "Vaccinations & injections",
    "Dressing & minor procedures",
    "Prescription & medicine advice",
    "Gynecology & maternal care",
    "Child health & growth monitoring",
  ],

  // ── Appointments ───────────────────────────────────────────────────
  appointments: {
    howToBook: "Call or WhatsApp us at +92-300-1234567 to book an appointment.",
    walkIn: "Walk-in patients are also welcome, subject to doctor availability.",
    cancellation: "Please inform us at least 2 hours before your appointment if you need to cancel.",
    waitTime: "Average wait time for walk-ins is 20–40 minutes.",
  },

  // ── Lab & Reports ──────────────────────────────────────────────────
  lab: {
    timings: "8:00 AM – 8:00 PM (Monday – Saturday)",
    reportDelivery: "Most reports ready within 24 hours. CBC and blood sugar results within 2 hours.",
    homeCollection: "Home blood sample collection available. Call to arrange.",
    homeCollectionFee: "Rs. 300 extra for home collection.",
  },

  // ── FAQs ───────────────────────────────────────────────────────────
  faqs: [
    {
      question: "Do you accept insurance?",
      answer: "We accept Sehat Sahulat Card and most major private health insurance. Please bring your card on your visit.",
    },
    {
      question: "Is parking available?",
      answer: "Yes, free parking is available in front of the clinic.",
    },
    {
      question: "Do you have an emergency service?",
      answer: "We handle minor emergencies during clinic hours. For life-threatening emergencies please call 115 (Rescue) immediately.",
    },
    {
      question: "Can I get a prescription without visiting?",
      answer: "A physical consultation is required for a new prescription. For prescription renewals, please WhatsApp us the previous prescription.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash, JazzCash, and EasyPaisa.",
    },
  ],
};
