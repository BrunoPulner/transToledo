"use client";

import {
  Clock3,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

type TimeSelectionDialogProps = {
  open: boolean;
  day: Date;
  mode: "departure" | "return";
  intervalMinutes?: number;
  isTimeDisabled: (date: Date) => boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

const dayFormatter =
  new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

function createTimeSlots(
  day: Date,
  intervalMinutes: number,
) {
  const slots: Date[] = [];
  const totalMinutes = 24 * 60;

  for (
    let minute = 0;
    minute < totalMinutes;
    minute += intervalMinutes
  ) {
    const slot = new Date(day);
    slot.setHours(
      Math.floor(minute / 60),
      minute % 60,
      0,
      0,
    );
    slots.push(slot);
  }

  return slots;
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function TimeSelectionDialog({
  open,
  day,
  mode,
  intervalMinutes = 30,
  isTimeDisabled,
  onClose,
  onConfirm,
}: TimeSelectionDialogProps) {
  const [selectedTime, setSelectedTime] =
    useState<Date | null>(null);

  const timeSlots = useMemo(
    () =>
      createTimeSlots(
        day,
        intervalMinutes,
      ),
    [day, intervalMinutes],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;
    document.body.style.overflow =
      "hidden";

    function closeOnEscape(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      closeOnEscape,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;
      window.removeEventListener(
        "keydown",
        closeOnEscape,
      );
    };
  }, [onClose, open]);

  if (
    !open ||
    typeof document === "undefined"
  ) {
    return null;
  }

  return createPortal(
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-100 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-5"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="time-dialog-title"
        className="max-h-[90dvh] w-full overflow-hidden rounded-t-3xl border border-white/10 bg-[#121620] shadow-2xl shadow-black/50 sm:max-w-xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between border-b border-white/8 px-5 py-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-yellow-400">
              {mode === "departure"
                ? "Horário de saída"
                : "Horário de retorno"}
            </p>
            <h3
              id="time-dialog-title"
              className="mt-1 text-lg font-bold capitalize text-white"
            >
              {dayFormatter.format(day)}
            </h3>
            <p className="mt-1 text-xs text-white/40">
              Selecione um horário disponível. Intervalos de {intervalMinutes} minutos.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-yellow-400/40 hover:text-yellow-400"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[52dvh] overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {timeSlots.map((slot) => {
              const disabled =
                isTimeDisabled(slot);
              const selected =
                selectedTime?.getTime() ===
                slot.getTime();

              return (
                <button
                  key={slot.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    setSelectedTime(slot)
                  }
                  className={`flex h-10 items-center justify-center rounded-xl border text-xs font-semibold transition ${
                    selected
                      ? "border-yellow-300 bg-yellow-400 text-slate-950"
                      : disabled
                        ? "cursor-not-allowed border-transparent bg-white/3 text-white/15 line-through"
                        : "border-white/10 bg-white/4 text-white/65 hover:border-yellow-400/40 hover:text-yellow-300"
                  }`}
                >
                  {formatTime(slot)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/8 px-5 py-4">
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Clock3 size={14} />
            {selectedTime
              ? `Selecionado: ${formatTime(selectedTime)}`
              : "Escolha um horário"}
          </div>

          <button
            type="button"
            disabled={!selectedTime}
            onClick={() => {
              if (selectedTime) {
                onConfirm(selectedTime);
              }
            }}
            className="h-10 rounded-xl bg-yellow-400 px-5 text-xs font-bold text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-white/8 disabled:text-white/25"
          >
            Confirmar horário
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
