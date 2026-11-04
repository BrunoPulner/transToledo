"use client";

import { Check } from "lucide-react";
import type { QuoteStep } from "@/types/quote";

type QuoteStepperProps = {
  currentStep: QuoteStep;
  completedSteps: QuoteStep[];
  onStepChange: (step: QuoteStep) => void;
};

const steps: { id: QuoteStep; label: string }[] = [
  { id: "vehicle", label: "Veículo" },
  { id: "trip", label: "Viagem" },
  { id: "contact", label: "Contato" },
  { id: "review", label: "Revisão" },
];

export function QuoteStepper({
  currentStep,
  completedSteps,
  onStepChange,
}: QuoteStepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="Etapas da solicitação de orçamento" className="w-full">
      <ol className="grid grid-cols-4 gap-2 sm:gap-3">
        {steps.map((step, index) => {
          const active = currentStep === step.id;
          const completed = completedSteps.includes(step.id);
          const accessible = index <= currentIndex || completed;

          return (
            <li key={step.id} className="min-w-0">
              <button
                type="button"
                disabled={!accessible}
                onClick={() => onStepChange(step.id)}
                aria-current={active ? "step" : undefined}
                className="group flex w-full min-w-0 flex-col gap-2 text-left disabled:cursor-not-allowed"
              >
                <span
                  aria-hidden="true"
                  className={`h-1 w-full rounded-full transition-colors duration-300 ${
                    active
                      ? "bg-yellow-400"
                      : completed
                        ? "bg-emerald-400"
                        : "bg-white/15"
                  }`}
                />
                <span
                  className={`flex items-center gap-1.5 truncate text-[10px] font-medium sm:text-xs ${
                    active
                      ? "text-yellow-400"
                      : completed
                        ? "text-emerald-300"
                        : "text-white/45"
                  }`}
                >
                  {completed && !active ? (
                    <Check size={12} className="shrink-0" aria-hidden="true" />
                  ) : (
                    <span className="shrink-0">{index + 1}.</span>
                  )}
                  <span className="truncate">{step.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
