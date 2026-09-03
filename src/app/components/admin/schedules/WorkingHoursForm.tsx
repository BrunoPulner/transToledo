"use client";

import {
  Clock3,
  Copy,
  LoaderCircle,
  Save,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  workingHoursSchema,
} from "@/schemas/scheduleSchema";

import {
  WEEKDAYS,
} from "@/app/hooks/schedules/useVehiclesSchedule";

import type {
  CreateVehicleWorkingHoursInput,
  VehicleWorkingHours,
  Weekday,
} from "@/types/schedule";

type WorkingHoursFormProps = {
  vehicleId: string;

  workingHours:
    VehicleWorkingHours[];

  loading?: boolean;
  saving?: boolean;
  disabled?: boolean;

  onSave: (
    input:
      CreateVehicleWorkingHoursInput,
  ) => Promise<
    string | void
  >;
};

type WorkingHoursDayForm = {
  weekday: Weekday;
  enabled: boolean;
  startsAt: string;
  endsAt: string;
};

const defaultStartTime = "08:00";
const defaultEndTime = "18:00";

function createInitialDays(
  workingHours:
    VehicleWorkingHours[],
): WorkingHoursDayForm[] {
  return WEEKDAYS.map(
    (weekday) => {
      const savedWorkingHours =
        workingHours.find(
          (workingHour) =>
            workingHour.weekday ===
            weekday.value,
        );

      return {
        weekday:
          weekday.value as Weekday,

        enabled:
          savedWorkingHours
            ?.enabled ?? false,

        startsAt:
          savedWorkingHours
            ?.startsAt ||
          defaultStartTime,

        endsAt:
          savedWorkingHours
            ?.endsAt ||
          defaultEndTime,
      };
    },
  );
}

