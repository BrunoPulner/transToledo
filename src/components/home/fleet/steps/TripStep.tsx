"use client";

import {
  BusFront,
  MapPin,
  MapPinned,
  MessageSquareText,
  Pencil,
  Route,
  UsersRound,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  useFleetPreview,
} from "@/app/hooks/fleet/useFleetPreview";

import {
  CustomTripForm,
  type CustomTripFormValues,
} from "../trip/CustomTripForm";

import {
  CustomDestinationDialog,
} from "../trip/TripLocationDialog";

import type {
  DestinationLocation,
} from "../trip/DestinationMapPicker";

import {
  RegisteredTripSelector,
} from "../trip/RegisteredTripSelector";

import {
  TripTypeSelector,
} from "../trip/TripTypeSelector";

import type {
  QuoteDraft,
  QuoteTripMode,
} from "@/types/quote";

import type {
  FrequentTrip,
} from "@/types/trip";

type TripStepProps = {
  quoteDraft: QuoteDraft;

  onDraftChange: (
    updates: Partial<QuoteDraft>,
  ) => void;
};

export function TripStep({
  quoteDraft,
  onDraftChange,
}: TripStepProps) {
  const {
    activeVehicles,
  } = useFleetPreview();

  const selectedVehicle =
    activeVehicles.find(
      (vehicle) =>
        vehicle.id ===
        quoteDraft.vehicleId,
    ) ?? null;

  const maximumPassengers =
    selectedVehicle
      ?.passengerCapacity ?? 1;

  const passengersInvalid =
    quoteDraft.passengers < 1 ||
    quoteDraft.passengers >
      maximumPassengers;

  function selectTripMode(
    mode: QuoteTripMode,
  ) {
    if (
      quoteDraft.tripMode ===
      mode
    ) {
      return;
    }

    if (mode === "registered") {
      onDraftChange({
        tripMode:
          "registered",

        frequentTripId: "",
        tripName: "",

        origin: "",

        originLatitude:
          null,

        originLongitude:
          null,

        destination: "",

        destinationLatitude:
          null,

        destinationLongitude:
          null,
      });

      return;
    }

    onDraftChange({
      tripMode: "custom",

      frequentTripId: "",

      tripName:
        "Viagem personalizada",

      origin: "",

      originLatitude:
        null,

      originLongitude:
        null,

      destination: "",

      destinationLatitude:
        null,

      destinationLongitude:
        null,
    });
  }

  function selectRegisteredTrip(
    trip: FrequentTrip,
  ) {
    const destination =
      trip.location.trim() ||
      [trip.city, trip.state]
        .filter(Boolean)
        .join(" - ");

    onDraftChange({
      tripMode:
        "registered",

      frequentTripId:
        trip.id,

      tripName:
        trip.name,

      destination,

      destinationLatitude:
        trip.latitude,

      destinationLongitude:
        trip.longitude,
    });
  }

  function updateCustomTrip(
    updates: Partial<CustomTripFormValues>,
  ) {
    onDraftChange({
      ...updates,

      tripMode: "custom",
      frequentTripId: "",

      tripName:
        "Viagem personalizada",
    });
  }

  function updatePassengerCount(
    value: string,
  ) {
    const parsedValue =
      Number(value);

    onDraftChange({
      passengers:
        Number.isFinite(
          parsedValue,
        )
          ? Math.trunc(
              parsedValue,
            )
          : 1,
    });
  }

  return (
    <div>
      <header
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                flex
                size-9
                items-center
                justify-center
                rounded-xl
                bg-yellow-400/10
                text-yellow-400
              "
            >
              <MapPinned
                size={18}
              />
            </span>

            <p
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-yellow-400
              "
            >
              Segunda etapa
            </p>
          </div>

          <h3
            className="
              mt-3
              text-xl
              font-bold
              text-white
              sm:text-2xl
            "
          >
            Defina sua viagem
          </h3>

          <p
            className="
              mt-1
              max-w-2xl
              text-sm
              leading-6
              text-white/45
            "
          >
            Escolha uma viagem frequente
            ou informe um destino
            personalizado.
          </p>
        </div>

        {selectedVehicle && (
          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-white/5
              px-3
              py-1.5
            "
          >
            <BusFront
              size={13}
              className="text-yellow-400"
            />

            <span
              className="
                text-[10px]
                font-semibold
                text-white/55
              "
            >
              {
                selectedVehicle.model
              }{" "}
              •{" "}
              {
                selectedVehicle
                  .passengerCapacity
              }{" "}
              passageiros
            </span>
          </div>
        )}
      </header>

      <div className="mt-5">
        <TripTypeSelector
          selectedMode={
            quoteDraft.tripMode
          }
          onSelect={
            selectTripMode
          }
        />
      </div>

      {quoteDraft.tripMode ===
        "registered" && (
        <div
          className="
            mt-5
            space-y-5
          "
        >
          <RegisteredTripSelector
            selectedTripId={
              quoteDraft
                .frequentTripId
            }
            onSelect={
              selectRegisteredTrip
            }
          />

          {quoteDraft.frequentTripId && (
            <RegisteredTripDetails
              origin={
                quoteDraft.origin
              }
              originLatitude={
                quoteDraft
                  .originLatitude
              }
              originLongitude={
                quoteDraft
                  .originLongitude
              }
              passengers={
                quoteDraft.passengers
              }
              notes={
                quoteDraft.notes
              }
              destination={
                quoteDraft.destination
              }
              maximumPassengers={
                maximumPassengers
              }
              passengersInvalid={
                passengersInvalid
              }
              onOriginChange={(
                origin,
              ) =>
                onDraftChange({
                  origin:
                    origin.address,

                  originLatitude:
                    origin.latitude,

                  originLongitude:
                    origin.longitude,
                })
              }
              onPassengersChange={
                updatePassengerCount
              }
              onNotesChange={(
                notes,
              ) =>
                onDraftChange({
                  notes,
                })
              }
            />
          )}
        </div>
      )}

      {quoteDraft.tripMode ===
        "custom" && (
        <div className="mt-5">
          <CustomTripForm
            values={{
              origin:
                quoteDraft.origin,

              originLatitude:
                quoteDraft
                  .originLatitude,

              originLongitude:
                quoteDraft
                  .originLongitude,

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
            }}
            maximumPassengers={
              maximumPassengers
            }
            onChange={
              updateCustomTrip
            }
          />
        </div>
      )}

      {!quoteDraft.tripMode && (
        <div
          className="
            mt-5
            flex
            min-h-36
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
          <Route
            size={25}
            className="text-white/20"
          />

          <p
            className="
              mt-3
              text-xs
              font-medium
              text-white/40
            "
          >
            Selecione uma das opções
            acima para continuar.
          </p>
        </div>
      )}
    </div>
  );
}

