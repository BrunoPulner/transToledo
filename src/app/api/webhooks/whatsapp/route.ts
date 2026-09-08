import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { hashVerificationValue, verifyMetaSignature } from "@/lib/phone-verification";

export const dynamic = "force-dynamic";

type MetaMessage = { from?: string; text?: { body?: string } };
type MetaWebhookPayload = {
  entry?: Array<{
    changes?: Array<{ value?: { messages?: MetaMessage[] } }>;
  }>;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json({ success: false }, { status: 403 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  if (!verifyMetaSignature(rawBody, signature)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as MetaWebhookPayload;
    const messages = payload.entry?.flatMap((entry) =>
      entry.changes?.flatMap((change) => change.value?.messages ?? []) ?? [],
    ) ?? [];
    await Promise.all(messages.map(processMessage));
  } catch (error) {
    console.error("Erro ao processar webhook do WhatsApp:", error);
  }

  return NextResponse.json({ success: true });
}

async function processMessage(message: MetaMessage) {
  // O Firebase Admin é carregado apenas quando uma mensagem realmente chega.
  // Dessa forma, a validação GET inicial da Meta não depende do Firestore.
  const { adminDb } = await import("@/lib/firebase/admin");

  const sender = message.from ? `+${message.from.replace(/\D/g, "")}` : null;
  const code = (message.text?.body ?? "")
    .toUpperCase()
    .match(/TT-[A-HJ-NP-Z2-9]{6}/)?.[0];
  if (!sender || !code) return;

  const snapshot = await adminDb
    .collection("phoneVerifications")
    .where("codeHash", "==", hashVerificationValue(code))
    .limit(1)
    .get();
  const document = snapshot.docs[0];
  if (!document) return;

  const data = document.data();
  const expiresAt = data.expiresAt?.toDate?.();
  if (
    data.status !== "pending" ||
    data.phone !== sender ||
    !(expiresAt instanceof Date) ||
    expiresAt <= new Date()
  ) return;

  await document.ref.update({
    status: "verified",
    verifiedAt: FieldValue.serverTimestamp(),
  });
}
