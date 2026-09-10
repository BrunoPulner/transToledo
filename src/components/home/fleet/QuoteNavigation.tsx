"use client";

import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  MessageCircle,
} from "lucide-react";

import type {
  QuoteStep,
} from "@/types/quote";

type QuoteNavigationProps = {
  currentStep: QuoteStep;
  canContinue: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onContinue: () => void;
};

const stepPosition: Record<
  QuoteStep,
  number
> = {
  vehicle: 1,
  trip: 2,
  contact: 3,
  review: 4,
};

export function QuoteNavigation({
  currentStep,
  canContinue,
  isSubmitting = false,
  onBack,
  onContinue,
}: QuoteNavigationProps) {
  const isFirstStep =
    currentStep === "vehicle";

  const isReviewStep =
    currentStep === "review";

  const currentPosition =
    stepPosition[currentStep];

  return (
    <div
      className="
        flex
        flex-col
        gap-3
        rounded-2xl
        border
        border-white/10
        bg-[#121620]/95
        p-3
        shadow-2xl
        shadow-black/35
        backdrop-blur-xl
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:p-4
      "
    >
      <div className="hidden sm:block">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/30">
          Progresso
        </p>

        <p className="mt-1 text-xs text-white/60">
          Etapa{" "}
          <strong className="text-white">
            {currentPosition}
          </strong>{" "}
          de 4
        </p>
      </div>

      <div
        className={`
          flex
          w-full
          items-center
          gap-2
          sm:w-auto
          ${
            isFirstStep
              ? "justify-end"
              : "justify-between"
          }
        `}
      >
        {!isFirstStep && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onBack}
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              text-xs
              font-bold
              text-white/70
              transition
              hover:border-white/20
              hover:bg-white/10
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-40
              sm:min-w-28
            "
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
        )}

        <button
          type="button"
          disabled={
            !canContinue ||
            isSubmitting
          }
          onClick={onContinue}
          className={`
            group
            flex
            h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            px-5
            text-xs
            font-bold
            transition
            disabled:cursor-not-allowed
            disabled:bg-white/8
            disabled:text-white/25
            disabled:shadow-none
            ${
              isFirstStep
                ? "w-full sm:w-auto sm:min-w-48"
                : "flex-1 sm:min-w-48 sm:flex-none"
            }
            ${
              isReviewStep
                ? `
                  bg-emerald-500
                  text-white
                  shadow-lg
                  shadow-emerald-950/30
                  hover:bg-emerald-400
                `
                : `
                  bg-yellow-400
                  text-slate-950
                  shadow-lg
                  shadow-yellow-950/20
                  hover:bg-yellow-300
                `
            }
          `}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
              Enviando...
            </>
          ) : isReviewStep ? (
            <>
              <MessageCircle size={16} />
              Enviar orçamento
            </>
          ) : (
            <>
              Continuar
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
