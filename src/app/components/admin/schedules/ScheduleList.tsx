"use client";

import {
  CalendarX,
  LoaderCircle,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  ScheduleCard,
} from "./ScheduleCard";

import type {
  VehicleScheduleEntry,
} from "@/types/schedule";

type ScheduleListProps = {
  schedules:
    VehicleScheduleEntry[];

  loading?: boolean;

  deletingId?:
    | string
    | null;

  vehicleNames?: Record<
    string,
    string
  >;

  showVehicleName?: boolean;

  emptyTitle?: string;

  emptyDescription?: string;

  onEdit?: (
    schedule:
      VehicleScheduleEntry,
  ) => void;

  onDelete?: (
    schedule:
      VehicleScheduleEntry,
  ) => void;
};

export function ScheduleList({
  schedules,
  loading = false,
  deletingId = null,
  vehicleNames = {},
  showVehicleName = true,
  emptyTitle =
    "Nenhum agendamento encontrado",
  emptyDescription =
    "Não existem viagens ou bloqueios para os filtros selecionados.",
  onEdit,
  onDelete,
}: ScheduleListProps) {
  /*
   * Criamos uma cópia antes de ordenar
   * para não alterar diretamente o
   * estado recebido pelo componente.
   */
  const sortedSchedules =
    useMemo(() => {
      return [...schedules].sort(
        (
          firstSchedule,
          secondSchedule,
        ) =>
          firstSchedule.startsAt.getTime() -
          secondSchedule.startsAt.getTime(),
      );
    }, [schedules]);

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/40">
          <LoaderCircle
            size={30}
            className="animate-spin text-yellow-400"
          />

          <p className="text-sm">
            Carregando agenda...
          </p>
        </div>
      </div>
    );
  }

  if (
    sortedSchedules.length === 0
  ) {
    return (
      <div className="flex min-h-80 items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
            <CalendarX
              size={28}
            />
          </span>

          <h3 className="mt-5 font-semibold text-white">
            {emptyTitle}
          </h3>

          <p className="mt-2 text-sm leading-6 text-white/40">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedSchedules.map(
        (schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            vehicleName={
              showVehicleName
                ? vehicleNames[
                    schedule
                      .vehicleId
                  ]
                : undefined
            }
            deleting={
              deletingId ===
              schedule.id
            }
            onEdit={onEdit}
            onDelete={
              onDelete
            }
          />
        ),
      )}
    </div>
  );
}