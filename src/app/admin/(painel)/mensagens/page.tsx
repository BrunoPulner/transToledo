import {
  CircleDollarSign,
  MessageSquarePlus,
  MessageSquareText,
  Send,
  Settings2,
} from "lucide-react";

import { whatsappMessageTemplates } from "@/lib/whatsapp/message-templates";

import { MessageTemplateCard } from "./MessageTemplateCard";

const overview = [
  {
    label: "Modelos automáticos",
    value: String(whatsappMessageTemplates.length),
    icon: MessageSquareText,
  },
  {
    label: "Aprovados pela Meta",
    value: String(
      whatsappMessageTemplates.filter(
        (template) => template.status === "approved",
      ).length,
    ),
    icon: Send,
  },
  {
    label: "Estimativa por envio",
    value: "≈ R$ 0,04",
    icon: CircleDollarSign,
  },
];

export default function MessagesPage() {
  return (
    <main className="px-5 pb-10 pt-26 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-400">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-yellow-400" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
                Administração
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
              Mensagens
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
              Gerencie os avisos automáticos de orçamento e os lembretes enviados pelo WhatsApp.
            </p>
          </div>

          <button
            type="button"
            disabled
            title="Disponível na próxima etapa"
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 text-xs font-bold text-black opacity-45"
          >
            <MessageSquarePlus size={16} />
            Nova mensagem
          </button>
        </header>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          {overview.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/3 p-4"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                  <Icon size={18} />
                </span>
                <p className="mt-4 text-xs text-white/40">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {item.value}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-7 rounded-2xl border border-amber-400/15 bg-amber-400/5 p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
              <Settings2 size={18} />
            </span>
            <div>
              <h2 className="text-sm font-bold text-amber-100">
                Integração aguardando configuração
              </h2>
              <p className="mt-1 text-xs leading-5 text-amber-100/50">
                Os modelos abaixo ainda precisam ser cadastrados e aprovados no Gerenciador do WhatsApp da Meta antes dos envios automáticos.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div>
            <h2 className="text-lg font-bold text-white">
              Modelos automáticos
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Cada modelo corresponde a um evento do fluxo de orçamento e viagem.
            </p>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {whatsappMessageTemplates.map((template) => (
              <MessageTemplateCard
                key={template.key}
                template={template}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}