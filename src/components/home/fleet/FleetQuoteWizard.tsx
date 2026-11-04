
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { QuoteNavigation } from "./QuoteNavigation";
import { QuoteStepper } from "./QuoteStepper";
import { VehicleStep } from "./steps/VehicleStep";
import { TripStep } from "./steps/TripStep";
import { ContactStep } from "./steps/ContactStep";
import { ReviewStep } from "./steps/ReviewStep";

import type { VehicleDateSelection } from "./PublicVehicleCalendar";

import {
  initialQuoteDraft,
  type QuoteDraft,
  type QuoteStep,
} from "@/types/quote";

import type { Vehicle } from "@/types/vehicles";

// ============================================
// CONFIGURAÇÃO DAS ETAPAS
// ============================================

const stepOrder: QuoteStep[] = [
  "vehicle",
  "trip",
  "contact",
  "review",
];

const stepInformation: Record<
  QuoteStep,
  {
    title: string;
    description: string;
  }
> = {
  vehicle: {
    title: "Escolha sua van",
    description:
      "Selecione um veículo e consulte a disponibilidade para sua viagem.",
  },
  trip: {
    title: "Detalhes da viagem",
    description:
      "Informe o destino, a origem e a quantidade de passageiros.",
  },
  contact: {
    title: "Seus dados",
    description:
      "Preencha seus dados para receber o orçamento.",
  },
  review: {
    title: "Revise sua solicitação",
    description:
      "Confira as informações antes de enviar o orçamento.",
  },
};

