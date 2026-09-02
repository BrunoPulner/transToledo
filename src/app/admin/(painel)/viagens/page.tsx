import {
  BusFront,
  Clock3,
  MapPin,
  Plus,
  Route,
} from "lucide-react";

import Link from "next/link";

const frequentTrips: {
  id: string;
  name: string;
  city: string;
  state: string;
  type: string;
  averageDurationMinutes: number;
  active: boolean;
}[] = [];

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

export default function AdminTripsPage() {
  return (
    <div className="px-5 pb-10 pt-26 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-400">
        {/* CABEÇALHO */}
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-yellow-400" />

              <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
                Administração
              </span>
            </div>

            <h1 className="mt-4 font-(family-name:--font-montserrat) text-3xl font-bold tracking-tight sm:text-4xl">
              Viagens frequentes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Cadastre e gerencie os destinos e roteiros realizados com
              frequência pela TransToledo.
            </p>
          </div>

          <Link
            href="/admin/viagens/nova"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-black transition hover:bg-yellow-300"
          >
            <Plus size={18} />

            Nova viagem
          </Link>
        </header>

        {/* RESUMO */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/2.5 p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <Route size={19} />
            </div>

            <p className="mt-5 text-sm text-white/45">
              Viagens cadastradas
            </p>

            <p className="mt-1 text-3xl font-bold">
              {frequentTrips.length}
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/2.5 p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <BusFront size={19} />
            </div>

            <p className="mt-5 text-sm text-white/45">
              Viagens ativas
            </p>

            <p className="mt-1 text-3xl font-bold">
              {
                frequentTrips.filter(
                  (trip) => trip.active
                ).length
              }
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/2.5 p-5 sm:col-span-2 xl:col-span-1">
            <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <MapPin size={19} />
            </div>

            <p className="mt-5 text-sm text-white/45">
              Destinos disponíveis
            </p>

            <p className="mt-1 text-3xl font-bold">
              {frequentTrips.length}
            </p>
          </article>
        </section>

        {/* LISTAGEM */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/2.5">
          <div className="border-b border-white/10 p-6">
            <h2 className="font-(family-name:--font-montserrat) text-lg font-bold">
              Viagens cadastradas
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Os roteiros cadastrados aparecerão aqui para edição e
              gerenciamento.
            </p>
          </div>

          {frequentTrips.length > 0 ? (
            <div className="divide-y divide-white/5">
              {frequentTrips.map((trip) => (
                <article
                  key={trip.id}
                  className="flex flex-col gap-5 p-6 transition hover:bg-white/2 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-(family-name:--font-montserrat) text-lg font-bold text-white">
                        {trip.name}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          trip.active
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/5 text-white/35"
                        }`}
                      >
                        {trip.active
                          ? "Ativa"
                          : "Inativa"}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/45">
                      <span className="flex items-center gap-2">
                        <MapPin size={15} />

                        {trip.city} • {trip.state}
                      </span>

                      <span className="flex items-center gap-2">
                        <Clock3 size={15} />

                        {formatDuration(
                          trip.averageDurationMinutes
                        )}
                      </span>

                      <span className="capitalize">
                        {trip.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/admin/viagens/${trip.id}`}
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition hover:border-yellow-400/30 hover:text-yellow-400"
                    >
                      Visualizar
                    </Link>

                    <Link
                      href={`/admin/viagens/${trip.id}/editar`}
                      className="rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Editar
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center p-6">
              <div className="max-w-md text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                  <Route size={28} />
                </div>

                <h3 className="mt-5 font-(family-name:--font-montserrat) text-lg font-bold">
                  Nenhuma viagem cadastrada
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/40">
                  Cadastre a primeira viagem frequente da TransToledo para que
                  ela possa ser exibida no site e utilizada nas solicitações de
                  orçamento.
                </p>

                <Link
                  href="/admin/viagens/nova"
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-black transition hover:bg-yellow-300"
                >
                  <Plus size={18} />

                  Cadastrar primeira viagem
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}