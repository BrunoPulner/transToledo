"use client";

import { BusFront, Check, X } from "lucide-react";
import { useEffect, useRef } from "react";

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
    if (event.key === "Escape") {
      onClose();
    }
  };

  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", handleKeyDown);

  closeButtonRef.current?.focus();

  return () => {
    document.body.style.overflow = previousOverflow;
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [vehicle, onClose]);

  if (!vehicle) return null;

  const handleSelectVehicle = () => {
    onSelect(vehicle);
  };

  return (
  <div
    className="
      fixed
      inset-x-0
      bottom-20
      top-16
      z-80
      flex
      items-center
      justify-center
      overflow-y-auto
      overscroll-contain
      bg-black/80
      p-2
      backdrop-blur-md
      sm:p-4
      lg:top-18
      lg:p-5
    "
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vehicle-dialog-title"
      className="
        relative
        mx-auto
        flex
        max-h-full
        w-full
        max-w-350
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-[#10141d]
        shadow-[0_30px_100px_rgba(0,0,0,0.65)]
        sm:rounded-3xl
      "
    >
      <header
        className="
          flex
          shrink-0
          items-center
          justify-between
          gap-4
          border-b
          border-white/10
          bg-[#121720]
          px-4
          py-3
          sm:px-5
          lg:px-6
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="
              flex
              size-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-yellow-400/15
              bg-yellow-400/10
              text-yellow-400
            "
          >
            <BusFront size={18} />
          </span>

          <div className="min-w-0">
            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-yellow-400
                sm:text-[10px]
              "
            >
              Detalhes da frota
            </p>

            <h2
              id="vehicle-dialog-title"
              className="
                mt-0.5
                truncate
                text-lg
                font-bold
                text-white
                sm:text-xl
              "
            >
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
          className="
            flex
            size-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-white/5
            text-slate-300
            transition
            duration-200
            hover:border-yellow-400/40
            hover:bg-yellow-400/10
            hover:text-yellow-400
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-yellow-400
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[#121720]
          "
        >
          <X size={20} />
        </button>
      </header>

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overscroll-contain
          p-3
          [scrollbar-color:rgba(250,204,21,0.45)_transparent]
          scrollbar-thin
          sm:p-4
          lg:grid
          lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]
          lg:gap-5
          lg:p-5
          xl:grid-cols-[minmax(0,1.6fr)_minmax(350px,0.72fr)]
        "
      >
        <div className="min-h-0 min-w-0">
          <VehicleDetailsGallery vehicle={vehicle} />
        </div>

        <aside
          className="
            mt-5
            min-w-0
            space-y-5
            lg:mt-0
            lg:border-l
            lg:border-white/10
            lg:pl-5
          "
        >
          <VehicleDetailsInformation vehicle={vehicle} />

          <div className="border-t border-white/10 pt-5">
            <VehicleFeatureList features={vehicle.features} />
          </div>
        </aside>
      </div>

      <footer
        className="
          flex
          shrink-0
          items-center
          justify-end
          border-t
          border-white/10
          bg-[#0c1017]/95
          px-3
          py-3
          sm:px-5
        "
      >
        <button
          type="button"
          onClick={handleSelectVehicle}
          className={`
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            px-5
            text-xs
            font-bold
            transition
            duration-200
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-yellow-400
            focus-visible:ring-offset-2
            focus-visible:ring-offset-[#0c1017]
            sm:w-auto
            sm:min-w-52
            ${
              selected
                ? `
                  bg-yellow-400
                  text-slate-950
                  shadow-[0_8px_25px_rgba(250,204,21,0.18)]
                `
                : `
                  border
                  border-yellow-400/40
                  bg-yellow-400/10
                  text-yellow-300
                  hover:border-yellow-400
                  hover:bg-yellow-400
                  hover:text-slate-950
                `
            }
          `}
        >
          {selected ? <Check size={17} /> : <BusFront size={17} />}

          {selected ? "Veículo selecionado" : "Selecionar veículo"}
        </button>
      </footer>
    </div>
  </div>
);
}