"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  MapPin,
  Snowflake,
  UserRoundCheck,
} from "lucide-react";
import Image from "next/image";

const highlights = [
  {
    icon: BadgeCheck,
    title: "+15 anos no mercado",
    description:
      "Experiência construída ao longo de anos transportando pessoas com responsabilidade.",
  },
  {
    icon: UserRoundCheck,
    title: "Motoristas profissionais",
    description:
      "Equipe experiente, preparada e comprometida com a segurança de cada viagem.",
  },
  {
    icon: Snowflake,
    title: "Frota climatizada",
    description:
      "Todos os veículos contam com ar-condicionado para proporcionar mais conforto.",
  },
  {
    icon: MapPin,
    title: "Rebouças • Paraná",
    description:
      "Empresa sediada em Rebouças, atendendo viagens, eventos e diferentes destinos.",
  },
];

export function AboutSection() {
  return (
    <section
         id="sobre"
         className="relative scroll-mt-28 overflow-hidden bg-white py-20 text-slate-950 transition-colors duration-500 dark:bg-[#080a0c] dark:text-white lg:scroll-mt-32 lg:py-28"      
      
    >
      {/* DETALHES DE FUNDO */}
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-yellow-400/5 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-yellow-400/5 blur-3xl" />

      <div className="relative mx-auto w-full max-w-375 px-5 lg:px-10">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] xl:gap-20">
          {/* CONTEÚDO */}
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.7,
            }}
          >
            {/* LABEL */}
            <div className="flex items-center gap-3" >
              <span className="h-px w-10 bg-yellow-400"/>

              <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500 dark:text-yellow-400">
                Sobre
              </span>
            </div>

            {/* TÍTULO */}
            <h2 className="mt-6 max-w-2xl font-(family-name:--font-montserrat) text-4xl font-bold leading-tight tracking-tight text-slate-950 transition-colors duration-500 dark:text-white sm:text-5xl lg:text-6xl">
              Experiência que transforma
              <span className="block text-yellow-500 dark:text-yellow-400">
                cada trajeto em confiança.
              </span>
            </h2>

            {/* TEXTOS */}
            <div className="mt-7 max-w-2xl space-y-5 text-base leading-8 text-slate-600 transition-colors duration-500 dark:text-white/65">
              <p>
                Com sede em Rebouças, no Paraná, a TransToledo
                Transportes atua há mais de 15 anos no transporte de
                passageiros, atendendo turismo, excursões, eventos,
                shows, universidades e viagens personalizadas.
              </p>

              <p>
                Ao longo dessa trajetória, construímos nosso trabalho
                com foco em segurança, responsabilidade, conforto e
                atendimento próximo. Cada viagem é planejada para
                proporcionar tranquilidade desde o embarque até o
                destino final.
              </p>

              <p>
                Nossa frota conta com veículos climatizados e
                motoristas profissionais e experientes, preparados
                para oferecer um transporte seguro e confortável em
                diferentes tipos de viagem.
              </p>
            </div>
          </motion.div>

          {/* IMAGEM */}
          <motion.div
            initial={{
              opacity: 0,
              x: 35,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.8,
              delay: 0.1,
            }}
            className="relative"
          >
            <div className="relative aspect-4/3 overflow-hidden rounded-4xl border border-black/5 bg-slate-200 shadow-2xl shadow-black/10 transition-colors duration-500 dark:border-white/10 dark:bg-white/5 dark:shadow-black/30">
              <Image
                src="/images/backgrounds/motoristas.jpeg"
                alt="Motoristas da TransToledo Transportes"
                fill
                priority={false}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              {/* GRADIENTE DA FOTO */}
              <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/5 to-transparent" />

              {/* TEXTO NA FOTO */}
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400">
                  TransToledo Transportes
                </span>

                <p className="mt-2 max-w-md text-xl font-bold text-white sm:text-2xl">
                  Mais do que transportar pessoas, fazemos parte da
                  experiência de cada viagem.
                </p>
              </div>
            </div>

            {/* CARD SOBREPOSTO */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.35,
              }}
              className="absolute -bottom-7 left-5 rounded-2xl border border-white/15 bg-[#0b0d0f]/90 px-6 py-5 text-white shadow-xl backdrop-blur-xl sm:left-auto sm:right-6"
            >
              <span className="text-3xl font-black text-yellow-400">
                +15
              </span>

              <p className="mt-1 text-sm font-semibold text-white">
                anos de experiência
              </p>

              <p className="mt-1 text-xs text-white/50">
                transportando pessoas
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* DIFERENCIAIS */}
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.7,
            delay: 0.15,
          }}
          className="mt-24 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/40 hover:shadow-xl hover:shadow-black/5 dark:border-white/10 dark:bg-white/3 dark:hover:border-yellow-400/30 dark:hover:bg-white/5"
              >
                {/* ÍCONE */}
                <div className="flex size-12 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-500 transition-all duration-300 group-hover:bg-yellow-400 group-hover:text-black dark:text-yellow-400">
                  <Icon size={22} />
                </div>

                {/* TÍTULO */}
                <h3 className="mt-5 font-bold text-slate-950 transition-colors duration-500 dark:text-white">
                  {item.title}
                </h3>

                {/* DESCRIÇÃO */}
                <p className="mt-2 text-sm leading-6 text-slate-500 transition-colors duration-500 dark:text-white/50">
                  {item.description}
                </p>
              </article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}