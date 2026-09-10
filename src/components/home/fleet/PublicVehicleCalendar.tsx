"use client";

import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  TimeSelectionDialog,
} from "./TimeSelectionDialog";

export type VehicleDateSelection = {
  departureDate: Date;
  returnDate: Date;
};

type PublicVehicleCalendarProps = {
  vehicleId: string;

  onSelectionChange?: (
    selection:
      VehicleDateSelection | null,
  ) => void;
};

type BusyPeriod = {
  startsAt: string;
  endsAt: string;
  type: "booking" | "blocked";
};

type DayAvailability =
  | "available"
  | "partial"
  | "occupied";

const weekDays = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
];

/*
 * Intervalo público padrão.
 *
 * Posteriormente este valor poderá
 * vir das configurações do admin.
 */
const PUBLIC_TIME_INTERVAL_MINUTES =
  30;

const monthFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      month: "long",
      year: "numeric",
    },
  );

const dayFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );

const timeFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

/*
 * Retorna o início do dia.
 */
function startOfDay(
  date: Date,
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

/*
 * Retorna o início do mês.
 */
function startOfMonth(
  date: Date,
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
}

/*
 * Verifica se duas datas pertencem
 * ao mesmo dia.
 */
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

/*
 * Verifica se a data está antes
 * do dia atual.
 */
function isBeforeToday(
  date: Date,
) {
  return (
    startOfDay(date).getTime() <
    startOfDay(
      new Date(),
    ).getTime()
  );
}

/*
 * Verifica se o dia está dentro
 * do período selecionado.
 */
function isDateInsideRange(
  date: Date,
  startDate: Date,
  endDate: Date,
) {
  const dateTime =
    startOfDay(
      date,
    ).getTime();

  const startTime =
    startOfDay(
      startDate,
    ).getTime();

  const endTime =
    startOfDay(
      endDate,
    ).getTime();

  return (
    dateTime >= startTime &&
    dateTime <= endTime
  );
}

/*
 * Retorna os períodos ocupados
 * que atravessam determinado dia.
 */
function getPeriodsForDay(
  periods: BusyPeriod[],
  day: Date,
) {
  const dayStart =
    startOfDay(day);

  const dayEnd =
    new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate() + 1,
      0,
      0,
      0,
      0,
    );

  return periods.filter(
    (period) => {
      const startsAt =
        new Date(
          period.startsAt,
        );

      const endsAt =
        new Date(
          period.endsAt,
        );

      if (
        Number.isNaN(
          startsAt.getTime(),
        ) ||
        Number.isNaN(
          endsAt.getTime(),
        )
      ) {
        return false;
      }

      return (
        startsAt < dayEnd &&
        endsAt > dayStart
      );
    },
  );
}

/*
 * Identifica se um dia está:
 *
 * available:
 * nenhum horário ocupado.
 *
 * partial:
 * possui horários ocupados e disponíveis.
 *
 * occupied:
 * o dia inteiro está ocupado.
 */
function getDayAvailability(
  periods: BusyPeriod[],
  day: Date,
): DayAvailability {
  const dayStart =
    startOfDay(day);

  const dayEnd =
    new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate() + 1,
      0,
      0,
      0,
      0,
    );

  const intervals =
    getPeriodsForDay(
      periods,
      day,
    )
      .map((period) => {
        const periodStart =
          new Date(
            period.startsAt,
          );

        const periodEnd =
          new Date(
            period.endsAt,
          );

        return {
          start: Math.max(
            periodStart.getTime(),
            dayStart.getTime(),
          ),

          end: Math.min(
            periodEnd.getTime(),
            dayEnd.getTime(),
          ),
        };
      })
      .filter(
        (interval) =>
          interval.start <
          interval.end,
      )
      .sort(
        (
          firstInterval,
          secondInterval,
        ) =>
          firstInterval.start -
          secondInterval.start,
      );

  if (
    intervals.length === 0
  ) {
    return "available";
  }

  /*
   * Junta períodos que se sobrepõem.
   *
   * Isso permite identificar corretamente
   * um dia totalmente ocupado mesmo que
   * existam vários agendamentos.
   */
  const mergedIntervals: Array<{
    start: number;
    end: number;
  }> = [];

  for (
    const interval
    of intervals
  ) {
    const previousInterval =
      mergedIntervals[
        mergedIntervals.length - 1
      ];

    if (
      !previousInterval ||
      interval.start >
        previousInterval.end
    ) {
      mergedIntervals.push({
        ...interval,
      });

      continue;
    }

    previousInterval.end =
      Math.max(
        previousInterval.end,
        interval.end,
      );
  }

  const occupiedMilliseconds =
    mergedIntervals.reduce(
      (
        total,
        interval,
      ) =>
        total +
        (
          interval.end -
          interval.start
        ),
      0,
    );

  const completeDayMilliseconds =
    dayEnd.getTime() -
    dayStart.getTime();

  if (
    occupiedMilliseconds >=
    completeDayMilliseconds
  ) {
    return "occupied";
  }

  return "partial";
}

