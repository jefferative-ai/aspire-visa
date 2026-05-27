import type { Question } from "./types";
import { NORDIC_DESTINATIONS, WORLD_COUNTRIES, NORDIC_COUNTRY_VALUES } from "./countries";

export const FREE_QUESTIONS: Question[] = [
  // ─── A1: Personal Information ───────────────────────────────────────────────
  {
    id: "F-A1-01",
    section: "A1",
    type: "text",
    question: "What is your full legal name?",
    subtitle: "As it appears in your passport.",
    placeholder: "e.g. Amara Okonkwo",
    storesAs: "full_name",
    required: true,
  },
  {
    id: "F-A1-03",
    section: "A1",
    type: "number",
    question: "How old are you?",
    subtitle: "You must be 18 or older to use this service.",
    placeholder: "e.g. 28",
    storesAs: "age",
    required: true,
    validation: { min: 18, max: 99 },
    hardBlockIf: (answers) => {
      const age = Number(answers.age);
      if (age < 18) return "You must be 18 or older to use this service.";
      return null;
    },
  },
  {
    id: "F-A1-04",
    section: "A1",
    type: "single",
    question: "What is your gender?",
    storesAs: "gender",
    required: true,
    options: [
      { label: "Female", value: "female" },
      { label: "Male", value: "male" },
      { label: "Prefer not to say", value: "prefer_not_to_say" },
    ],
  },
  {
    id: "F-A1-05",
    section: "A1",
    type: "dropdown",
    question: "What is your country of citizenship?",
    subtitle: "Select the country that issued your passport.",
    storesAs: "citizenship_country",
    required: true,
    options: WORLD_COUNTRIES,
  },
  {
    id: "F-A1-06",
    section: "A1",
    type: "yesno",
    question: "Do you currently live in Nigeria?",
    storesAs: "lives_in_nigeria",
    required: true,
  },
  {
    id: "F-A1-06A",
    section: "A1",
    type: "dropdown",
    question: "Which country do you currently live in?",
    subtitle: "This affects your application route and embassy.",
    storesAs: "current_residence_country",
    required: true,
    options: WORLD_COUNTRIES,
    showIf: (answers) => answers.lives_in_nigeria === "no",
  },
  {
    id: "F-A1-07",
    section: "A1",
    type: "dropdown",
    question: "Do you hold citizenship of any other country?",
    subtitle: "A second passport may change your eligibility entirely.",
    storesAs: "dual_citizenship_country",
    required: false,
    options: [
      { label: "No, Nigeria only", value: "none" },
      ...WORLD_COUNTRIES.filter((c) => c.value !== "nigeria"),
    ],
  },
  {
    id: "F-A1-08",
    section: "A1",
    type: "dropdown",
    question: "How long have you lived in your current country of residence?",
    storesAs: "residence_duration",
    required: true,
    options: [
      { label: "Less than 6 months", value: "under_6m" },
      { label: "6 – 12 months", value: "6_12m" },
      { label: "1 – 3 years", value: "1_3y" },
      { label: "More than 3 years", value: "3y_plus" },
    ],
    showIf: (answers) => answers.lives_in_nigeria === "no",
  },
  {
    id: "F-A1-09",
    section: "A1",
    type: "dropdown",
    question: "What type of residence status do you hold there?",
    subtitle: "This affects which visa paths are available to you.",
    storesAs: "residence_permit_type",
    required: true,
    options: [
      { label: "Nigerian citizen, no foreign permit", value: "none" },
      { label: "Temporary residence (student/work/visitor)", value: "temporary" },
      { label: "Permanent residence", value: "permanent" },
      { label: "In the process of getting one", value: "in_process" },
    ],
    showIf: (answers) => answers.lives_in_nigeria === "no",
  },

  // ─── A2: Travel Purpose ──────────────────────────────────────────────────────
  {
    id: "F-A2-01",
    section: "A2",
    type: "single",
    question: "What is your primary reason for wanting to travel?",
    subtitle: "Choose the one that fits best. We'll explore alternatives too.",
    storesAs: "primary_visa_category",
    required: true,
    options: [
      { label: "Tourism / Holiday", value: "tourist" },
      { label: "Visiting family or friends", value: "family_visit" },
      { label: "Business or conference", value: "business" },
      { label: "University or college degree", value: "student_degree" },
      { label: "Language course or short study", value: "student_nondegree" },
      { label: "Scholarship programme", value: "scholarship" },
      { label: "Internship or traineeship", value: "internship" },
      { label: "Au Pair", value: "au_pair" },
      { label: "Skilled work / Employment", value: "skilled_worker" },
      { label: "Seasonal or temporary work", value: "seasonal_worker" },
      { label: "Cultural exchange / Artist / Athlete", value: "cultural_exchange" },
      { label: "Family reunification", value: "family_reunification" },
      { label: "Medical treatment", value: "medical" },
    ],
  },
  {
    id: "F-A2-02",
    section: "A2",
    type: "single",
    question: "Are you open to alternative visa options?",
    subtitle: "We may find a better route than your first choice.",
    storesAs: "open_to_alternatives",
    required: true,
    options: [
      { label: "Yes, show me alternatives too", value: "yes" },
      { label: "Only my chosen category, please", value: "no" },
    ],
  },
  {
    id: "F-A2-03",
    section: "A2",
    type: "single",
    question: "What is the intention behind this trip?",
    storesAs: "relocation_intent",
    required: true,
    options: [
      { label: "One-time visit or short stay", value: "one_time" },
      { label: "I might consider relocating", value: "maybe_relocate" },
      { label: "I definitely want to relocate", value: "relocate" },
    ],
  },

  // ─── A3: Destination ─────────────────────────────────────────────────────────
  {
    id: "F-A3-01",
    section: "A3",
    type: "single",
    question: "Do you have a specific destination country in mind?",
    storesAs: "destination_intent_mode",
    required: true,
    options: [
      { label: "Yes, I know where I want to go", value: "specific" },
      { label: "I have a preference but want to compare options", value: "compare" },
    ],
  },
  {
    id: "F-A3-02",
    section: "A3",
    type: "single",
    question: "Which country do you want to go to?",
    subtitle: "We cover all Nordic destinations.",
    storesAs: "destination_country",
    required: true,
    options: NORDIC_DESTINATIONS,
    showIf: (answers) =>
      answers.destination_intent_mode === "specific" ||
      answers.destination_intent_mode === "compare",
    hardBlockIf: (answers) => {
      const dest = answers.destination_country as string;
      const residence = answers.current_residence_country as string;
      if (dest && residence && NORDIC_COUNTRY_VALUES.includes(residence) && dest === residence) {
        return `You already live in ${dest.charAt(0).toUpperCase() + dest.slice(1)}. Please choose a different destination.`;
      }
      return null;
    },
  },
  {
    id: "F-A3-03",
    section: "A3",
    type: "multi",
    question: "What matters most to you in a destination?",
    subtitle: "Select all that apply. This helps us rank options for you.",
    storesAs: "destination_preferences",
    required: false,
    options: [
      { label: "High approval chances", value: "approval_chances" },
      { label: "Lower cost of living", value: "low_cost" },
      { label: "Fast visa processing", value: "fast_processing" },
      { label: "Ability to work", value: "work_ability" },
      { label: "Study opportunities", value: "study" },
      { label: "Family reunification options", value: "family" },
      { label: "Long-term residence pathway", value: "long_term" },
    ],
    showIf: (answers) =>
      answers.destination_intent_mode === "compare",
  },

  // ─── A4: Stay Duration ────────────────────────────────────────────────────────
  {
    id: "F-A4-01",
    section: "A4",
    type: "single",
    question: "How long do you plan to stay?",
    storesAs: "intended_stay_duration",
    required: true,
    options: [
      { label: "Less than 14 days", value: "under_14d" },
      { label: "Up to 30 days", value: "under_30d" },
      { label: "1 – 3 months", value: "1_3m" },
      { label: "3 – 6 months", value: "3_6m" },
      { label: "More than 6 months", value: "6m_plus" },
      { label: "Permanently / Long-term", value: "permanent" },
    ],
  },
];

export const FREE_SECTIONS = [
  { id: "A1", label: "About You", questionCount: 0 },
  { id: "A2", label: "Travel Purpose", questionCount: 0 },
  { id: "A3", label: "Destination", questionCount: 0 },
  { id: "A4", label: "Stay Duration", questionCount: 0 },
];
