import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import {
  createVerificationChallenge,
  createVerificationCode,
  hashVerificationValue,
  normalizeBrazilianPhone,
} from "@/lib/phone-verification";

export const dynamic = "force-dynamic";
const VERIFICATION_DURATION_MINUTES = 10;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { phone?: unknown };
    if (typeof body.phone !== "string") {
      return NextResponse.json(
        { success: false, message: "Informe um WhatsApp válido." },
        { status: 400 },
      );
    }

    const phone = normalizeBrazilianPhone(body.phone);
    const businessPhone = process.env.WHATSAPP_TEST_PHONE_NUMBER?.replace(/\D/g, "");
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Informe um WhatsApp brasileiro com DDD." },
        { status: 400 },
      );
    }
    if (!businessPhone) throw new Error("WHATSAPP_TEST_PHONE_NUMBER não configurado.");

    const code = createVerificationCode();
    const challengeToken = createVerificationChallenge();
    const reference = adminDb.collection("phoneVerifications").doc();
    const expiresAt = new Date(
      Date.now() + VERIFICATION_DURATION_MINUTES * 60 * 1000,
    );

    await reference.set({
      phone,
      codeHash: hashVerificationValue(code),
      challengeHash: hashVerificationValue(challengeToken),
      status: "pending",
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: FieldValue.serverTimestamp(),
    });

    const message = [
      "Olá, quero confirmar meu WhatsApp para solicitar um orçamento na TransToledo.",
      "",
      `Código: ${code}`,
    ].join("\n");

    return NextResponse.json(
      {
        success: true,
        verificationId: reference.id,
        challengeToken,
        code,
        expiresAt: expiresAt.toISOString(),
        whatsappUrl: `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`,
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Erro ao criar confirmação do WhatsApp:", error);
    return NextResponse.json(
      { success: false, message: "Não foi possível iniciar a confirmação." },
      { status: 500 },
    );
  }
}
