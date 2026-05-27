import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateFreePreview } from "@/lib/ai/report-generator";
import type { ScreeningAnswers } from "@/lib/questions/types";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const screening = await db.screening.findUnique({ where: { id } });
    if (!screening) {
      return NextResponse.json(
        { error: "Screening not found." },
        { status: 404 }
      );
    }

    let freeAnswers: ScreeningAnswers = {};
    if (screening.freeAnswers) {
      try {
        freeAnswers = JSON.parse(screening.freeAnswers) as ScreeningAnswers;
      } catch {
        // keep empty object
      }
    }

    const preview = await generateFreePreview(freeAnswers);
    const previewJson = JSON.stringify(preview);

    await db.screening.update({
      where: { id },
      data: { freePreview: previewJson },
    });

    return NextResponse.json({ preview });
  } catch (err) {
    console.error("[screening/[id]/preview POST]", err);
    return NextResponse.json(
      { error: "Failed to generate preview." },
      { status: 500 }
    );
  }
}