/*
 * Verifica se um intervalo atravessa
 * algum período ocupado.
 */
function rangeHasConflict(
  startDate: Date,
  endDate: Date,
  periods: BusyPeriod[],
) {
  return periods.some(
    (period) => {
      const periodStart =
        new Date(
          period.startsAt,
        );

      const periodEnd =
        new Date(
          period.endsAt,
        );

      if (
        Number.isNaN(
          periodStart.getTime(),
        ) ||
        Number.isNaN(
          periodEnd.getTime(),
        )
      ) {
        return false;
      }

      return (
        startDate < periodEnd &&
        endDate > periodStart
      );
    },
  );
}

/*
 * Valida os períodos recebidos
 * da API pública.
 */
function readBusyPeriods(
  value: unknown,
): BusyPeriod[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap(
    (item): BusyPeriod[] => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return [];
      }

      const period =
        item as {
          startsAt?: unknown;
          endsAt?: unknown;
          type?: unknown;
        };

      if (
        typeof period.startsAt !==
          "string" ||
        typeof period.endsAt !==
          "string" ||
        (
          period.type !== "booking" &&
          period.type !== "blocked"
        )
      ) {
        return [];
      }

      const startsAt =
        new Date(
          period.startsAt,
        );

      const endsAt =
        new Date(
          period.endsAt,
        );

      if (
        Number.isNaN(
          startsAt.getTime(),
        ) ||
        Number.isNaN(
          endsAt.getTime(),
        ) ||
        startsAt >= endsAt
      ) {
        return [];
      }

      return [
        {
          startsAt:
            startsAt.toISOString(),

          endsAt:
            endsAt.toISOString(),

          type:
            period.type,
        },
      ];
    },
  );
}

