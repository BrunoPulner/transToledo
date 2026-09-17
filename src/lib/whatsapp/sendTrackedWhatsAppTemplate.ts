import "server-only";

import { createHash } from "node:crypto";

import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";
import { normalizeBrazilianPhone } from "@/lib/phone-verification";
import {
  sendWhatsAppTemplate,
} from "@/lib/whatsapp/sendWhatsAppTemplate";
import type {
  WhatsAppMessageEvent,
  WhatsAppTemplateKey,
} from "@/types/whatsapp-message";

type SendTrackedWhatsAppTemplateInput = {
  event: WhatsAppMessageEvent;
  template: WhatsAppTemplateKey;
  to: string;
  parameters: string[];
  idempotencyKey: string;
  quoteRequestId?: string | null;
  scheduleId?: string | null;
};

export type TrackedWhatsAppSendResult =
  | {
      status: "sent";
      logId: string;
      messageId: string;
    }
  | {
      status: "duplicate";
      logId: string;
    };

/*
 * Registra e envia uma mensagem automática.
 *
 * A chave de idempotência vira um ID determinístico no Firestore. Assim,
 * duas execuções do mesmo evento não conseguem enviar a mensagem duas vezes.
 */
export async function sendTrackedWhatsAppTemplate({
  event,
  template,
  to,
  parameters,
  idempotencyKey,
  quoteRequestId = null,
  scheduleId = null,
}: SendTrackedWhatsAppTemplateInput): Promise<TrackedWhatsAppSendResult> {
  const normalizedRecipient = normalizeBrazilianPhone(to);

  if (!normalizedRecipient) {
    throw new Error(
      "Não foi possível registrar a mensagem: destinatário inválido.",
    );
  }

  const normalizedKey = idempotencyKey.trim();

  if (!normalizedKey || normalizedKey.length > 500) {
    throw new Error("A chave de idempotência da mensagem é inválida.");
  }

  const logId = createHash("sha256")
    .update(normalizedKey)
    .digest("hex");
  const logReference = adminDb
    .collection("whatsappMessageLogs")
    .doc(logId);

  const created = await adminDb.runTransaction(async (transaction) => {
    const existingLog = await transaction.get(logReference);

    if (existingLog.exists) {
      return false;
    }

    transaction.create(logReference, {
      event,
      template,
      recipient: normalizedRecipient.replace(/^\+/, ""),
      quoteRequestId,
      scheduleId,
      status: "sending",
      metaMessageId: null,
      error: null,
      createdAt: FieldValue.serverTimestamp(),
      sentAt: null,
      deliveredAt: null,
      readAt: null,
      failedAt: null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return true;
  });

  if (!created) {
    return {
      status: "duplicate",
      logId,
    };
  }

  try {
    const result = await sendWhatsAppTemplate({
      to: normalizedRecipient,
      template,
      parameters,
    });

    await logReference.update({
      status: "sent",
      metaMessageId: result.messageId,
      recipientWhatsAppId: result.recipientWhatsAppId,
      sentAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      status: "sent",
      logId,
      messageId: result.messageId,
    };
  } catch (error) {
    const message = readSafeErrorMessage(error);

    await logReference.update({
      status: "failed",
      error: message,
      failedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    throw error;
  }
}

function readSafeErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Falha desconhecida ao enviar a mensagem.";
  }

  return error.message.trim().slice(0, 1000) ||
    "Falha desconhecida ao enviar a mensagem.";
}