"use client";

import {
  BusFront,
  CalendarDays,
  Clock3,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  ScheduleBadge,
} from "./ScheduleBadge";

import type {
  VehicleScheduleEntry,
} from "@/types/schedule";

type ScheduleCardProps = {
  schedule:
    VehicleScheduleEntry;

  vehicleName?: string;

  deleting?: boolean;

  onEdit?: (
    schedule:
      VehicleScheduleEntry,
  ) => void;

  onDelete?: (
    schedule:
      VehicleScheduleEntry,
  ) => void;
};

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatTime(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function isSameDay(
  firstDate: Date,
  secondDate: Date,
) {
  return (
    firstDate.getFullYear() ===
      secondDate.getFullYear() &&
    firstDate.getMonth() ===
      secondDate.getMonth() &&
    firstDate.getDate() ===
      secondDate.getDate()
  );
}

function calculateDuration(
  startsAt: Date,
  endsAt: Date,
) {
  const durationInMilliseconds =
    endsAt.getTime() -
    startsAt.getTime();

  const totalMinutes =
    Math.floor(
      durationInMilliseconds /
        1000 /
        60,
    );

  const days =
    Math.floor(
      totalMinutes /
        60 /
        24,
    );

  const hours =
    Math.floor(
      (totalMinutes %
        (60 * 24)) /
        60,
    );

  const minutes =
    totalMinutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(
      `${days} ${
        days === 1
          ? "dia"
          : "dias"
      }`,
    );
  }

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(
      `${minutes}min`,
    );
  }

  return (
    parts.join(" ") ||
    "Menos de 1 minuto"
  );
}

export function ScheduleCard({
  schedule,
  vehicleName,
  deleting = false,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  const sameDay =
    isSameDay(
      schedule.startsAt,
      schedule.endsAt,
    );

  /*
   * Viagens confirmadas devem ser
   * alteradas pelo módulo de
   * orçamentos.
   *
   * Somente bloqueios manuais podem
   * ser editados ou excluídos aqui.
   */
  const canManage =
    schedule.type === "blocked" &&
    schedule.source === "manual" &&
    schedule.status === "active";

  return (
    <article
      className={`
        rounded-2xl
        border
        border-white/10
        bg-white/2.5
        p-5
        transition
        hover:border-white/15
        hover:bg-white/4

        ${
          schedule.status ===
          "cancelled"
            ? "opacity-60"
            : ""
        }
      `}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-white">
              {schedule.title}
            </h3>

            <ScheduleBadge
              type={schedule.type}
              status={
                schedule.status
              }
            />
          </div>

          {vehicleName && (
            <p className="mt-3 flex items-center gap-2 text-sm text-white/55">
              <BusFront
                size={15}
                className="text-yellow-400"
              />

              {vehicleName}
            </p>
          )}

          <div className="mt-3 flex flex-col gap-2 text-sm text-white/45">
            <p className="flex items-center gap-2">
              <CalendarDays
                size={15}
              />

              {formatDate(
                schedule.startsAt,
              )}

              {!sameDay && (
                <>
                  {" até "}

                  {formatDate(
                    schedule.endsAt,
                  )}
                </>
              )}
            </p>

            <p className="flex items-center gap-2">
              <Clock3 size={15} />

              {formatTime(
                schedule.startsAt,
              )}

              {" até "}

              {formatTime(
                schedule.endsAt,
              )}

              <span className="text-white/25">
                •
              </span>

              {calculateDuration(
                schedule.startsAt,
                schedule.endsAt,
              )}
            </p>
          </div>

          {schedule.notes && (
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/40">
              {schedule.notes}
            </p>
          )}

          {schedule.type ===
            "booking" &&
            schedule.quoteId && (
              <p className="mt-3 text-xs text-white/25">
                Orçamento:{" "}
                {schedule.quoteId}
              </p>
            )}
        </div>

        {canManage &&
          (onEdit ||
            onDelete) && (
            <div className="flex shrink-0 gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() =>
                    onEdit(schedule)
                  }
                  disabled={deleting}
                  className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-yellow-400/30 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Editar bloqueio"
                  title="Editar bloqueio"
                >
                  <Pencil
                    size={16}
                  />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() =>
                    onDelete(
                      schedule,
                    )
                  }
                  disabled={deleting}
                  className="inline-flex size-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Excluir bloqueio"
                  title="Excluir bloqueio"
                >
                  {deleting ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2
                      size={16}
                    />
                  )}
                </button>
              )}
            </div>
          )}
      </div>
    </article>
  );
}