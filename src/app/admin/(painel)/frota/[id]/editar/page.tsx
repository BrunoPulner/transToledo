"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BusFront,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { VehicleForm } from "@/app/components/admin/VehicleForm";
import { getVehicleById } from "@/services/vehicles/getVehicleById";
import type { Vehicle } from "@/types/vehicles";

export default function EditVehiclePage() {
  const params = useParams<{ id: string }>();
  const vehicleId = params.id;

  const [vehicle, setVehicle] =
    useState<Vehicle | null>(null);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  async function loadVehicle() {
    if (!vehicleId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setNotFound(false);

      const foundVehicle =
        await getVehicleById(vehicleId);

      if (!foundVehicle) {
        setNotFound(true);
        setVehicle(null);
        return;
      }

      setVehicle(foundVehicle);
    } catch (loadError) {
      console.error(loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar a van.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  if (loading) {
    return <LoadingVehicle />;
  }

  if (notFound) {
    return <VehicleNotFound />;
  }

  if (error || !vehicle) {
    return (
      <VehicleLoadError
        message={
          error || "Não foi possível carregar a van."
        }
        onRetry={loadVehicle}
      />
    );
  }

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/admin/frota"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-yellow-300"
        >
          <ArrowLeft size={17} />
          Voltar para a frota
        </Link>

        <header className="mt-6 flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-yellow-400/15 text-yellow-400">
            <BusFront size={25} />
          </span>

          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Edição de veículo
            </span>

            <h1 className="mt-2 text-3xl font-bold">
              Editar {vehicle.model}
            </h1>

            <p className="mt-2 text-zinc-400">
              Atualize as informações, comodidades e mídias
              cadastradas para esta van.
            </p>
          </div>
        </header>

        <div className="mt-8">
          <VehicleForm
            key={vehicle.id}
            vehicle={vehicle}
          />
        </div>
      </div>
    </main>
  );
}

function LoadingVehicle() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-black px-5 text-white">
      <div className="flex flex-col items-center text-center">
        <LoaderCircle
          size={34}
          className="animate-spin text-yellow-400"
        />

        <h1 className="mt-5 text-xl font-semibold">
          Carregando veículo
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Aguarde enquanto buscamos os dados da van.
        </p>
      </div>
    </main>
  );
}

function VehicleNotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-black px-5 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
          <AlertTriangle size={27} />
        </span>

        <h1 className="mt-5 text-xl font-semibold">
          Veículo não encontrado
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Esse veículo pode ter sido excluído ou o endereço
          acessado não é válido.
        </p>

        <Link
          href="/admin/frota"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300"
        >
          <ArrowLeft size={17} />
          Voltar para a frota
        </Link>
      </div>
    </main>
  );
}

type VehicleLoadErrorProps = {
  message: string;
  onRetry: () => void;
};

function VehicleLoadError({
  message,
  onRetry,
}: VehicleLoadErrorProps) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-black px-5 text-white">
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-950 p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <AlertTriangle size={27} />
        </span>

        <h1 className="mt-5 text-xl font-semibold">
          Erro ao carregar veículo
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          {message}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => void onRetry()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300"
          >
            <RefreshCw size={17} />
            Tentar novamente
          </button>

          <Link
            href="/admin/frota"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-200 transition hover:border-yellow-400 hover:text-yellow-300"
          >
            <ArrowLeft size={17} />
            Voltar
          </Link>
        </div>
      </div>
    </main>
  );
}