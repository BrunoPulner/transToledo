"use client";

import {
  BusFront,
  MapPin,
  MapPinned,
  MessageSquareText,
  Pencil,
  UsersRound,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  CustomDestinationDialog,
} from "./TripLocationDialog";

import type {
  DestinationLocation,
} from "./DestinationMapPicker";

type CustomTripFormValues = {
  origin: string;

  originLatitude:
    number | null;

  originLongitude:
    number | null;

  destination: string;

  destinationLatitude:
    number | null;

  destinationLongitude:
    number | null;

  passengers: number;
  notes: string;
};

type CustomTripFormProps = {
  values: CustomTripFormValues;
  maximumPassengers: number;

  onChange: (
    updates: Partial<CustomTripFormValues>,
  ) => void;
};

export function CustomTripForm({
  values,
  maximumPassengers,
  onChange,
}: CustomTripFormProps) {
  const [
    originDialogOpen,
    setOriginDialogOpen,
  ] = useState(false);

  const [
    destinationDialogOpen,
    setDestinationDialogOpen,
  ] = useState(false);

  const initialOrigin =
    useMemo<DestinationLocation | null>(
      () => {
        if (
          !values.origin ||
          values.originLatitude ===
            null ||
          values.originLongitude ===
            null
        ) {
          return null;
        }

        return {
          address: values.origin,

          latitude:
            values.originLatitude,

          longitude:
            values.originLongitude,
        };
      },
      [
        values.origin,
        values.originLatitude,
        values.originLongitude,
      ],
    );

  const initialDestination =
    useMemo<DestinationLocation | null>(
      () => {
        if (
          !values.destination ||
          values.destinationLatitude ===
            null ||
          values.destinationLongitude ===
            null
        ) {
          return null;
        }

        return {
          address:
            values.destination,

          latitude:
            values.destinationLatitude,

          longitude:
            values.destinationLongitude,
        };
      },
      [
        values.destination,
        values.destinationLatitude,
        values.destinationLongitude,
      ],
    );

  const destinationSelected =
    initialDestination !== null;

  const originSelected =
    initialOrigin !== null;

  const passengersInvalid =
    values.passengers < 1 ||
    values.passengers >
      maximumPassengers;

  function confirmOrigin(
    origin: DestinationLocation,
  ) {
    onChange({
      origin: origin.address,

      originLatitude:
        origin.latitude,

      originLongitude:
        origin.longitude,
    });

    setOriginDialogOpen(false);
  }

  function confirmDestination(
    destination: DestinationLocation,
  ) {
    onChange({
      destination:
        destination.address,

      destinationLatitude:
        destination.latitude,

      destinationLongitude:
        destination.longitude,
    });

    setDestinationDialogOpen(
      false,
    );
  }

  function updatePassengerCount(
    value: string,
  ) {
    const parsedValue =
      Number(value);

    onChange({
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
              size-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-yellow-400/10
              text-yellow-400
            "
          >
            <MapPinned
              size={21}
            />
          </span>

          <div>
            <h4
              className="
                text-base
                font-bold
                text-white
              "
            >
              Informações da viagem
            </h4>

            <p
              className="
                mt-1
                text-[11px]
                leading-5
                text-white/40
              "
            >
              Informe o ponto de saída,
              escolha o destino e indique
              quantas pessoas irão
              viajar.
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
                setOriginDialogOpen(
                  true,
                )
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

              <span
                className="
                  min-w-0
                  flex-1
                "
              >
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
                    ? values.origin
                    : "Pesquise ou marque o ponto de saída no mapa"}
                </span>
              </span>

              <Pencil
                size={14}
                className="
                  shrink-0
                  text-white/30
                "
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
              Destino
            </span>

            <button
              type="button"
              onClick={() =>
                setDestinationDialogOpen(
                  true,
                )
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
                  destinationSelected
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
                    destinationSelected
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
                {destinationSelected ? (
                  <MapPin
                    size={15}
                  />
                ) : (
                  <MapPinned
                    size={15}
                  />
                )}
              </span>

              <span
                className="
                  min-w-0
                  flex-1
                "
              >
                <strong
                  className={`
                    block
                    text-xs
                    ${
                      destinationSelected
                        ? "text-white"
                        : "text-white/55"
                    }
                  `}
                >
                  {destinationSelected
                    ? "Destino selecionado"
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
                  {destinationSelected
                    ? values.destination
                    : "Pesquise ou marque o local no mapa"}
                </span>
              </span>

              <Pencil
                size={14}
                className="
                  shrink-0
                  text-white/30
                "
              />
            </button>
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
                value={
                  values.passengers
                }
                onChange={(
                  event,
                ) =>
                  updatePassengerCount(
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
                      ? `
                        border-red-500/50
                        focus:border-red-400
                      `
                      : `
                        border-white/10
                        focus:border-yellow-400/60
                        focus:bg-white/7
                      `
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

              Esta van comporta até{" "}
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
                value={
                  values.notes
                }
                onChange={(
                  event,
                ) =>
                  onChange({
                    notes:
                      event.target
                        .value,
                  })
                }
                maxLength={500}
                rows={4}
                placeholder="Bagagens, pontos de parada ou outras informações..."
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
                  focus:bg-white/7
                "
              />
            </div>

            <p
              className="
                mt-1.5
                text-right
                text-[9px]
                text-white/25
              "
            >
              {
                values.notes.length
              }
              /500
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
          setOriginDialogOpen(
            false,
          )
        }
        onConfirm={confirmOrigin}
      />

      <CustomDestinationDialog
        open={
          destinationDialogOpen
        }
        initialDestination={
          initialDestination
        }
        onClose={() =>
          setDestinationDialogOpen(
            false,
          )
        }
        onConfirm={
          confirmDestination
        }
      />
    </>
  );
}

export type {
  CustomTripFormValues,
};