"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Clock3,
  Headphones,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  QuoteNavigation,
} from "./QuoteNavigation";

import {
  QuoteStepper,
} from "./QuoteStepper";

import {
  VehicleStep,
} from "./steps/VehicleStep";

import {
  TripStep,
} from "./steps/TripStep";

import {
  ContactStep,
} from "./steps/ContactStep";

import {
  ReviewStep,
} from "./steps/ReviewStep";

import type {
  VehicleDateSelection,
} from "./PublicVehicleCalendar";

import {
  initialQuoteDraft,
  type QuoteDraft,
  type QuoteStep,
} from "@/types/quote";

import type {
  Vehicle,
} from "@/types/vehicles";

const stepOrder: QuoteStep[] = [
  "vehicle",
  "trip",
  "contact",
  "review",
];

const stepInformation: Record<
  QuoteStep,
  {
    eyebrow: string;
    title: string;
    description: string;
  }
> = {
  vehicle: {
    eyebrow: "Primeira etapa",
    title: "Escolha o veículo e o período",
    description:
      "Selecione a van ideal e consulte as datas disponíveis na agenda.",
  },

  trip: {
    eyebrow: "Segunda etapa",
    title: "Conte como será a viagem",
    description:
      "Informe o destino, o local de saída e a quantidade de passageiros.",
  },

  contact: {
    eyebrow: "Terceira etapa",
    title: "Preencha seus dados",
    description:
      "Precisamos destas informações para entrar em contato e preparar o orçamento.",
  },

  review: {
    eyebrow: "Última etapa",
    title: "Revise e envie sua solicitação",
    description:
      "Confira os dados da viagem antes de encaminhar o pedido para nossa equipe.",
  },
};

type SubmitQuoteResponse = {
  success?: boolean;
  quoteRequestId?: string;
  message?: string;
};

