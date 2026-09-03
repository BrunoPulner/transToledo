"use client";

import {
  Ban,
  BusFront,
  CalendarCheck,
  LoaderCircle,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

import type {
  VehicleScheduleEntry,
} from "@/types/schedule";

import type {
  Vehicle,
} from "@/types/vehicles";

type ScheduleStatisticsProps = {
  vehicles: Vehicle[];

  schedules:
    VehicleScheduleEntry[];

  loading?: boolean;
};

export function ScheduleStatistics({
  vehicles,
  schedules,
  loading = false,
}: ScheduleStatisticsProps) {
  const now = new Date();

  const activeVehicles =
    vehicles.filter(
      (vehicle) =>
        vehicle.status ===
        "active",
    ).length;

  const upcomingBookings =
    schedules.filter(
      (schedule) =>
        schedule.type ===
          "booking" &&
        schedule.status ===
          "active" &&
        schedule.endsAt >= now,
    ).length;

  const activeBlocks =
    schedules.filter(
      (schedule) =>
        schedule.type ===
          "blocked" &&
        schedule.status ===
          "active" &&
        schedule.endsAt >= now,
    ).length;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatisticCard
        label="Veículos ativos"
        value={
          activeVehicles
        }
        loading={loading}
        icon={
          <BusFront
            size={21}
          />
        }
        iconClassName="bg-yellow-400/10 text-yellow-400"
      />

      <StatisticCard
        label="Próximas viagens"
        value={
          upcomingBookings
        }
        loading={loading}
        icon={
          <CalendarCheck
            size={21}
          />
        }
        iconClassName="bg-emerald-500/10 text-emerald-400"
      />

      <StatisticCard
        label="Bloqueios ativos"
        value={activeBlocks}
        loading={loading}
        icon={
          <Ban size={21} />
        }
        iconClassName="bg-red-500/10 text-red-400"
      />
    </section>
  );
}

type StatisticCardProps = {
  label: string;

  value: number;

  loading: boolean;

  icon: ReactNode;

  iconClassName: string;
};

function StatisticCard({
  label,
  value,
  loading,
  icon,
  iconClassName,
}: StatisticCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/2.5 p-5">
      <span
        className={`
          flex
          size-11
          items-center
          justify-center
          rounded-xl
          ${iconClassName}
        `}
      >
        {icon}
      </span>

      <p className="mt-4 text-sm text-white/45">
        {label}
      </p>

      <div className="mt-1 min-h-9">
        {loading ? (
          <LoaderCircle
            size={25}
            className="animate-spin text-white/30"
          />
        ) : (
          <strong className="text-3xl font-bold text-white">
            {value}
          </strong>
        )}
      </div>
    </article>
  );
}