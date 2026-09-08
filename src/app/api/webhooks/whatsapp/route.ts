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
    console.warn("Webhook do WhatsApp recusado: assinatura inválida.");
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as MetaWebhookPayload;
    const messages = payload.entry?.flatMap((entry) =>
      entry.changes?.flatMap((change) => change.value?.messages ?? []) ?? [],
    ) ?? [];
    console.info("Webhook do WhatsApp recebido", {
      messageCount: messages.length,
    });
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
  if (!sender || !code) {
    console.info("Webhook sem mensagem de texto ou sem código TT válido.");
    return;
  }

  const snapshot = await adminDb
    .collection("phoneVerifications")
    .where("codeHash", "==", hashVerificationValue(code))
    .limit(1)
    .get();
  const document = snapshot.docs[0];
  if (!document) {
    console.info("Código recebido não encontrado ou já consumido.");
    return;
  }

  const data = document.data();
  const expiresAt = data.expiresAt?.toDate?.();
  if (data.status !== "pending") {
    console.info("Código recebido não está pendente.");
    return;
  }
  if (data.phone !== sender) {
    console.warn("Telefone remetente não corresponde ao orçamento", {
      expectedEnding: String(data.phone ?? "").slice(-4),
      senderEnding: sender.slice(-4),
    });
    return;
  }
  if (!(expiresAt instanceof Date) || expiresAt <= new Date()) {
    console.info("Código recebido está expirado.");
    return;
  }

  await document.ref.update({
    status: "verified",
    verifiedAt: FieldValue.serverTimestamp(),
  });
  console.info("Telefone verificado com sucesso", {
    phoneEnding: sender.slice(-4),
  });
}
