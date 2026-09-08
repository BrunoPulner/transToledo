"use client";

import {
  BusFront,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import Image from "next/image";

import type {
  Vehicle,
} from "@/types/vehicles";

type FleetSidebarProps = {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  collapsed: boolean;

  onSelect: (
    vehicleId: string,
  ) => void;

  onToggle: () => void;
};

function getVehicleThumbnail(
  vehicle: Vehicle,
) {
  return (
    vehicle.media.find(
      (media) =>
        media.type === "image" &&
        media.isCover,
    )?.url ??
    vehicle.media.find(
      (media) =>
        media.type === "image",
    )?.url ??
    null
  );
}

export function FleetSidebar({
  vehicles,
  selectedVehicleId,
  collapsed,
  onSelect,
  onToggle,
}: FleetSidebarProps) {
  return (
    <aside
      className="
        relative
        flex
        min-h-0
        flex-col
        rounded-3xl
        border
        border-white/10
        bg-white/4
        p-3
        transition-all
        duration-300
      "
    >
      {/* CABEÇALHO DO MENU */}
      <div
        className={`flex items-center ${
          collapsed
            ? "justify-center"
            : "justify-between"
        }`}
      >
        {!collapsed && (
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
            Selecione um veículo
          </p>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-label={
            collapsed
              ? "Expandir menu da frota"
              : "Recolher menu da frota"
          }
          title={
            collapsed
              ? "Expandir menu"
              : "Recolher menu"
          }
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
            text-white/55
            transition
            hover:border-yellow-400/40
            hover:bg-yellow-400/10
            hover:text-yellow-400
          "
        >
          {collapsed ? (
            <PanelLeftOpen
              size={17}
            />
          ) : (
            <PanelLeftClose
              size={17}
            />
          )}
        </button>
      </div>

      {/* LISTA COM SCROLL */}
      <div
        className="
          mt-3
          flex
          gap-2
          overflow-x-auto
          pb-1
          lg:min-h-0
          lg:flex-1
          lg:flex-col
          lg:overflow-x-hidden
          lg:overflow-y-auto
          lg:pr-1
        "
      >
        {vehicles.map(
          (vehicle) => {
            const active =
              vehicle.id ===
              selectedVehicleId;

            const thumbnail =
              getVehicleThumbnail(
                vehicle,
              );

            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() =>
                  onSelect(
                    vehicle.id,
                  )
                }
                title={
                  collapsed
                    ? vehicle.model
                    : undefined
                }
                className={`
                  flex
                  shrink-0
                  items-center
                  rounded-2xl
                  border
                  text-left
                  transition
                  duration-300
                  ${
                    collapsed
                      ? "justify-center p-1.5"
                      : "min-w-60 gap-3 p-2 lg:min-w-0"
                  }
                  ${
                    active
                      ? "border-yellow-400/50 bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-400/10"
                      : "border-transparent bg-white/4 text-white hover:border-white/10 hover:bg-white/8"
                  }
                `}
              >
                {/* MINIATURA */}
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-black/20">
                  {thumbnail ? (
                    <Image
                      src={
                        thumbnail
                      }
                      alt={`Veículo ${vehicle.model}`}
                      fill
                      unoptimized
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center">
                      <BusFront
                        size={22}
                        className={
                          active
                            ? "text-slate-950/40"
                            : "text-white/20"
                        }
                      />
                    </span>
                  )}
                </span>

                {/* INFORMAÇÕES */}
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-(family-name:--font-montserrat) text-sm font-bold">
                        {
                          vehicle.model
                        }
                      </span>

                      <span
                        className={`mt-1 block text-[11px] ${
                          active
                            ? "text-slate-950/65"
                            : "text-white/40"
                        }`}
                      >
                        {
                          vehicle.year
                        }{" "}
                        •{" "}
                        {
                          vehicle.passengerCapacity
                        }{" "}
                        passageiros
                      </span>
                    </span>

                    <ChevronRight
                      size={16}
                      className={
                        active
                          ? "text-slate-950"
                          : "text-white/25"
                      }
                    />
                  </>
                )}
              </button>
            );
          },
        )}
      </div>
    </aside>
  );
}