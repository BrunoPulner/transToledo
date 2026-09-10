"use client";

import {
  BusFront,
  Check,
  ClipboardCheck,
  LockKeyhole,
  MapPinned,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type {
  QuoteStep,
} from "@/types/quote";

type QuoteStepperProps = {
  currentStep: QuoteStep;
  completedSteps: QuoteStep[];
  onStepChange: (
    step: QuoteStep,
  ) => void;
};

type StepItem = {
  id: QuoteStep;
  number: number;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
};

const steps: StepItem[] = [
  {
    id: "vehicle",
    number: 1,
    label: "Escolher veículo",
    shortLabel: "Veículo",
    description:
      "Selecione uma van",
    icon: BusFront,
  },
  {
    id: "trip",
    number: 2,
    label: "Definir viagem",
    shortLabel: "Viagem",
    description:
      "Destino e período",
    icon: MapPinned,
  },
  {
    id: "contact",
    number: 3,
    label: "Seus dados",
    shortLabel: "Dados",
    description:
      "Informações de contato",
    icon: UserRound,
  },
  {
    id: "review",
    number: 4,
    label: "Revisar e enviar",
    shortLabel: "Revisão",
    description:
      "Confira a solicitação",
    icon: ClipboardCheck,
  },
];

function getStepIndex(
  step: QuoteStep,
) {
  return steps.findIndex(
    (item) =>
      item.id === step,
  );
}

export function QuoteStepper({
  currentStep,
  completedSteps,
  onStepChange,
}: QuoteStepperProps) {
  const currentStepIndex =
    getStepIndex(currentStep);

  function canAccessStep(
    step: QuoteStep,
  ) {
    const stepIndex =
      getStepIndex(step);

    return (
      stepIndex <=
        currentStepIndex ||
      completedSteps.includes(
        step,
      )
    );
  }

  return (
    <nav
      aria-label="Etapas da solicitação de orçamento"
      className="
        rounded-3xl
        border
        border-white/10
        bg-[#121620]
        p-2
        shadow-xl
        shadow-black/20
        sm:p-3
      "
    >
      <ol
        className="
          grid
          grid-cols-4
          gap-1.5
          sm:gap-2
        "
      >
        {steps.map(
          (
            step,
            index,
          ) => {
            const Icon =
              step.icon;

            const active =
              currentStep ===
              step.id;

            const completed =
              completedSteps.includes(
                step.id,
              );

            const accessible =
              canAccessStep(
                step.id,
              );

            return (
              <li
                key={step.id}
                className="
                  relative
                  min-w-0
                "
              >
                <button
                  type="button"
                  disabled={
                    !accessible
                  }
                  onClick={() =>
                    onStepChange(
                      step.id,
                    )
                  }
                  aria-current={
                    active
                      ? "step"
                      : undefined
                  }
                  className={`
                    group
                    relative
                    z-10
                    flex
                    min-h-24
                    w-full
                    min-w-0
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    px-1.5
                    py-3
                    text-center
                    transition
                    duration-300
                    sm:min-h-28
                    sm:px-3
                    ${
                      active
                        ? `
                          border-yellow-400
                          bg-yellow-400
                          text-slate-950
                          shadow-lg
                          shadow-yellow-400/15
                        `
                        : completed
                          ? `
                            border-emerald-400/40
                            bg-emerald-400/10
                            text-emerald-300
                            hover:bg-emerald-400/15
                          `
                          : `
                            border-white/10
                            bg-white/3
                            text-white/30
                            disabled:cursor-not-allowed
                          `
                    }
                  `}
                >
                  <span
                    className={`
                      absolute
                      left-2
                      top-2
                      flex
                      size-5
                      items-center
                      justify-center
                      rounded-full
                      text-[9px]
                      font-black
                      sm:left-3
                      sm:top-3
                      sm:size-6
                      sm:text-[10px]
                      ${
                        active
                          ? `
                            bg-slate-950
                            text-yellow-400
                          `
                          : completed
                            ? `
                              bg-emerald-400
                              text-slate-950
                            `
                            : `
                              bg-white/8
                              text-white/35
                            `
                      }
                    `}
                  >
                    {completed &&
                    !active ? (
                      <Check
                        size={13}
                      />
                    ) : (
                      step.number
                    )}
                  </span>

                  {!accessible && (
                    <LockKeyhole
                      size={11}
                      className="
                        absolute
                        right-2
                        top-2
                        text-white/20
                        sm:right-3
                        sm:top-3
                      "
                    />
                  )}

                  <span
                    className={`
                      flex
                      size-9
                      items-center
                      justify-center
                      rounded-xl
                      border
                      sm:size-10
                      ${
                        active
                          ? `
                            border-black/10
                            bg-black/10
                          `
                          : completed
                            ? `
                              border-emerald-400/20
                              bg-emerald-400/10
                            `
                            : `
                              border-white/10
                              bg-white/5
                            `
                      }
                    `}
                  >
                    <Icon
                      size={17}
                    />
                  </span>

                  <strong
                    className="
                      mt-1
                      w-full
                      truncate
                      text-[10px]
                      font-bold
                      sm:text-xs
                    "
                  >
                    <span className="sm:hidden">
                      {
                        step.shortLabel
                      }
                    </span>

                    <span className="hidden sm:inline">
                      {
                        step.label
                      }
                    </span>
                  </strong>

                  <span
                    className={`
                      hidden
                      text-[9px]
                      sm:block
                      ${
                        active
                          ? "text-slate-950/60"
                          : completed
                            ? "text-emerald-200/50"
                            : "text-white/20"
                      }
                    `}
                  >
                    {
                      step.description
                    }
                  </span>
                </button>

                {index <
                  steps.length -
                    1 && (
                  <span
                    aria-hidden="true"
                    className={`
                      pointer-events-none
                      absolute
                      -right-1.5
                      top-1/2
                      z-20
                      h-0.5
                      w-1.5
                      -translate-y-1/2
                      sm:-right-2
                      sm:w-2
                      ${
                        completed
                          ? "bg-emerald-400"
                          : active
                            ? "bg-yellow-400"
                            : "bg-white/15"
                      }
                    `}
                  />
                )}
              </li>
            );
          },
        )}
      </ol>
    </nav>
  );
}