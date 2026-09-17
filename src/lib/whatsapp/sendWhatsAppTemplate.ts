import "server-only";

import { normalizeBrazilianPhone } from "@/lib/phone-verification";
import { whatsappMessageTemplates } from "@/lib/whatsapp/message-templates";
import type { WhatsAppTemplateKey } from "@/types/whatsapp-message";

type SendWhatsAppTemplateInput = {
  to: string;
  template: WhatsAppTemplateKey;
  parameters: string[];
};

export type WhatsAppTemplateSendResult = {
  messageId: string;
  recipientWhatsAppId: string | null;
};

type MetaMessagesResponse = {
  contacts?: Array<{ wa_id?: string }>;
  messages?: Array<{ id?: string }>;
  error?: {
    code?: number;
    message?: string;
    error_data?: {
      details?: string;
    };
  };
};

export class WhatsAppTemplateSendError extends Error {
  readonly status: number;
  readonly metaCode: number | null;

  constructor(
    message: string,
    options: {
      status: number;
      metaCode?: number | null;
    },
  ) {
    super(message);
    this.name = "WhatsAppTemplateSendError";
    this.status = options.status;
    this.metaCode = options.metaCode ?? null;
  }
}

/*
 * Envia um modelo previamente aprovado pela Meta.
 *
 * Este arquivo deve ser usado somente no servidor. O token nunca pode
 * ser enviado a componentes client ou retornado nas respostas das APIs.
 */
export async function sendWhatsAppTemplate({
  to,
  template,
  parameters,
}: SendWhatsAppTemplateInput): Promise<WhatsAppTemplateSendResult> {
  const configuration = readWhatsAppConfiguration();
  const recipient = normalizeBrazilianPhone(to)?.replace(/^\+/, "");

  if (!recipient) {
    throw new WhatsAppTemplateSendError(
      "O destinatário não possui um WhatsApp brasileiro válido.",
      { status: 400 },
    );
  }

  const selectedTemplate = whatsappMessageTemplates.find(
    (item) => item.key === template,
  );

  if (!selectedTemplate) {
    throw new WhatsAppTemplateSendError(
      "O modelo de WhatsApp informado não está cadastrado no sistema.",
      { status: 400 },
    );
  }

  if (parameters.length !== selectedTemplate.variables.length) {
    throw new WhatsAppTemplateSendError(
      `O modelo ${selectedTemplate.metaName} exige ${selectedTemplate.variables.length} variáveis.`,
      { status: 400 },
    );
  }

  const normalizedParameters = parameters.map((parameter) => {
    const value = String(parameter).trim();

    if (!value || value.length > 1024) {
      throw new WhatsAppTemplateSendError(
        "As variáveis da mensagem devem possuir entre 1 e 1024 caracteres.",
        { status: 400 },
      );
    }

    return value;
  });

  const endpoint = new URL(
    `${configuration.graphApiVersion}/${configuration.phoneNumberId}/messages`,
    "https://graph.facebook.com",
  );

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${configuration.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipient,
        type: "template",
        template: {
          name: selectedTemplate.metaName,
          language: {
            code: "pt_BR",
          },
          components: [
            {
              type: "body",
              parameters: normalizedParameters.map((value) => ({
                type: "text",
                text: value,
              })),
            },
          ],
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    const timedOut =
      error instanceof Error && error.name === "TimeoutError";

    throw new WhatsAppTemplateSendError(
      timedOut
        ? "A API do WhatsApp demorou para responder."
        : "Não foi possível conectar à API do WhatsApp.",
      { status: 503 },
    );
  }

  const result = await readMetaResponse(response);

  if (!response.ok || result.error) {
    const detail =
      result.error?.error_data?.details ??
      result.error?.message ??
      "A Meta recusou o envio da mensagem.";

    throw new WhatsAppTemplateSendError(detail, {
      status: response.status,
      metaCode: result.error?.code,
    });
  }

  const messageId = result.messages?.[0]?.id;

  if (!messageId) {
    throw new WhatsAppTemplateSendError(
      "A Meta não retornou o identificador da mensagem.",
      { status: 502 },
    );
  }

  return {
    messageId,
    recipientWhatsAppId: result.contacts?.[0]?.wa_id ?? null,
  };
}

function readWhatsAppConfiguration() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const graphApiVersion =
    process.env.WHATSAPP_GRAPH_API_VERSION?.trim();

  if (!accessToken || !phoneNumberId || !graphApiVersion) {
    throw new WhatsAppTemplateSendError(
      "As credenciais de envio do WhatsApp não estão configuradas.",
      { status: 500 },
    );
  }

  if (!/^\d+$/.test(phoneNumberId)) {
    throw new WhatsAppTemplateSendError(
      "WHATSAPP_PHONE_NUMBER_ID possui formato inválido.",
      { status: 500 },
    );
  }

  if (!/^v\d+\.\d+$/.test(graphApiVersion)) {
    throw new WhatsAppTemplateSendError(
      "WHATSAPP_GRAPH_API_VERSION possui formato inválido.",
      { status: 500 },
    );
  }

  return {
    accessToken,
    phoneNumberId,
    graphApiVersion,
  };
}

async function readMetaResponse(response: Response) {
  try {
    return (await response.json()) as MetaMessagesResponse;
  } catch {
    throw new WhatsAppTemplateSendError(
      "A API do WhatsApp retornou uma resposta inválida.",
      { status: response.status || 502 },
    );
  }
}