"use client";

import { BusFront, Clock3, Eye, LoaderCircle, MapPin, Pencil, Plus, Route, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteTrip } from "@/services/trips/deleteTrip";
import { subscribeToTrips } from "@/services/trips/subscribeToTrips";
import type { FrequentTrip } from "@/types/trip";

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} min`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
}

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<FrequentTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => subscribeToTrips(
    (nextTrips) => {
      setTrips(nextTrips);
      setError("");
      setLoading(false);
    },
    (subscriptionError) => {
      console.error("Erro ao carregar viagens:", subscriptionError);
      setError("Não foi possível carregar as viagens cadastradas.");
      setLoading(false);
    }
  ), []);

  const activeTrips = useMemo(
    () => trips.filter((trip) => trip.active).length,
    [trips]
  );

  const destinations = useMemo(() => new Set(
    trips.map((trip) => `${trip.city.trim().toLowerCase()}-${trip.state.trim().toLowerCase()}`)
  ).size, [trips]);

  async function handleDelete(trip: FrequentTrip) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a viagem “${trip.name}”? Esta ação também removerá suas imagens e vídeos.`
    );

    if (!confirmed || deletingId) return;

    try {
      setDeletingId(trip.id);
      setError("");
      await deleteTrip(trip.id, trip.media);
    } catch (deleteError) {
      console.error("Erro ao excluir viagem:", deleteError);
      setError("Não foi possível excluir a viagem. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  }

  const cards = [
    { label: "Viagens cadastradas", value: trips.length, icon: Route },
    { label: "Viagens ativas", value: activeTrips, icon: BusFront },
    { label: "Destinos disponíveis", value: destinations, icon: MapPin },
  ];

  return (
    <div className="px-5 pb-10 pt-26 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-400">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-yellow-400" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">Administração</span>
            </div>
            <h1 className="mt-4 font-(family-name:--font-montserrat) text-3xl font-bold tracking-tight sm:text-4xl">Viagens frequentes</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Cadastre e gerencie os destinos e roteiros realizados com frequência pela TransToledo.
            </p>
          </div>
          <Link href="/admin/viagens/nova" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-black transition hover:bg-yellow-300">
            <Plus size={18} /> Nova viagem
          </Link>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className="rounded-2xl border border-white/10 bg-white/2.5 p-5">
                <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400"><Icon size={19} /></div>
                <p className="mt-5 text-sm text-white/45">{card.label}</p>
                <p className="mt-1 text-3xl font-bold">{loading ? "—" : card.value}</p>
              </article>
            );
          })}
        </section>

        {error && <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/2.5">
          <div className="border-b border-white/10 p-6">
            <h2 className="font-(family-name:--font-montserrat) text-lg font-bold">Viagens cadastradas</h2>
            <p className="mt-2 text-sm text-white/40">Acesse, edite ou exclua os roteiros cadastrados.</p>
          </div>

          {loading ? (
            <div className="flex min-h-80 items-center justify-center"><LoaderCircle size={30} className="animate-spin text-yellow-400" /></div>
          ) : trips.length > 0 ? (
            <div className="divide-y divide-white/5">
              {trips.map((trip) => {
                const cover =
                  trip.media.find((item) => item.isCover) ??
                  trip.media.find((item) => item.type === "image") ??
                  trip.media[0];
                const deleting = deletingId === trip.id;
                return (
                  <article key={trip.id} className="flex flex-col gap-5 p-5 transition hover:bg-white/2 lg:flex-row lg:items-center lg:justify-between lg:p-6">
                    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 text-white/20 sm:w-36">
                        {cover?.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover.url} alt={trip.name} className="h-full w-full object-cover" />
                        ) : cover?.type === "video" ? (
                          <video
                            src={cover.url}
                            aria-label={trip.name}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : <Route size={26} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="truncate font-(family-name:--font-montserrat) text-lg font-bold text-white">{trip.name}</h3>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${trip.active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/35"}`}>{trip.active ? "Ativa" : "Inativa"}</span>
                          {trip.featured && <span className="flex items-center gap-1 rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400"><Star size={12} /> Destaque</span>}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/45">
                          <span className="flex items-center gap-2"><MapPin size={15} /> {trip.city} • {trip.state}</span>
                          <span className="flex items-center gap-2"><Clock3 size={15} /> {formatDuration(trip.averageDurationMinutes)}</span>
                          <span className="capitalize">{trip.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                      <Link href={`/admin/viagens/${trip.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition hover:border-yellow-400/30 hover:text-yellow-400"><Eye size={16} /> Acessar</Link>
                      <Link href={`/admin/viagens/${trip.id}/editar`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"><Pencil size={16} /> Editar</Link>
                      <button type="button" onClick={() => handleDelete(trip)} disabled={deleting || deletingId !== null} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50">
                        {deleting ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />} Excluir
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center p-6">
              <div className="max-w-md text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400"><Route size={28} /></div>
                <h3 className="mt-5 font-(family-name:--font-montserrat) text-lg font-bold">Nenhuma viagem cadastrada</h3>
                <p className="mt-2 text-sm leading-6 text-white/40">Cadastre a primeira viagem frequente da TransToledo.</p>
                <Link href="/admin/viagens/nova" className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 text-sm font-bold text-black transition hover:bg-yellow-300"><Plus size={18} /> Cadastrar primeira viagem</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}