export function PublicVehicleCalendar({
  vehicleId,
  onSelectionChange,
}: PublicVehicleCalendarProps) {
  const today =
    new Date();

  const currentMonth =
    startOfMonth(today);

  const [
    displayedMonth,
    setDisplayedMonth,
  ] = useState(
    () =>
      startOfMonth(
        today,
      ),
  );

  /*
   * Dia selecionado para visualizar
   * seus horários ocupados.
   */
  const [
    inspectionDay,
    setInspectionDay,
  ] = useState<Date | null>(
    null,
  );

  /*
   * Período desejado pelo cliente.
   */
  const [
    departureDate,
    setDepartureDate,
  ] = useState<Date | null>(
    null,
  );

  const [
    returnDate,
    setReturnDate,
  ] = useState<Date | null>(
    null,
  );

  const [
    selectionFinished,
    setSelectionFinished,
  ] = useState(false);

  const [
    timeSelection,
    setTimeSelection,
  ] = useState<{
    day: Date;
    mode:
      | "departure"
      | "return";
  } | null>(null);

  const [
    selectionError,
    setSelectionError,
  ] = useState("");

  const [
    busyPeriods,
    setBusyPeriods,
  ] = useState<
    BusyPeriod[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /*
   * Impede navegação para meses
   * anteriores ao mês atual.
   */
  const canGoToPreviousMonth =
    displayedMonth.getTime() >
    currentMonth.getTime();

  /*
   * Consulta a agenda pública
   * do veículo selecionado.
   */
  useEffect(() => {
    const controller =
      new AbortController();

    async function loadAvailability() {
      try {
        setLoading(true);
        setError("");
        setBusyPeriods([]);
        setSelectionError("");
        setInspectionDay(null);
        setDepartureDate(null);
        setReturnDate(null);
        setSelectionFinished(false);
        setTimeSelection(null);

        const response =
          await fetch(
            `/api/public/vehicle-availability?vehicleId=${encodeURIComponent(
              vehicleId,
            )}`,
            {
              method: "GET",
              cache: "no-store",

              signal:
                controller.signal,
            },
          );

        const data =
          (await response.json()) as {
            success?: boolean;
            message?: string;
            busyPeriods?: unknown;
          };

        if (
          !response.ok ||
          data.success !== true
        ) {
          throw new Error(
            typeof data.message ===
              "string"
              ? data.message
              : "Não foi possível carregar a agenda.",
          );
        }

        setBusyPeriods(
          readBusyPeriods(
            data.busyPeriods,
          ),
        );
      } catch (loadError) {
        if (
          loadError instanceof
            Error &&
          loadError.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(
          "Erro ao carregar agenda pública:",
          loadError,
        );

        setBusyPeriods([]);

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar a agenda.",
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadAvailability();

    return () => {
      controller.abort();
    };
  }, [vehicleId]);

  /*
   * Gera somente as semanas
   * necessárias para o mês.
   */
  const calendarDays =
    useMemo(() => {
      const year =
        displayedMonth.getFullYear();

      const month =
        displayedMonth.getMonth();

      const firstWeekday =
        new Date(
          year,
          month,
          1,
        ).getDay();

      const numberOfDays =
        new Date(
          year,
          month + 1,
          0,
        ).getDate();

      const requiredCells =
        Math.ceil(
          (
            firstWeekday +
            numberOfDays
          ) /
            7,
        ) * 7;

      return Array.from(
        {
          length:
            requiredCells,
        },
        (_, index) => {
          const dayNumber =
            index -
            firstWeekday +
            1;

          if (
            dayNumber < 1 ||
            dayNumber >
              numberOfDays
          ) {
            return null;
          }

          return new Date(
            year,
            month,
            dayNumber,
          );
        },
      );
    }, [
      displayedMonth,
    ]);

  /*
   * Ocupações do dia atualmente
   * selecionado.
   */
  const inspectionPeriods =
    inspectionDay
      ? getPeriodsForDay(
          busyPeriods,
          inspectionDay,
        )
      : [];

  /*
   * Navega para o mês anterior.
   */
  function previousMonth() {
    if (
      !canGoToPreviousMonth
    ) {
      return;
    }

    setDisplayedMonth(
      (month) =>
        new Date(
          month.getFullYear(),
          month.getMonth() - 1,
          1,
        ),
    );

    setInspectionDay(null);
    setTimeSelection(null);
  }

  /*
   * Navega para o próximo mês.
   */
  function nextMonth() {
    setDisplayedMonth(
      (month) =>
        new Date(
          month.getFullYear(),
          month.getMonth() + 1,
          1,
        ),
    );

    setInspectionDay(null);
    setTimeSelection(null);
  }

  /*
   * Limpa completamente o período
   * selecionado pelo cliente.
   */
  function clearSelection() {
    setDepartureDate(null);
    setReturnDate(null);
    setSelectionFinished(false);
    setSelectionError("");
    setInspectionDay(null);
    setTimeSelection(null);

    onSelectionChange?.(
      null,
    );
  }

  /*
   * Inicia a seleção de saída
   * ou retorno.
   */
  function selectTravelDate(
    day: Date,
  ) {
    if (
      loading ||
      error
    ) {
      return;
    }

    if (
      isBeforeToday(day)
    ) {
      setSelectionError(
        "Não é possível selecionar uma data anterior à data atual.",
      );

      return;
    }

    setInspectionDay(day);
setSelectionError("");

const dayAvailability =
  getDayAvailability(
    busyPeriods,
    day,
  );

if (
  dayAvailability ===
  "occupied"
) {
  setTimeSelection(null);

  setSelectionError(
    "Este dia está totalmente ocupado por outra viagem.",
  );

  return;
}

    /*
     * Primeira seleção ou começo
     * de um novo intervalo.
     */
    if (
      !departureDate ||
      selectionFinished
    ) {
      setTimeSelection({
        day,
        mode: "departure",
      });

      return;
    }

    /*
     * Se clicar antes da saída,
     * inicia uma nova seleção.
     */
    if (
      startOfDay(
        day,
      ).getTime() <
      startOfDay(
        departureDate,
      ).getTime()
    ) {
      setTimeSelection({
        day,
        mode: "departure",
      });

      return;
    }

    setTimeSelection({
      day,
      mode: "return",
    });
  }

  /*
   * Confirma o horário selecionado
   * no TimeSelectionDialog.
   */
  function confirmTime(
    date: Date,
  ) {
    if (!timeSelection) {
      return;
    }

    /*
     * Define a data e o horário
     * de saída.
     */
    if (
      timeSelection.mode ===
      "departure"
    ) {
      setDepartureDate(
        date,
      );

      setReturnDate(
        null,
      );

      setSelectionFinished(
        false,
      );

      setSelectionError(
        "",
      );

      setTimeSelection(
        null,
      );

      onSelectionChange?.(
        null,
      );

      return;
    }

    /*
     * Valida o retorno.
     */
    if (
      !departureDate ||
      date <= departureDate
    ) {
      setSelectionError(
        "O retorno deve acontecer depois da saída.",
      );

      setTimeSelection(
        null,
      );

      return;
    }

    /*
     * Valida todo o período entre
     * a saída e o retorno.
     */
    if (
      rangeHasConflict(
        departureDate,
        date,
        busyPeriods,
      )
    ) {
      setSelectionError(
        "Já existe um agendamento ou bloqueio dentro deste período.",
      );

      setTimeSelection(
        null,
      );

      return;
    }

    setReturnDate(
      date,
    );

    setSelectionFinished(
      true,
    );

    setSelectionError(
      "",
    );

    setTimeSelection(
      null,
    );

    onSelectionChange?.({
      departureDate,
      returnDate:
        date,
    });
  }

  /*
   * Informa ao seletor de horário
   * quais horários não podem ser usados.
   */
  function isTimeDisabled(
    date: Date,
  ) {
    if (
      date <= new Date()
    ) {
      return true;
    }

    /*
     * No retorno, também valida todo
     * o período desde a saída.
     */
    if (
      timeSelection?.mode ===
        "return" &&
      departureDate
    ) {
      return (
        date <= departureDate ||
        rangeHasConflict(
          departureDate,
          date,
          busyPeriods,
        )
      );
    }

    /*
     * Na saída, bloqueia somente os
     * horários que estão ocupados.
     */
    return busyPeriods.some(
      (period) => {
        const startsAt =
          new Date(
            period.startsAt,
          );

        const endsAt =
          new Date(
            period.endsAt,
          );

        return (
          date >= startsAt &&
          date < endsAt
        );
      },
    );
  }

  return (
    <div className="w-full">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        {/* CALENDÁRIO */}
        <div className="min-w-0 rounded-2xl border border-white/8 bg-white/2 p-3 sm:p-4">
          {/* NAVEGAÇÃO */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={
                previousMonth
              }
              disabled={
                !canGoToPreviousMonth
              }
              aria-label="Mês anterior"
              className="
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-white/10
                bg-white/5
                text-white/60
                transition
                hover:border-yellow-400/40
                hover:text-yellow-400
                disabled:cursor-not-allowed
                disabled:opacity-25
                disabled:hover:border-white/10
                disabled:hover:text-white/60
                sm:size-9
              "
            >
              <ChevronLeft
                size={16}
              />
            </button>

            <strong className="truncate text-center text-xs font-semibold capitalize text-white sm:text-sm">
              {monthFormatter.format(
                displayedMonth,
              )}
            </strong>

            <button
              type="button"
              onClick={
                nextMonth
              }
              aria-label="Próximo mês"
              className="
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-white/10
                bg-white/5
                text-white/60
                transition
                hover:border-yellow-400/40
                hover:text-yellow-400
                sm:size-9
              "
            >
              <ChevronRight
                size={16}
              />
            </button>
          </div>

          {/* DIAS DA SEMANA */}
          <div className="mt-3 grid grid-cols-7 gap-1">
            {weekDays.map(
              (
                weekDay,
                index,
              ) => (
                <span
                  key={`${weekDay}-${index}`}
                  className="
                    flex
                    h-6
                    items-center
                    justify-center
                    overflow-hidden
                    text-[8px]
                    font-bold
                    uppercase
                    text-white/30
                    sm:text-[9px]
                  "
                >
                  <span className="sm:hidden">
                    {weekDay.charAt(
                      0,
                    )}
                  </span>

                  <span className="hidden sm:inline">
                    {weekDay}
                  </span>
                </span>
              ),
            )}

            {/* DATAS */}
            {calendarDays.map(
              (
                day,
                index,
              ) => {
                if (!day) {
                  return (
                    <span
                      key={`empty-${index}`}
                      className="h-8 sm:h-9"
                    />
                  );
                }

                /*
                 * booking possui prioridade visual
                 * quando existirem tipos diferentes
                 * no mesmo dia.
                 */
                const dayAvailability =
  getDayAvailability(
    busyPeriods,
    day,
  );

const occupied =
  dayAvailability ===
  "occupied";

const partiallyOccupied =
  dayAvailability ===
  "partial";

                const past =
                  isBeforeToday(
                    day,
                  );

                const currentDay =
                  isSameDay(
                    day,
                    today,
                  );

                const departure =
                  departureDate
                    ? isSameDay(
                        day,
                        departureDate,
                      )
                    : false;

                const returnDay =
                  returnDate
                    ? isSameDay(
                        day,
                        returnDate,
                      )
                    : false;

                const insideSelection =
                  departureDate &&
                  returnDate
                    ? isDateInsideRange(
                        day,
                        departureDate,
                        returnDate,
                      )
                    : false;

                const disabled =
                  past ||
                  loading ||
                  Boolean(
                    error,
                  );

                return (
                  <button
                    key={
                      day.toISOString()
                    }
                    type="button"
                    disabled={
                      disabled
                    }
                    onClick={() =>
                      selectTravelDate(
                        day,
                      )
                    }
                    aria-label={
  past
    ? `${dayFormatter.format(
        day,
      )}, data anterior`
    : occupied
      ? `${dayFormatter.format(
          day,
        )}, totalmente ocupado`
      : partiallyOccupied
        ? `${dayFormatter.format(
            day,
          )}, parcialmente ocupado`
        : `${dayFormatter.format(
            day,
          )}, disponível`
}
                    className={`
                      relative
                      flex
                      h-8
                      min-w-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      text-[10px]
                      font-semibold
                      transition
                      sm:h-9
                      sm:text-xs

                      ${
                        departure &&
                        returnDay
                          ? "z-10 border-blue-300 bg-linear-to-r from-blue-500 to-violet-500 text-white ring-2 ring-blue-400/30"
                          : departure
                            ? "z-10 border-blue-300 bg-blue-500 text-white ring-2 ring-blue-400/30"
                            : returnDay
                              ? "z-10 border-violet-300 bg-violet-500 text-white ring-2 ring-violet-400/30"
                              : insideSelection
                                ? "border-blue-400/20 bg-blue-400/20 text-blue-100"
                                : occupied
  ? "border-red-400/30 bg-red-500/25 text-red-200 hover:bg-red-500/35"
  : partiallyOccupied
    ? "border-amber-400/30 bg-amber-400/20 text-amber-200 hover:bg-amber-400/30"
    : past
                                      ? "border-transparent bg-white/2 text-white/15"
                                      : "border-emerald-400/15 bg-emerald-400/8 text-emerald-200 hover:border-emerald-400/40 hover:bg-emerald-400/15"
                      }

                      ${
                        currentDay &&
                        !departure &&
                        !returnDay
                          ? "ring-2 ring-inset ring-cyan-400"
                          : ""
                      }

                      ${
                        disabled
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    {day.getDate()}
                  </button>
                );
              },
            )}
          </div>

          {/* LEGENDA */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/8 pt-3">
            <Legend
              color="bg-emerald-400"
              label="Disponível"
            />

            <Legend
  color="bg-red-400"
  label="Ocupado"
/>

<Legend
  color="bg-amber-400"
  label="Parcialmente ocupado"
/>

            <Legend
              color="border border-cyan-400"
              label="Hoje"
            />

            <Legend
              color="bg-blue-500"
              label="Saída"
            />

            <Legend
              color="bg-violet-500"
              label="Retorno"
            />
          </div>
        </div>

        {/* PAINEL LATERAL */}
        <div className="flex min-h-32 flex-col rounded-2xl border border-white/8 bg-white/2 p-3 sm:p-4">
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
            Período desejado
          </p>

          {loading && (
            <p className="mt-4 flex items-center gap-2 text-xs text-white/40">
              <LoaderCircle
                size={14}
                className="animate-spin"
              />

              Carregando agenda...
            </p>
          )}

          {!loading &&
            error && (
              <p className="mt-4 text-xs leading-5 text-red-200">
                {error}
              </p>
            )}

          {!loading &&
            !error && (
              <>
                {departureDate ? (
                  <div className="mt-3 space-y-2">
                    <DateInformation
                      label="Saída"
                      value={`${dayFormatter.format(
                        departureDate,
                      )} às ${timeFormatter.format(
                        departureDate,
                      )}`}
                      color="blue"
                    />

                    {returnDate ? (
                      <DateInformation
                        label="Retorno"
                        value={`${dayFormatter.format(
                          returnDate,
                        )} às ${timeFormatter.format(
                          returnDate,
                        )}`}
                        color="violet"
                      />
                    ) : (
                      <div className="rounded-xl border border-dashed border-violet-400/20 px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-300/60">
                          Retorno
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-white/35">
                          Agora selecione o dia e o
                          horário de retorno.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-xs leading-5 text-white/35">
                    Selecione uma data disponível
                    para definir a saída.
                  </p>
                )}

                {selectionError && (
                  <p className="mt-3 rounded-lg border border-red-400/10 bg-red-400/8 px-3 py-2 text-[11px] leading-5 text-red-300">
                    {selectionError}
                  </p>
                )}

                {departureDate && (
                  <button
                    type="button"
                    onClick={
                      clearSelection
                    }
                    className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-[10px] font-semibold text-white/45 transition hover:border-red-400/30 hover:text-red-300"
                  >
                    <RotateCcw
                      size={12}
                    />

                    Limpar seleção
                  </button>
                )}

                {/* HORÁRIOS OCUPADOS */}
                {inspectionDay &&
                  inspectionPeriods.length >
                    0 && (
                    <div className="mt-4 border-t border-white/8 pt-3">
                      <div>
  <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/30">
    Disponibilidade em
  </p>

  <p className="mt-1 text-xs font-semibold text-white/70">
    {dayFormatter.format(
      inspectionDay,
    )}
  </p>
</div>

                      <div className="mt-2 max-h-32 space-y-2 overflow-y-auto pr-1">
                        {inspectionPeriods.map(
                          (
                            period,
                            index,
                          ) => (
                            <div
  key={`${period.startsAt}-${period.endsAt}-${index}`}
  className={`rounded-xl border p-3 ${
    period.type === "booking"
      ? "border-red-400/20 bg-red-400/8"
      : "border-amber-400/20 bg-amber-400/8"
  }`}
>
  <div className="flex items-center justify-between gap-2">
    <p
      className={`text-[9px] font-bold uppercase tracking-[0.12em] ${
        period.type === "booking"
          ? "text-red-300"
          : "text-amber-300"
      }`}
    >
      {period.type === "booking"
        ? "Período já agendado"
        : "Veículo indisponível"}
    </p>

    <span
      className={`size-2 shrink-0 rounded-full ${
        period.type === "booking"
          ? "bg-red-400"
          : "bg-amber-400"
      }`}
    />
  </div>

  <div className="mt-3 grid gap-2">
    <div className="rounded-lg border border-white/8 bg-black/10 px-3 py-2">
      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-white/30">
        Início
      </p>

      <p className="mt-1 text-[11px] font-semibold text-white/75">
        {dayFormatter.format(
          new Date(
            period.startsAt,
          ),
        )}

        {" às "}

        {timeFormatter.format(
          new Date(
            period.startsAt,
          ),
        )}
      </p>
    </div>

    <div className="rounded-lg border border-white/8 bg-black/10 px-3 py-2">
      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-white/30">
        Término
      </p>

      <p className="mt-1 text-[11px] font-semibold text-white/75">
        {dayFormatter.format(
          new Date(
            period.endsAt,
          ),
        )}

        {" às "}

        {timeFormatter.format(
          new Date(
            period.endsAt,
          ),
        )}
      </p>
    </div>
  </div>

  {period.type === "booking" && (
    <p className="mt-3 text-[10px] leading-4 text-white/35">
      Este período já está reservado para
      outro cliente.
    </p>
  )}
</div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </>
            )}
        </div>
      </div>

      {timeSelection && (
        <TimeSelectionDialog
          open
          day={
            timeSelection.day
          }
          mode={
            timeSelection.mode
          }
          intervalMinutes={
            PUBLIC_TIME_INTERVAL_MINUTES
          }
          isTimeDisabled={
            isTimeDisabled
          }
          onClose={() =>
            setTimeSelection(
              null,
            )
          }
          onConfirm={
            confirmTime
          }
        />
      )}
    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[9px] text-white/35">
      <span
        className={`size-2 rounded-full ${color}`}
      />

      {label}
    </span>
  );
}

function DateInformation({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color:
    | "blue"
    | "violet";
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        color === "blue"
          ? "border-blue-400/20 bg-blue-400/10"
          : "border-violet-400/20 bg-violet-400/10"
      }`}
    >
      <p
        className={`text-[9px] font-bold uppercase tracking-[0.12em] ${
          color === "blue"
            ? "text-blue-300"
            : "text-violet-300"
        }`}
      >
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold text-white">
        {value}
      </p>
    </div>
  );
}