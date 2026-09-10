"use client";

import {
  useMemo,
  useState,
} from "react";

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

  return (
    <section
      id="frota"
      className="
        relative
        isolate
        scroll-mt-28
        overflow-x-clip
        bg-slate-950
        py-12
        text-white
        lg:min-h-[calc(100vh-112px)]
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -left-40
          top-20
          size-96
          rounded-full
          bg-yellow-400/8
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-0
          size-96
          rounded-full
          bg-yellow-400/6
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          w-full
          max-w-375
          px-4
          sm:px-5
          lg:px-10
        "
      >
        <header className="mb-6">
          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.18em]
              text-yellow-400
            "
          >
            Solicite seu orçamento
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-bold
              tracking-tight
              sm:text-3xl
              lg:text-4xl
            "
          >
            Planeje sua viagem com a
            TransToledo
          </h2>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-white/50
            "
          >
            Escolha a van, consulte a
            agenda, informe o destino e
            envie sua solicitação para
            nossa equipe.
          </p>
        </header>

        <QuoteStepper
          currentStep={
            currentStep
          }
          completedSteps={
            completedSteps
          }
          onStepChange={
            handleStepChange
          }
        />

        <div
          className="
            mt-5
            min-h-90
            rounded-3xl
            border
            border-white/10
            bg-[#121620]
            p-4
            shadow-2xl
            shadow-black/20
            sm:p-6
          "
        >
          {renderCurrentStep()}
        </div>

        <div
          className="
            sticky
            bottom-0
            z-20
            -mx-4
            mt-6
            bg-linear-to-t
            from-slate-950
            via-slate-950/95
            to-transparent
            px-4
            pb-[max(1rem,env(safe-area-inset-bottom))]
            pt-5
            sm:-mx-5
            sm:px-5
            lg:-mx-10
            lg:px-10
          "
        >
          <QuoteNavigation
            currentStep={
              currentStep
            }
            canContinue={
              canContinue
            }
            isSubmitting={
              isSubmitting
            }
            submissionComplete={
              Boolean(
                submittedQuoteId,
              )
            }
            onBack={
              goToPreviousStep
            }
            onContinue={
              goToNextStep
            }
          />
        </div>
      </div>
    </section>
  );
}