"use client";

import {
  Ban,
  CalendarClock,
  LoaderCircle,
  Plus,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  blockedScheduleSchema,
} from "@/schemas/scheduleSchema";

import type {
  CreateVehicleScheduleInput,
} from "@/types/schedule";

type BlockVehicleFormProps = {
  vehicleId: string;

  vehicleName?: string;

  saving?: boolean;

  disabled?: boolean;

  onCreate: (
    schedule:
      CreateVehicleScheduleInput,
  ) => Promise<
    string | void
  >;

  onCancel?: () => void;

  onCreated?: () => void;
};

const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-40";

export function BlockVehicleForm({
  vehicleId,
  vehicleName,
  saving = false,
  disabled = false,
  onCreate,
  onCancel,
  onCreated,
}: BlockVehicleFormProps) {
  const [title, setTitle] =
    useState("");

  const [startsAt, setStartsAt] =
    useState("");

  const [endsAt, setEndsAt] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  function resetForm() {
    setTitle("");
    setStartsAt("");
    setEndsAt("");
    setNotes("");
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
        "Selecione um veículo antes de criar um bloqueio.",
      );

      return;
    }

    const validation =
      blockedScheduleSchema.safeParse(
        {
          vehicleId,

          type: "blocked",
          source: "manual",
          status: "active",

          title,
          notes,

          startsAt,
          endsAt,
        },
      );

    if (!validation.success) {
      const firstIssue =
        validation.error
          .issues[0];

      setError(
        firstIssue?.message ??
          "Verifique os dados informados.",
      );

      return;
    }

    try {
      const data =
        validation.data;

      await onCreate({
        vehicleId:
          data.vehicleId,

        type: "blocked",
        source: "manual",
        status:
          data.status,

        title:
          data.title,

        notes:
          data.notes ||
          undefined,

        startsAt:
          data.startsAt,

        endsAt:
          data.endsAt,
      });

      resetForm();

      setSuccess(
        "Bloqueio cadastrado com sucesso.",
      );

      onCreated?.();
    } catch (createError) {
      console.error(
        "Erro ao bloquear veículo:",
        createError,
      );

      setError(
        createError instanceof
          Error
          ? createError.message
          : "Não foi possível cadastrar o bloqueio.",
      );
    }
  }

  if (!vehicleId) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
        <div className="flex min-h-56 flex-col items-center justify-center text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <Ban size={25} />
          </span>

          <h2 className="mt-4 font-semibold text-white">
            Selecione um veículo
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-white/40">
            Escolha uma van antes de
            cadastrar um bloqueio na
            agenda.
          </p>
        </div>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/2.5"
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2">
            <Ban
              size={18}
              className="text-red-400"
            />

            <h2 className="font-semibold text-white">
              Bloquear veículo
            </h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-white/40">
            Cadastre uma manutenção,
            folga ou indisponibilidade
            específica.
          </p>

          {vehicleName && (
            <p className="mt-2 text-sm font-medium text-yellow-400">
              {vehicleName}
            </p>
          )}
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/45 transition hover:text-white disabled:opacity-40"
            aria-label="Fechar formulário"
          >
            <X size={17} />
          </button>
        )}
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {disabled && (
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-300">
            Este veículo está inativo
            ou em manutenção.
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/70">
            Motivo do bloqueio
          </span>

          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value,
              )
            }
            placeholder="Ex.: Manutenção preventiva"
            disabled={
              saving ||
              disabled
            }
            className={
              inputClassName
            }
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70">
              <CalendarClock
                size={15}
              />

              Início
            </span>

            <input
              type="datetime-local"
              value={startsAt}
              onChange={(
                event,
              ) =>
                setStartsAt(
                  event.target
                    .value,
                )
              }
              disabled={
                saving ||
                disabled
              }
              className={
                inputClassName
              }
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70">
              <CalendarClock
                size={15}
              />

              Fim
            </span>

            <input
              type="datetime-local"
              value={endsAt}
              onChange={(
                event,
              ) =>
                setEndsAt(
                  event.target
                    .value,
                )
              }
              disabled={
                saving ||
                disabled
              }
              className={
                inputClassName
              }
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/70">
            Observações
          </span>

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(
                event.target.value,
              )
            }
            rows={4}
            placeholder="Informações adicionais sobre o bloqueio..."
            disabled={
              saving ||
              disabled
            }
            className={`${inputClassName} h-auto resize-none py-3`}
          />
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:justify-end sm:p-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-medium text-white/60 transition hover:bg-white/5 disabled:opacity-40"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={
            saving ||
            disabled
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <LoaderCircle
              size={17}
              className="animate-spin"
            />
          ) : (
            <Plus size={17} />
          )}

          {saving
            ? "Salvando..."
            : "Cadastrar bloqueio"}
        </button>
      </div>
    </form>
  );
}