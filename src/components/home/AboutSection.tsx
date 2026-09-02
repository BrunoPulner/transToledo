"use client";

import { AnimatePresence, motion } from "framer-motion";
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
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
  const timeout = window.setTimeout(() => {
    setCurrentImage((current) =>
      current === aboutImages.length - 1
        ? 0
        : current + 1
    );
  }, 5500);

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
      className="
        relative
        scroll-mt-28
        overflow-hidden
        bg-white
        py-14
        text-slate-950
        transition-colors
        duration-500
        dark:bg-[#080a0c]
        dark:text-white
        lg:min-h-[calc(100vh-112px)]
        lg:scroll-mt-28
        lg:py-12
        xl:py-14
      "
    >
      {/* DETALHES DE FUNDO */}
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 rounded-full bg-yellow-400/5 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-yellow-400/5 blur-3xl" />

      <div className="relative mx-auto w-full max-w-375 px-5 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] xl:gap-16">
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
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-yellow-400" />

              <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500 dark:text-yellow-400">
                Sobre
              </span>
            </div>

            {/* TÍTULO */}
            <h2 className="mt-4 max-w-2xl font-(family-name:--font-montserrat) text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 transition-colors duration-500 dark:text-white sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
              Experiência que transforma
              <span className="block text-yellow-500 dark:text-yellow-400">
                cada trajeto em confiança.
              </span>
            </h2>

            {/* TEXTOS */}
            <div className="mt-5 max-w-2xl space-y-3 text-[15px] leading-7 text-slate-600 transition-colors duration-500 dark:text-white/65 lg:text-base">
              <p>
                Com sede em Rebouças, no Paraná, a TransToledo Transportes atua
                há mais de 15 anos no transporte de passageiros, atendendo
                turismo, excursões, eventos, shows, universidades e viagens
                personalizadas.
              </p>

              <p>
                Ao longo dessa trajetória, construímos nosso trabalho com foco
                em segurança, responsabilidade, conforto e atendimento próximo.
                Cada viagem é planejada para proporcionar tranquilidade desde o
                embarque até o destino final.
              </p>

              <p>
                Nossa frota conta com veículos climatizados e motoristas
                profissionais e experientes, preparados para oferecer um
                transporte seguro e confortável em diferentes tipos de viagem.
              </p>
            </div>
          </motion.div>

          {/* CARROSSEL */}
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
            <div className="group relative aspect-4/3 overflow-hidden rounded-4xl border border-black/5 bg-slate-200 shadow-2xl shadow-black/10 transition-colors duration-500 dark:border-white/10 dark:bg-white/5 dark:shadow-black/30 lg:aspect-16/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage.src}
                  initial={{
                    opacity: 0,
                    scale: 1.04,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 1.02,
                  }}
                  transition={{
                    duration: 0.65,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* GRADIENTE */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/5 to-black/10" />

              {/* SETA ESQUERDA */}
              <button
                type="button"
                onClick={handlePreviousImage}
                aria-label="Imagem anterior"
                className="absolute left-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white opacity-0 backdrop-blur-md transition duration-300 hover:border-yellow-400/50 hover:bg-yellow-400 hover:text-black group-hover:opacity-100"
              >
                <ChevronLeft size={20} />
              </button>

              {/* SETA DIREITA */}
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Próxima imagem"
                className="absolute right-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white opacity-0 backdrop-blur-md transition duration-300 hover:border-yellow-400/50 hover:bg-yellow-400 hover:text-black group-hover:opacity-100"
              >
                <ChevronRight size={20} />
              </button>

              {/* TEXTO */}
              <div className="absolute bottom-7 left-6 right-6 z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage.label}
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400">
                      {activeImage.label}
                    </span>

                    <p className="mt-2 max-w-lg text-lg font-bold leading-snug text-white sm:text-xl xl:text-2xl">
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
                      aria-label={`Exibir imagem ${index + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        active
                          ? "w-7 bg-yellow-400"
                          : "w-1.5 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            
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
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-12 xl:grid-cols-4"
        >
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-400/40 hover:shadow-xl hover:shadow-black/5 dark:border-white/10 dark:bg-white/3 dark:hover:border-yellow-400/30 dark:hover:bg-white/5"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-500 transition-all duration-300 group-hover:bg-yellow-400 group-hover:text-black dark:text-yellow-400">
                  <Icon size={21} />
                </div>

                <h3 className="mt-4 font-bold text-slate-950 transition-colors duration-500 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-5 text-slate-500 transition-colors duration-500 dark:text-white/50">
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