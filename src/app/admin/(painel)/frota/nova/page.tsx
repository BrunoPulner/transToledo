import { ArrowLeft, BusFront } from "lucide-react";
import Link from "next/link";

import { VehicleForm } from "@/app/components/admin/VehicleForm";

export default function NewVehiclePage() {
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
            <h1 className="text-3xl font-bold">
              Cadastrar nova van
            </h1>

            <p className="mt-2 text-zinc-400">
              Cadastre as características, comodidades e mídias
              do veículo.
            </p>
          </div>
        </header>

        <div className="mt-8">
          <VehicleForm />
        </div>
      </div>
    </main>
  );
}