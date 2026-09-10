"use client";

import {
  BusFront,
  CalendarRange,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useFleetPreview,
} from "@/app/hooks/fleet/useFleetPreview";

import {
  FleetEmpty,
} from "../FleetEmpty";

import {
  FleetLoading,
} from "../FleetLoading";

import {
  VehicleAvailabilityDialog,
} from "../vehicle/VehicleAvailabilityDialog";

import {
  VehicleSelectionCard,
} from "../vehicle/VehicleSelectionCard";

import {
  VehicleDetailsDialog,
} from "../vehicle/details/VehicleDetailsDialog";

import type {
  VehicleDateSelection,
} from "../PublicVehicleCalendar";

import type {
  Vehicle,
} from "@/types/vehicles";

type VehicleStepProps = {
  selectedVehicleId: string;

  selectedPeriod:
    VehicleDateSelection | null;

  onSelectVehicle: (
    vehicle: Vehicle,
  ) => void;

  onConfirmAvailability: (
    vehicle: Vehicle,
    selection: VehicleDateSelection,
  ) => void;
};

export function VehicleStep({
  selectedVehicleId,
  selectedPeriod,
  onSelectVehicle,
  onConfirmAvailability,
}: VehicleStepProps) {
  const [
    availabilityVehicle,
    setAvailabilityVehicle,
  ] = useState<Vehicle | null>(
    null,
  );

  const [
    detailsVehicle,
    setDetailsVehicle,
  ] = useState<Vehicle | null>(
    null,
  );

  const {
    activeVehicles,
    loading,
    error,
  } = useFleetPreview();

  /*
   * Abre o painel com todas as
   * informações do veículo.
   */
  function openVehicleDetails(
    vehicle: Vehicle,
  ) {
    setDetailsVehicle(vehicle);
  }

  function closeVehicleDetails() {
    setDetailsVehicle(null);
  }

  /*
   * Seleciona o veículo e fecha
   * o painel de detalhes.
   */
  function selectVehicleFromDetails(
    vehicle: Vehicle,
  ) {
    onSelectVehicle(vehicle);

    closeVehicleDetails();
  }

  /*
   * Abre o calendário do veículo.
   */
  function openAvailability(
    vehicle: Vehicle,
  ) {
    setAvailabilityVehicle(
      vehicle,
    );
  }

  function closeAvailability() {
    setAvailabilityVehicle(
      null,
    );
  }

  /*
   * Salva veículo e período
   * selecionados no orçamento.
   */
  function confirmAvailability(
    vehicle: Vehicle,
    selection: VehicleDateSelection,
  ) {
    onConfirmAvailability(
      vehicle,
      selection,
    );

    closeAvailability();
  }

  if (loading) {
    return <FleetLoading />;
  }

  if (error) {
    return (
      <FleetEmpty error={error} />
    );
  }

  if (
    activeVehicles.length === 0
  ) {
    return <FleetEmpty />;
  }

  return (
    <>
      <div>
        <div
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
                <BusFront size={18} />
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
                Primeira etapa
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
              Escolha a van e o período
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
              Clique em um veículo para
              ver todos os detalhes e
              consulte a agenda para
              escolher a data e o horário
              da viagem.
            </p>
          </div>

          <p
            className="
              rounded-full
              border
              border-white/10
              bg-white/5
              px-3
              py-1.5
              text-[10px]
              font-semibold
              text-white/45
            "
          >
            {activeVehicles.length}{" "}
            {activeVehicles.length === 1
              ? "veículo disponível"
              : "veículos disponíveis"}
          </p>
        </div>

        <div
          className="
            mt-4
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-yellow-400/15
            bg-yellow-400/5
            p-3
          "
        >
          <span
            className="
              flex
              size-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-yellow-400/10
              text-yellow-400
            "
          >
            <CalendarRange
              size={17}
            />
          </span>

          <div>
            <p
              className="
                text-xs
                font-bold
                text-white/75
              "
            >
              Escolha também a data da
              viagem
            </p>

            <p
              className="
                mt-1
                text-[11px]
                leading-5
                text-white/40
              "
            >
              Utilize “Ver agenda” para
              consultar os períodos
              disponíveis de cada van.
            </p>
          </div>
        </div>

        <div
          className="
            mt-6
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {activeVehicles.map(
            (vehicle) => {
              const selected =
                selectedVehicleId ===
                vehicle.id;

              return (
                <VehicleSelectionCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  selected={selected}
                  selectedPeriod={
                    selected
                      ? selectedPeriod
                      : null
                  }
                  onSelect={
                    onSelectVehicle
                  }
                  onOpenAvailability={
                    openAvailability
                  }
                  onOpenDetails={
                    openVehicleDetails
                  }
                />
              );
            },
          )}
        </div>
      </div>

      <VehicleDetailsDialog
        vehicle={detailsVehicle}
        selected={
          detailsVehicle?.id ===
          selectedVehicleId
        }
        onClose={
          closeVehicleDetails
        }
        onSelect={
          selectVehicleFromDetails
        }
      />

      <VehicleAvailabilityDialog
        open={
          availabilityVehicle !==
          null
        }
        vehicle={
          availabilityVehicle
        }
        initialSelection={
          availabilityVehicle?.id ===
          selectedVehicleId
            ? selectedPeriod
            : null
        }
        onClose={
          closeAvailability
        }
        onConfirm={
          confirmAvailability
        }
      />
    </>
  );
}