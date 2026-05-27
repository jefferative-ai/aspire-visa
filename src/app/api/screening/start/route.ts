import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { ScreeningAnswers } from "@/lib/questions/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, freeAnswers } = body as {
      email?: string;
      freeAnswers?: ScreeningAnswers;
    };

    if (!email) {
      return NextResponse.json(
        { error: "An email address is required to start a screening." },
        { status: 400 }
      );
    }

    if (!freeAnswers || typeof freeAnswers !== "object") {
      return NextResponse.json(
        { error: "Screening answers are required." },
        { status: 400 }
      );
    }

    // Attach to user if authenticated
    const session = await getSession();
    const userId = session?.userId ?? null;

    // 72-hour expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72);

    const screening = await db.screening.create({
      data: {
        email: email.trim().toLowerCase(),
        userId,
        phase: "FREE",
        status: "IN_PROGRESS",
        freeAnswers: JSON.stringify(freeAnswers),
        expiresAt,
      },
    });

    return NextResponse.json(
      { screeningId: screening.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("[screening/start]", err);
    return NextResponse.json(
      { error: "Failed to start screening. Please try again." },
      { status: 500 }
    );
  }
}
