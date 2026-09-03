"use client";

import {
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";

import type {
  VehicleScheduleEntry,
} from "@/types/schedule";

export type SchedulePeriodFilter =
  | "all"
  | "today"
  | "upcoming"
  | "past";

export type ScheduleTypeFilter =
  | "all"
  | VehicleScheduleEntry["type"];

export type ScheduleStatusFilter =
  | "all"
  | VehicleScheduleEntry["status"];

export type ScheduleFiltersValue = {
  search: string;

  period:
    SchedulePeriodFilter;

  type:
    ScheduleTypeFilter;

  status:
    ScheduleStatusFilter;
};

type ScheduleFiltersProps = {
  value:
    ScheduleFiltersValue;

  onChange: (
    filters:
      ScheduleFiltersValue,
  ) => void;
};

export const defaultScheduleFilters:
  ScheduleFiltersValue = {
  search: "",
  period: "upcoming",
  type: "all",
  status: "active",
};

const fieldClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition focus:border-yellow-400/50";

export function ScheduleFilters({
  value,
  onChange,
}: ScheduleFiltersProps) {
  const hasActiveFilters =
    value.search !== "" ||
    value.period !==
      defaultScheduleFilters.period ||
    value.type !==
      defaultScheduleFilters.type ||
    value.status !==
      defaultScheduleFilters.status;

  function updateFilter<
    Key extends keyof
      ScheduleFiltersValue,
  >(
    key: Key,
    nextValue:
      ScheduleFiltersValue[Key],
  ) {
    onChange({
      ...value,
      [key]: nextValue,
    });
  }

  function resetFilters() {
    onChange({
      ...defaultScheduleFilters,
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/2.5 p-5">
      <div className="flex items-center gap-2">
        <Filter
          size={17}
          className="text-yellow-400"
        />

        <h2 className="font-semibold text-white">
          Filtrar agenda
        </h2>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
        <label className="relative block">
          <span className="sr-only">
            Pesquisar agendamento
          </span>

          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
          />

          <input
            type="search"
            value={value.search}
            onChange={(event) =>
              updateFilter(
                "search",
                event.target.value,
              )
            }
            placeholder="Pesquisar agendamento..."
            className={`${fieldClassName} pl-11`}
          />
        </label>

        <label>
          <span className="sr-only">
            Filtrar por período
          </span>

          <select
            value={value.period}
            onChange={(event) =>
              updateFilter(
                "period",
                event.target
                  .value as SchedulePeriodFilter,
              )
            }
            className={
              fieldClassName
            }
          >
            <option value="all">
              Todos os períodos
            </option>

            <option value="today">
              Hoje
            </option>

            <option value="upcoming">
              Próximos
            </option>

            <option value="past">
              Anteriores
            </option>
          </select>
        </label>

        <label>
          <span className="sr-only">
            Filtrar por tipo
          </span>

          <select
            value={value.type}
            onChange={(event) =>
              updateFilter(
                "type",
                event.target
                  .value as ScheduleTypeFilter,
              )
            }
            className={
              fieldClassName
            }
          >
            <option value="all">
              Todos os tipos
            </option>

            <option value="booking">
              Viagens confirmadas
            </option>

            <option value="blocked">
              Bloqueios
            </option>
          </select>
        </label>

        <label>
          <span className="sr-only">
            Filtrar por situação
          </span>

          <select
            value={value.status}
            onChange={(event) =>
              updateFilter(
                "status",
                event.target
                  .value as ScheduleStatusFilter,
              )
            }
            className={
              fieldClassName
            }
          >
            <option value="all">
              Todas as situações
            </option>

            <option value="active">
              Ativos
            </option>

            <option value="cancelled">
              Cancelados
            </option>
          </select>
        </label>

        <button
          type="button"
          onClick={resetFilters}
          disabled={
            !hasActiveFilters
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/55 transition hover:border-yellow-400/30 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <RotateCcw
            size={16}
          />

          Limpar
        </button>
      </div>
    </div>
  );
}

/**
 * Função utilizada pela página para
 * aplicar os filtros nos agendamentos.
 */
export function filterSchedules(
  schedules:
    VehicleScheduleEntry[],

  filters:
    ScheduleFiltersValue,
) {
  const now = new Date();

  const startOfToday =
    new Date(now);

  startOfToday.setHours(
    0,
    0,
    0,
    0,
  );

  const endOfToday =
    new Date(now);

  endOfToday.setHours(
    23,
    59,
    59,
    999,
  );

  const normalizedSearch =
    filters.search
      .trim()
      .toLocaleLowerCase(
        "pt-BR",
      );

  return schedules.filter(
    (schedule) => {
      const matchesSearch =
        !normalizedSearch ||
        schedule.title
          .toLocaleLowerCase(
            "pt-BR",
          )
          .includes(
            normalizedSearch,
          ) ||
        schedule.notes
          ?.toLocaleLowerCase(
            "pt-BR",
          )
          .includes(
            normalizedSearch,
          ) ||
        schedule.quoteId
          ?.toLocaleLowerCase(
            "pt-BR",
          )
          .includes(
            normalizedSearch,
          );

      const matchesType =
        filters.type === "all" ||
        schedule.type ===
          filters.type;

      const matchesStatus =
        filters.status === "all" ||
        schedule.status ===
          filters.status;

      let matchesPeriod = true;

      if (
        filters.period ===
        "today"
      ) {
        matchesPeriod =
          schedule.startsAt <=
            endOfToday &&
          schedule.endsAt >=
            startOfToday;
      }

      if (
        filters.period ===
        "upcoming"
      ) {
        matchesPeriod =
          schedule.endsAt >= now;
      }

      if (
        filters.period ===
        "past"
      ) {
        matchesPeriod =
          schedule.endsAt < now;
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesPeriod
      );
    },
  );
}