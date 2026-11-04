"use client";

import { CalendarDays, CheckCircle2, Users } from "lucide-react";
import { useState } from "react";

import { useFleetPreview } from "@/app/hooks/fleet/useFleetPreview";
import type { Vehicle } from "@/types/vehicles";

import { FleetEmpty } from "../FleetEmpty";
import { FleetLoading } from "../FleetLoading";
import type { VehicleDateSelection } from "../PublicVehicleCalendar";
import { VehicleAvailabilityDialog } from "../vehicle/VehicleAvailabilityDialog";
import { VehicleSelectionCard } from "../vehicle/VehicleSelectionCard";
import { VehicleDetailsDialog } from "../vehicle/details/VehicleDetailsDialog";

type VehicleStepProps = {
  selectedVehicleId: string;
  selectedPeriod: VehicleDateSelection | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onConfirmAvailability: (
    vehicle: Vehicle,
    selection: VehicleDateSelection,
  ) => void;
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export function VehicleStep({
  selectedVehicleId,
  selectedPeriod,
  onSelectVehicle,
  onConfirmAvailability,
}: VehicleStepProps) {
  const [availabilityVehicle, setAvailabilityVehicle] =
    useState<Vehicle | null>(null);
  const [detailsVehicle, setDetailsVehicle] =
    useState<Vehicle | null>(null);

  const { activeVehicles, loading, error } = useFleetPreview();

  function selectVehicleFromDetails(vehicle: Vehicle) {
    onSelectVehicle(vehicle);
    setDetailsVehicle(null);
  }

  function confirmAvailability(
    vehicle: Vehicle,
    selection: VehicleDateSelection,
  ) {
    onConfirmAvailability(vehicle, selection);
    setAvailabilityVehicle(null);
  }

  if (loading) return <FleetLoading />;
  if (error) return <FleetEmpty error={error} />;
  if (activeVehicles.length === 0) return <FleetEmpty />;

  const selectedVehicle = activeVehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-white/50">
            Selecione uma van e consulte sua agenda.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-white/45">
            <Users size={14} aria-hidden="true" />
            {activeVehicles.length}{" "}
            {activeVehicles.length === 1
              ? "veículo disponível"
              : "veículos disponíveis"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {activeVehicles.map((vehicle) => {
            const selected = selectedVehicleId === vehicle.id;

            return (
              <VehicleSelectionCard
                key={vehicle.id}
                vehicle={vehicle}
                selected={selected}
                selectedPeriod={selected ? selectedPeriod : null}
                onSelect={onSelectVehicle}
                onOpenAvailability={setAvailabilityVehicle}
                onOpenDetails={setDetailsVehicle}
              />
            );
          })}
        </div>

        {selectedVehicle && selectedPeriod && (
          <div
            role="status"
            className="flex flex-wrap items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3"
          >
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0 text-emerald-400"
              aria-hidden="true"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-semibold text-white">
                Veículo e período selecionados
              </p>
              <p className="text-xs text-white/60">
                {selectedVehicle.model}
              </p>
              <p className="flex flex-wrap items-center gap-1.5 text-xs text-white/60">
                <CalendarDays size={13} aria-hidden="true" />
                {dateFormatter.format(selectedPeriod.departureDate)}
                {" até "}
                {dateFormatter.format(selectedPeriod.returnDate)}
              </p>
            </div>
          </div>
        )}
      </div>

      <VehicleDetailsDialog
        vehicle={detailsVehicle}
        selected={detailsVehicle?.id === selectedVehicleId}
        onClose={() => setDetailsVehicle(null)}
        onSelect={selectVehicleFromDetails}
      />

      <VehicleAvailabilityDialog
        open={availabilityVehicle !== null}
        vehicle={availabilityVehicle}
        initialSelection={
          availabilityVehicle?.id === selectedVehicleId
            ? selectedPeriod
            : null
        }
        onClose={() => setAvailabilityVehicle(null)}
        onConfirm={confirmAvailability}
      />
    </>
  );
}
