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
} from "lucide-react";
import Image from "next/image";
import type { KeyboardEvent } from "react";

import type { VehicleDateSelection } from "../PublicVehicleCalendar";
import type { Vehicle } from "@/types/vehicles";

type VehicleSelectionCardProps = {
  vehicle: Vehicle;
  selected: boolean;
  selectedPeriod?: VehicleDateSelection | null;
  onSelect: (vehicle: Vehicle) => void;
  onOpenAvailability: (vehicle: Vehicle) => void;
  onOpenDetails: (vehicle: Vehicle) => void;
};

const luggageLabels = {
  small: "Pequeno",
  medium: "Médio",
  large: "Amplo",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function getVehicleCover(vehicle: Vehicle): string | null {
  return (
    vehicle.media.find((media) => media.type === "image" && media.isCover)?.url ??
    vehicle.media.find((media) => media.type === "image")?.url ??
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
  const cover = getVehicleCover(vehicle);
  const hasConfirmedPeriod = selected && selectedPeriod !== null;

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenDetails(vehicle);
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${vehicle.model}`}
      onClick={() => onOpenDetails(vehicle)}
      onKeyDown={handleCardKeyDown}
      className={`group flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border transition-colors duration-200 md:flex-row ${
        selected
          ? "border-yellow-400/70 bg-yellow-400/5.5"
          : "border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/5.5"
      }`}
    >
      {/* Imagem compacta à esquerda no desktop */}
      <div className="relative h-44 shrink-0 overflow-hidden bg-black/25 sm:h-52 md:h-auto md:min-h-56 md:w-64 lg:w-72">
        {cover ? (
          <Image
  src={cover}
  alt={`Veículo ${vehicle.model}`}
  fill
  unoptimized
  sizes="(max-width: 640px) 100vw, 320px"
  className="
    object-cover
    object-center
    transition-transform
    duration-500
    group-hover:scale-[1.04]
  "
/>
        ) : (
          <div className="flex size-full items-center justify-center">
            <BusFront size={40} className="text-white/20" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md border border-white/15 bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white">
          {vehicle.year}
        </span>
      </div>

      {/* Informações e ações */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-(family-name:--font-montserrat) text-base font-bold leading-snug text-white sm:text-lg">
              {vehicle.model}
            </h3>
            <p className="mt-1 text-xs text-white/45">
              Consulte os detalhes ou escolha a data da viagem.
            </p>
          </div>
          {selected && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-1 text-[10px] font-bold text-slate-950">
              <Check size={12} /> Selecionada
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <UsersRound size={15} className="text-yellow-400" />
            {vehicle.passengerCapacity} passageiros
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BriefcaseBusiness size={15} className="text-yellow-400" />
            Bagageiro {luggageLabels[vehicle.luggageSize].toLowerCase()}
          </span>
          {vehicle.features.airConditioning && (
            <span className="inline-flex items-center gap-1.5">
              <Snowflake size={15} className="text-yellow-400" />
              Ar-condicionado
            </span>
          )}
          {vehicle.features.wifi && (
            <span className="inline-flex items-center gap-1.5">
              <Wifi size={15} className="text-yellow-400" />
              Wi-Fi
            </span>
          )}
        </div>

        {hasConfirmedPeriod && selectedPeriod && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/6 px-3 py-2.5">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
              <CalendarDays size={14} /> Período confirmado
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={12} className="text-white/45" />
                Saída: {dateFormatter.format(selectedPeriod.departureDate)}
              </span>
              <span>Retorno: {dateFormatter.format(selectedPeriod.returnDate)}</span>
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenAvailability(vehicle);
            }}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-yellow-300 sm:flex-none"
          >
            <CalendarDays size={15} />
            {hasConfirmedPeriod ? "Alterar agenda" : "Ver agenda"}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(vehicle);
            }}
            disabled={selected}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-yellow-400/60 hover:text-yellow-300 disabled:cursor-default disabled:opacity-60 sm:flex-none"
          >
            {selected ? <Check size={15} /> : <BusFront size={15} />}
            {selected ? "Selecionada" : "Selecionar"}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenDetails(vehicle);
            }}
            className="min-h-10 w-full rounded-lg px-3 py-2 text-xs font-medium text-white/55 transition hover:text-white sm:ml-auto sm:w-auto"
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </article>
  );
}