export function FleetQuoteWizard() {
  const [
    currentStep,
    setCurrentStep,
  ] = useState<QuoteStep>(
    "vehicle",
  );

  const [
    quoteDraft,
    setQuoteDraft,
  ] = useState<QuoteDraft>(
    () => ({
      ...initialQuoteDraft,

      contact: {
        ...initialQuoteDraft.contact,
      },
    }),
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    submissionError,
    setSubmissionError,
  ] = useState("");

  const [
    submittedQuoteId,
    setSubmittedQuoteId,
  ] = useState<string | null>(
    null,
  );

  /*
   * Atualiza somente os campos informados,
   * preservando o restante do orçamento.
   */
  function updateQuoteDraft(
    updates: Partial<QuoteDraft>,
  ) {
    setQuoteDraft(
      (currentDraft) => ({
        ...currentDraft,
        ...updates,
      }),
    );

    /*
     * Caso o cliente altere alguma informação
     * depois de um erro, removemos a mensagem.
     */
    if (submissionError) {
      setSubmissionError("");
    }
  }

  /*
   * Período atualmente selecionado.
   */
  const selectedPeriod =
    useMemo<VehicleDateSelection | null>(
      () => {
        if (
          !quoteDraft.departureDate ||
          !quoteDraft.returnDate
        ) {
          return null;
        }

        return {
          departureDate:
            quoteDraft.departureDate,

          returnDate:
            quoteDraft.returnDate,
        };
      },
      [
        quoteDraft.departureDate,
        quoteDraft.returnDate,
      ],
    );

  /*
   * Validação do período.
   */
  const validPeriod =
    quoteDraft.departureDate !==
      null &&
    quoteDraft.returnDate !==
      null &&
    quoteDraft.returnDate >
      quoteDraft.departureDate;

  /*
   * Validação da primeira etapa.
   */
  const vehicleStepValid =
    Boolean(
      quoteDraft.vehicleId &&
        quoteDraft.vehicleName,
    ) &&
    validPeriod;

  /*
   * Validação da quantidade
   * de passageiros.
   */
  const validPassengers =
    Number.isInteger(
      quoteDraft.passengers,
    ) &&
    quoteDraft.passengers > 0;

  /*
   * Validação de uma viagem cadastrada.
   */
  const registeredTripValid =
    quoteDraft.tripMode ===
      "registered" &&
    Boolean(
      quoteDraft.frequentTripId &&
        quoteDraft.tripName &&
        quoteDraft.origin.trim() &&
        quoteDraft.destination.trim(),
    ) &&
    quoteDraft.originLatitude !==
      null &&
    quoteDraft.originLongitude !==
      null &&
    quoteDraft.destinationLatitude !==
      null &&
    quoteDraft.destinationLongitude !==
      null;

  /*
   * Validação de uma viagem personalizada.
   */
  const customTripValid =
    quoteDraft.tripMode ===
      "custom" &&
    Boolean(
      quoteDraft.origin.trim() &&
        quoteDraft.destination.trim(),
    ) &&
    quoteDraft.originLatitude !==
      null &&
    quoteDraft.originLongitude !==
      null &&
    quoteDraft.destinationLatitude !==
      null &&
    quoteDraft.destinationLongitude !==
      null;

  /*
   * Validação da segunda etapa.
   */
  const tripStepValid =
    vehicleStepValid &&
    validPassengers &&
    (
      registeredTripValid ||
      customTripValid
    );

  /*
   * Validação das informações
   * de contato.
   */
  const contactDataValid =
    quoteDraft.contact.name
      .trim()
      .length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      quoteDraft.contact.email.trim(),
    ) &&
    Boolean(
      quoteDraft.contact.phone &&
        quoteDraft.contact
          .phoneVerificationToken,
    );

  /*
   * Validação da terceira etapa.
   */
  const contactStepValid =
    tripStepValid &&
    contactDataValid;

  /*
   * Etapas concluídas exibidas
   * no componente de progresso.
   */
  const completedSteps =
    useMemo<QuoteStep[]>(() => {
      const completed: QuoteStep[] =
        [];

      if (vehicleStepValid) {
        completed.push(
          "vehicle",
        );
      }

      if (tripStepValid) {
        completed.push(
          "trip",
        );
      }

      if (contactStepValid) {
        completed.push(
          "contact",
        );
      }

      if (
        contactStepValid &&
        submittedQuoteId
      ) {
        completed.push(
          "review",
        );
      }

      return completed;
    }, [
      vehicleStepValid,
      tripStepValid,
      contactStepValid,
      submittedQuoteId,
    ]);

  /*
   * Define se o botão principal
   * pode ser utilizado.
   */
  const canContinue = (() => {
    switch (currentStep) {
      case "vehicle":
        return vehicleStepValid;

      case "trip":
        return tripStepValid;

      case "contact":
        return contactStepValid;

      case "review":
        return (
          vehicleStepValid &&
          tripStepValid &&
          contactStepValid
        );

      default:
        return false;
    }
  })();

  /*
   * Selecionar outra van apaga o período,
   * pois cada veículo possui sua agenda.
   */
  function handleVehicleSelect(
    vehicle: Vehicle,
  ) {
    const vehicleChanged =
      quoteDraft.vehicleId !==
      vehicle.id;

    updateQuoteDraft({
      vehicleId: vehicle.id,
      vehicleName: vehicle.model,

      departureDate:
        vehicleChanged
          ? null
          : quoteDraft.departureDate,

      returnDate:
        vehicleChanged
          ? null
          : quoteDraft.returnDate,
    });
  }

  /*
   * Confirma o veículo e o período
   * selecionado na agenda.
   */
  function handleConfirmAvailability(
    vehicle: Vehicle,
    selection: VehicleDateSelection,
  ) {
    updateQuoteDraft({
      vehicleId: vehicle.id,
      vehicleName: vehicle.model,

      departureDate:
        selection.departureDate,

      returnDate:
        selection.returnDate,
    });
  }

  /*
   * Retorna para a etapa anterior.
   */
  function goToPreviousStep() {
    if (submittedQuoteId) {
      return;
    }

    const currentIndex =
      stepOrder.indexOf(
        currentStep,
      );

    if (currentIndex <= 0) {
      return;
    }

    const previousStep =
      stepOrder[
        currentIndex - 1
      ];

    if (previousStep) {
      setCurrentStep(
        previousStep,
      );
    }
  }

  /*
   * Avança para a próxima etapa
   * ou envia o orçamento.
   */
  async function goToNextStep() {
    if (
      !canContinue ||
      isSubmitting ||
      submittedQuoteId
    ) {
      return;
    }

    if (
      currentStep ===
      "review"
    ) {
      await submitQuote();
      return;
    }

    const currentIndex =
      stepOrder.indexOf(
        currentStep,
      );

    const nextStep =
      stepOrder[
        currentIndex + 1
      ];

    if (nextStep) {
      setCurrentStep(
        nextStep,
      );
    }
  }

  /*
   * Permite retornar para etapas anteriores
   * pelo componente de progresso.
   */
  function handleStepChange(
    step: QuoteStep,
  ) {
    if (submittedQuoteId) {
      return;
    }

    const requestedIndex =
      stepOrder.indexOf(step);

    const currentIndex =
      stepOrder.indexOf(
        currentStep,
      );

    /*
     * Sempre permite acessar
     * uma etapa anterior.
     */
    if (
      requestedIndex <=
      currentIndex
    ) {
      setCurrentStep(step);
      return;
    }

    /*
     * Permite acessar etapas que
     * já tenham sido concluídas.
     */
    if (
      completedSteps.includes(
        step,
      )
    ) {
      setCurrentStep(step);
    }
  }

  /*
   * Envia a solicitação completa
   * para a API.
   */
  async function submitQuote() {
    if (
      !quoteDraft.departureDate ||
      !quoteDraft.returnDate ||
      !quoteDraft.tripMode
    ) {
      setSubmissionError(
        "Existem informações obrigatórias faltando. Revise as etapas anteriores.",
      );

      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");

    try {
      const response = await fetch(
        "/api/quote-requests",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            vehicleId:
              quoteDraft.vehicleId,

            startsAt:
              quoteDraft
                .departureDate
                .toISOString(),

            endsAt:
              quoteDraft
                .returnDate
                .toISOString(),

            tripMode:
              quoteDraft.tripMode,

            frequentTripId:
              quoteDraft.frequentTripId,

            tripName:
              quoteDraft.tripName,

            origin:
              quoteDraft.origin,

            originLatitude:
              quoteDraft.originLatitude,

            originLongitude:
              quoteDraft.originLongitude,

            destination:
              quoteDraft.destination,

            destinationLatitude:
              quoteDraft
                .destinationLatitude,

            destinationLongitude:
              quoteDraft
                .destinationLongitude,

            passengers:
              quoteDraft.passengers,

            notes:
              quoteDraft.notes,

            name:
              quoteDraft.contact.name,

            email:
              quoteDraft.contact.email,

            phone:
              quoteDraft.contact.phone,

            phoneVerificationToken:
              quoteDraft.contact
                .phoneVerificationToken,
          }),
        },
      );

      const result =
        (await response.json()) as
          SubmitQuoteResponse;

      if (
        !response.ok ||
        !result.success ||
        !result.quoteRequestId
      ) {
        throw new Error(
          result.message ??
            "Não foi possível enviar a solicitação de orçamento.",
        );
      }

      setSubmittedQuoteId(
        result.quoteRequestId,
      );
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a solicitação de orçamento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * Renderiza o conteúdo da
   * etapa selecionada.
   */
  function renderCurrentStep() {
    switch (currentStep) {
      case "vehicle":
        return (
          <VehicleStep
            selectedVehicleId={
              quoteDraft.vehicleId
            }
            selectedPeriod={
              selectedPeriod
            }
            onSelectVehicle={
              handleVehicleSelect
            }
            onConfirmAvailability={
              handleConfirmAvailability
            }
          />
        );

      case "trip":
        return (
          <TripStep
            quoteDraft={
              quoteDraft
            }
            onDraftChange={
              updateQuoteDraft
            }
          />
        );

      case "contact":
        return (
          <ContactStep
            contact={
              quoteDraft.contact
            }
            onContactChange={(
              contact,
            ) =>
              updateQuoteDraft({
                contact,
              })
            }
          />
        );

      case "review":
        return (
          <ReviewStep
            quoteDraft={
              quoteDraft
            }
            submissionError={
              submissionError
            }
            submittedQuoteId={
              submittedQuoteId
            }
            onEditStep={(
              step,
            ) => {
              setSubmissionError("");
              setCurrentStep(step);
            }}
          />
        );

      default:
        return null;
    }
  }

  const currentStepIndex =
  stepOrder.indexOf(currentStep);

