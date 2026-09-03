"use client";

import {
  CalendarDays,
  Clock3,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  BlockVehicleForm,
} from "@/app/components/admin/schedules/BlockVehicleForm";

import {
  DeleteScheduleDialog,
} from "@/app/components/admin/schedules/DeleteScheduleDialog";

import {
  ScheduleFilters,
  defaultScheduleFilters,
  filterSchedules,
} from "@/app/components/admin/schedules/ScheduleFilters";

import {
  ScheduleHeader,
} from "@/app/components/admin/schedules/ScheduleHeader";

import {
  ScheduleList,
} from "@/app/components/admin/schedules/ScheduleList";

import {
  ScheduleStatistics,
} from "@/app/components/admin/schedules/ScheduleStatistics";

import {
  VehicleScheduleSelector,
} from "@/app/components/admin/schedules/VehicleScheduleSelector";

import {
  WorkingHoursForm,
} from "@/app/components/admin/schedules/WorkingHoursForm";

import {
  useSchedules,
} from "@/app/hooks/schedules/useSchedules";

import {
  useVehiclesSchedule,
} from "@/app/hooks/schedules/useVehiclesSchedule";

import type {
  ScheduleFiltersValue,
} from "@/app/components/admin/schedules/ScheduleFilters";

import type {
  VehicleScheduleEntry,
} from "@/types/schedule";

type ScheduleTab =
  | "working-hours"
  | "schedule";