type RegisteredTripDetailsProps = {
  origin: string;
  originLatitude: number | null;
  originLongitude: number | null;
  destination: string;
  passengers: number;
  notes: string;
  maximumPassengers: number;
  passengersInvalid: boolean;

  onOriginChange: (
    origin: DestinationLocation,
  ) => void;

  onPassengersChange: (
    value: string,
  ) => void;

  onNotesChange: (
    value: string,
  ) => void;
};

function RegisteredTripDetails({
  origin,
  originLatitude,
  originLongitude,
  destination,
  passengers,
  notes,
  maximumPassengers,
  passengersInvalid,
  onOriginChange,
  onPassengersChange,
  onNotesChange,
}: RegisteredTripDetailsProps) {
  const [
    originDialogOpen,
    setOriginDialogOpen,
  ] = useState(false);

  const initialOrigin =
    useMemo<DestinationLocation | null>(
      () => {
        if (
          !origin ||
          originLatitude === null ||
          originLongitude === null
        ) {
          return null;
        }

        return {
          address: origin,
          latitude: originLatitude,
          longitude: originLongitude,
        };
      },
      [
        origin,
        originLatitude,
        originLongitude,
      ],
    );

  const originSelected =
    initialOrigin !== null;

  function confirmOrigin(
    selectedOrigin: DestinationLocation,
  ) {
    onOriginChange(selectedOrigin);
    setOriginDialogOpen(false);
  }

  return (
    <>
      <div
        className="
          rounded-3xl
          border
          border-white/10
          bg-white/3
          p-4
          sm:p-5
        "
      >
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        <span
          className="
            flex
            size-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-yellow-400/10
            text-yellow-400
          "
        >
          <Route
            size={18}
          />
        </span>

        <div>
          <h4
            className="
              text-sm
              font-bold
              text-white
            "
          >
            Complete as informações
          </h4>

          <p
            className="
              mt-1
              text-[11px]
              text-white/40
            "
          >
            Informe o ponto de saída e
            a quantidade de passageiros.
          </p>
        </div>
      </div>

      <div
        className="
          mt-5
          grid
          gap-4
          lg:grid-cols-2
        "
      >
        <div>
          <span
            className="
              mb-1.5
              block
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-white/40
            "
          >
            Local de saída
          </span>

          <button
            type="button"
            onClick={() =>
              setOriginDialogOpen(true)
            }
            className={`
              flex
              min-h-11
              w-full
              items-center
              gap-3
              rounded-xl
              border
              px-3
              py-2.5
              text-left
              transition
              ${
                originSelected
                  ? `
                    border-emerald-400/25
                    bg-emerald-400/8
                  `
                  : `
                    border-white/10
                    bg-white/5
                    hover:border-yellow-400/50
                    hover:bg-yellow-400/5
                  `
              }
            `}
          >
            <span
              className={`
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                ${
                  originSelected
                    ? `
                      bg-emerald-400/15
                      text-emerald-300
                    `
                    : `
                      bg-yellow-400/10
                      text-yellow-400
                    `
                }
              `}
            >
              {originSelected ? (
                <MapPin size={15} />
              ) : (
                <MapPinned size={15} />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <strong
                className={`
                  block
                  text-xs
                  ${
                    originSelected
                      ? "text-white"
                      : "text-white/55"
                  }
                `}
              >
                {originSelected
                  ? "Local de saída selecionado"
                  : "Escolher no mapa"}
              </strong>

              <span
                className="
                  mt-0.5
                  block
                  truncate
                  text-[10px]
                  text-white/35
                "
              >
                {originSelected
                  ? origin
                  : "Pesquise ou marque o ponto de saída no mapa"}
              </span>
            </span>

            <Pencil
              size={14}
              className="shrink-0 text-white/30"
            />
          </button>
        </div>

        <div>
          <span
            className="
              mb-1.5
              block
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-white/40
            "
          >
            Destino selecionado
          </span>

          <div
            className="
              flex
              min-h-11
              items-center
              gap-2
              rounded-xl
              border
              border-emerald-400/20
              bg-emerald-400/5
              px-3
              py-2
            "
          >
            <MapPin
              size={15}
              className="
                shrink-0
                text-emerald-300
              "
            />

            <span
              className="
                text-xs
                leading-5
                text-white/65
              "
            >
              {destination}
            </span>
          </div>
        </div>

        <label>
          <span
            className="
              mb-1.5
              block
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-white/40
            "
          >
            Quantidade de passageiros
          </span>

          <div className="relative">
            <UsersRound
              size={16}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-yellow-400
              "
            />

            <input
              type="number"
              min={1}
              max={
                maximumPassengers
              }
              value={passengers}
              onChange={(
                event,
              ) =>
                onPassengersChange(
                  event.target
                    .value,
                )
              }
              className={`
                h-11
                w-full
                rounded-xl
                border
                bg-white/5
                pl-10
                pr-3
                text-sm
                text-white
                outline-none
                transition
                ${
                  passengersInvalid
                    ? "border-red-500/50"
                    : "border-white/10 focus focus:border-yellow-400/60"
                }
              `}
            />
          </div>

          <p
            className={`
              mt-1.5
              flex
              items-center
              gap-1.5
              text-[10px]
              ${
                passengersInvalid
                  ? "text-red-300"
                  : "text-white/25"
              }
            `}
          >
            <BusFront
              size={11}
            />

            Capacidade máxima:{" "}
            {maximumPassengers}{" "}
            passageiros.
          </p>
        </label>

        <label>
          <span
            className="
              mb-1.5
              block
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-white/40
            "
          >
            Observações
          </span>

          <div className="relative">
            <MessageSquareText
              size={16}
              className="
                pointer-events-none
                absolute
                left-3
                top-3.5
                text-yellow-400
              "
            />

            <textarea
              value={notes}
              onChange={(
                event,
              ) =>
                onNotesChange(
                  event.target
                    .value,
                )
              }
              maxLength={500}
              rows={4}
              placeholder="Bagagens, paradas ou outras informações..."
              className="
                min-h-28
                w-full
                resize-none
                rounded-xl
                border
                border-white/10
                bg-white/5
                py-3
                pl-10
                pr-3
                text-sm
                text-white
                outline-none
                transition
                placeholder:text-white/25
                focus:border-yellow-400/60
              "
            />
          </div>

          <p
            className="
              mt-1
              text-right
              text-[9px]
              text-white/25
            "
          >
            {notes.length}/500
          </p>
        </label>
        </div>
      </div>

      <CustomDestinationDialog
        open={originDialogOpen}
        initialDestination={
          initialOrigin
        }
        onClose={() =>
          setOriginDialogOpen(false)
        }
        onConfirm={confirmOrigin}
      />
    </>
  );
}
