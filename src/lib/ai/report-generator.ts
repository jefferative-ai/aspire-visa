import Anthropic from "@anthropic-ai/sdk";
import type { ScreeningAnswers } from "@/lib/questions/types";
import type { RulesResult, ReasoningResult } from "@/lib/rules-engine";

export type FullReport = {
  report_id: string;
  generated_at: string;
  expires_at: string;
  status: "ELIGIBLE" | "CONDITIONAL" | "NOT_ELIGIBLE";
  summary: {
    headline: string;
    plain_language_explanation: string;
  };
  eligibility: {
    hard_blocks: string[];
    risk_flags: string[];
    confidence_level: string;
  };
  checklist: {
    required_documents: string[];
    missing_items: string[];
    optional_strengtheners: string[];
  };
  recommendations: {
    primary_visa_tracks: Array<{ country: string; visa_category: string; score: number }>;
    alternative_visa_tracks: Array<{ country: string; visa_category: string; reason: string }>;
    suggested_countries: Array<{ country: string; score: number; reasons: string[] }>;
  };
  improvement_steps: string[];
  next_actions: {
    apply_independently: boolean;
    book_consultation: boolean;
    message: string;
  };
  disclaimers: {
    no_guarantee: true;
    advisory_only: true;
    valid_for_days: 90;
  };
  audit: {
    question_registry_version: string;
    logic_spec_version: string;
    generated_by: string;
  };
};

// ─── Mock data builders ───────────────────────────────────────────────────────

function buildMockPreview(answers: ScreeningAnswers) {
  const category = (answers.primary_visa_category as string) ?? "tourist";
  const dest = (answers.destination_country as string) ?? "denmark";
  const destLabel = dest.charAt(0).toUpperCase() + dest.slice(1).replace("_", " ");

  const categoryLabels: Record<string, string> = {
    tourist: "Short-Stay Tourist Visa",
    student_degree: "Student Visa (Degree)",
    skilled_worker: "Skilled Worker Visa",
    family_visit: "Family / Friend Visit Visa",
    business: "Business Short-Stay Visa",
    scholarship: "Scholarship-Linked Visa",
    internship: "Internship / Trainee Visa",
    au_pair: "Au Pair Visa",
    seasonal_worker: "Seasonal Worker Visa",
    cultural_exchange: "Cultural Exchange Visa",
    family_reunification: "Family Reunification Visa",
    medical: "Medical Treatment Visa",
  };

  return {
    suggested_tracks: [
      categoryLabels[category] ?? "Short-Stay Visa",
      "Alternative routes may also apply",
    ],
    what_you_need_next: [
      "Valid passport (minimum 6 months validity beyond your stay)",
      "Proof of sufficient funds (3–6 months bank statements)",
      "Travel insurance covering your full stay",
      category.includes("student") ? "Admission or acceptance letter from institution" : "Purpose-specific supporting documents",
      `${destLabel} visa application form (via VFS Global or embassy)`,
    ],
    cta: `Unlock your full ${destLabel} eligibility report - see exactly what you need, what's missing, and your realistic chances of approval.`,
    disclaimer: "This preview is informational only and does not constitute legal advice or a guarantee of visa approval.",
  };
}

