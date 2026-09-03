"use client";

import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  LoaderCircle,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import type {
  MouseEvent,
} from "react";

import type {
  VehicleScheduleEntry,
} from "@/types/schedule";

type DeleteScheduleDialogProps = {
  schedule:
    | VehicleScheduleEntry
    | null;

  deleting?: boolean;

  onClose: () => void;

  onConfirm: (
    schedule:
      VehicleScheduleEntry,
  ) => Promise<void>;
};

function formatDate(
  date: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "long",
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

export function DeleteScheduleDialog({
  schedule,
  deleting = false,
  onClose,
  onConfirm,
}: DeleteScheduleDialogProps) {
  const [error, setError] =
    useState("");

  /*
   * Fecha com Escape e bloqueia
   * o scroll da página enquanto
   * o diálogo estiver aberto.
   */
  useEffect(() => {
    if (!schedule) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
          "Escape" &&
        !deleting
      ) {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    schedule,
    deleting,
    onClose,
  ]);

  /*
   * Limpa o erro sempre que outro
   * agendamento for selecionado.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError("");
  }, [schedule]);

  if (!schedule) {
    return null;
  }

  const canDelete =
    schedule.type ===
      "blocked" &&
    schedule.source ===
      "manual";

  function handleBackdropClick(
    event:
      MouseEvent<HTMLDivElement>,
  ) {
    if (
      event.target ===
        event.currentTarget &&
      !deleting
    ) {
      onClose();
    }
  }

  async function handleConfirm() {
  const currentSchedule =
    schedule;

  if (!currentSchedule) {
    return;
  }

  const canDelete =
    currentSchedule.type ===
      "blocked" &&
    currentSchedule.source ===
      "manual";

  if (!canDelete) {
    setError(
      "Somente bloqueios manuais podem ser excluídos pela agenda.",
    );

    return;
  }

  try {
    setError("");

    await onConfirm(
      currentSchedule,
    );

    onClose();
  } catch (confirmError) {
    console.error(
      "Erro ao excluir bloqueio:",
      confirmError,
    );

    setError(
      confirmError instanceof Error
        ? confirmError.message
        : "Não foi possível excluir o bloqueio.",
    );
  }
}

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={
        handleBackdropClick
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-schedule-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#111315] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle
                size={21}
              />
            </span>

            <div>
              <h2
                id="delete-schedule-title"
                className="font-semibold text-white"
              >
                Excluir bloqueio
              </h2>

              <p className="mt-1 text-sm leading-6 text-white/40">
                Esta ação removerá o
                bloqueio da agenda do
                veículo.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/45 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
            aria-label="Fechar"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-400" />

              <h3 className="font-medium text-white">
                {schedule.title}
              </h3>
            </div>

            <div className="mt-4 space-y-2 text-sm text-white/45">
              <p className="flex items-center gap-2">
                <CalendarDays
                  size={15}
                />

                {formatDate(
                  schedule.startsAt,
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
              </p>
            </div>

            {schedule.notes && (
              <p className="mt-4 border-t border-white/5 pt-4 text-sm leading-6 text-white/35">
                {schedule.notes}
              </p>
            )}
          </div>

          <p className="mt-5 text-sm leading-6 text-white/50">
            Depois da exclusão, o
            veículo poderá voltar a
            receber viagens nesse
            período, desde que esteja
            dentro do seu horário de
            trabalho.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-medium text-white/60 transition hover:bg-white/5 disabled:opacity-40"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={
              handleConfirm
            }
            disabled={
              deleting ||
              !canDelete
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={17}
              />
            )}

            {deleting
              ? "Excluindo..."
              : "Excluir bloqueio"}
          </button>
        </div>
      </div>
    </div>
  );
}