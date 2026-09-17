import {
  BellRing,
  Building2,
  Clock3,
  UserRound,
} from "lucide-react";

import type {
  WhatsAppMessageTemplate,
} from "@/types/whatsapp-message";

type MessageTemplateCardProps = {
  template: WhatsAppMessageTemplate;
};

const statusDetails = {
  not_configured: {
    label: "Não configurado",
    className:
      "border-white/10 bg-white/5 text-white/45",
  },
  pending: {
    label: "Aguardando Meta",
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
  },
  approved: {
    label: "Aprovado",
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },
  rejected: {
    label: "Reprovado",
    className:
      "border-red-400/20 bg-red-400/10 text-red-300",
  },
} as const;

export function MessageTemplateCard({
  template,
}: MessageTemplateCardProps) {
  const status = statusDetails[template.status];
  const AudienceIcon =
    template.audience === "administrator"
      ? Building2
      : UserRound;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/3 p-5 transition hover:border-yellow-400/25">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
            <BellRing size={19} />
          </span>

          <div className="min-w-0">
            <h2 className="font-bold text-white">
              {template.title}
            </h2>
            <p className="mt-1 font-mono text-[10px] text-white/30">
              {template.metaName}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/50">
        {template.description}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
          <AudienceIcon
            size={14}
            className="shrink-0 text-yellow-400"
          />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/25">
              Destinatário
            </p>
            <p className="mt-0.5 text-xs font-semibold text-white/65">
              {template.audience === "administrator"
                ? "Responsável"
                : "Solicitante"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/15 px-3 py-2.5">
          <Clock3
            size={14}
            className="shrink-0 text-yellow-400"
          />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/25">
              Gatilho
            </p>
            <p className="mt-0.5 text-xs font-semibold text-white/65">
              {template.trigger}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 rounded-xl border border-white/8 bg-[#090b0d] p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300/70">
          Prévia da mensagem
        </p>
        <p className="mt-2 text-xs leading-5 text-white/55">
          {template.preview}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {template.variables.map((variable) => (
          <span
            key={variable}
            className="rounded-md border border-white/8 bg-white/4 px-2 py-1 text-[9px] font-medium text-white/35"
          >
            {variable}
          </span>
        ))}
      </div>
    </article>
  );
}
