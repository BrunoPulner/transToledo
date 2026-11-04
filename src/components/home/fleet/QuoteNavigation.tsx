"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Send,
} from "lucide-react";

import type { QuoteStep } from "@/types/quote";

type QuoteNavigationProps = {
  currentStep: QuoteStep;
  canContinue: boolean;
  isSubmitting?: boolean;
  submissionComplete?: boolean;
  onBack: () => void;
  onContinue: () => void;
};

export function QuoteNavigation({
  currentStep,
  canContinue,
  isSubmitting = false,
  submissionComplete = false,
  onBack,
  onContinue,
}: QuoteNavigationProps) {
  const isFirstStep = currentStep === "vehicle";
  const isReviewStep = currentStep === "review";

  return (
    <nav
      aria-label="Navegação do orçamento"
      className="flex w-full flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="hidden text-xs text-white/40 sm:block">
        {submissionComplete
          ? "Sua solicitação foi enviada com sucesso."
          : isReviewStep
            ? "Confira os dados antes de enviar."
            : canContinue
              ? "Tudo pronto para continuar."
              : "Preencha as informações desta etapa para continuar."}
      </p>

      <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
        {!isFirstStep && !submissionComplete && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar
          </button>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue || isSubmitting || submissionComplete}
          className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35 sm:min-w-44 sm:flex-none ${
            isReviewStep
              ? "bg-emerald-500 text-white hover:bg-emerald-400"
              : "bg-yellow-400 text-slate-950 hover:bg-yellow-300"
          }`}
        >
          {submissionComplete ? (
            <>
              <CheckCircle2 size={17} aria-hidden="true" />
              Solicitação enviada
            </>
          ) : isSubmitting ? (
            <>
              <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
              Enviando...
            </>
          ) : isReviewStep ? (
            <>
              <Send size={17} aria-hidden="true" />
              Enviar orçamento
            </>
          ) : (
            <>
              Continuar
              <ArrowRight size={17} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
