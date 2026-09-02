import {
  BusFront,
  CalendarDays,
  ClipboardList,
  Route,
} from "lucide-react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminAuth } from "@/lib/firebase/admin";

const cards = [
  {
    title: "Frota",
    value: "0",
    description: "Veículos cadastrados",
    icon: BusFront,
  },
  {
    title: "Orçamentos",
    value: "0",
    description: "Solicitações pendentes",
    icon: ClipboardList,
  },
  {
    title: "Viagens",
    value: "0",
    description: "Viagens agendadas",
    icon: Route,
  },
  {
    title: "Agenda",
    value: "0",
    description: "Compromissos próximos",
    icon: CalendarDays,
  },
];

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get(
    "transtoledo_session"
  )?.value;

  if (!sessionCookie) {
    redirect("/admin");
  }

  try {
    await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );
  } catch {
    redirect("/admin");
  }

  return (
    <main className="min-h-dvh bg-[#07090b] px-5 py-10 text-white lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        {/* CABEÇALHO */}
        <div>
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
            Acompanhe as operações da TransToledo
            em um único lugar.
          </p>
        </div>

        {/* CARDS */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/4 p-6 transition duration-300 hover:border-yellow-400/30 hover:bg-white/6"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                  <Icon size={21} />
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-white/50">
                    {card.title}
                  </p>

                  <p className="mt-1 text-3xl font-bold">
                    {card.value}
                  </p>

                  <p className="mt-2 text-xs text-white/35">
                    {card.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* CONTEÚDO INICIAL */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/3 p-6">
          <h2 className="font-(family-name:--font-montserrat) text-lg font-bold">
            Operações recentes
          </h2>

          <p className="mt-2 text-sm text-white/40">
            As próximas viagens e solicitações de
            orçamento aparecerão aqui.
          </p>

          <div className="mt-8 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-white/10">
            <div className="text-center">
              <CalendarDays
                size={30}
                className="mx-auto text-white/20"
              />

              <p className="mt-3 text-sm text-white/35">
                Nenhuma operação registrada ainda.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}