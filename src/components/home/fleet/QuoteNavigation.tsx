"use client";

import { motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Send,
} from "lucide-react";

import type {
  QuoteStep,
} from "@/types/quote";

type QuoteNavigationProps = {
  currentStep: QuoteStep;
  canContinue: boolean;
  isSubmitting?: boolean;
  submissionComplete?: boolean;
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

const completedProgress: Record<
  QuoteStep,
  number
> = {
  vehicle: 0,
  trip: 25,
  contact: 50,
  review: 75,
};

const validatedProgress: Record<
  QuoteStep,
  number
> = {
  vehicle: 25,
  trip: 50,
  contact: 75,
  review: 100,
};

export function QuoteNavigation({
  currentStep,
  canContinue,
  isSubmitting = false,
  submissionComplete = false,
  onBack,
  onContinue,
}: QuoteNavigationProps) {
  const isFirstStep =
    currentStep === "vehicle";

  const isReviewStep =
    currentStep === "review";

  const currentPosition =
    stepPosition[currentStep];

  /*
   * A barra considera apenas etapas
   * que já foram preenchidas corretamente.
   */
  const progress = submissionComplete
    ? 100
    : canContinue
      ? validatedProgress[currentStep]
      : completedProgress[currentStep];

  const progressMessage =
    progress === 100
      ? "Tudo pronto para enviar"
      : canContinue
        ? "Etapa preenchida"
        : "Complete esta etapa";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121620]/95 p-3 shadow-xl shadow-black/25 backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* PROGRESSO */}
        <div className="min-w-0 flex-1 sm:max-w-sm">
          <div className="mb-2 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                Progresso
              </p>

              <span className="size-1 rounded-full bg-white/20" />

              <p className="text-[11px] text-white/55">
                Etapa{" "}
                <strong className="text-white">
                  {currentPosition}
                </strong>{" "}
                de 4
              </p>
            </div>

            <motion.span
              key={progress}
              initial={{
                opacity: 0,
                scale: 0.85,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.3,
              }}
              className="text-[11px] font-bold text-yellow-400"
            >
              {progress}%
            </motion.span>
          </div>

          {/* BARRA ANIMADA */}
          <div
            role="progressbar"
            aria-label="Progresso da solicitação de orçamento"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10"
          >
            <motion.div
              initial={false}
              animate={{
                width: `${progress}%`,
              }}
              transition={{
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative h-full overflow-hidden rounded-full bg-linear-to-r from-yellow-500 via-yellow-400 to-amber-300 shadow-[0_0_14px_rgba(250,204,21,0.45)]"
            >
              {/* BRILHO EM MOVIMENTO */}
              {progress > 0 && (
                <motion.span
                  aria-hidden="true"
                  initial={{
                    x: "-120%",
                  }}
                  animate={{
                    x: "350%",
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    repeatDelay: 1.2,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-y-0 w-12 skew-x-[-20deg] bg-linear-to-r from-transparent via-white/70 to-transparent"
                />
              )}
            </motion.div>
          </div>

          <div className="mt-1.5 flex items-center justify-between">
            <p
              className={`text-[10px] transition-colors duration-300 ${
                canContinue
                  ? "text-emerald-400/80"
                  : "text-white/30"
              }`}
            >
              {progressMessage}
            </p>

            <p className="text-[10px] text-white/25">
              {4 - currentPosition}{" "}
              {4 - currentPosition === 1
                ? "etapa restante"
                : "etapas restantes"}
            </p>
          </div>
        </div>

        {/* BOTÕES */}
        <div
          className={`flex w-full items-center gap-2 sm:w-auto ${
            isFirstStep
              ? "justify-end"
              : "justify-between"
          }`}
        >
          {!isFirstStep &&
            !submissionComplete && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onBack}
                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-white/65 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-26"
              >
                <ArrowLeft size={15} />

                Voltar
              </button>
            )}

          <button
            type="button"
            disabled={
              !canContinue ||
              isSubmitting ||
              submissionComplete
            }
            onClick={onContinue}
            className={`group flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:bg-white/8 disabled:text-white/25 disabled:shadow-none ${
              isFirstStep
                ? "w-full sm:w-auto sm:min-w-44"
                : "flex-1 sm:min-w-44 sm:flex-none"
            } ${
              isReviewStep
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/30 hover:-translate-y-0.5 hover:bg-emerald-400"
                : "bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-950/20 hover:-translate-y-0.5 hover:bg-yellow-300"
            }`}
          >
            {submissionComplete ? (
              <>
                <CheckCircle2 size={16} />

                Solicitação enviada
              </>
            ) : isSubmitting ? (
              <>
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />

                Enviando...
              </>
            ) : isReviewStep ? (
              <>
                <Send size={15} />

                Enviar orçamento
              </>
            ) : (
              <>
                Continuar

                <ArrowRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}