type SubmitQuoteResponse = {
  success?: boolean;
  quoteRequestId?: string;
  message?: string;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function FleetQuoteWizard() {
  // ==========================================
  // ESTADOS
  // ==========================================

  const [currentStep, setCurrentStep] =
    useState<QuoteStep>("vehicle");

  const [quoteDraft, setQuoteDraft] =
    useState<QuoteDraft>(() => ({
      ...initialQuoteDraft,
      contact: { ...initialQuoteDraft.contact },
    }));

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submissionError, setSubmissionError] =
    useState("");

  const [submittedQuoteId, setSubmittedQuoteId] =
    useState<string | null>(null);

  // ==========================================
  // REFERÊNCIAS PARA ROLAGEM AUTOMÁTICA
  // ==========================================

  const quoteSectionRef =
    useRef<HTMLElement | null>(null);

  const previousStepRef =
    useRef<QuoteStep>(currentStep);

  // ==========================================
  // ROLAGEM AO ALTERAR A ETAPA
  // ==========================================

  useEffect(() => {
    // Não executa no carregamento inicial.
    if (previousStepRef.current === currentStep) {
      return;
    }

    previousStepRef.current = currentStep;

    // Respeita a preferência de acessibilidade
    // configurada pelo usuário no navegador.
    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    const animationFrame = requestAnimationFrame(() => {
      quoteSectionRef.current?.scrollIntoView({
        behavior: prefersReducedMotion
          ? "instant"
          : "smooth",
        block: "start",
      });
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [currentStep]);

  // ==========================================
  // ATUALIZAÇÃO DOS DADOS DO ORÇAMENTO
  // ==========================================

  function updateQuoteDraft(
    updates: Partial<QuoteDraft>,
  ) {
    setQuoteDraft((currentDraft) => ({
      ...currentDraft,
      ...updates,
    }));

    if (submissionError) {
      setSubmissionError("");
    }
  }

  // ==========================================
  // PERÍODO SELECIONADO
  // ==========================================

  const selectedPeriod =
    useMemo<VehicleDateSelection | null>(() => {
      if (
        !quoteDraft.departureDate ||
        !quoteDraft.returnDate
      ) {
        return null;
      }

      return {
        departureDate: quoteDraft.departureDate,
        returnDate: quoteDraft.returnDate,
      };
    }, [
      quoteDraft.departureDate,
      quoteDraft.returnDate,
    ]);

  // ==========================================
  // VALIDAÇÃO DO VEÍCULO E PERÍODO
  // ==========================================

  const validPeriod =
    quoteDraft.departureDate !== null &&
    quoteDraft.returnDate !== null &&
    quoteDraft.returnDate > quoteDraft.departureDate;

  const vehicleStepValid =
    Boolean(
      quoteDraft.vehicleId &&
      quoteDraft.vehicleName,
    ) && validPeriod;

  // ==========================================
  // VALIDAÇÃO DA VIAGEM
  // ==========================================

  const validPassengers =
    Number.isInteger(quoteDraft.passengers) &&
    quoteDraft.passengers > 0;

  const registeredTripValid =
    quoteDraft.tripMode === "registered" &&
    Boolean(
      quoteDraft.frequentTripId &&
        quoteDraft.tripName &&
        quoteDraft.origin.trim() &&
        quoteDraft.destination.trim(),
    ) &&
    quoteDraft.originLatitude !== null &&
    quoteDraft.originLongitude !== null &&
    quoteDraft.destinationLatitude !== null &&
    quoteDraft.destinationLongitude !== null;

  const customTripValid =
    quoteDraft.tripMode === "custom" &&
    Boolean(
      quoteDraft.origin.trim() &&
      quoteDraft.destination.trim(),
    ) &&
    quoteDraft.originLatitude !== null &&
    quoteDraft.originLongitude !== null &&
    quoteDraft.destinationLatitude !== null &&
    quoteDraft.destinationLongitude !== null;

  const tripStepValid =
    vehicleStepValid &&
    validPassengers &&
    (registeredTripValid || customTripValid);

  // ==========================================
  // VALIDAÇÃO DO CONTATO
  // ==========================================

  const contactDataValid =
    quoteDraft.contact.name.trim().length >= 3 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      quoteDraft.contact.email.trim(),
    ) &&
    Boolean(
      quoteDraft.contact.phone &&
      quoteDraft.contact.phoneVerificationToken,
    );

  const contactStepValid =
    tripStepValid && contactDataValid;

  // ==========================================
  // ETAPAS CONCLUÍDAS
  // ==========================================

  const completedSteps = useMemo<QuoteStep[]>(() => {
    const completed: QuoteStep[] = [];

    if (vehicleStepValid) {
      completed.push("vehicle");
    }

    if (tripStepValid) {
      completed.push("trip");
    }

    if (contactStepValid) {
      completed.push("contact");
    }

    if (contactStepValid && submittedQuoteId) {
      completed.push("review");
    }

    return completed;
  }, [
    vehicleStepValid,
    tripStepValid,
    contactStepValid,
    submittedQuoteId,
  ]);

  // ==========================================
  // PERMISSÃO PARA CONTINUAR
  // ==========================================

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

  // ==========================================
  // SELEÇÃO DO VEÍCULO
  // ==========================================

  function handleVehicleSelect(vehicle: Vehicle) {
    const vehicleChanged =
      quoteDraft.vehicleId !== vehicle.id;

    updateQuoteDraft({
      vehicleId: vehicle.id,
      vehicleName: vehicle.model,
      departureDate: vehicleChanged
        ? null
        : quoteDraft.departureDate,
      returnDate: vehicleChanged
        ? null
        : quoteDraft.returnDate,
    });
  }

  // ==========================================
  // CONFIRMAÇÃO DA DISPONIBILIDADE
  // ==========================================

  function handleConfirmAvailability(
    vehicle: Vehicle,
    selection: VehicleDateSelection,
  ) {
    updateQuoteDraft({
      vehicleId: vehicle.id,
      vehicleName: vehicle.model,
      departureDate: selection.departureDate,
      returnDate: selection.returnDate,
    });
  }

  // ==========================================
  // VOLTAR UMA ETAPA
  // ==========================================

  function goToPreviousStep() {
    if (submittedQuoteId) {
      return;
    }

    const currentIndex =
      stepOrder.indexOf(currentStep);

    if (currentIndex <= 0) {
      return;
    }

    const previousStep =
      stepOrder[currentIndex - 1];

    if (previousStep) {
      setCurrentStep(previousStep);
    }
  }

  // ==========================================
  // AVANÇAR UMA ETAPA
  // ==========================================

  async function goToNextStep() {
    if (
      !canContinue ||
      isSubmitting ||
      submittedQuoteId
    ) {
      return;
    }

    if (currentStep === "review") {
      await submitQuote();
      return;
    }

    const nextStep =
      stepOrder[stepOrder.indexOf(currentStep) + 1];

    if (nextStep) {
      setCurrentStep(nextStep);
    }
  }

  // ==========================================
  // NAVEGAÇÃO PELO INDICADOR DE ETAPAS
  // ==========================================

  function handleStepChange(step: QuoteStep) {
    if (submittedQuoteId) {
      return;
    }

    const requestedIndex =
      stepOrder.indexOf(step);

    const currentIndex =
      stepOrder.indexOf(currentStep);

    if (
      requestedIndex <= currentIndex ||
      completedSteps.includes(step)
    ) {
      setCurrentStep(step);
    }
  }

  // ==========================================
  // ENVIO DO ORÇAMENTO
  // ==========================================

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicleId: quoteDraft.vehicleId,
            startsAt:
              quoteDraft.departureDate.toISOString(),
            endsAt:
              quoteDraft.returnDate.toISOString(),
            tripMode: quoteDraft.tripMode,
            frequentTripId:
              quoteDraft.frequentTripId,
            tripName: quoteDraft.tripName,
            origin: quoteDraft.origin,
            originLatitude:
              quoteDraft.originLatitude,
            originLongitude:
              quoteDraft.originLongitude,
            destination: quoteDraft.destination,
            destinationLatitude:
              quoteDraft.destinationLatitude,
            destinationLongitude:
              quoteDraft.destinationLongitude,
            passengers: quoteDraft.passengers,
            notes: quoteDraft.notes,
            name: quoteDraft.contact.name,
            email: quoteDraft.contact.email,
            phone: quoteDraft.contact.phone,
            phoneVerificationToken:
              quoteDraft.contact.phoneVerificationToken,
          }),
        },
      );

      const result =
        (await response.json()) as SubmitQuoteResponse;

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

      setSubmittedQuoteId(result.quoteRequestId);
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

  // ==========================================
  // RENDERIZAÇÃO DA ETAPA ATUAL
  // ==========================================

  function renderCurrentStep() {
    switch (currentStep) {
      case "vehicle":
        return (
          <VehicleStep
            selectedVehicleId={quoteDraft.vehicleId}
            selectedPeriod={selectedPeriod}
            onSelectVehicle={handleVehicleSelect}
            onConfirmAvailability={
              handleConfirmAvailability
            }
          />
        );

      case "trip":
        return (
          <TripStep
            quoteDraft={quoteDraft}
            onDraftChange={updateQuoteDraft}
          />
        );

      case "contact":
        return (
          <ContactStep
            contact={quoteDraft.contact}
            onContactChange={(contact) =>
              updateQuoteDraft({ contact })
            }
          />
        );

      case "review":
        return (
          <ReviewStep
            quoteDraft={quoteDraft}
            submissionError={submissionError}
            submittedQuoteId={submittedQuoteId}
            onEditStep={(step) => {
              setSubmissionError("");
              setCurrentStep(step);
            }}
          />
        );

      default:
        return null;
    }
  }

  // ==========================================
  // INFORMAÇÕES DA ETAPA ATUAL
  // ==========================================

  const currentStepIndex =
    stepOrder.indexOf(currentStep);

  const currentStepInformation =
    stepInformation[currentStep];

  // ==========================================
  // INTERFACE
  // ==========================================

  return (
    <section
      ref={quoteSectionRef}
      id="frota"
      className="
        relative
        isolate
        scroll-mt-20
        overflow-x-clip
        bg-[#050914]
        py-6
        text-white
        sm:py-8
        lg:min-h-[calc(100vh-72px)]
        lg:py-10
      "
    >
      {/* Fundo quadriculado discreto */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.025]
        "
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-325
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* ==================================
            CABEÇALHO COMPACTO
        ================================== */}

        <header className="mb-5 sm:mb-6">
          <h2
            className="
              font-(family-name:--font-montserrat)
              text-2xl
              font-bold
              tracking-tight
              text-white
              sm:text-3xl
            "
          >
            Solicite seu{" "}
            <span className="text-yellow-400">
              orçamento
            </span>
          </h2>

          <p className="mt-1.5 text-sm text-white/55">
            Escolha seu veículo e informe os detalhes
            da viagem.
          </p>
        </header>

        {/* ==================================
            INDICADOR DE ETAPAS
        ================================== */}

        <div className="mb-5 sm:mb-6">
          <QuoteStepper
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepChange={handleStepChange}
          />
        </div>

        {/* ==================================
            CARD PRINCIPAL
        ================================== */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-white/10
            bg-[#101520]
            shadow-xl
            shadow-black/20
          "
        >
          {/* Cabeçalho da etapa */}

          <div
            className="
              flex
              flex-wrap
              items-start
              justify-between
              gap-3
              border-b
              border-white/8
              px-4
              py-4
              sm:px-6
              sm:py-5
            "
          >
            <div>
              <h3
                className="
                  font-(family-name:--font-montserrat)
                  text-lg
                  font-bold
                  text-white
                  sm:text-xl
                "
              >
                {currentStepInformation.title}
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-white/50
                  sm:text-sm
                "
              >
                {currentStepInformation.description}
              </p>
            </div>

            <span
              className="
                shrink-0
                rounded-full
                border
                border-white/10
                px-2.5
                py-1
                text-[11px]
                text-white/55
              "
            >
              Etapa {currentStepIndex + 1} de{" "}
              {stepOrder.length}
            </span>
          </div>

          {/* ==================================
              CONTEÚDO DA ETAPA
          ================================== */}

          <div className="p-3 sm:p-5 lg:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut",
                }}
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ==================================
              NAVEGAÇÃO
          ================================== */}

          <div
            className="
              border-t
              border-white/8
              p-3
              sm:p-4
            "
          >
            <QuoteNavigation
              currentStep={currentStep}
              canContinue={canContinue}
              isSubmitting={isSubmitting}
              submissionComplete={Boolean(
                submittedQuoteId,
              )}
              onBack={goToPreviousStep}
              onContinue={goToNextStep}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