function buildMockFullReport(
  freeAnswers: ScreeningAnswers,
  rulesResult: RulesResult,
  reasoningResult: ReasoningResult,
  reportId: string
): FullReport {
  const name = (freeAnswers.full_name as string) ?? "Applicant";
  const dest = (freeAnswers.destination_country as string) ?? "denmark";
  const destLabel = dest.charAt(0).toUpperCase() + dest.slice(1).replace("_", " ");
  const category = (freeAnswers.primary_visa_category as string) ?? "tourist";
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);

  const headlines: Record<string, Record<string, string>> = {
    ELIGIBLE: {
      tourist: `${name}, your profile meets the core requirements for a ${destLabel} short-stay visa.`,
      student_degree: `${name}, you have a strong foundation for a ${destLabel} student visa application.`,
      skilled_worker: `${name}, your employment profile is competitive for a ${destLabel} work permit.`,
      default: `${name}, your profile is well-positioned for this visa application.`,
    },
    CONDITIONAL: {
      tourist: `${name}, you can apply - but two things need attention before you do.`,
      student_degree: `${name}, you're on the right track, but your application needs strengthening first.`,
      skilled_worker: `${name}, you're eligible in principle - close the gaps below to improve your chances.`,
      default: `${name}, you're conditionally eligible. A few key items need to be resolved.`,
    },
    NOT_ELIGIBLE: {
      default: `${name}, there are significant barriers that must be resolved before you apply.`,
    },
  };

  const explanations: Record<string, string> = {
    ELIGIBLE: `Based on your answers, you meet the fundamental requirements for a ${destLabel} ${category.replace(/_/g, " ")} visa. Your passport is valid, you have proof of funds, and no major red flags were detected. You should proceed with gathering your documents and submitting your application. Remember that embassies make final decisions - this report is a guide, not a guarantee.`,
    CONDITIONAL: `You are eligible to apply, but there are one or more gaps in your profile that could lead to a refusal if not addressed. The items flagged below are not insurmountable - most can be resolved within a few weeks. We recommend addressing all flagged items before submitting your application.`,
    NOT_ELIGIBLE: `Based on your answers, there are hard blocks preventing you from qualifying for this visa at this time. These are not permanent - they are specific issues that, once resolved, would make you eligible to reapply. Review the hard blocks section carefully and use the improvement steps as your action plan.`,
  };

  const requiredDocs: Record<string, string[]> = {
    tourist: [
      "Valid Nigerian international passport (6+ months validity)",
      "Completed visa application form",
      "Recent passport photographs (biometric)",
      "Bank statements (last 3–6 months, showing consistent funds)",
      "Travel insurance covering full stay",
      "Proof of accommodation (hotel booking or invitation letter)",
      "Proof of ties to Nigeria (employment letter, property, family)",
      "Return flight booking or itinerary",
    ],
    student_degree: [
      "Valid Nigerian international passport (6+ months validity)",
      "Acceptance or admission letter from institution",
      "Proof of tuition fee payment or scholarship award",
      "Bank statements (yours or sponsor's, last 3–6 months)",
      "Academic transcripts and certificates",
      "Language proficiency certificate (IELTS/Duolingo if applicable)",
      "Completed visa application form",
      "Birth certificate",
    ],
    skilled_worker: [
      "Valid Nigerian international passport (6+ months validity)",
      "Signed employment contract or job offer letter",
      "Proof of professional qualifications / degree certificates",
      "Employer registration documents",
      "Bank statements (3–6 months)",
      "Completed visa/work permit application form",
      "Police clearance certificate",
      "Medical certificate (if required by destination country)",
    ],
  };

  const missingItems = rulesResult.riskFlags.length > 0
    ? ["Proof of sufficient funds - bank statements not confirmed", "Police clearance certificate - not yet obtained"]
    : ["Travel insurance - not yet confirmed", "Return ticket booking - to be arranged"];

  const shouldSuggestConsultation =
    rulesResult.status === "ELIGIBLE" ||
    (rulesResult.status === "CONDITIONAL" && rulesResult.riskFlags.length <= 2);

  return {
    report_id: reportId,
    generated_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    status: rulesResult.status,
    summary: {
      headline:
        headlines[rulesResult.status]?.[category] ??
        headlines[rulesResult.status]?.default ??
        `Eligibility assessment complete for ${destLabel}.`,
      plain_language_explanation: explanations[rulesResult.status] ?? explanations.CONDITIONAL,
    },
    eligibility: {
      hard_blocks: rulesResult.hardBlocks,
      risk_flags: rulesResult.riskFlags,
      confidence_level: rulesResult.confidenceLevel,
    },
    checklist: {
      required_documents: requiredDocs[category] ?? requiredDocs.tourist,
      missing_items: missingItems,
      optional_strengtheners: [
        "Letter of sponsorship from family member abroad (strengthens financial case)",
        "Previous approved Schengen visa copy (demonstrates travel history)",
        "Property ownership documents in Nigeria (demonstrates home ties)",
      ],
    },
    recommendations: {
      primary_visa_tracks: reasoningResult.primaryTracks.map((t) => ({
        country: t.country,
        visa_category: t.visaCategory,
        score: t.score,
      })),
      alternative_visa_tracks: reasoningResult.alternativeTracks.map((t) => ({
        country: t.country,
        visa_category: t.visaCategory,
        reason: t.reason,
      })),
      suggested_countries: reasoningResult.suggestedCountries,
    },
    improvement_steps: reasoningResult.improvementSteps.length > 0
      ? reasoningResult.improvementSteps
      : [
          "Maintain a consistent bank balance for at least 3 months before applying.",
          "Obtain a police clearance certificate from the Nigerian Police Force.",
          "Ensure your passport has at least 12 months validity before applying.",
          "Gather all documents and have them translated to English by a certified translator.",
        ],
    next_actions: {
      apply_independently: rulesResult.status === "ELIGIBLE",
      book_consultation: shouldSuggestConsultation,
      message:
        rulesResult.status === "ELIGIBLE"
          ? "Your profile is strong enough to apply now. Gather your checklist documents and submit."
          : "Address the flagged items first, then apply. A consultation can help you prioritise.",
    },
    disclaimers: {
      no_guarantee: true,
      advisory_only: true,
      valid_for_days: 90,
    },
    audit: {
      question_registry_version: "v1.0",
      logic_spec_version: "v1.0",
      generated_by: "mock",
    },
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateFreePreview(
  freeAnswers: ScreeningAnswers
): Promise<{
  suggested_tracks: string[];
  what_you_need_next: string[];
  cta: string;
  disclaimer: string;
}> {
  // Use mock when no API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return buildMockPreview(freeAnswers);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const answers = freeAnswers;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: `You are a visa eligibility advisor. Based on this FREE screening data, generate a brief non-binding preview.

Applicant: ${answers.age} year old Nigerian, residing in ${answers.lives_in_nigeria === "yes" ? "Nigeria" : answers.current_residence_country}.
Wants to: ${answers.primary_visa_category} in ${answers.destination_country || "Nordic countries"}.
Stay duration: ${answers.intended_stay_duration}.
Open to alternatives: ${answers.open_to_alternatives}.

Return ONLY valid JSON (no markdown):
{
  "suggested_tracks": ["2-3 visa type names that seem most relevant"],
  "what_you_need_next": ["3-5 key document types they should start gathering"],
  "cta": "One compelling sentence encouraging them to get the full report",
  "disclaimer": "One short disclaimer sentence"
}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected");
    return JSON.parse(content.text) as Awaited<ReturnType<typeof generateFreePreview>>;
  } catch {
    return buildMockPreview(freeAnswers);
  }
}

