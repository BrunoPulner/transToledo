"use client";

import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BusyPeriod = {
  startsAt: string;
  endsAt: string;
};

const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];
const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function sameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function periodsForDay(periods: BusyPeriod[], day: Date) {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);

  return periods.filter(
    (period) =>
      new Date(period.startsAt) < dayEnd && new Date(period.endsAt) > dayStart,
  );
}

export function PublicVehicleCalendar({ vehicleId }: { vehicleId: string }) {
  const [displayedMonth, setDisplayedMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [periods, setPeriods] = useState<BusyPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      try {
        setLoading(true);
        setError("");
        setSelectedDay(null);

        const response = await fetch(
          `/api/public/vehicle-availability?vehicleId=${encodeURIComponent(vehicleId)}`,
          { cache: "no-store", signal: controller.signal },
        );

        if (!response.ok) throw new Error();

        const data = (await response.json()) as { busyPeriods?: BusyPeriod[] };
        setPeriods(data.busyPeriods ?? []);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") return;
        setError("Não foi possível carregar a agenda.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadAvailability();
    return () => controller.abort();
  }, [vehicleId]);

  const calendarDays = useMemo(() => {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      const dayNumber = index - firstWeekday + 1;
      return dayNumber > 0 && dayNumber <= daysInMonth
        ? new Date(year, month, dayNumber)
        : null;
    });
  }, [displayedMonth]);

  const selectedPeriods = selectedDay
    ? periodsForDay(periods, selectedDay)
    : [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() =>
            setDisplayedMonth(
              (month) => new Date(month.getFullYear(), month.getMonth() - 1, 1),
            )
          }
          className="flex size-8 items-center justify-center rounded-lg border border-white/10 hover:bg-white/10"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <strong className="text-sm capitalize">
          {monthFormatter.format(displayedMonth)}
        </strong>
        <button
          type="button"
          onClick={() =>
            setDisplayedMonth(
              (month) => new Date(month.getFullYear(), month.getMonth() + 1, 1),
            )
          }
          className="flex size-8 items-center justify-center rounded-lg border border-white/10 hover:bg-white/10"
          aria-label="Próximo mês"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {weekDays.map((weekDay, index) => (
          <span key={`${weekDay}-${index}`} className="pb-1 text-[10px] font-bold text-white/30">
            {weekDay}
          </span>
        ))}

        {calendarDays.map((day, index) => {
          if (!day) return <span key={`empty-${index}`} className="aspect-square" />;

          const occupied = periodsForDay(periods, day).length > 0;
          const selected = selectedDay ? sameDay(day, selectedDay) : false;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => occupied && setSelectedDay(day)}
              disabled={!occupied}
              className={`relative aspect-square rounded-lg text-xs transition ${
                selected
                  ? "bg-yellow-400 font-bold text-slate-950"
                  : occupied
                    ? "bg-red-400/15 font-semibold text-red-200 hover:bg-red-400/25"
                    : "text-white/45"
              }`}
            >
              {day.getDate()}
              {occupied && !selected && (
                <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-red-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-14 rounded-xl border border-white/8 bg-black/15 p-3">
        {loading && (
          <p className="flex items-center gap-2 text-xs text-white/40">
            <LoaderCircle size={14} className="animate-spin" /> Carregando agenda...
          </p>
        )}
        {!loading && error && <p className="text-xs text-red-200">{error}</p>}
        {!loading && !error && !selectedDay && (
          <p className="text-xs leading-5 text-white/35">
            Dias em vermelho já possuem horários indisponíveis. Selecione um dia para consultar.
          </p>
        )}
        {!loading && !error && selectedPeriods.map((period) => (
          <p key={`${period.startsAt}-${period.endsAt}`} className="text-xs leading-5 text-white/65">
            Indisponível: {timeFormatter.format(new Date(period.startsAt))} até {timeFormatter.format(new Date(period.endsAt))}
          </p>
        ))}
      </div>
    </div>
  );
}
