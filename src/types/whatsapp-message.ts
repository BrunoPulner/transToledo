export type WhatsAppTemplateKey =
  | "new_quote_admin"
  | "quote_approved"
  | "quote_rejected"
  | "trip_reminder_5h";

export type WhatsAppTemplateStatus =
  | "not_configured"
  | "pending"
  | "approved"
  | "rejected";

export type WhatsAppTemplateAudience =
  | "administrator"
  | "customer";

export type WhatsAppMessageEvent =
  | "quote_created"
  | "quote_approved"
  | "quote_rejected"
  | "trip_reminder_5h"
  | "manual";

export type WhatsAppMessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type WhatsAppMessageTemplate = {
  key: WhatsAppTemplateKey;
  metaName: string;
  title: string;
  description: string;
  audience: WhatsAppTemplateAudience;
  trigger: string;
  preview: string;
  variables: string[];
  status: WhatsAppTemplateStatus;
};

export type WhatsAppMessageLogRecord = {
  id: string;
  event: WhatsAppMessageEvent;
  template: WhatsAppTemplateKey;
  recipient: string;
  quoteRequestId: string | null;
  scheduleId: string | null;
  status: WhatsAppMessageStatus;
  metaMessageId: string | null;
  error: string | null;
  createdAt: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  failedAt: string | null;
};