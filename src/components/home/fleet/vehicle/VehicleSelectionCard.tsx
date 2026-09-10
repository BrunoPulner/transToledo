"use client";

import {
  BriefcaseBusiness,
  BusFront,
  CalendarDays,
  Check,
  Clock3,
  Snowflake,
  UsersRound,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import Image from "next/image";

import type {
  VehicleDateSelection,
} from "../PublicVehicleCalendar";

import type {
  Vehicle,
} from "@/types/vehicles";

type VehicleSelectionCardProps = {
  vehicle: Vehicle;
  selected: boolean;
  selectedPeriod?: VehicleDateSelection | null;

  onSelect: (
    vehicle: Vehicle,
  ) => void;

  onOpenAvailability: (
    vehicle: Vehicle,
  ) => void;

  onOpenDetails: (
    vehicle: Vehicle,
  ) => void;
};

const luggageLabels = {
  small: "Pequeno",
  medium: "Médio",
  large: "Amplo",
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

function getVehicleCover(
  vehicle: Vehicle,
) {
  return (
    vehicle.media.find(
      (media) =>
        media.type ===
          "image" &&
        media.isCover,
    )?.url ??
    vehicle.media.find(
      (media) =>
        media.type ===
        "image",
    )?.url ??
    null
  );
}

export function VehicleSelectionCard({
  vehicle,
  selected,
  selectedPeriod = null,
  onSelect,
  onOpenAvailability,
  onOpenDetails,
}: VehicleSelectionCardProps) {
  const cover =
    getVehicleCover(vehicle);

  const hasConfirmedPeriod =
    selected &&
    selectedPeriod !== null;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() =>
        onOpenDetails(vehicle)
      }
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          onOpenDetails(vehicle);
        }
      }}
      className={`
        group
        flex
        h-full
        cursor-pointer
        flex-col
        overflow-hidden
        rounded-3xl
        border
        transition
        duration-300
        ${
          selected
            ? `
              border-yellow-400
              bg-yellow-400/8
              shadow-xl
              shadow-yellow-400/10
            `
            : `
              border-white/10
              bg-white/4
              hover:-translate-y-1
              hover:border-white/20
              hover:bg-white/6
            `
        }
      `}
    >
      <div
        className="
          relative
          aspect-video
          overflow-hidden
          bg-black/30
        "
      >
        {cover ? (
          <Image
            src={cover}
            alt={`Veículo ${vehicle.model}`}
            fill
            unoptimized
            sizes="
              (max-width: 768px) 100vw,
              (max-width: 1280px) 50vw,
              33vw
            "
            className="
              object-contain
              p-2
              transition
              duration-500
              group-hover:scale-[1.02]
            "
          />
        ) : (
          <div
            className="
              flex
              size-full
              items-center
              justify-center
            "
          >
            <BusFront
              size={48}
              className="text-white/15"
            />
          </div>
        )}

        <span
          className="
            absolute
            left-3
            top-3
            rounded-full
            border
            border-white/10
            bg-black/70
            px-3
            py-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-white
            backdrop-blur-sm
          "
        >
          {vehicle.year}
        </span>

        {selected && (
          <span
            className="
              absolute
              right-3
              top-3
              flex
              items-center
              gap-1.5
              rounded-full
              bg-yellow-400
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              text-slate-950
            "
          >
            <Check size={13} />

            Selecionada
          </span>
        )}
      </div>

      <div
        className="
          flex
          flex-1
          flex-col
          p-4
          sm:p-5
        "
      >
        <div>
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-yellow-400
            "
          >
            Van disponível
          </p>

          <h3
            className="
              mt-1
              font-(family-name:--font-montserrat)
              text-lg
              font-bold
              text-white
            "
          >
            {vehicle.model}
          </h3>
        </div>

        <div
          className="
            mt-4
            grid
            grid-cols-2
            gap-2
          "
        >
          <VehicleDetail
            icon={UsersRound}
            label="Capacidade"
            value={`${vehicle.passengerCapacity} passageiros`}
          />

          <VehicleDetail
            icon={
              BriefcaseBusiness
            }
            label="Bagageiro"
            value={
              luggageLabels[
                vehicle
                  .luggageSize
              ]
            }
          />
        </div>

        <div
          className="
            mt-3
            flex
            min-h-7
            flex-wrap
            gap-2
          "
        >
          {vehicle.features
            .airConditioning && (
            <FeatureBadge
              icon={Snowflake}
              label="Ar-condicionado"
            />
          )}

          {vehicle.features
            .wifi && (
            <FeatureBadge
              icon={Wifi}
              label="Wi-Fi"
            />
          )}

          {vehicle.media.length >
            0 && (
            <span
              className="
                rounded-full
                border
                border-white/10
                bg-white/5
                px-2.5
                py-1
                text-[10px]
                font-medium
                text-white/50
              "
            >
              {
                vehicle.media
                  .length
              }{" "}
              {vehicle.media
                .length === 1
                ? "mídia"
                : "mídias"}
            </span>
          )}
        </div>

        {hasConfirmedPeriod &&
          selectedPeriod && (
            <div
              className="
                mt-4
                rounded-2xl
                border
                border-emerald-400/25
                bg-emerald-400/8
                p-3
              "
            >
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
                    size-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-400/15
                    text-emerald-300
                  "
                >
                  <CalendarDays
                    size={15}
                  />
                </span>

                <div>
                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-emerald-300
                    "
                  >
                    Período confirmado
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[10px]
                      text-white/45
                    "
                  >
                    Você pode alterar
                    pela agenda.
                  </p>
                </div>
              </div>

              <div
                className="
                  mt-3
                  space-y-2
                "
              >
                <PeriodLine
                  label="Saída"
                  date={
                    selectedPeriod
                      .departureDate
                  }
                />

                <PeriodLine
                  label="Retorno"
                  date={
                    selectedPeriod
                      .returnDate
                  }
                />
              </div>
            </div>
          )}

        <div
          className="
            mt-auto
            grid
            grid-cols-2
            gap-2
            pt-5
          "
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenAvailability(
                vehicle,
              );
            }}
            className="
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-3
              text-xs
              font-bold
              text-white
              transition
              hover:border-yellow-400/50
              hover:bg-yellow-400/10
              hover:text-yellow-400
            "
          >
            <CalendarDays
              size={15}
            />

            {hasConfirmedPeriod
              ? "Alterar agenda"
              : "Ver agenda"}
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(vehicle);
            }}
            className={`
              flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              px-3
              text-xs
              font-bold
              transition
              ${
                selected
                  ? `
                    bg-yellow-400
                    text-slate-950
                  `
                  : `
                    border
                    border-white/10
                    bg-white/5
                    text-white
                    hover:border-yellow-400
                    hover:bg-yellow-400
                    hover:text-slate-950
                  `
              }
            `}
          >
            {selected ? (
              <>
                <Check
                  size={15}
                />

                Selecionada
              </>
            ) : (
              <>
                <BusFront
                  size={15}
                />

                Selecionar
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

type VehicleDetailProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function VehicleDetail({
  icon: Icon,
  label,
  value,
}: VehicleDetailProps) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/8
        bg-black/15
        p-3
      "
    >
      <Icon
        size={16}
        className="text-yellow-400"
      />

      <p
        className="
          mt-2
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          text-white/30
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-xs
          font-semibold
          text-white/75
        "
      >
        {value}
      </p>
    </div>
  );
}

type FeatureBadgeProps = {
  icon: LucideIcon;
  label: string;
};

function FeatureBadge({
  icon: Icon,
  label,
}: FeatureBadgeProps) {
  return (
    <span
      className="
        flex
        items-center
        gap-1.5
        rounded-full
        border
        border-white/10
        bg-white/5
        px-2.5
        py-1
        text-[10px]
        font-medium
        text-white/60
      "
    >
      <Icon
        size={11}
        className="text-yellow-400"
      />

      {label}
    </span>
  );
}

type PeriodLineProps = {
  label: string;
  date: Date;
};

function PeriodLine({
  label,
  date,
}: PeriodLineProps) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-2
        rounded-xl
        border
        border-white/8
        bg-black/15
        px-3
        py-2
      "
    >
      <span
        className="
          flex
          items-center
          gap-1.5
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          text-white/35
        "
      >
        <Clock3
          size={11}
          className="text-yellow-400"
        />

        {label}
      </span>

      <strong
        className="
          text-right
          text-[10px]
          font-semibold
          text-white/75
        "
      >
        {dateFormatter.format(
          date,
        )}
      </strong>
    </div>
  );
}
