"use client";

import {
  Ban,
  CalendarDays,
  Plus,
} from "lucide-react";

type ScheduleHeaderProps = {
  vehicleSelected: boolean;

  blockFormOpen?: boolean;

  onToggleBlockForm: () => void;
};

export function ScheduleHeader({
  vehicleSelected,
  blockFormOpen = false,
  onToggleBlockForm,
}: ScheduleHeaderProps) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-yellow-400" />

          <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
            Administração
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
            <CalendarDays
              size={22}
            />
          </span>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Agendamentos
          </h1>
        </div>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">
          Configure os horários de
          trabalho, acompanhe as viagens
          confirmadas e gerencie os
          bloqueios de cada veículo.
        </p>
      </div>

      <button
        type="button"
        onClick={
          onToggleBlockForm
        }
        disabled={
          !vehicleSelected
        }
        className={`
          inline-flex
          h-11
          items-center
          justify-center
          gap-2
          rounded-xl
          px-5
          text-sm
          font-bold
          transition
          disabled:cursor-not-allowed
          disabled:opacity-40

          ${
            blockFormOpen
              ? `
                border
                border-white/10
                bg-white/5
                text-white
                hover:bg-white/10
              `
              : `
                bg-red-500
                text-white
                hover:bg-red-400
              `
          }
        `}
      >
        {blockFormOpen ? (
          <>
            <Ban size={18} />

            Fechar bloqueio
          </>
        ) : (
          <>
            <Plus size={18} />

            Novo bloqueio
          </>
        )}
      </button>
    </header>
  );
}