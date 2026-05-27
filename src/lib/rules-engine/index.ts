import type { ScreeningAnswers } from "@/lib/questions/types";
import { SCHENGEN_COUNTRIES, NORDIC_COUNTRY_VALUES } from "@/lib/questions/countries";

export type EligibilityStatus = "ELIGIBLE" | "CONDITIONAL" | "NOT_ELIGIBLE";

export type RulesResult = {
  status: EligibilityStatus;
  hardBlocks: string[];
  riskFlags: string[];
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";
};

export type ReasoningResult = {
  primaryTracks: Array<{ country: string; visaCategory: string; score: number }>;
  alternativeTracks: Array<{ country: string; visaCategory: string; reason: string }>;
  suggestedCountries: Array<{ country: string; score: number; reasons: string[] }>;
  improvementSteps: string[];
};

// ─── Hard Rules Engine ───────────────────────────────────────────────────────

export function runRulesEngine(
  freeAnswers: ScreeningAnswers,
  paidAnswers: ScreeningAnswers
): RulesResult {
  const answers = { ...freeAnswers, ...paidAnswers };
  const hardBlocks: string[] = [];
  const riskFlags: string[] = [];

  // Age check
  if (Number(answers.age) < 18) {
    hardBlocks.push("Applicant must be 18 or older.");
  }

  // Passport check
  if (answers.has_passport === "no" && answers.can_obtain_passport === "no") {
    hardBlocks.push(
      "A valid passport is required for all international travel. Without one, no visa can be issued."
    );
  }

  // Dual citizenship - may not need a visa at all
  const dualCitizenship = answers.dual_citizenship_country as string;
  if (dualCitizenship && dualCitizenship !== "none") {
    riskFlags.push(
      `You hold citizenship of ${dualCitizenship}. If this country is visa-exempt for your destination, you may not need a visa at all. Consider travelling on that passport.`
    );
  }

  // Already in Schengen - may have access
  const residenceCountry = answers.current_residence_country as string;
  if (residenceCountry && SCHENGEN_COUNTRIES.includes(residenceCountry)) {
    const dest = answers.destination_country as string;
    if (dest && SCHENGEN_COUNTRIES.includes(dest)) {
      riskFlags.push(
        `You live in a Schengen country (${residenceCountry}). You may already have access to ${dest} without a new visa. Verify your current permit allows free movement.`
      );
    }
  }

  // Destination = residence block
  if (
    answers.destination_country &&
    answers.current_residence_country &&
    answers.destination_country === answers.current_residence_country
  ) {
    hardBlocks.push(
      `You cannot apply to visit a country you already reside in (${answers.destination_country}).`
    );
  }

  // Immigration violations
  if (answers.has_immigration_violations === "yes") {
    riskFlags.push(
      "Previous overstay, deportation, or entry denial is a major risk factor. Declare truthfully on all applications."
    );
  }

  // Criminal record
  if (answers.has_criminal_record === "yes_pending") {
    riskFlags.push(
      "A pending or recent criminal case is a significant barrier for Nordic visa applications."
    );
  }

  // Passport validity
  if (answers.passport_validity === "under_6m") {
    riskFlags.push(
      "Your passport expires in less than 6 months. Most countries require 6+ months validity beyond your stay."
    );
  }

  // Proof of funds missing
  if (answers.has_proof_of_funds === "no") {
    riskFlags.push(
      "Proof of sufficient funds is a core requirement for all visa categories."
    );
  }

  // Determine status
  if (hardBlocks.length > 0) {
    return { status: "NOT_ELIGIBLE", hardBlocks, riskFlags, confidenceLevel: "HIGH" };
  }

  if (riskFlags.length >= 3) {
    return { status: "CONDITIONAL", hardBlocks, riskFlags, confidenceLevel: "MEDIUM" };
  }

  if (riskFlags.length > 0) {
    return { status: "CONDITIONAL", hardBlocks, riskFlags, confidenceLevel: "MEDIUM" };
  }

  return { status: "ELIGIBLE", hardBlocks, riskFlags, confidenceLevel: "HIGH" };
}

// ─── Reasoning Engine ────────────────────────────────────────────────────────

const COUNTRY_DISPLAY: Record<string, string> = {
  denmark: "Denmark",
  norway: "Norway",
  sweden: "Sweden",
  finland: "Finland",
  iceland: "Iceland",
  faroe_islands: "Faroe Islands",
};

const VISA_CATEGORY_DISPLAY: Record<string, string> = {
  tourist: "Tourist / Short-Stay Visa",
  family_visit: "Family / Friend Visit Visa",
  business: "Business Short-Stay Visa",
  student_degree: "Student Visa (Degree)",
  student_nondegree: "Student Visa (Language / Short Course)",
  scholarship: "Scholarship-Linked Visa",
  internship: "Internship / Trainee Visa",
  au_pair: "Au Pair Visa",
  skilled_worker: "Skilled Worker Visa",
  seasonal_worker: "Seasonal / Temporary Worker Visa",
  cultural_exchange: "Cultural Exchange / Artist / Athlete Visa",
  family_reunification: "Family Reunification Visa",
  medical: "Medical Treatment Visa",
};

