import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import {
  createPhoneVerificationToken,
  hashVerificationValue,
} from "@/lib/phone-verification";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      verificationId?: unknown;
      challengeToken?: unknown;
    };

    if (
      typeof body.verificationId !== "string" ||
      typeof body.challengeToken !== "string" ||
      body.verificationId.length > 128
    ) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const reference = adminDb.collection("phoneVerifications").doc(body.verificationId);
    const snapshot = await reference.get();
    if (!snapshot.exists) {
      return NextResponse.json(
        { success: false, expired: true, message: "Esta confirmação expirou." },
        { status: 404 },
      );
    }

    const data = snapshot.data();
    if (data?.challengeHash !== hashVerificationValue(body.challengeToken)) {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const expiresAt = data?.expiresAt?.toDate?.();
    if (!(expiresAt instanceof Date) || expiresAt <= new Date()) {
      await reference.delete();
      return NextResponse.json(
        { success: false, expired: true, message: "Esta confirmação expirou." },
        { status: 410 },
      );
    }

    if (data?.status !== "verified" || typeof data.phone !== "string") {
      return NextResponse.json({ success: true, verified: false });
    }

    const verificationToken = createPhoneVerificationToken(data.phone);
    await reference.delete();
    return NextResponse.json({ success: true, verified: true, verificationToken });
  } catch (error) {
    console.error("Erro ao consultar confirmação:", error);
    return NextResponse.json(
      { success: false, message: "Não foi possível consultar a confirmação." },
      { status: 500 },
    );
  }
}
