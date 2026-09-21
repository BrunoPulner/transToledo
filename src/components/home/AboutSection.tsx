"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Snowflake,
  UserRoundCheck,
} from "lucide-react";

import Image from "next/image";
import { useEffect, useState } from "react";

const CAROUSEL_INTERVAL = 5500;

const highlights = [
  {
    icon: BadgeCheck,
    title: "+15 anos no mercado",
    description:
      "Experiência construída transportando pessoas com responsabilidade.",
    iconClass:
      "bg-yellow-400/15 text-yellow-600 dark:text-yellow-400",
    hoverClass:
      "hover:border-yellow-400/50 hover:shadow-yellow-400/10",
  },
  {
    icon: UserRoundCheck,
    title: "Motoristas profissionais",
    description:
      "Equipe experiente e comprometida com a segurança de cada viagem.",
    iconClass:
      "bg-sky-500/12 text-sky-600 dark:text-sky-400",
    hoverClass:
      "hover:border-sky-400/40 hover:shadow-sky-500/10",
  },
  {
    icon: Snowflake,
    title: "Frota climatizada",
    description:
      "Veículos preparados para proporcionar mais conforto durante o trajeto.",
    iconClass:
      "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400",
    hoverClass:
      "hover:border-cyan-400/40 hover:shadow-cyan-500/10",
  },
  {
    icon: MapPin,
    title: "Rebouças • Paraná",
    description:
      "Atendendo viagens, excursões, eventos e diferentes destinos.",
    iconClass:
      "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    hoverClass:
      "hover:border-emerald-400/40 hover:shadow-emerald-500/10",
  },
];

const aboutImages = [
  {
    src: "/images/backgrounds/motoristas.png",
    alt: "Motoristas da TransToledo Transportes",
    label: "Nossa equipe",
    description:
      "Mais do que transportar pessoas, fazemos parte da experiência de cada viagem.",
  },
  {
    src: "/images/trips/barretos_melhorada.png",
    alt: "Viagem da TransToledo para Barretos",
    label: "Viagens e excursões",
    description:
      "Experiências que conectam pessoas a grandes destinos, eventos e momentos especiais.",
  },
  {
    src: "/images/trips/frota-melhorada.png",
    alt: "Frota da TransToledo Transportes",
    label: "Nossa frota",
    description:
      "Veículos preparados para oferecer segurança, conforto e tranquilidade em cada trajeto.",
  },
];