export function runReasoningEngine(
  freeAnswers: ScreeningAnswers,
  paidAnswers: ScreeningAnswers,
  rulesResult: RulesResult
): ReasoningResult {
  const answers = { ...freeAnswers, ...paidAnswers };
  const primaryCategory = answers.primary_visa_category as string;
  const destMode = answers.destination_intent_mode as string;
  const destCountry = answers.destination_country as string;
  const openToAlternatives = answers.open_to_alternatives as string;

  const improvementSteps: string[] = [];
  const primaryTracks: ReasoningResult["primaryTracks"] = [];
  const alternativeTracks: ReasoningResult["alternativeTracks"] = [];

  // Score profile (0–100)
  let profileScore = 50;
  if (answers.has_passport === "yes") profileScore += 10;
  if (answers.passport_validity === "over_12m") profileScore += 5;
  if (answers.has_proof_of_funds === "yes") profileScore += 10;
  if (answers.has_birth_certificate === "yes") profileScore += 5;
  if (answers.has_police_clearance === "yes" || answers.has_police_clearance === "can_obtain") profileScore += 5;
  if (answers.docs_in_english === "yes") profileScore += 5;
  if (answers.previous_visa_applications === "approved") profileScore += 10;
  if (answers.has_immigration_violations === "yes") profileScore -= 20;
  if (answers.has_criminal_record === "yes_pending") profileScore -= 15;
  if (answers.has_criminal_record === "yes_resolved") profileScore -= 5;
  profileScore = Math.max(0, Math.min(100, profileScore));

  // Improvement steps
  if (answers.has_passport === "no") {
    improvementSteps.push("Obtain a valid Nigerian international passport as a first step.");
  }
  if (answers.passport_validity === "under_6m") {
    improvementSteps.push("Renew your passport to have at least 12 months validity.");
  }
  if (answers.has_proof_of_funds === "no" || answers.has_proof_of_funds === "unsure") {
    improvementSteps.push("Build up 3–6 months of bank statements showing consistent funds.");
  }
  if (!answers.has_admission_letter || answers.has_admission_letter === "no") {
    if (["student_degree", "student_nondegree", "scholarship", "internship"].includes(primaryCategory)) {
      improvementSteps.push("Secure an admission or acceptance letter from your institution.");
    }
  }
  if (answers.employment_status === "not_working") {
    improvementSteps.push("Demonstrating strong ties to Nigeria (employment, property, family) reduces refusal risk.");
  }
  if (answers.docs_in_english === "no") {
    improvementSteps.push("Get all documents officially translated to English.");
  }

  // Primary tracks - based on chosen destination + category
  const destinations = destCountry
    ? [destCountry]
    : NORDIC_COUNTRY_VALUES;

  const uniqueDestinations: string[] = [];
  for (const d of destinations) {
    if (!uniqueDestinations.includes(d)) uniqueDestinations.push(d);
  }

  for (const country of uniqueDestinations) {
    let score = profileScore;

    // Country-specific boosts
    if (country === "sweden" && answers.has_proof_of_funds === "yes") score += 5;
    if (country === "finland" && answers.scholarship_status === "yes") score += 8;
    if (country === "norway" && answers.employment_status === "employed") score += 5;

    primaryTracks.push({
      country: COUNTRY_DISPLAY[country] || country,
      visaCategory: VISA_CATEGORY_DISPLAY[primaryCategory] || primaryCategory,
      score: Math.min(100, score),
    });
  }

  // Sort primary tracks by score (highest first), deduplicate
  primaryTracks.sort((a, b) => b.score - a.score);

  // Alternative tracks
  if (openToAlternatives !== "no" && rulesResult.status !== "ELIGIBLE") {
    const altCategories: string[] = [];

    if (primaryCategory === "skilled_worker") {
      altCategories.push("student_degree", "internship");
    }
    if (primaryCategory === "tourist") {
      altCategories.push("family_visit", "business");
    }
    if (primaryCategory === "student_degree") {
      altCategories.push("scholarship", "internship");
    }

    for (const alt of altCategories) {
      const altDest = primaryTracks[0]?.country || "Sweden";
      alternativeTracks.push({
        country: altDest,
        visaCategory: VISA_CATEGORY_DISPLAY[alt] || alt,
        reason: `Based on your profile, this category may have higher approval chances.`,
      });
    }
  }

  // Suggested countries (deduplicated, ranked by score + processing speed)
  const suggestedCountries = primaryTracks.map((t) => ({
    country: t.country,
    score: t.score,
    reasons: buildCountryReasons(t.country, answers),
  }));

  return {
    primaryTracks,
    alternativeTracks,
    suggestedCountries,
    improvementSteps,
  };
}

function buildCountryReasons(country: string, answers: ScreeningAnswers): string[] {
  const reasons: string[] = [];
  const prefs = (answers.destination_preferences as string[]) || [];

  if (country === "Sweden" || country === "Finland") {
    reasons.push("Strong study and scholarship infrastructure");
  }
  if (country === "Norway") {
    reasons.push("Recognised work permit scheme for skilled workers");
  }
  if (country === "Denmark") {
    reasons.push("Well-established Schengen application process via VFS Nigeria");
  }
  if (prefs.includes("fast_processing")) {
    reasons.push("Generally faster processing times");
  }
  return reasons.length > 0 ? reasons : ["Meets your stated visa category requirements"];
}