const currentStepInformation =
  stepInformation[currentStep];

  return (
  <section
    id="frota"
    className="relative isolate overflow-x-clip bg-[#050914] py-14 text-white lg:min-h-[calc(100vh-72px)] lg:py-18"
  >
    {/* GRADE DE FUNDO */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage:
          "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    />

    {/* LUZ AMARELA */}
    <motion.div
      aria-hidden="true"
      animate={{
        scale: [1, 1.18, 1],
        opacity: [0.09, 0.17, 0.09],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="pointer-events-none absolute -left-50 top-10 size-125 rounded-full bg-yellow-400 blur-[150px]"
    />

    {/* LUZ AZUL */}
    <motion.div
      aria-hidden="true"
      animate={{
        scale: [1.1, 1, 1.1],
        opacity: [0.06, 0.12, 0.06],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="pointer-events-none absolute -right-60 bottom-0 size-140 rounded-full bg-blue-600 blur-[170px]"
    />

    <div className="relative mx-auto w-full max-w-375 px-4 sm:px-5 lg:px-10">
      {/* CABEÇALHO */}
      <motion.header
        initial={{
          opacity: 0,
          y: 25,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.4,
        }}
        transition={{
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="mb-8"
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/25 bg-yellow-400/8 px-4 py-2">
              <motion.span
                animate={{
                  rotate: [0, 12, -8, 0],
                  scale: [1, 1.15, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <Sparkles
                  size={15}
                  className="text-yellow-400"
                />
              </motion.span>

              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-400">
                Solicite seu orçamento
              </span>
            </div>

            <h2 className="mt-5 font-(family-name:--font-montserrat) text-2xl font-bold leading-tight tracking-tight sm:whitespace-nowrap sm:text-4xl lg:text-5xl">
  Planeje sua viagem{" "}
  <span className="bg-linear-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
    com facilidade
  </span>
</h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
              Siga as quatro etapas abaixo. Você escolhe
              o veículo e informa os detalhes; nossa equipe
              prepara o orçamento.
            </p>
          </div>

          {/* VANTAGENS */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:flex lg:max-w-xl">
            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-xs text-white/65 backdrop-blur-sm">
              <Clock3
                size={16}
                className="shrink-0 text-yellow-400"
              />

              Processo rápido
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-xs text-white/65 backdrop-blur-sm">
              <ShieldCheck
                size={16}
                className="shrink-0 text-emerald-400"
              />

              Sem compromisso
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-xs text-white/65 backdrop-blur-sm">
              <Headphones
                size={16}
                className="shrink-0 text-sky-400"
              />

              Atendimento humano
            </div>
          </div>
        </div>
      </motion.header>

      {/* ÁREA DO PROGRESSO */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        transition={{
          duration: 0.7,
          delay: 0.1,
        }}
        className="rounded-3xl border border-white/10 bg-white/[0.035] p-2 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-3"
      >
        <div className="mb-3 flex items-center justify-between px-2 pt-1 sm:px-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
              Seu progresso
            </p>

            <p className="mt-1 text-xs text-white/60">
              Etapa {currentStepIndex + 1} de{" "}
              {stepOrder.length}
            </p>
          </div>

          <div className="rounded-full border border-yellow-400/20 bg-yellow-400/8 px-3 py-1.5 text-xs font-semibold text-yellow-400">
            {Math.round(
              ((currentStepIndex + 1) /
                stepOrder.length) *
                100
            )}
            % do formulário
          </div>
        </div>

        <QuoteStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={handleStepChange}
        />
      </motion.div>

      {/* CONTEÚDO DA ETAPA */}
      <motion.div
        initial={{
          opacity: 0,
          y: 25,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.1,
        }}
        transition={{
          duration: 0.7,
          delay: 0.15,
        }}
        className="relative mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#101520]/95 shadow-2xl shadow-black/30 backdrop-blur-xl"
      >
        {/* LINHA SUPERIOR */}
        <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-yellow-400/70 to-transparent" />

        {/* CABEÇALHO DA ETAPA */}
        <div className="flex flex-col gap-4 border-b border-white/8 bg-white/2.5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-start gap-4">
            <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400 font-bold text-black shadow-lg shadow-yellow-400/20">
              {currentStepIndex + 1}

              <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-[#101520] bg-emerald-400" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400">
                {currentStepInformation.eyebrow}
              </p>

              <h3 className="mt-1 font-(family-name:--font-montserrat) text-lg font-bold text-white sm:text-xl">
                {currentStepInformation.title}
              </h3>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-white/45 sm:text-sm">
                {currentStepInformation.description}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/45 lg:flex">
            <ShieldCheck
              size={15}
              className="text-emerald-400"
            />

            Seus dados estão seguros
          </div>
        </div>

        {/* CONTEÚDO DINÂMICO */}
        <div className="min-h-90 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -20,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* NAVEGAÇÃO FIXA */}
      <div className="sticky bottom-0 z-20 -mx-4 mt-6 bg-linear-to-t from-[#050914] via-[#050914]/98 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 sm:-mx-5 sm:px-5 lg:-mx-10 lg:px-10">
        
          <QuoteNavigation
            currentStep={currentStep}
            canContinue={canContinue}
            isSubmitting={isSubmitting}
            submissionComplete={Boolean(
              submittedQuoteId
            )}
            onBack={goToPreviousStep}
            onContinue={goToNextStep}
          />
        
      </div>
    </div>
  </section>
);
}