import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { ScreeningAnswers } from "@/lib/questions/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { phase, answers } = body as {
      phase?: "FREE" | "PAID";
      answers?: ScreeningAnswers;
    };

    if (!phase || !answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "phase and answers are required." },
        { status: 400 }
      );
    }

    if (phase !== "FREE" && phase !== "PAID") {
      return NextResponse.json(
        { error: "phase must be FREE or PAID." },
        { status: 400 }
      );
    }

    const screening = await db.screening.findUnique({ where: { id } });
    if (!screening) {
      return NextResponse.json(
        { error: "Screening not found." },
        { status: 404 }
      );
    }

    const updateData =
      phase === "FREE"
        ? { freeAnswers: JSON.stringify(answers), phase: "FREE" as const }
        : { paidAnswers: JSON.stringify(answers), phase: "PAID" as const };

    const updated = await db.screening.update({
      where: { id },
      data: updateData,
      select: { id: true, phase: true, updatedAt: true },
    });

    return NextResponse.json({ success: true, screening: updated });
  } catch (err) {
    console.error("[screening/[id]/answers PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update answers." },
      { status: 500 }
    );
  }
}
