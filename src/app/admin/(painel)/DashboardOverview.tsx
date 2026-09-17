"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  ClipboardList,
  Clock3,
  MapPin,
  Route,
  UserRound,
  Users,
} from "lucide-react";

export type DashboardVehicle = {
  id: string;
  name: string;
  image: string | null;
};

export type DashboardBooking = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  tripName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  origin: string;
  destination: string;
  passengers: number | null;
  notes: string;
  quoteId: string;
  startsAt: string;
  endsAt: string;
};

type Props = {
  vehicles: DashboardVehicle[];
  bookings: DashboardBooking[];
  pendingCount: number;
  tripCount: number;
  agendaCount: number;
};

const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function isInProgress(
  booking: DashboardBooking,
  currentTime: number | null,
) {
  if (currentTime === null) return false;

  const start = Date.parse(booking.startsAt);
  const end = Date.parse(booking.endsAt);

  return start <= currentTime && currentTime < end;
}

export function DashboardOverview({
  vehicles,
  bookings,
  pendingCount,
  tripCount,
  agendaCount,
}: Props) {
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  useEffect(() => {
    const updateClock = () => setCurrentTime(Date.now());

    updateClock();

    const interval = window.setInterval(updateClock, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const visibleBookings = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          currentTime === null ||
          Date.parse(booking.endsAt) > currentTime,
      )
      .sort((first, second) => {
        const firstInProgress = isInProgress(first, currentTime);
        const secondInProgress = isInProgress(second, currentTime);

        if (firstInProgress !== secondInProgress) {
          return firstInProgress ? -1 : 1;
        }

        return first.startsAt.localeCompare(second.startsAt);
      });
  }, [bookings, currentTime]);

  const filteredBookings = useMemo(
    () =>
      vehicleId
        ? visibleBookings.filter(
            (booking) => booking.vehicleId === vehicleId,
          )
        : visibleBookings,
    [visibleBookings, vehicleId],
  );

  const vehiclesInProgress = useMemo(() => {
    return new Set(
      visibleBookings
        .filter((booking) => isInProgress(booking, currentTime))
        .map((booking) => booking.vehicleId),
    );
  }, [visibleBookings, currentTime]);

  const cards = [
    {
      title: "Frota",
      count: vehicles.length,
      description: "Veículos cadastrados",
      href: "/admin/frota",
      icon: BusFront,
      tone: "text-yellow-400 bg-yellow-400/10",
    },
    {
      title: "Orçamentos",
      count: pendingCount,
      description: "Solicitações pendentes",
      href: "/admin/orcamentos",
      icon: ClipboardList,
      tone: "text-orange-300 bg-orange-400/10",
    },
    {
      title: "Viagens",
      count: tripCount,
      description: "Viagens cadastradas",
      href: "/admin/viagens",
      icon: Route,
      tone: "text-sky-300 bg-sky-400/10",
    },
    {
      title: "Agenda",
      count: agendaCount,
      description: "Compromissos em andamento ou futuros",
      href: "/admin/agenda",
      icon: CalendarDays,
      tone: "text-emerald-300 bg-emerald-400/10",
    },
  ];

  return (
    <main className="min-h-dvh bg-[#07090b] px-5 pb-12 pt-26 text-white lg:px-10 lg:pt-10">
      <div className="mx-auto w-full max-w-7xl">
        <header>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-yellow-400" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
              Administração
            </span>
          </div>

          <h1 className="mt-4 font-(family-name:--font-montserrat) text-3xl font-bold sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Acompanhe as operações da TransToledo em um único lugar.
          </p>
        </header>

        <section
          aria-label="Resumo do painel"
          className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {cards.map(
            ({
              title,
              count,
              description,
              href,
              icon: Icon,
              tone,
            }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl border border-white/10 bg-white/4 p-5 transition duration-200 hover:-translate-y-1 hover:border-yellow-400/40 hover:bg-white/7 focus-visible:outline-2 focus-visible:outline-yellow-400"
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl ${tone}`}
                  >
                    <Icon size={20} />
                  </span>

                  <ArrowRight
                    size={17}
                    className="text-white/25 transition group-hover:text-yellow-400"
                  />
                </div>

                <p className="mt-5 text-sm text-white/55">{title}</p>
                <p className="mt-1 text-3xl font-bold">{count}</p>
                <p className="mt-2 text-xs text-white/40">
                  {description}
                </p>
              </Link>
            ),
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/3 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-(family-name:--font-montserrat) text-xl font-bold">
                Viagens em andamento e próximas saídas
              </h2>

              <p className="mt-1 text-sm text-white/45">
                Viagens em andamento primeiro; depois, as próximas
                saídas em ordem cronológica.
              </p>
            </div>

            <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-300">
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "viagem" : "viagens"}
            </span>
          </div>

          <div
            className="mt-6 flex gap-3 overflow-x-auto pb-2"
            aria-label="Filtrar viagens por veículo"
          >
            <button
              type="button"
              aria-pressed={vehicleId === null}
              onClick={() => setVehicleId(null)}
              className={`min-w-36 shrink-0 rounded-xl border p-3 text-left transition ${
                vehicleId === null
                  ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                  : "border-white/10 bg-[#16191c] text-white/70 hover:border-white/35"
              }`}
            >
              <span className="flex h-20 items-center justify-center rounded-lg bg-white/5">
                <BusFront size={30} />
              </span>

              <span className="mt-2 block text-sm font-semibold">
                Todas as vans
              </span>

              <span className="text-xs opacity-65">
                {visibleBookings.length} confirmadas
              </span>
            </button>

            {vehicles.map((vehicle) => {
              const vehicleBookings = visibleBookings.filter(
                (booking) => booking.vehicleId === vehicle.id,
              );

              const inProgress = vehiclesInProgress.has(vehicle.id);

              return (
                <button
                  type="button"
                  key={vehicle.id}
                  aria-pressed={vehicleId === vehicle.id}
                  onClick={() => setVehicleId(vehicle.id)}
                  className={`w-40 shrink-0 rounded-xl border p-3 text-left transition ${
                    vehicleId === vehicle.id
                      ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                      : "border-white/10 bg-[#16191c] text-white/70 hover:border-white/35"
                  }`}
                >
                  <span className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-white/5">
                    {vehicle.image ? (
                      <span
                        role="img"
                        aria-label={vehicle.name}
                        className="h-full w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${vehicle.image.replaceAll('"', "%22")}")`,
                        }}
                      />
                    ) : (
                      <BusFront size={28} />
                    )}
                  </span>

                  <span
                    className="mt-2 block truncate text-sm font-semibold"
                    title={vehicle.name}
                  >
                    {vehicle.name}
                  </span>

                  <span className="text-xs opacity-65">
                    {vehicleBookings.length}{" "}
                    {vehicleBookings.length === 1
                      ? "viagem"
                      : "viagens"}
                  </span>

                  {inProgress && (
                    <span className="mt-2 block w-fit rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] font-bold text-emerald-300">
                      Em viagem
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="mt-5 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center">
              <CalendarDays size={28} className="text-white/25" />

              <p className="mt-3 text-sm text-white/45">
                {vehicleId
                  ? "Esta van não tem viagens em andamento ou futuras."
                  : "Nenhuma viagem em andamento ou futura."}
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {filteredBookings.map((booking) => {
                const inProgress = isInProgress(
                  booking,
                  currentTime,
                );

                return (
                  <article
                    key={booking.id}
                    className={`rounded-2xl border bg-[#151719] p-5 ${
                      inProgress
                        ? "border-emerald-400/35"
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ${
                            inProgress
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "bg-yellow-400/10 text-yellow-400"
                          }`}
                        >
                          {inProgress
                            ? "Em viagem · van ocupada"
                            : "Viagem confirmada"}
                        </span>

                        <h3 className="mt-2 text-lg font-bold">
                          {booking.tripName}
                        </h3>
                      </div>

                      <span className="rounded-lg bg-yellow-400/10 px-3 py-2 text-xs font-semibold text-yellow-300">
                        {booking.vehicleName}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 rounded-xl border border-white/8 bg-black/20 p-4 sm:grid-cols-2">
                      <div className="flex gap-2">
                        <Clock3
                          size={17}
                          className="mt-0.5 shrink-0 text-yellow-400"
                        />

                        <div>
                          <p className="text-xs text-white/45">Saída</p>
                          <p className="text-sm font-medium">
                            {dateFormat.format(
                              new Date(booking.startsAt),
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <CalendarDays
                          size={17}
                          className="mt-0.5 shrink-0 text-yellow-400"
                        />

                        <div>
                          <p className="text-xs text-white/45">Retorno</p>
                          <p className="text-sm font-medium">
                            {dateFormat.format(
                              new Date(booking.endsAt),
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex gap-2">
                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0 text-emerald-400"
                        />

                        <div>
                          <span className="text-xs text-white/45">
                            Origem
                          </span>
                          <p className="wrap-break-word">
                            {booking.origin}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0 text-rose-400"
                        />

                        <div>
                          <span className="text-xs text-white/45">
                            Destino
                          </span>
                          <p className="wrap-break-word">
                            {booking.destination}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-2">
                      <div className="flex gap-2">
                        <UserRound
                          size={17}
                          className="mt-0.5 shrink-0 text-yellow-400"
                        />

                        <div>
                          <span className="text-xs text-white/45">
                            Solicitante
                          </span>
                          <p>{booking.customerName}</p>
                          <p className="text-xs text-white/55">
                            {booking.customerPhone}
                          </p>
                          <p className="wrap-break-word text-xs text-white/55">
                            {booking.customerEmail}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Users
                          size={17}
                          className="mt-0.5 shrink-0 text-yellow-400"
                        />

                        <div>
                          <span className="text-xs text-white/45">
                            Passageiros
                          </span>
                          <p>
                            {booking.passengers ?? "Não informado"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <p className="mt-3 rounded-lg bg-white/5 p-3 text-xs text-white/65">
                        <span className="font-semibold text-white/80">
                          Observações:{" "}
                        </span>
                        {booking.notes}
                      </p>
                    )}

                    <div className="mt-4 flex justify-end border-t border-white/10 pt-4">
                      <Link
                        href={
                          booking.quoteId
                            ? `/admin/orcamentos?quoteId=${encodeURIComponent(booking.quoteId)}`
                            : "/admin/agenda"
                        }
                        className="inline-flex items-center gap-2 text-xs font-semibold text-yellow-400 hover:text-yellow-300"
                      >
                        {booking.quoteId
                          ? "Ver orçamento"
                          : "Abrir agenda"}
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}