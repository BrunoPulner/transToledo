"use client";

import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";



export function HomeHero() {
  return (
    <section className="relative flex min-h-screen overflow-hidden bg-black">
      {/* BACKGROUND */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/images/backgrounds/inicio2.png')",
        }}
      />

      {/* OVERLAY PRINCIPAL */}
      <div className="absolute inset-0 bg-black/30" />

      {/* GRADIENTE ESQUERDO */}
      <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/45 to-black/10" />

      {/* GRADIENTE INFERIOR */}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/15" />

      {/* CONTEÚDO */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-375 items-center px-5 pb-28 pt-32 lg:px-10">
        <div className="w-full max-w-4xl">
          {/* BEM-VINDO */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            className="mb-5 flex items-center gap-3"
          >
            <span className="h-px w-10 bg-yellow-400" />

            <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400 sm:text-sm">
              Bem-vindo
            </span>
          </motion.div>

          {/* TEXTO PRINCIPAL */}
          <motion.h1
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.1,
            }}
            className="max-w-3xl font-(family-name:--font-montserrat) text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Há mais de 15 anos
            <span className="block text-yellow-400">
              levando você mais longe.
            </span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.25,
            }}
            className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg"
          >
            Segurança, conforto e experiência para transformar
            cada trajeto em parte de uma grande viagem.
            Turismo, eventos, excursões e transporte de passageiros.
          </motion.p>

          {/* BOTÕES */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              delay: 0.4,
            }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/destinos"
              className="group flex items-center justify-center gap-3 rounded-full bg-yellow-400 px-7 py-4 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              Explore nossos destinos

              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/frota"
              className="flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Conheça nossa frota
            </Link>
          </motion.div>

          

          {/* CONFIANÇA */}
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.85,
              duration: 0.8,
            }}
            className="mt-6 flex items-center gap-3 text-sm text-white/60"
          >
            <ShieldCheck
              size={19}
              className="shrink-0 text-yellow-400"
            />

            Transporte com segurança, responsabilidade e conforto.
          </motion.div>
        </div>
      </div>

      {/* SCROLL */}
      <div className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
          Explore
        </span>

        <motion.div
          animate={{
            y: [0, 6, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
          }}
        >
          <ArrowDown
            size={18}
            className="text-yellow-400"
          />
        </motion.div>
      </div>
    </section>
  );
}