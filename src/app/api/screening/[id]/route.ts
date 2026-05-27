import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const screening = await db.screening.findUnique({
      where: { id },
      select: {
        id: true,
        phase: true,
        status: true,
        paymentStatus: true,
        freePreview: true,
        report: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        // Deliberately exclude freeAnswers and paidAnswers - only return summary flags
      },
    });

    if (!screening) {
      return NextResponse.json(
        { error: "Screening not found." },
        { status: 404 }
      );
    }

    // Parse preview and report safely, stripping sensitive fields
    let preview: Record<string, unknown> | null = null;
    if (screening.freePreview) {
      try {
        preview = JSON.parse(screening.freePreview) as Record<string, unknown>;
      } catch {
        // ignore parse error
      }
    }

    let reportSummary: Record<string, unknown> | null = null;
    if (screening.report) {
      try {
        const full = JSON.parse(screening.report) as Record<string, unknown>;
        // Return only non-sensitive summary fields
        reportSummary = {
          status: full.status,
          summary: full.summary,
          generated_at: full.generated_at,
          expires_at: full.expires_at,
        };
      } catch {
        // ignore parse error
      }
    }

    return NextResponse.json({
      id: screening.id,
      phase: screening.phase,
      status: screening.status,
      paymentStatus: screening.paymentStatus,
      expiresAt: screening.expiresAt,
      createdAt: screening.createdAt,
      updatedAt: screening.updatedAt,
      preview,
      reportSummary,
    });
  } catch (err) {
    console.error("[screening/[id] GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch screening." },
      { status: 500 }
    );
  }
}
