"use client";

import { Check, MapPin, MapPinned, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  DestinationMapPicker,
  type DestinationLocation,
} from "./DestinationMapPicker";

export type TripLocationType = "origin" | "destination";

type TripLocationDialogProps = {
  open: boolean;
  locationType: TripLocationType;
  initialLocation?: DestinationLocation | null;
  onClose: () => void;
  onConfirm: (location: DestinationLocation) => void;
};

const locationContent = {
  origin: {
    eyebrow: "Local de embarque",
    title: "Escolha o local de saída",
    description:
      "Pesquise o endereço de embarque e ajuste o pin no ponto exato.",
    instructionsTitle: "Como escolher o local de saída",
    instructions:
      "Pesquise o endereço, clique no mapa ou arraste o pin para marcar o ponto de embarque.",
    currentLabel: "Local de saída atual",
    emptyMessage: "Nenhum local de saída selecionado",
    confirmLabel: "Confirmar local de saída",
    closeLabel: "Fechar seleção do local de saída",
  },
  destination: {
    eyebrow: "Destino da viagem",
    title: "Escolha seu destino",
    description:
      "Pesquise pelo nome do lugar, endereço ou CEP e ajuste o pin no ponto desejado.",
    instructionsTitle: "Como escolher o destino",
    instructions:
      "Pesquise o endereço, clique no mapa ou arraste o pin para ajustar o destino.",
    currentLabel: "Destino atual",
    emptyMessage: "Nenhum destino selecionado",
    confirmLabel: "Confirmar destino",
    closeLabel: "Fechar seleção do destino",
  },
} satisfies Record<
  TripLocationType,
  {
    eyebrow: string;
    title: string;
    description: string;
    instructionsTitle: string;
    instructions: string;
    currentLabel: string;
    emptyMessage: string;
    confirmLabel: string;
    closeLabel: string;
  }
>;

export function TripLocationDialog({
  open,
  locationType,
  initialLocation = null,
  onClose,
  onConfirm,
}: TripLocationDialogProps) {
  const [selectedLocation, setSelectedLocation] =
    useState<DestinationLocation | null>(initialLocation);

  const content = locationContent[locationType];

  useEffect(() => {
    if (!open) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedLocation(initialLocation);
  }, [initialLocation, locationType, open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  const address = selectedLocation?.address ?? "";
  const latitude = selectedLocation?.latitude ?? null;
  const longitude = selectedLocation?.longitude ?? null;

  const locationValid =
    Boolean(address.trim()) &&
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  function confirmLocation() {
    if (!selectedLocation || !locationValid) return;
    onConfirm(selectedLocation);
  }

  return createPortal(
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-100 flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-5"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trip-location-dialog-title"
        className="flex max-h-[95dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#121620] shadow-2xl shadow-black/50 sm:max-w-5xl sm:rounded-3xl"
      >
        <header className="flex shrink-0 items-start justify-between border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
              {locationType === "origin" ? (
                <MapPin size={21} />
              ) : (
                <MapPinned size={21} />
              )}
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-400">
                {content.eyebrow}
              </p>
              <h3
                id="trip-location-dialog-title"
                className="mt-1 text-lg font-bold text-white sm:text-xl"
              >
                {content.title}
              </h3>
              <p className="mt-1 max-w-xl text-xs leading-5 text-white/45">
                {content.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={content.closeLabel}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 transition hover:border-yellow-400/40 hover:text-yellow-400"
          >
            <X size={17} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-yellow-400/15 bg-yellow-400/5 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <Search size={16} />
            </span>
            <div>
              <p className="text-xs font-bold text-white/75">
                {content.instructionsTitle}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-white/40">
                {content.instructions}
              </p>
            </div>
          </div>

          <DestinationMapPicker
            address={address}
            latitude={latitude}
            longitude={longitude}
            onLocationChange={setSelectedLocation}
          />
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-white/10 bg-[#0f131c] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="hidden min-w-0 sm:block">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/30">
              {content.currentLabel}
            </p>
            <p className="mt-1 max-w-md truncate text-xs text-white/55">
              {locationValid ? address : content.emptyMessage}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-xs font-bold text-white/60 transition hover:border-white/20 hover:text-white"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={!locationValid}
              onClick={confirmLocation}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 text-xs font-bold text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-white/8 disabled:text-white/25"
            >
              <Check size={16} />
              {content.confirmLabel}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

type LegacyCustomDestinationDialogProps = {
  open: boolean;
  initialDestination?: DestinationLocation | null;
  onClose: () => void;
  onConfirm: (destination: DestinationLocation) => void;
};

/* Compatibilidade temporária com o CustomTripForm atual. */
export function CustomDestinationDialog({
  open,
  initialDestination = null,
  onClose,
  onConfirm,
}: LegacyCustomDestinationDialogProps) {
  return (
    <TripLocationDialog
      open={open}
      locationType="destination"
      initialLocation={initialDestination}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}
