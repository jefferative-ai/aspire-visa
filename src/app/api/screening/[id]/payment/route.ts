import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { consent } = body as { consent?: boolean };

    if (consent !== true) {
      return NextResponse.json(
        {
          error:
            "You must accept the advisory disclaimer (consent: true) before proceeding.",
        },
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

    if (
      screening.paymentStatus === "MOCK_SUCCESS" ||
      screening.paymentStatus === "PAID"
    ) {
      return NextResponse.json({ success: true, alreadyPaid: true });
    }

    await db.screening.update({
      where: { id },
      data: {
        paymentStatus: "MOCK_SUCCESS",
        consentAt: new Date(),
        phase: "PAID",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[screening/[id]/payment POST]", err);
    return NextResponse.json(
      { error: "Failed to process payment. Please try again." },
      { status: 500 }
    );
  }
}
