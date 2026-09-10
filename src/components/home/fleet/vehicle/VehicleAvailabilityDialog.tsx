"use client";

import {
  BusFront,
  CalendarCheck,
  CalendarRange,
  Check,
  Clock3,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  PublicVehicleCalendar,
  type VehicleDateSelection,
} from "../PublicVehicleCalendar";

import type {
  Vehicle,
} from "@/types/vehicles";

type VehicleAvailabilityDialogProps = {
  open: boolean;
  vehicle: Vehicle | null;
  initialSelection?: VehicleDateSelection | null;
  onClose: () => void;
  onConfirm: (
    vehicle: Vehicle,
    selection: VehicleDateSelection,
  ) => void;
};

const dateFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

export function VehicleAvailabilityDialog({
  open,
  vehicle,
  initialSelection = null,
  onClose,
  onConfirm,
}: VehicleAvailabilityDialogProps) {
  const [
    selectedPeriod,
    setSelectedPeriod,
  ] = useState<VehicleDateSelection | null>(
    initialSelection,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPeriod(
      initialSelection,
    );
  }, [
    initialSelection,
    open,
    vehicle?.id,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    function handleEscape(
      event: KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [
    onClose,
    open,
  ]);

  if (
    !open ||
    !vehicle ||
    typeof document ===
      "undefined"
  ) {
    return null;
  }

  function confirmPeriod() {
    if (
      !vehicle ||
      !selectedPeriod
    ) {
      return;
    }

    onConfirm(
      vehicle,
      selectedPeriod,
    );
  }

  return createPortal(
    <div
      role="presentation"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
      className="
        fixed
        inset-0
        z-100
        flex
        items-end
        justify-center
        bg-black/80
        p-0
        backdrop-blur-sm
        sm:items-center
        sm:p-5
      "
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-availability-title"
        className="
          flex
          max-h-[95dvh]
          w-full
          flex-col
          overflow-hidden
          rounded-t-3xl
          border
          border-white/10
          bg-[#121620]
          shadow-2xl
          shadow-black/50
          sm:max-w-5xl
          sm:rounded-3xl
        "
      >
        <header
          className="
            flex
            shrink-0
            items-start
            justify-between
            border-b
            border-white/10
            px-4
            py-4
            sm:px-6
          "
        >
          <div className="flex min-w-0 items-start gap-3">
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
              <CalendarCheck
                size={21}
              />
            </span>

            <div className="min-w-0">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.16em]
                  text-yellow-400
                "
              >
                Agenda do veículo
              </p>

              <h3
                id="vehicle-availability-title"
                className="
                  mt-1
                  truncate
                  text-lg
                  font-bold
                  text-white
                  sm:text-xl
                "
              >
                Escolha o período da
                viagem
              </h3>

              <p
                className="
                  mt-1
                  flex
                  items-center
                  gap-1.5
                  text-xs
                  text-white/45
                "
              >
                <BusFront
                  size={13}
                  className="text-yellow-400"
                />

                {vehicle.model}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Fechar agenda"
            className="
              flex
              size-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/5
              text-white/50
              transition
              hover:border-yellow-400/40
              hover:text-yellow-400
            "
          >
            <X size={17} />
          </button>
        </header>

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            p-3
            sm:p-5
          "
        >
          <div
            className="
              mb-4
              grid
              gap-2
              sm:grid-cols-3
            "
          >
            <LegendItem
              color="bg-emerald-400"
              label="Disponível"
            />

            <LegendItem
              color="bg-red-500"
              label="Ocupado"
            />

            <LegendItem
              color="bg-amber-400"
              label="Parcialmente ocupado"
            />
          </div>

          <PublicVehicleCalendar
            key={vehicle.id}
            vehicleId={
              vehicle.id
            }
            onSelectionChange={
              setSelectedPeriod
            }
          />

          <div
            className={`
              mt-4
              rounded-2xl
              border
              p-4
              ${
                selectedPeriod
                  ? `
                    border-emerald-400/25
                    bg-emerald-400/8
                  `
                  : `
                    border-white/10
                    bg-white/3
                  `
              }
            `}
          >
            <div className="flex items-start gap-3">
              <span
                className={`
                  flex
                  size-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ${
                    selectedPeriod
                      ? `
                        bg-emerald-400/15
                        text-emerald-300
                      `
                      : `
                        bg-white/5
                        text-white/30
                      `
                  }
                `}
              >
                {selectedPeriod ? (
                  <Check
                    size={17}
                  />
                ) : (
                  <CalendarRange
                    size={17}
                  />
                )}
              </span>

              <div>
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-white/35
                  "
                >
                  Período selecionado
                </p>

                {selectedPeriod ? (
                  <div
                    className="
                      mt-2
                      grid
                      gap-2
                      text-xs
                      text-white/70
                      sm:grid-cols-2
                    "
                  >
                    <PeriodItem
                      label="Saída"
                      date={
                        selectedPeriod
                          .departureDate
                      }
                    />

                    <PeriodItem
                      label="Retorno"
                      date={
                        selectedPeriod
                          .returnDate
                      }
                    />
                  </div>
                ) : (
                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-white/40
                    "
                  >
                    Escolha no calendário
                    a data e o horário de
                    saída e retorno.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer
          className="
            flex
            shrink-0
            flex-col-reverse
            gap-2
            border-t
            border-white/10
            bg-[#0f131c]
            p-4
            sm:flex-row
            sm:items-center
            sm:justify-end
            sm:px-6
          "
        >
          <button
            type="button"
            onClick={
              onClose
            }
            className="
              flex
              h-11
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-5
              text-xs
              font-bold
              text-white/60
              transition
              hover:border-white/20
              hover:text-white
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={
              !selectedPeriod
            }
            onClick={
              confirmPeriod
            }
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-yellow-400
              px-5
              text-xs
              font-bold
              text-slate-950
              transition
              hover:bg-yellow-300
              disabled:cursor-not-allowed
              disabled:bg-white/8
              disabled:text-white/25
            "
          >
            <CalendarCheck
              size={16}
            />

            Confirmar período
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

type LegendItemProps = {
  color: string;
  label: string;
};

function LegendItem({
  color,
  label,
}: LegendItemProps) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-xl
        border
        border-white/8
        bg-white/3
        px-3
        py-2
      "
    >
      <span
        className={`
          size-2
          shrink-0
          rounded-full
          ${color}
        `}
      />

      <span
        className="
          text-[10px]
          font-medium
          text-white/50
        "
      >
        {label}
      </span>
    </div>
  );
}

type PeriodItemProps = {
  label: string;
  date: Date;
};

function PeriodItem({
  label,
  date,
}: PeriodItemProps) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/8
        bg-black/15
        px-3
        py-2
      "
    >
      <p
        className="
          flex
          items-center
          gap-1.5
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          text-white/30
        "
      >
        <Clock3
          size={11}
          className="text-yellow-400"
        />

        {label}
      </p>

      <p
        className="
          mt-1
          font-semibold
          text-white
        "
      >
        {dateFormatter.format(
          date,
        )}
      </p>
    </div>
  );
}