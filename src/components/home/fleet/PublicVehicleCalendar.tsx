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

const weekDays = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb",
];

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

      return (
        startsAt < dayEnd &&
        endsAt > dayStart
      );
    },
  );
}

function rangeHasConflict(
  startDate: Date,
  endDate: Date,
  periods: BusyPeriod[],
) {
  const currentDate =
    startOfDay(
      startDate,
    );

  const finalDate =
    startOfDay(
      endDate,
    );

  while (
    currentDate.getTime() <=
    finalDate.getTime()
  ) {
    if (
      getPeriodsForDay(
        periods,
        currentDate,
      ).length > 0
    ) {
      return true;
    }

    currentDate.setDate(
      currentDate.getDate() + 1,
    );
  }

  return false;
}

export function PublicVehicleCalendar({
  vehicleId,
  onSelectionChange,
}: PublicVehicleCalendarProps) {
  const today = new Date();

  const [
    displayedMonth,
    setDisplayedMonth,
  ] = useState(
    () =>
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
  );

  /*
   * Dia ocupado selecionado apenas
   * para consultar os horários.
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
        setSelectionError("");
        setInspectionDay(null);
        setDepartureDate(null);
        setReturnDate(null);
        setSelectionFinished(false);

        const response =
          await fetch(
            `/api/public/vehicle-availability?vehicleId=${encodeURIComponent(
              vehicleId,
            )}`,
            {
              cache: "no-store",
              signal:
                controller.signal,
            },
          );

        if (!response.ok) {
          throw new Error(
            "Não foi possível carregar a agenda.",
          );
        }

        const data =
          (await response.json()) as {
            busyPeriods?: BusyPeriod[];
          };

        setBusyPeriods(
          data.busyPeriods ?? [],
        );
      } catch (loadError) {
        if (
          loadError instanceof
            DOMException &&
          loadError.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(
          "Erro ao carregar agenda pública:",
          loadError,
        );

        setError(
          "Não foi possível carregar a agenda.",
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
          (firstWeekday +
            numberOfDays) /
            7,
        ) * 7;

      return Array.from(
        {
          length: requiredCells,
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
    }, [displayedMonth]);

  const inspectionPeriods =
    inspectionDay
      ? getPeriodsForDay(
          busyPeriods,
          inspectionDay,
        )
      : [];

  function previousMonth() {
    setDisplayedMonth(
      (currentMonth) =>
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() -
            1,
          1,
        ),
    );

    setInspectionDay(null);
  }

  function nextMonth() {
    setDisplayedMonth(
      (currentMonth) =>
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() +
            1,
          1,
        ),
    );

    setInspectionDay(null);
  }

  function clearSelection() {
    setDepartureDate(null);
    setReturnDate(null);
    setSelectionFinished(false);
    setSelectionError("");
    setInspectionDay(null);

    onSelectionChange?.(
      null,
    );
  }

  function selectTravelDate(
    day: Date,
  ) {
    if (
      isBeforeToday(day)
    ) {
      setSelectionError(
        "Não é possível selecionar uma data anterior à data atual.",
      );

      return;
    }

    const dayPeriods =
      getPeriodsForDay(
        busyPeriods,
        day,
      );

    /*
     * Dias ocupados abrem somente
     * os detalhes do agendamento.
     */
    if (
      dayPeriods.length > 0
    ) {
      setInspectionDay(
        day,
      );

      setSelectionError(
        "Este veículo não está disponível nesta data.",
      );

      return;
    }

    setInspectionDay(null);
    setSelectionError("");

    /*
     * Primeira seleção ou começo
     * de um novo intervalo.
     */
    if (
      !departureDate ||
      selectionFinished
    ) {
      setDepartureDate(
        day,
      );

      setReturnDate(
        day,
      );

      setSelectionFinished(
        false,
      );

      onSelectionChange?.({
        departureDate: day,
        returnDate: day,
      });

      return;
    }

    /*
     * Se clicar antes da saída,
     * inicia uma nova seleção.
     */
    if (
      day.getTime() <
      departureDate.getTime()
    ) {
      setDepartureDate(
        day,
      );

      setReturnDate(
        day,
      );

      setSelectionFinished(
        false,
      );

      onSelectionChange?.({
        departureDate: day,
        returnDate: day,
      });

      return;
    }

    /*
     * Impede selecionar um período
     * que atravesse uma reserva ou
     * bloqueio existente.
     */
    if (
      rangeHasConflict(
        departureDate,
        day,
        busyPeriods,
      )
    ) {
      setSelectionError(
        "Existe uma data indisponível entre a saída e o retorno.",
      );

      return;
    }

    setReturnDate(
      day,
    );

    setSelectionFinished(
      true,
    );

    onSelectionChange?.({
      departureDate,
      returnDate: day,
    });
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

                const periods =
                  getPeriodsForDay(
                    busyPeriods,
                    day,
                  );

                const booked =
                  periods.some(
                    (period) =>
                      period.type ===
                      "booking",
                  );

                const blocked =
                  periods.some(
                    (period) =>
                      period.type ===
                      "blocked",
                  );

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const occupied =
                  booked || blocked;

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

                return (
                  <button
                    key={
                      day.toISOString()
                    }
                    type="button"
                    disabled={
                      past
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
                        : booked
                          ? `${dayFormatter.format(
                              day,
                            )}, viagem agendada`
                          : blocked
                            ? `${dayFormatter.format(
                                day,
                              )}, veículo bloqueado`
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
                          ? "z-10 border-blue-300 bg-blue-500 text-white ring-2 ring-blue-400/30"
                          : departure
                            ? "z-10 border-blue-300 bg-blue-500 text-white ring-2 ring-blue-400/30"
                            : returnDay
                              ? "z-10 border-violet-300 bg-violet-500 text-white ring-2 ring-violet-400/30"
                              : insideSelection
                                ? "border-blue-400/20 bg-blue-400/20 text-blue-100"
                                : booked
                                  ? "cursor-pointer border-red-400/20 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                                  : blocked
                                    ? "cursor-pointer border-amber-400/20 bg-amber-400/20 text-amber-200 hover:bg-amber-400/30"
                                    : past
                                      ? "cursor-not-allowed border-transparent bg-white/2 text-white/15"
                                      : "cursor-pointer border-emerald-400/15 bg-emerald-400/8 text-emerald-200 hover:border-emerald-400/40 hover:bg-emerald-400/15"
                      }

                      ${
                        currentDay &&
                        !departure &&
                        !returnDay
                          ? "ring-2 ring-inset ring-cyan-400"
                          : ""
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
              label="Agendado"
            />

            <Legend
              color="bg-amber-400"
              label="Bloqueado"
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
                {departureDate &&
                returnDate ? (
                  <div className="mt-3 space-y-2">
                    <DateInformation
                      label="Saída"
                      value={dayFormatter.format(
                        departureDate,
                      )}
                      color="blue"
                    />

                    <DateInformation
                      label="Retorno"
                      value={dayFormatter.format(
                        returnDate,
                      )}
                      color="violet"
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-xs leading-5 text-white/35">
                    Selecione uma data
                    disponível para
                    definir a saída.
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
                      <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/30">
                        Ocupações em{" "}
                        {dayFormatter.format(
                          inspectionDay,
                        )}
                      </p>

                      <div className="mt-2 max-h-32 space-y-2 overflow-y-auto pr-1">
                        {inspectionPeriods.map(
                          (
                            period,
                            index,
                          ) => (
                            <div
                              key={`${period.startsAt}-${period.endsAt}-${index}`}
                              className={`rounded-lg border px-3 py-2 ${
                                period.type ===
                                "booking"
                                  ? "border-red-400/10 bg-red-400/8"
                                  : "border-amber-400/10 bg-amber-400/8"
                              }`}
                            >
                              <p
                                className={`text-[9px] font-semibold uppercase ${
                                  period.type ===
                                  "booking"
                                    ? "text-red-300"
                                    : "text-amber-300"
                                }`}
                              >
                                {period.type ===
                                "booking"
                                  ? "Agendado"
                                  : "Bloqueado"}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-white/70">
                                {timeFormatter.format(
                                  new Date(
                                    period.startsAt,
                                  ),
                                )}
                                {" até "}
                                {timeFormatter.format(
                                  new Date(
                                    period.endsAt,
                                  ),
                                )}
                              </p>
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