export function AboutSection() {
  const [currentImage, setCurrentImage] =
    useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setCurrentImage((current) =>
        current === aboutImages.length - 1
          ? 0
          : current + 1
      );
    }, CAROUSEL_INTERVAL);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [currentImage]);

  function handlePreviousImage() {
    setCurrentImage((current) =>
      current === 0
        ? aboutImages.length - 1
        : current - 1
    );
  }

  function handleNextImage() {
    setCurrentImage((current) =>
      current === aboutImages.length - 1
        ? 0
        : current + 1
    );
  }

  const activeImage = aboutImages[currentImage];

  return (
    <section
      id="sobre"
      className="relative overflow-hidden bg-slate-50 py-16 text-slate-950 transition-colors duration-500 dark:bg-[#080a0c] dark:text-white lg:min-h-[calc(100vh-72px)] lg:py-18"
    >
      {/* FUNDO DECORATIVO */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        aria-hidden="true"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-40 top-10 size-125 rounded-full bg-yellow-400 blur-[130px]"
      />

      <motion.div
        aria-hidden="true"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.08, 0.16, 0.08],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -right-48 bottom-0 size-130 rounded-full bg-sky-500 blur-[150px]"
      />

      <div className="relative mx-auto w-full max-w-375 px-5 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] xl:gap-18">
          {/* CONTEÚDO */}
          <motion.div
            initial={{
              opacity: 0,
              x: -40,
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
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* LABEL */}
            <div className="inline-flex items-center gap-3 rounded-full border border-yellow-400/25 bg-yellow-400/8 px-4 py-2 shadow-sm shadow-yellow-400/10">
              <motion.span
                animate={{
                  scale: [1, 1.35, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="size-2 rounded-full bg-yellow-400"
              />

              <span className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-600 dark:text-yellow-400">
                Sobre a TransToledo
              </span>
            </div>

            {/* TÍTULO */}
            <h2 className="mt-6 max-w-2xl font-(family-name:--font-montserrat) text-3xl font-bold leading-[1.12] tracking-tight text-slate-950 transition-colors duration-500 dark:text-white sm:text-4xl lg:text-[2.75rem] xl:text-5xl">
  Experiência que transforma

  <span className="relative mt-1 block bg-linear-to-r from-yellow-500 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
    cada trajeto em confiança.
  </span>
</h2>

            {/* LINHA DECORATIVA */}
            <div className="mt-6 flex items-center gap-2">
              <span className="h-1 w-14 rounded-full bg-yellow-400" />
              <span className="h-1 w-5 rounded-full bg-yellow-400/40" />
              <span className="h-1 w-2 rounded-full bg-yellow-400/20" />
            </div>

            {/* TEXTOS */}
            <div className="mt-6 max-w-2xl space-y-4 text-[15px] leading-7 text-slate-600 transition-colors duration-500 dark:text-white/65 lg:text-base">
              <p>
                Com sede em Rebouças, no Paraná, a
                TransToledo Transportes atua há mais de
                15 anos no transporte de passageiros,
                atendendo turismo, excursões, eventos,
                shows, universidades e viagens
                personalizadas.
              </p>

              <p>
                Ao longo dessa trajetória, construímos
                nosso trabalho com foco em segurança,
                responsabilidade, conforto e atendimento
                próximo. Cada viagem é planejada para
                proporcionar tranquilidade desde o
                embarque até o destino final.
              </p>

              <p>
                Nossa frota conta com veículos
                climatizados e motoristas profissionais
                e experientes, preparados para oferecer
                um transporte seguro e confortável.
              </p>
            </div>

            {/* DESTAQUE */}
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.6,
                delay: 0.35,
              }}
              className="mt-7 flex max-w-xl items-center gap-4 rounded-2xl border border-yellow-400/25 bg-yellow-400/8 p-4 shadow-lg shadow-yellow-400/5 backdrop-blur-sm"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-black shadow-lg shadow-yellow-400/25">
                <BadgeCheck size={22} />
              </div>

              <p className="text-sm font-medium leading-6 text-slate-700 dark:text-white/75">
                Cada viagem é planejada com atenção aos
                detalhes, do primeiro contato até a
                chegada ao destino.
              </p>
            </motion.div>
          </motion.div>

          {/* CARROSSEL */}
          <motion.div
            initial={{
              opacity: 0,
              x: 45,
              scale: 0.96,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.9,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative"
          >
            {/* BRILHO DA IMAGEM */}
            <div className="absolute -inset-4 rounded-[2.5rem] bg-linear-to-br from-yellow-400/20 via-transparent to-sky-500/15 blur-2xl" />

            <motion.div
              whileHover={{
                y: -5,
              }}
              transition={{
                duration: 0.3,
              }}
              className="group relative aspect-4/3 overflow-hidden rounded-4xl border border-black/5 bg-slate-200 shadow-2xl shadow-black/15 transition-colors duration-500 dark:border-white/10 dark:bg-white/5 dark:shadow-black/40 lg:aspect-16/10"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage.src}
                  initial={{
                    opacity: 0,
                    scale: 1.08,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.03,
                  }}
                  transition={{
                    duration: 0.75,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    priority={currentImage === 0}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                  />
                </motion.div>
              </AnimatePresence>

              {/* GRADIENTES */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/90 via-black/15 to-black/15" />

              <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/25 via-transparent to-transparent" />

              {/* CONTADOR */}
              <div className="absolute right-5 top-5 z-20 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xl">
                {String(currentImage + 1).padStart(
                  2,
                  "0"
                )}
                <span className="mx-1 text-white/35">
                  /
                </span>
                {String(aboutImages.length).padStart(
                  2,
                  "0"
                )}
              </div>

              {/* SETA ESQUERDA */}
              <button
                type="button"
                onClick={handlePreviousImage}
                aria-label="Exibir imagem anterior"
                className="absolute left-4 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white opacity-100 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black lg:opacity-0 lg:group-hover:opacity-100"
              >
                <ChevronLeft size={21} />
              </button>

              {/* SETA DIREITA */}
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Exibir próxima imagem"
                className="absolute right-4 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white opacity-100 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black lg:opacity-0 lg:group-hover:opacity-100"
              >
                <ChevronRight size={21} />
              </button>

              {/* TEXTO */}
              <div className="absolute bottom-8 left-6 right-6 z-10 sm:left-8 sm:right-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage.label}
                    initial={{
                      opacity: 0,
                      y: 18,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    transition={{
                      duration: 0.45,
                    }}
                  >
                    <span className="inline-flex rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-black">
                      {activeImage.label}
                    </span>

                    <p className="mt-3 max-w-xl text-lg font-bold leading-snug text-white sm:text-xl xl:text-2xl">
                      {activeImage.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* INDICADORES */}
              <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
                {aboutImages.map((image, index) => {
                  const active =
                    index === currentImage;

                  return (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() =>
                        setCurrentImage(index)
                      }
                      aria-label={`Exibir imagem ${
                        index + 1
                      }`}
                      aria-current={
                        active ? "true" : undefined
                      }
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        active
                          ? "w-8 bg-yellow-400"
                          : "w-2 bg-white/35 hover:bg-white/70"
                      }`}
                    />
                  );
                })}
              </div>

              {/* PROGRESSO AUTOMÁTICO */}
              <div className="absolute bottom-0 left-0 right-0 z-20 h-0.75 bg-white/10">
                <motion.div
                  key={`progress-${currentImage}`}
                  initial={{
                    width: "0%",
                  }}
                  animate={{
                    width: "100%",
                  }}
                  transition={{
                    duration:
                      CAROUSEL_INTERVAL / 1000,
                    ease: "linear",
                  }}
                  className="h-full bg-yellow-400"
                />
              </div>
            </motion.div>

            {/* SELO FLUTUANTE */}
            <motion.div
              animate={{
                y: [0, -7, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-6 left-6 z-30 hidden items-center gap-3 rounded-2xl border border-white/15 bg-[#111315]/90 px-4 py-3 text-white shadow-2xl backdrop-blur-xl sm:flex"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-400 text-black">
                <BadgeCheck size={21} />
              </div>

              <div>
                <p className="text-xs text-white/50">
                  Nossa prioridade
                </p>

                <p className="text-sm font-bold">
                  Segurança e conforto
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* DIFERENCIAIS */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.15,
          }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
          className="mt-20 grid gap-4 sm:grid-cols-2 lg:mt-18 xl:grid-cols-4"
        >
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <motion.article
                key={item.title}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 30,
                    scale: 0.96,
                  },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  },
                }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -7,
                }}
                className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-lg shadow-black/3 backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-300 dark:border-white/10 dark:bg-white/4 dark:shadow-black/20 dark:hover:bg-white/6 ${item.hoverClass}`}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-current opacity-[0.025] blur-xl transition-transform duration-500 group-hover:scale-150" />

                <div
                  className={`flex size-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${item.iconClass}`}
                >
                  <Icon size={22} />
                </div>

                <h3 className="mt-4 font-(family-name:--font-montserrat) font-bold text-slate-950 transition-colors duration-500 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500 transition-colors duration-500 dark:text-white/50">
                  {item.description}
                </p>

                <div className="mt-5 h-0.5 w-8 rounded-full bg-yellow-400/50 transition-all duration-300 group-hover:w-16 group-hover:bg-yellow-400" />
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}