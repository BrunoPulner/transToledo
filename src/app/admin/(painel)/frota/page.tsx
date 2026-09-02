"use client";

import {
  BriefcaseBusiness,
  BusFront,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { deleteVehicle } from "@/services/vehicles/deleteVehicle";
import { subscribeToVehicles } from "@/services/vehicles/subscribeToVehicles";
import type {
  LuggageSize,
  Vehicle,
  VehicleFeatures,
} from "@/types/vehicles";

const statusInformation = {
  active: {
    label: "Ativa",
    className:
      "border-green-500/30 bg-green-500/10 text-green-300",
  },
  maintenance: {
    label: "Em manutenção",
    className:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
  },
  inactive: {
    label: "Inativa",
    className:
      "border-zinc-600 bg-zinc-800 text-zinc-300",
  },
};

const luggageLabels: Record<LuggageSize, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
};

const featureLabels: Record<keyof VehicleFeatures, string> = {
  airConditioning: "Ar-condicionado",
  wifi: "Wi-Fi",
  usb: "USB",
  powerOutlet: "Tomada",
  recliningSeats: "Assentos reclináveis",
  accessibility: "Acessibilidade",
  television: "Televisão",
  refrigerator: "Geladeira",
};

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<
    string | null
  >(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToVehicles(
      (updatedVehicles) => {
        setVehicles(updatedVehicles);
        setLoading(false);
        setError("");
      },
      (subscriptionError) => {
        setError(subscriptionError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const statistics = useMemo(() => {
    return {
      total: vehicles.length,
      active: vehicles.filter(
        (vehicle) => vehicle.status === "active",
      ).length,
      maintenance: vehicles.filter(
        (vehicle) => vehicle.status === "maintenance",
      ).length,
    };
  }, [vehicles]);

  async function handleDelete(vehicle: Vehicle) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a van "${vehicle.model}"?\n\nAs fotos e os vídeos também serão excluídos.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(vehicle.id);
      setError("");

      await deleteVehicle(vehicle.id, vehicle.media);
    } catch (deleteError) {
      console.error(deleteError);

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir a van.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Gerenciamento
            </span>

            <h1 className="mt-2 text-3xl font-bold">
              Frota de vans
            </h1>

            <p className="mt-2 text-zinc-400">
              Cadastre, consulte e gerencie os veículos da
              TransToledo.
            </p>
          </div>

          <Link
            href="/admin/frota/nova"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300"
          >
            <Plus size={19} />
            Cadastrar van
          </Link>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <StatisticCard
            label="Vans cadastradas"
            value={statistics.total}
            icon={<BusFront size={22} />}
          />

          <StatisticCard
            label="Vans ativas"
            value={statistics.active}
            icon={<Users size={22} />}
          />

          <StatisticCard
            label="Em manutenção"
            value={statistics.maintenance}
            icon={<Wrench size={22} />}
          />
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-6 py-5">
            <h2 className="text-xl font-semibold">
              Veículos cadastrados
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Vans disponíveis para utilização nos
              agendamentos.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <div className="flex items-center gap-3 text-zinc-400">
                <LoaderCircle
                  size={22}
                  className="animate-spin"
                />

                Carregando frota...
              </div>
            </div>
          ) : vehicles.length === 0 ? (
            <EmptyFleet />
          ) : (
            <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  deleting={deletingId === vehicle.id}
                  onDelete={() => handleDelete(vehicle)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

type StatisticCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
};

function StatisticCard({
  label,
  value,
  icon,
}: StatisticCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <span className="flex size-11 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
        {icon}
      </span>

      <p className="mt-4 text-sm text-zinc-400">
        {label}
      </p>

      <strong className="mt-1 block text-3xl text-white">
        {value}
      </strong>
    </article>
  );
}

type VehicleCardProps = {
  vehicle: Vehicle;
  deleting: boolean;
  onDelete: () => void;
};

function VehicleCard({
  vehicle,
  deleting,
  onDelete,
}: VehicleCardProps) {
  const cover =
    vehicle.media.find((mediaItem) => mediaItem.isCover) ??
    vehicle.media[0];

  const status =
    statusInformation[vehicle.status] ??
    statusInformation.inactive;

  const availableFeatures = Object.entries(
    vehicle.features,
  )
    .filter(([, enabled]) => enabled)
    .map(
      ([feature]) =>
        featureLabels[feature as keyof VehicleFeatures],
    );

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <div className="relative aspect-video bg-zinc-950">
        {cover?.type === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt={`Van ${vehicle.model}`}
            className="size-full object-cover"
          />
        )}

        {cover?.type === "video" && (
          <video
            src={cover.url}
            muted
            controls
            playsInline
            preload="metadata"
            className="size-full object-cover"
          />
        )}

        {!cover && (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-zinc-600">
            <BusFront size={42} />
            <span className="text-sm">
              Nenhuma mídia cadastrada
            </span>
          </div>
        )}

        <span
          className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="p-5">
        <div>
          <h3 className="text-xl font-semibold text-white">
            {vehicle.model}
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Ano {vehicle.year}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-zinc-950 p-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <Users size={16} />
              <span className="text-xs font-medium">
                Passageiros
              </span>
            </div>

            <strong className="mt-2 block text-sm">
              {vehicle.passengerCapacity} lugares
            </strong>
          </div>

          <div className="rounded-xl bg-zinc-950 p-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <BriefcaseBusiness size={16} />

              <span className="text-xs font-medium">
                Bagageiro
              </span>
            </div>

            <strong className="mt-2 block text-sm">
              {vehicle.luggageCapacityLiters} litros
            </strong>
          </div>
        </div>

        <p className="mt-4 text-sm text-zinc-400">
          Porte:{" "}
          <span className="text-zinc-200">
            {luggageLabels[vehicle.luggageSize]}
          </span>
        </p>

        {vehicle.luggageDimensions && (
          <p className="mt-1 text-xs text-zinc-500">
            Dimensões:{" "}
            {vehicle.luggageDimensions.widthCm} ×{" "}
            {vehicle.luggageDimensions.heightCm} ×{" "}
            {vehicle.luggageDimensions.depthCm} cm
          </p>
        )}

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Comodidades
          </p>

          {availableFeatures.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {availableFeatures.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full bg-yellow-400/10 px-2.5 py-1 text-xs text-yellow-300"
                >
                  {feature}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-zinc-500">
              Nenhuma comodidade informada.
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link
            href={`/admin/frota/${vehicle.id}/editar`}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-yellow-400 hover:text-yellow-300"
          >
            <Pencil size={16} />
            Editar
          </Link>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}

            {deleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyFleet() {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-5 py-12 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
        <BusFront size={31} />
      </span>

      <h3 className="mt-5 text-xl font-semibold">
        Nenhuma van cadastrada
      </h3>

      <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-400">
        Cadastre o primeiro veículo da TransToledo para
        utilizá-lo posteriormente nos agendamentos.
      </p>

      <Link
        href="/admin/frota/nova"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300"
      >
        <Plus size={18} />
        Cadastrar primeira van
      </Link>
    </div>
  );
}