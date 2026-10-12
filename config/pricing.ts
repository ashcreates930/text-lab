// Plans shown on the pricing page and in the waitlist form. yearly is the list price used for the owner's Pitch tab
// ("stated purchase intent"); District is priced per student per year; Professional development is one-time training.
export type PlanId = "explorer" | "individual" | "family" | "school" | "district" | "pilot" | "pd";
export type Plan = {
  id: PlanId; name: string; price: string; cadence: string; detail: string; features: readonly string[];
  yearly: number | null; perStudentYearly?: number; studentsRequired: boolean; institutional: boolean; highlight?: boolean;
};

export const plans: readonly Plan[] = [
  { id: "explorer", name: "Explorer", price: "Free", cadence: "", detail: "A place to begin", features: ["1 world", "1 class", "Up to 30 students"], yearly: 0, studentsRequired: false, institutional: false },
  { id: "individual", name: "Individual Teacher", price: "$9", cadence: "/ month · or $79 / year", detail: "For your classroom", features: ["All worlds", "Unlimited classes, up to 150 students", "Reading Resource Report"], yearly: 79, studentsRequired: true, institutional: false, highlight: true },
  { id: "family", name: "Family & Microschool", price: "$5", cadence: "/ month · or $49 / year", detail: "For learning at home", features: ["All worlds", "Up to 6 learners", "Progress reports for parents"], yearly: 49, studentsRequired: true, institutional: false },
  { id: "school", name: "School", price: "$1,500", cadence: "/ year", detail: "For a whole school", features: ["Up to 25 teachers and 300 students", "Admin view", "All worlds", "Live Lessons"], yearly: 1500, studentsRequired: true, institutional: true },
  { id: "district", name: "District", price: "From $5", cadence: "per student / year", detail: "Built around your needs", features: ["Full reporting", "Onboarding", "Professional development"], yearly: null, perStudentYearly: 5, studentsRequired: true, institutional: true },
  { id: "pilot", name: "Founding school pilot", price: "$500", cadence: "for the 2026-27 school year", detail: "Limited to 5 schools", features: ["$500 for the 2026-27 school year", "Limited to 5 schools", "Onboarding and a feedback session"], yearly: 500, studentsRequired: true, institutional: true },
  { id: "pd", name: "Professional development", price: "$1,500", cadence: "virtual half day · on-site full day from $3,500", detail: "Training led by a classroom teacher", features: ["Led by a classroom teacher", "Virtual half day: $1,500", "On-site full day: from $3,500"], yearly: null, studentsRequired: false, institutional: false },
];
export const planCards = plans.filter((p) => !["pilot", "pd"].includes(p.id));
export const planById = (id: string | null | undefined) => plans.find((p) => p.id === id);

// Kept for older screens that list plans by name.
export const pricing = planCards.map(({ name, price, cadence, detail, features }) => ({ name, price, cadence, detail, features }));
