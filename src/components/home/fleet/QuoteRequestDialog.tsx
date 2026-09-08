"use client";

import {
  ArrowRight,
  BusFront,
  CalendarRange,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";

import type {
  VehicleDateSelection,
} from "./PublicVehicleCalendar";

import type {
  Vehicle,
} from "@/types/vehicles";

export type QuoteContactDraft = {
  name: string;
  email: string;
  phone: string;
};

type QuoteRequestDialogProps = {
  open: boolean;
  vehicle: Vehicle;
  selection: VehicleDateSelection;
  initialContact?: QuoteContactDraft | null;
  onClose: () => void;
  onSave: (contact: QuoteContactDraft) => void;
};

type FormErrors = Partial<
  Record<keyof QuoteContactDraft, string>
>;

const dateFormatter =
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

function formatPhone(value: string) {
  const digits = value
    .replace(/\D/g, "")
    .slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function QuoteRequestDialog({
  open,
  vehicle,
  selection,
  initialContact,
  onClose,
  onSave,
}: QuoteRequestDialogProps) {
  const [contact, setContact] =
    useState<QuoteContactDraft>(
      initialContact ?? {
        name: "",
        email: "",
        phone: "",
      },
    );
  const [errors, setErrors] =
    useState<FormErrors>({});

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
  }, [
    onClose,
    open,
  ]);

  if (
    !open ||
    typeof document === "undefined"
  ) {
    return null;
  }

  function validate() {
    const nextErrors: FormErrors = {};
    const phoneDigits =
      contact.phone.replace(/\D/g, "");

    if (contact.name.trim().length < 3) {
      nextErrors.name =
        "Informe seu nome completo.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        contact.email.trim(),
      )
    ) {
      nextErrors.email =
        "Informe um e-mail válido.";
    }

    if (
      phoneDigits.length !== 10 &&
      phoneDigits.length !== 11
    ) {
      nextErrors.phone =
        "Informe um telefone com DDD.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSave({
      name: contact.name.trim(),
      email: contact.email.trim().toLowerCase(),
      phone: contact.phone,
    });
  }

  return createPortal(
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-100 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-dialog-title"
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#121620] shadow-2xl shadow-black/50 sm:max-w-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between border-b border-white/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-400">
              Solicitação de orçamento
            </p>
            <h3
              id="quote-dialog-title"
              className="mt-1 text-xl font-bold text-white"
            >
              Seus dados para contato
            </h3>
            <p className="mt-1 text-xs leading-5 text-white/45">
              A TransToledo utilizará estas informações para retornar sobre a solicitação.
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

        <div className="grid gap-3 border-b border-white/8 bg-black/15 px-5 py-4 sm:grid-cols-3 sm:px-6">
          <SummaryItem
            icon={BusFront}
            label="Veículo"
            value={vehicle.model}
          />
          <SummaryItem
            icon={CalendarRange}
            label="Saída"
            value={dateFormatter.format(
              selection.departureDate,
            )}
          />
          <SummaryItem
            icon={CalendarRange}
            label="Retorno"
            value={dateFormatter.format(
              selection.returnDate,
            )}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 px-5 py-5 sm:px-6"
        >
          <Field
            icon={UserRound}
            label="Nome completo"
            name="name"
            autoComplete="name"
            placeholder="Digite seu nome completo"
            value={contact.name}
            error={errors.name}
            onChange={(value) =>
              setContact((current) => ({
                ...current,
                name: value,
              }))
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              icon={Mail}
              label="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              value={contact.email}
              error={errors.email}
              onChange={(value) =>
                setContact((current) => ({
                  ...current,
                  email: value,
                }))
              }
            />

            <Field
              icon={Phone}
              label="Telefone com DDD"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(42) 99999-9999"
              value={contact.phone}
              error={errors.phone}
              onChange={(value) =>
                setContact((current) => ({
                  ...current,
                  phone: formatPhone(value),
                }))
              }
            />
          </div>

          <div className="flex gap-3 rounded-xl border border-blue-400/15 bg-blue-400/8 px-3 py-3">
            <ShieldCheck
              size={17}
              className="mt-0.5 shrink-0 text-blue-300"
            />
            <p className="text-[11px] leading-5 text-blue-100/65">
              Antes do envio definitivo, este telefone será confirmado por um código de segurança. Nenhuma solicitação será enviada nesta etapa.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-white/8 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-white/10 px-5 text-xs font-semibold text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-bold text-white shadow-lg shadow-red-950/25 transition hover:bg-red-500"
            >
              Salvar dados e continuar
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

type FieldProps = {
  icon: typeof UserRound;
  label: string;
  name: string;
  value: string;
  placeholder: string;
  error?: string;
  type?: "text" | "email" | "tel";
  inputMode?: "numeric";
  autoComplete?: string;
  onChange: (value: string) => void;
};

function Field({
  icon: Icon,
  label,
  error,
  onChange,
  ...inputProps
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.11em] text-white/45">
        {label}
      </span>
      <span className="relative block">
        <Icon
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          {...inputProps}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`h-11 w-full rounded-xl border bg-black/20 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/20 ${
            error
              ? "border-red-400/45 focus:border-red-400"
              : "border-white/10 focus:border-yellow-400/55"
          }`}
        />
      </span>
      {error && (
        <span className="mt-1 block text-[10px] text-red-300">
          {error}
        </span>
      )}
    </label>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BusFront;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/7 bg-white/3 px-3 py-2.5">
      <Icon
        size={15}
        className="shrink-0 text-yellow-400"
      />
      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-wider text-white/30">
          {label}
        </p>
        <p className="mt-0.5 truncate text-[11px] font-semibold text-white/75">
          {value}
        </p>
      </div>
    </div>
  );
}
