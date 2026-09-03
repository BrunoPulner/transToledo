"use client";

import {
  BusFront,
  CheckCircle2,
  LoaderCircle,
  Users,
  Wrench,
} from "lucide-react";

import type {
  Vehicle,
  VehicleStatus,
} from "@/types/vehicles";

type VehicleScheduleSelectorProps = {
  vehicles: Vehicle[];

  selectedVehicleId: string;

  loading?: boolean;

  onChange: (
    vehicleId: string,
  ) => void;
};

const statusInformation: Record<
  VehicleStatus,
  {
    label: string;
    className: string;
  }
> = {
  active: {
    label: "Ativa",

    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },

  maintenance: {
    label: "Em manutenção",

    className:
      "border-orange-500/20 bg-orange-500/10 text-orange-400",
  },

  inactive: {
    label: "Inativa",

    className:
      "border-white/10 bg-white/5 text-white/40",
  },
};

function getVehicleCover(
  vehicle: Vehicle,
) {
  return (
    vehicle.media.find(
      (mediaItem) =>
        mediaItem.type ===
          "image" &&
        mediaItem.isCover,
    ) ??
    vehicle.media.find(
      (mediaItem) =>
        mediaItem.type ===
        "image",
    )
  );
}

export function VehicleScheduleSelector({
  vehicles,
  selectedVehicleId,
  loading = false,
  onChange,
}: VehicleScheduleSelectorProps) {
  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
        <div className="flex min-h-44 items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-white/40">
            <LoaderCircle
              size={21}
              className="animate-spin text-yellow-400"
            />

            Carregando frota...
          </div>
        </div>
      </section>
    );
  }

  if (vehicles.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
        <div className="flex min-h-44 flex-col items-center justify-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
            <BusFront size={25} />
          </span>

          <h2 className="mt-4 font-semibold text-white">
            Nenhum veículo cadastrado
          </h2>

          <p className="mt-2 text-sm text-white/40">
            Cadastre uma van antes de
            configurar sua agenda.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/2.5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
          <BusFront size={19} />
        </span>

        <div>
          <h2 className="font-semibold text-white">
            Veículos da agenda
          </h2>

          <p className="mt-1 text-sm leading-6 text-white/40">
            Selecione uma van para
            consultar seus horários,
            viagens e bloqueios.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {vehicles.map(
          (vehicle) => {
            const selected =
              vehicle.id ===
              selectedVehicleId;

            const status =
              statusInformation[
                vehicle.status
              ];

            const cover =
              getVehicleCover(
                vehicle,
              );

            return (
              <button
                key={vehicle.id}
                type="button"
                onClick={() =>
                  onChange(
                    vehicle.id,
                  )
                }
                aria-pressed={
                  selected
                }
                className={`
                  group
                  relative
                  overflow-hidden
                  rounded-2xl
                  border
                  text-left
                  transition
                  duration-200

                  ${
                    selected
                      ? `
                        border-yellow-400
                        bg-yellow-400/5
                        shadow-[0_0_0_1px_rgba(250,204,21,0.15)]
                      `
                      : `
                        border-white/10
                        bg-black/20
                        hover:border-white/20
                        hover:bg-white/3
                      `
                  }
                `}
              >
                <div className="relative aspect-video overflow-hidden border-b border-white/10 bg-white/5">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover.url}
                      alt={
                        vehicle.model
                      }
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/20">
                      <BusFront
                        size={34}
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />

                  {selected && (
                    <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-yellow-400 text-black shadow-lg">
                      <CheckCircle2
                        size={19}
                      />
                    </span>
                  )}

                  <span
                    className={`
                      absolute
                      bottom-3
                      left-3
                      rounded-full
                      border
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      backdrop-blur-md
                      ${status.className}
                    `}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="p-4">
                  <h3
                    className={`
                      truncate
                      font-semibold
                      transition

                      ${
                        selected
                          ? "text-yellow-400"
                          : "text-white group-hover:text-yellow-400"
                      }
                    `}
                  >
                    {vehicle.model}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/45">
                    <span>
                      Ano:{" "}
                      {vehicle.year}
                    </span>

                    <span className="flex items-center gap-1.5">
                      <Users
                        size={14}
                      />

                      {
                        vehicle.passengerCapacity
                      }{" "}
                      passageiros
                    </span>
                  </div>

                  {vehicle.status ===
                    "maintenance" && (
                    <p className="mt-3 flex items-center gap-2 text-xs font-medium text-orange-400">
                      <Wrench
                        size={14}
                      />

                      Veículo indisponível
                    </p>
                  )}

                  {vehicle.status ===
                    "inactive" && (
                    <p className="mt-3 text-xs font-medium text-white/30">
                      Veículo inativo
                    </p>
                  )}

                  {selected && (
                    <p className="mt-4 border-t border-yellow-400/15 pt-3 text-xs font-semibold text-yellow-400">
                      Veículo selecionado
                    </p>
                  )}
                </div>
              </button>
            );
          },
        )}
      </div>
    </section>
  );
}