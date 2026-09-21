import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import {
  areBrazilianPhonesEquivalent,
  hashVerificationValue,
  verifyMetaSignature,
} from "@/lib/phone-verification";

export const dynamic = "force-dynamic";

type MetaMessage = {
  from?: string;
  text?: {
    body?: string;
  };
};

type MetaStatusError = {
  code?: number;
  title?: string;
  message?: string;
  error_data?: {
    details?: string;
  };
};

type MetaMessageStatus = {
  id?: string;
  status?: "sent" | "delivered" | "read" | "failed";
  timestamp?: string;
  recipient_id?: string;
  errors?: MetaStatusError[];
};

type MetaWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: MetaMessage[];
        statuses?: MetaMessageStatus[];
      };
    }>;
  }>;
};

export async function GET(request: Request) {
  const url = new URL(request.url);

  const mode =
    url.searchParams.get("hub.mode");

  const token =
    url.searchParams.get("hub.verify_token");

  const challenge =
    url.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    return new Response(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return NextResponse.json(
    {
      success: false,
    },
    {
      status: 403,
    },
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signature = request.headers.get(
    "x-hub-signature-256",
  );

  if (
    !verifyMetaSignature(
      rawBody,
      signature,
    )
  ) {
    console.warn(
      "Webhook do WhatsApp recusado: assinatura inválida.",
    );

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 401,
      },
    );
  }

  try {
    const payload =
      JSON.parse(rawBody) as MetaWebhookPayload;

    const values =
      payload.entry?.flatMap(
        (entry) =>
          entry.changes?.map(
            (change) => change.value,
          ) ?? [],
      ) ?? [];

    const messages = values.flatMap(
      (value) =>
        value?.messages ?? [],
    );

    const statuses = values.flatMap(
      (value) =>
        value?.statuses ?? [],
    );

    console.info(
      "Webhook do WhatsApp recebido",
      {
        messageCount: messages.length,
        statusCount: statuses.length,
      },
    );

    await Promise.all([
      ...messages.map(processMessage),
      ...statuses.map(processMessageStatus),
    ]);
  } catch (error) {
    console.error(
      "Erro ao processar webhook do WhatsApp:",
      error,
    );
  }

  /*
   * A Meta espera uma resposta 200 rapidamente.
   */
  return NextResponse.json({
    success: true,
  });
}

/*
 * Processa mensagens enviadas pelo usuário
 * ao número do WhatsApp da empresa.
 *
 * É utilizado para a verificação pelo código TT.
 */
async function processMessage(
  message: MetaMessage,
) {
  const { adminDb } =
    await import("@/lib/firebase/admin");

  const sender = message.from
    ? `+${message.from.replace(/\D/g, "")}`
    : null;

  const code = (
    message.text?.body ?? ""
  )
    .toUpperCase()
    .match(
      /TT-[A-HJ-NP-Z2-9]{6}/,
    )?.[0];

  if (!sender || !code) {
    console.info(
      "Webhook sem mensagem de texto ou sem código TT válido.",
    );

    return;
  }

  const snapshot = await adminDb
    .collection("phoneVerifications")
    .where(
      "codeHash",
      "==",
      hashVerificationValue(code),
    )
    .limit(1)
    .get();

  const document =
    snapshot.docs[0];

  if (!document) {
    console.info(
      "Código recebido não encontrado ou já consumido.",
    );

    return;
  }

  const data =
    document.data();

  const expiresAt =
    data.expiresAt?.toDate?.();

  if (data.status !== "pending") {
    console.info(
      "Código recebido não está pendente.",
    );

    return;
  }

  if (
    typeof data.phone !== "string" ||
    !areBrazilianPhonesEquivalent(
      data.phone,
      sender,
    )
  ) {
    console.warn(
      "Telefone remetente não corresponde ao orçamento",
      {
        expectedEnding: String(
          data.phone ?? "",
        ).slice(-4),

        senderEnding:
          sender.slice(-4),

        expectedLength: String(
          data.phone ?? "",
        ).replace(/\D/g, "").length,

        senderLength:
          sender.replace(/\D/g, "").length,
      },
    );

    return;
  }

  if (
    !(expiresAt instanceof Date) ||
    expiresAt <= new Date()
  ) {
    console.info(
      "Código recebido está expirado.",
    );

    return;
  }

  await document.ref.update({
    status: "verified",

    verifiedAt:
      FieldValue.serverTimestamp(),
  });

  console.info(
    "Telefone verificado com sucesso",
    {
      phoneEnding:
        sender.slice(-4),
    },
  );
}

/*
 * Processa os retornos de envio da Meta:
 *
 * sent      = recebido pela Meta
 * delivered = entregue ao aparelho
 * read      = aberto pelo destinatário
 * failed    = falha definitiva
 */
async function processMessageStatus(
  messageStatus: MetaMessageStatus,
) {
  const messageId =
    messageStatus.id?.trim();

  const status =
    messageStatus.status;

  if (
    !messageId ||
    !status ||
    ![
      "sent",
      "delivered",
      "read",
      "failed",
    ].includes(status)
  ) {
    console.warn(
      "Status de mensagem inválido recebido da Meta.",
    );

    return;
  }

  const { adminDb } =
    await import("@/lib/firebase/admin");

  const snapshot = await adminDb
    .collection("whatsappMessageLogs")
    .where(
      "metaMessageId",
      "==",
      messageId,
    )
    .limit(1)
    .get();

  const document =
    snapshot.docs[0];

  if (!document) {
    console.warn(
      "Log da mensagem do WhatsApp não encontrado.",
      {
        messageId,
        status,
        recipientId:
          messageStatus.recipient_id ?? null,
      },
    );

    return;
  }

  const update: Record<string, unknown> = {
    status,
    updatedAt:
      FieldValue.serverTimestamp(),
  };

  if (status === "sent") {
    update.sentAt =
      FieldValue.serverTimestamp();
  }

  if (status === "delivered") {
    update.deliveredAt =
      FieldValue.serverTimestamp();
  }

  if (status === "read") {
    update.readAt =
      FieldValue.serverTimestamp();
  }

  if (status === "failed") {
    update.failedAt =
      FieldValue.serverTimestamp();

    update.error =
      readMetaStatusError(
        messageStatus.errors,
      );
  }

  if (messageStatus.recipient_id) {
    update.recipientWhatsAppId =
      messageStatus.recipient_id;
  }

  await document.ref.update(update);

  console.info(
    "Status da mensagem do WhatsApp atualizado.",
    {
      logId: document.id,
      messageId,
      status,
      recipientId:
        messageStatus.recipient_id ?? null,
    },
  );
}

function readMetaStatusError(
  errors: MetaStatusError[] | undefined,
) {
  const error =
    errors?.[0];

  if (!error) {
    return "A Meta informou que a mensagem não pôde ser entregue.";
  }

  const detail =
    error.error_data?.details?.trim();

  const message =
    error.message?.trim();

  const title =
    error.title?.trim();

  const description =
    detail ||
    message ||
    title ||
    "A Meta informou que a mensagem não pôde ser entregue.";

  return error.code
    ? `[${error.code}] ${description}`.slice(
        0,
        1000,
      )
    : description.slice(0, 1000);
}