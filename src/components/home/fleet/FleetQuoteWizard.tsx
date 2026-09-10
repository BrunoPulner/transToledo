"use client";

import {
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";

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

type TemporaryStepProps = {
  icon: LucideIcon;
  title: string;
  description: string;
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

  function updateQuoteDraft(
    updates: Partial<QuoteDraft>,
  ) {
    setQuoteDraft(
      (currentDraft) => ({
        ...currentDraft,
        ...updates,
      }),
    );
  }

  /*
   * Período atualmente salvo no orçamento.
   * Será enviado ao VehicleStep e ao modal.
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
   * Verifica se saída e retorno são válidos.
   */
  const validPeriod =
    quoteDraft.departureDate !==
      null &&
    quoteDraft.returnDate !==
      null &&
    quoteDraft.returnDate >
      quoteDraft.departureDate;

  /*
   * A primeira etapa exige veículo e período.
   */
  const vehicleStepValid =
    Boolean(
      quoteDraft.vehicleId &&
        quoteDraft.vehicleName,
    ) &&
    validPeriod;

  const validPassengers =
    Number.isInteger(
      quoteDraft.passengers,
    ) &&
    quoteDraft.passengers > 0;

  const registeredTripValid =
    quoteDraft.tripMode ===
      "registered" &&
    Boolean(
      quoteDraft.frequentTripId &&
        quoteDraft.tripName &&
        quoteDraft.origin &&
        quoteDraft.destination,
    );

  const customTripValid =
  quoteDraft.tripMode ===
    "custom" &&
  Boolean(
    quoteDraft.origin.trim() &&
      quoteDraft.destination.trim(),
  ) &&
  quoteDraft.destinationLatitude !==
    null &&
  quoteDraft.destinationLongitude !==
    null;


  /*
   * A segunda etapa exige que a primeira
   * esteja completa e que a viagem seja válida.
   */
  const tripStepValid =
    vehicleStepValid &&
    validPassengers &&
    (registeredTripValid ||
      customTripValid);

  /*
   * O telefone somente será considerado
   * válido após receber o token de confirmação.
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
   * A terceira etapa também depende
   * das anteriores.
   */
  const contactStepValid =
    tripStepValid &&
    contactDataValid;

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

      return completed;
    }, [
      vehicleStepValid,
      tripStepValid,
      contactStepValid,
    ]);

  const canContinue = (() => {
    switch (currentStep) {
      case "vehicle":
        return vehicleStepValid;

      case "trip":
        return tripStepValid;

      case "contact":
        return contactStepValid;

      case "review":
        return vehicleSummaryStepValid(
          vehicleStepValid,
          tripStepValid,
          contactStepValid,
        );

      default:
        return false;
    }
  })();

  /*
   * Selecionar outra van apaga o período,
   * pois cada veículo possui agenda própria.
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
   * Ao confirmar a agenda, veículo e período
   * são salvos juntos no orçamento.
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

  function goToPreviousStep() {
    const currentIndex =
      stepOrder.indexOf(
        currentStep,
      );

    if (currentIndex <= 0) {
      return;
    }

    setCurrentStep(
      stepOrder[
        currentIndex - 1
      ],
    );
  }

  async function goToNextStep() {
    if (
      !canContinue ||
      isSubmitting
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

  function handleStepChange(
    step: QuoteStep,
  ) {
    const requestedIndex =
      stepOrder.indexOf(step);

    const currentIndex =
      stepOrder.indexOf(
        currentStep,
      );

    /*
     * Sempre permite retornar para
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
     * Permite reabrir uma etapa que
     * já tenha sido concluída.
     */
    if (
      completedSteps.includes(
        step,
      )
    ) {
      setCurrentStep(step);
    }
  }

  async function submitQuote() {
    setIsSubmitting(true);

    try {
      /*
       * A integração com /api/quote-requests
       * será feita na etapa de revisão.
       */
      console.info(
        "Orçamento pronto para envio:",
        quoteDraft,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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
            onContactChange={
              (contact) =>
                updateQuoteDraft({
                  contact,
                })
            }
          />
        );

      case "review":
        return (
          <TemporaryStep
            icon={
              ClipboardCheck
            }
            title="Revise a solicitação"
            description="Confira todas as informações antes de salvar e abrir o WhatsApp."
          />
        );
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

function TemporaryStep({
  icon: Icon,
  title,
  description,
}: TemporaryStepProps) {
  return (
    <div
      className="
        flex
        min-h-80
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-white/10
        bg-white/2
        px-5
        text-center
      "
    >
      <span
        className="
          flex
          size-14
          items-center
          justify-center
          rounded-2xl
          bg-yellow-400/10
          text-yellow-400
        "
      >
        <Icon size={26} />
      </span>

      <h3
        className="
          mt-4
          text-xl
          font-bold
          text-white
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          max-w-md
          text-sm
          leading-6
          text-white/45
        "
      >
        {description}
      </p>
    </div>
  );
}

function vehicleSummaryStepValid(
  vehicleValid: boolean,
  tripValid: boolean,
  contactValid: boolean,
) {
  return (
    vehicleValid &&
    tripValid &&
    contactValid
  );
}
