"use client";

import { BusFront, Check, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import type { Vehicle } from "@/types/vehicles";
import { VehicleDetailsGallery } from "./VehicleDetailsGallery";
import { VehicleDetailsInformation } from "./VehicleDetailsInformation";
import { VehicleFeatureList } from "./VehicleFeatureList";

type VehicleDetailsDialogProps = {
  vehicle: Vehicle | null;
  selected: boolean;
  onClose: () => void;
  onSelect: (vehicle: Vehicle) => void;
};

export function VehicleDetailsDialog({
  vehicle,
  selected,
  onClose,
  onSelect,
}: VehicleDetailsDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!vehicle) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [vehicle, onClose]);

  if (!vehicle || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center overflow-hidden bg-black/85 p-2 backdrop-blur-md sm:p-3 lg:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-dialog-title"
        className="relative flex h-full min-h-0 w-full max-w-[1600px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#10141d] shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:rounded-3xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#121720] px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-yellow-400/15 bg-yellow-400/10 text-yellow-400">
              <BusFront size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-yellow-400">
                Detalhes da frota
              </p>
              <h2 id="vehicle-dialog-title" className="truncate text-base font-bold text-white sm:text-lg">
                {vehicle.model}
              </h2>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes do veículo"
            title="Fechar"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:text-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-2.5 [scrollbar-color:rgba(250,204,21,0.45)_transparent] sm:p-3 lg:grid lg:grid-cols-[minmax(0,1.9fr)_minmax(280px,0.8fr)] lg:gap-3 lg:overflow-hidden xl:grid-cols-[minmax(0,2.1fr)_minmax(300px,0.8fr)]">
          <div className="min-h-75 min-w-0 shrink-0 lg:min-h-0 lg:h-full lg:shrink">
            <VehicleDetailsGallery vehicle={vehicle} />
          </div>
          <aside className="min-w-0 space-y-3 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:border-l lg:border-white/10 lg:pl-3 lg:pr-1">
            <VehicleDetailsInformation vehicle={vehicle} />
            <div className="border-t border-white/10 pt-3">
              <VehicleFeatureList features={vehicle.features} />
            </div>
          </aside>
        </div>

        <footer className="flex shrink-0 items-center justify-end border-t border-white/10 bg-[#0c1017]/95 px-3 py-2 sm:px-4">
          <button
            type="button"
            onClick={() => onSelect(vehicle)}
            className={`flex h-9 w-full items-center justify-center gap-2 rounded-lg px-4 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 sm:w-auto sm:min-w-44 ${
              selected
                ? "bg-yellow-400 text-slate-950 shadow-[0_8px_25px_rgba(250,204,21,0.18)]"
                : "border border-yellow-400/40 bg-yellow-400/10 text-yellow-300 hover:border-yellow-400 hover:bg-yellow-400 hover:text-slate-950"
            }`}
          >
            {selected ? <Check size={15} /> : <BusFront size={15} />}
            {selected ? "Veículo selecionado" : "Selecionar veículo"}
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