export default function SchedulesPage() {
  const [
    selectedTab,
    setSelectedTab,
  ] = useState<ScheduleTab>(
    "working-hours",
  );

  const [
    blockFormOpen,
    setBlockFormOpen,
  ] = useState(false);

  const [
    scheduleToDelete,
    setScheduleToDelete,
  ] = useState<
    VehicleScheduleEntry | null
  >(null);

  const [
    filters,
    setFilters,
  ] =
    useState<ScheduleFiltersValue>({
      ...defaultScheduleFilters,
    });

  const {
    vehicles,

    selectedVehicle,
    selectedVehicleId,
    setSelectedVehicleId,

    workingHours,

    loadingVehicles,
    loadingWorkingHours,

    saving:
      savingWorkingHours,

    error:
      vehiclesScheduleError,

    saveWorkingHours,
  } = useVehiclesSchedule();

  const {
    schedules,

    loading:
      loadingSchedules,

    saving:
      savingSchedule,

    deletingId,

    error:
      schedulesError,

    createSchedule,
    deleteSchedule,
  } = useSchedules({
    vehicleId:
      selectedVehicleId ||
      undefined,
  });

  const filteredSchedules =
    useMemo(
      () =>
        filterSchedules(
          schedules,
          filters,
        ),
      [
        schedules,
        filters,
      ],
    );

  const vehicleNames =
    useMemo(() => {
      return Object.fromEntries(
        vehicles.map(
          (vehicle) => [
            vehicle.id,
            vehicle.model,
          ],
        ),
      );
    }, [vehicles]);

  const selectedVehicleIsActive =
    selectedVehicle?.status ===
    "active";

  function handleVehicleChange(
    vehicleId: string,
  ) {
    setSelectedVehicleId(
      vehicleId,
    );

    setBlockFormOpen(false);
    setScheduleToDelete(null);
  }

  function handleToggleBlockForm() {
    setBlockFormOpen(
      (currentValue) =>
        !currentValue,
    );
  }

  return (
    <main className="px-5 pb-10 pt-26 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-400">
        <ScheduleHeader
          vehicleSelected={
            Boolean(
              selectedVehicleId,
            )
          }
          blockFormOpen={
            blockFormOpen
          }
          onToggleBlockForm={
            handleToggleBlockForm
          }
        />

        <div className="mt-8">
          <ScheduleStatistics
            vehicles={vehicles}
            schedules={
              schedules
            }
            loading={
              loadingVehicles ||
              loadingSchedules
            }
          />
        </div>

        {(vehiclesScheduleError ||
          schedulesError) && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {vehiclesScheduleError ||
              schedulesError}
          </div>
        )}

        <div className="mt-8">
          <VehicleScheduleSelector
            vehicles={vehicles}
            selectedVehicleId={
              selectedVehicleId
            }
            loading={
              loadingVehicles
            }
            onChange={
              handleVehicleChange
            }
          />
        </div>

        {blockFormOpen && (
          <div className="mt-6">
            <BlockVehicleForm
              vehicleId={
                selectedVehicleId
              }
              vehicleName={
                selectedVehicle
                  ?.model
              }
              saving={
                savingSchedule
              }
              disabled={
                !selectedVehicleIsActive
              }
              onCreate={
                createSchedule
              }
              onCancel={() =>
                setBlockFormOpen(
                  false,
                )
              }
              onCreated={() => {
                setBlockFormOpen(
                  false,
                );

                setSelectedTab(
                  "schedule",
                );
              }}
            />
          </div>
        )}

        <div className="mt-8 border-b border-white/10">
          <div className="flex gap-2">
            <TabButton
              active={
                selectedTab ===
                "working-hours"
              }
              onClick={() =>
                setSelectedTab(
                  "working-hours",
                )
              }
              icon={
                <Clock3
                  size={17}
                />
              }
            >
              Horários de trabalho
            </TabButton>

            <TabButton
              active={
                selectedTab ===
                "schedule"
              }
              onClick={() =>
                setSelectedTab(
                  "schedule",
                )
              }
              icon={
                <CalendarDays
                  size={17}
                />
              }
            >
              Agenda
            </TabButton>
          </div>
        </div>

        {selectedTab ===
        "working-hours" ? (
          <div className="mt-6">
            <WorkingHoursForm
              vehicleId={
                selectedVehicleId
              }
              workingHours={
                workingHours
              }
              loading={
                loadingWorkingHours
              }
              saving={
                savingWorkingHours
              }
              disabled={
                !selectedVehicleIsActive
              }
              onSave={
                saveWorkingHours
              }
            />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <ScheduleFilters
              value={filters}
              onChange={
                setFilters
              }
            />

            <section className="rounded-2xl border border-white/10 bg-white/2.5">
              <div className="border-b border-white/10 p-5 sm:p-6">
                <h2 className="font-semibold text-white">
                  Agenda do veículo
                </h2>

                <p className="mt-2 text-sm text-white/40">
                  Viagens confirmadas e
                  bloqueios cadastrados
                  para a van selecionada.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <ScheduleList
                  schedules={
                    filteredSchedules
                  }
                  loading={
                    loadingSchedules
                  }
                  deletingId={
                    deletingId
                  }
                  vehicleNames={
                    vehicleNames
                  }
                  showVehicleName={
                    false
                  }
                  emptyTitle="Agenda vazia"
                  emptyDescription="Nenhuma viagem ou bloqueio foi encontrado para os filtros selecionados."
                  onDelete={(
                    schedule,
                  ) =>
                    setScheduleToDelete(
                      schedule,
                    )
                  }
                />
              </div>
            </section>
          </div>
        )}
      </div>

      <DeleteScheduleDialog
        schedule={
          scheduleToDelete
        }
        deleting={
          deletingId ===
          scheduleToDelete?.id
        }
        onClose={() =>
          setScheduleToDelete(
            null,
          )
        }
        onConfirm={async (
          schedule,
        ) => {
          await deleteSchedule(
            schedule,
          );
        }}
      />
    </main>
  );
}

type TabButtonProps = {
  active: boolean;

  icon: React.ReactNode;

  children: React.ReactNode;

  onClick: () => void;
};

function TabButton({
  active,
  icon,
  children,
  onClick,
}: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        inline-flex
        items-center
        gap-2
        px-4
        pb-4
        pt-2
        text-sm
        font-medium
        transition

        ${
          active
            ? "text-yellow-400"
            : "text-white/40 hover:text-white/70"
        }
      `}
    >
      {icon}

      {children}

      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-yellow-400" />
      )}
    </button>
  );
}