export function WorkingHoursForm({
  vehicleId,
  workingHours,
  loading = false,
  saving = false,
  disabled = false,
  onSave,
}: WorkingHoursFormProps) {
  const [days, setDays] =
    useState<
      WorkingHoursDayForm[]
    >(() =>
      createInitialDays(
        workingHours,
      ),
    );

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * Atualiza o formulário quando
   * outro veículo for selecionado
   * ou os dados do Firestore mudarem.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDays(
      createInitialDays(
        workingHours,
      ),
    );

    setError("");
    setSuccess("");
  }, [
    vehicleId,
    workingHours,
  ]);

  function updateDay(
    weekday: Weekday,
    updates: Partial<
      WorkingHoursDayForm
    >,
  ) {
    setDays(
      (currentDays) =>
        currentDays.map(
          (day) =>
            day.weekday ===
            weekday
              ? {
                  ...day,
                  ...updates,
                }
              : day,
        ),
    );

    setError("");
    setSuccess("");
  }

  function copyMondayHours() {
    const monday =
      days.find(
        (day) =>
          day.weekday === 1,
      );

    if (!monday) {
      return;
    }

    setDays(
      (currentDays) =>
        currentDays.map(
          (day) => {
            /*
             * Copia somente para
             * segunda a sexta-feira.
             */
            if (
              day.weekday >= 1 &&
              day.weekday <= 5
            ) {
              return {
                ...day,
                enabled:
                  monday.enabled,
                startsAt:
                  monday.startsAt,
                endsAt:
                  monday.endsAt,
              };
            }

            return day;
          },
        ),
    );

    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!vehicleId) {
      setError(
        "Selecione um veículo antes de configurar os horários.",
      );

      return;
    }

    /*
     * Valida individualmente cada
     * dia antes de enviar qualquer
     * informação ao Firestore.
     */
    for (const day of days) {
      const validation =
        workingHoursSchema.safeParse(
          {
            vehicleId,
            weekday:
              day.weekday,
            enabled:
              day.enabled,
            startsAt:
              day.enabled
                ? day.startsAt
                : "",
            endsAt:
              day.enabled
                ? day.endsAt
                : "",
          },
        );

      if (!validation.success) {
       const weekday =
  WEEKDAYS.find(
    (item) =>
      item.value ===
      day.weekday,
  );

        const message =
          validation.error
            .issues[0]
            ?.message ??
          "Horário inválido.";

        setError(
          `${weekday?.label ?? "Dia da semana"}: ${message}`,
        );

        return;
      }
    }

    try {
      /*
       * Os sete dias são enviados
       * simultaneamente.
       *
       * O serviço usa IDs previsíveis,
       * por isso os horários existentes
       * serão atualizados sem duplicar.
       */
      await Promise.all(
        days.map((day) =>
          onSave({
            vehicleId,
            weekday:
              day.weekday,
            enabled:
              day.enabled,

            startsAt:
              day.enabled
                ? day.startsAt
                : "",

            endsAt:
              day.enabled
                ? day.endsAt
                : "",
          }),
        ),
      );

      setSuccess(
        "Horários de trabalho salvos com sucesso.",
      );
    } catch (saveError) {
      console.error(
        "Erro ao salvar horários:",
        saveError,
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar os horários.",
      );
    }
  }

  if (!vehicleId) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
        <div className="flex min-h-56 flex-col items-center justify-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
            <Clock3 size={25} />
          </span>

          <h2 className="mt-4 font-semibold text-white">
            Selecione um veículo
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-white/40">
            Escolha uma van para
            configurar os dias e
            horários de trabalho.
          </p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
        <div className="flex min-h-56 items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-white/40">
            <LoaderCircle
              size={21}
              className="animate-spin text-yellow-400"
            />

            Carregando horários...
          </div>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/2.5"
    >
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <Clock3
              size={18}
              className="text-yellow-400"
            />

            <h2 className="font-semibold text-white">
              Horários de trabalho
            </h2>
          </div>

          <p className="mt-2 text-sm text-white/40">
            Defina em quais dias e
            horários esta van pode
            receber viagens.
          </p>
        </div>

        <button
          type="button"
          onClick={
            copyMondayHours
          }
          disabled={
            saving ||
            disabled
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-white/55 transition hover:border-yellow-400/30 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Copy size={15} />

          Copiar segunda
        </button>
      </div>

      {disabled && (
        <div className="border-b border-orange-500/20 bg-orange-500/10 px-5 py-3 text-sm text-orange-300 sm:px-6">
          Este veículo está inativo
          ou em manutenção. Seus
          horários podem ser
          consultados, mas não
          alterados.
        </div>
      )}

      {error && (
        <div className="mx-5 mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 sm:mx-6">
          {error}
        </div>
      )}

      {success && (
        <div className="mx-5 mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 sm:mx-6">
          {success}
        </div>
      )}

      <div className="divide-y divide-white/5">
        {days.map((day) => {
          const weekday =
  WEEKDAYS.find(
    (item) =>
      item.value ===
      day.weekday,
  );

          return (
            <div
              key={day.weekday}
              className="grid gap-4 px-5 py-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:px-6"
            >
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={
                    day.enabled
                  }
                  onChange={(
                    event,
                  ) =>
                    updateDay(
                      day.weekday,
                      {
                        enabled:
                          event
                            .target
                            .checked,
                      },
                    )
                  }
                  disabled={
                    saving ||
                    disabled
                  }
                  className="size-4 accent-yellow-400"
                />

                <span
                  className={
                    day.enabled
                      ? "font-medium text-white"
                      : "font-medium text-white/35"
                  }
                >
                  {
                    weekday?.label
                  }
                </span>
              </label>

              <span
                className={`
                  hidden
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  sm:block

                  ${
                    day.enabled
                      ? "text-emerald-400"
                      : "text-white/25"
                  }
                `}
              >
                {day.enabled
                  ? "Ativo"
                  : "Fechado"}
              </span>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <input
                  type="time"
                  value={
                    day.startsAt
                  }
                  onChange={(
                    event,
                  ) =>
                    updateDay(
                      day.weekday,
                      {
                        startsAt:
                          event
                            .target
                            .value,
                      },
                    )
                  }
                  disabled={
                    !day.enabled ||
                    saving ||
                    disabled
                  }
                  aria-label={`Horário inicial de ${weekday?.label}`}
                  className="h-10 min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-35"
                />

                <span className="text-sm text-white/30">
                  até
                </span>

                <input
                  type="time"
                  value={
                    day.endsAt
                  }
                  onChange={(
                    event,
                  ) =>
                    updateDay(
                      day.weekday,
                      {
                        endsAt:
                          event
                            .target
                            .value,
                      },
                    )
                  }
                  disabled={
                    !day.enabled ||
                    saving ||
                    disabled
                  }
                  aria-label={`Horário final de ${weekday?.label}`}
                  className="h-10 min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-35"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-white/10 p-5 sm:p-6">
        <button
          type="submit"
          disabled={
            saving ||
            disabled
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? (
            <LoaderCircle
              size={17}
              className="animate-spin"
            />
          ) : (
            <Save size={17} />
          )}

          {saving
            ? "Salvando..."
            : "Salvar horários"}
        </button>
      </div>
    </form>
  );
}