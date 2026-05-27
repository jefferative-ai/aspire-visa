import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runRulesEngine, runReasoningEngine } from "@/lib/rules-engine";
import { generateFullReport } from "@/lib/ai/report-generator";
import type { ScreeningAnswers } from "@/lib/questions/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { paidAnswers: incomingPaidAnswers } = body as {
      paidAnswers?: ScreeningAnswers;
    };

    const screening = await db.screening.findUnique({ where: { id } });
    if (!screening) {
      return NextResponse.json(
        { error: "Screening not found." },
        { status: 404 }
      );
    }

    // Enforce payment gate
    if (
      screening.paymentStatus !== "MOCK_SUCCESS" &&
      screening.paymentStatus !== "PAID"
    ) {
      return NextResponse.json(
        { error: "Payment is required to generate the full report." },
        { status: 402 }
      );
    }

    // Parse stored free answers
    let freeAnswers: ScreeningAnswers = {};
    if (screening.freeAnswers) {
      try {
        freeAnswers = JSON.parse(screening.freeAnswers) as ScreeningAnswers;
      } catch {
        // keep empty
      }
    }

    // Merge incoming paid answers with any already stored
    let storedPaidAnswers: ScreeningAnswers = {};
    if (screening.paidAnswers) {
      try {
        storedPaidAnswers = JSON.parse(screening.paidAnswers) as ScreeningAnswers;
      } catch {
        // keep empty
      }
    }
    const paidAnswers: ScreeningAnswers = {
      ...storedPaidAnswers,
      ...(incomingPaidAnswers ?? {}),
    };

    // Persist paid answers
    await db.screening.update({
      where: { id },
      data: {
        paidAnswers: JSON.stringify(paidAnswers),
        phase: "PAID",
        status: "IN_PROGRESS",
      },
    });

    // Run engines
    const rulesResult = runRulesEngine(freeAnswers, paidAnswers);
    const reasoningResult = runReasoningEngine(
      freeAnswers,
      paidAnswers,
      rulesResult
    );

    // Generate report
    const report = await generateFullReport(
      freeAnswers,
      paidAnswers,
      rulesResult,
      reasoningResult,
      id
    );

    // Store completed report
    await db.screening.update({
      where: { id },
      data: {
        report: JSON.stringify(report),
        status: "COMPLETE",
      },
    });

    return NextResponse.json({ success: true, reportId: id });
  } catch (err) {
    console.error("[screening/[id]/report POST]", err);
    return NextResponse.json(
      { error: "Failed to generate report. Please try again." },
      { status: 500 }
    );
  }
}