export async function generateFullReport(
  freeAnswers: ScreeningAnswers,
  paidAnswers: ScreeningAnswers,
  rulesResult: RulesResult,
  reasoningResult: ReasoningResult,
  reportId: string
): Promise<FullReport> {
  // Use mock when no API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return buildMockFullReport(freeAnswers, rulesResult, reasoningResult, reportId);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const answers = { ...freeAnswers, ...paidAnswers };

  const prompt = `You are an expert visa eligibility advisor specialising in Nordic countries for Nigerian applicants.

## Applicant Profile
- Name: ${answers.full_name || "Applicant"}
- Age: ${answers.age} | Citizenship: ${answers.citizenship_country}
- Residence: ${answers.lives_in_nigeria === "yes" ? "Nigeria" : answers.current_residence_country}
- Permit type: ${answers.residence_permit_type || "N/A"}
- Dual citizenship: ${answers.dual_citizenship_country || "None"}
- Visa category: ${answers.primary_visa_category}
- Destination: ${answers.destination_country || "not specified"}
- Employment: ${answers.employment_status} | Education: ${answers.highest_education}
- Has passport: ${answers.has_passport} | Proof of funds: ${answers.has_proof_of_funds}
- Prior visas: ${answers.previous_visa_applications} | Violations: ${answers.has_immigration_violations}
- Criminal record: ${answers.has_criminal_record}

## Rules Engine
Status: ${rulesResult.status}
Hard blocks: ${rulesResult.hardBlocks.join("; ") || "None"}
Risk flags: ${rulesResult.riskFlags.join("; ") || "None"}

## Reasoning Engine
Primary tracks: ${JSON.stringify(reasoningResult.primaryTracks)}
Improvement steps: ${reasoningResult.improvementSteps.join("; ")}

Return ONLY valid JSON (no markdown):
{
  "headline": "One powerful sentence summarising the result",
  "plain_language_explanation": "3-5 sentences in second person, encouraging but honest",
  "required_documents": ["list of required docs for their category and destination"],
  "missing_items": ["docs they don't have based on their answers"],
  "optional_strengtheners": ["2-3 extra docs that would strengthen the application"],
  "apply_independently_message": "One sentence on whether to apply now or improve first"
}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    const parsed = JSON.parse(content.text) as {
      headline: string;
      plain_language_explanation: string;
      required_documents: string[];
      missing_items: string[];
      optional_strengtheners: string[];
      apply_independently_message: string;
    };

    const shouldSuggestConsultation =
      rulesResult.status === "ELIGIBLE" ||
      (rulesResult.status === "CONDITIONAL" && rulesResult.riskFlags.length <= 2);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    return {
      report_id: reportId,
      generated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      status: rulesResult.status,
      summary: {
        headline: parsed.headline,
        plain_language_explanation: parsed.plain_language_explanation,
      },
      eligibility: {
        hard_blocks: rulesResult.hardBlocks,
        risk_flags: rulesResult.riskFlags,
        confidence_level: rulesResult.confidenceLevel,
      },
      checklist: {
        required_documents: parsed.required_documents || [],
        missing_items: parsed.missing_items || [],
        optional_strengtheners: parsed.optional_strengtheners || [],
      },
      recommendations: {
        primary_visa_tracks: reasoningResult.primaryTracks.map((t) => ({
          country: t.country,
          visa_category: t.visaCategory,
          score: t.score,
        })),
        alternative_visa_tracks: reasoningResult.alternativeTracks.map((t) => ({
          country: t.country,
          visa_category: t.visaCategory,
          reason: t.reason,
        })),
        suggested_countries: reasoningResult.suggestedCountries,
      },
      improvement_steps: reasoningResult.improvementSteps,
      next_actions: {
        apply_independently: rulesResult.status === "ELIGIBLE",
        book_consultation: shouldSuggestConsultation,
        message: parsed.apply_independently_message,
      },
      disclaimers: {
        no_guarantee: true,
        advisory_only: true,
        valid_for_days: 90,
      },
      audit: {
        question_registry_version: "v1.0",
        logic_spec_version: "v1.0",
        generated_by: "claude-sonnet-4-20250514",
      },
    };
  } catch {
    return buildMockFullReport(freeAnswers, rulesResult, reasoningResult, reportId);
  }
}
