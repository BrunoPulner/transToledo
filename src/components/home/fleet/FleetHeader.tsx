"use client";

import {
  motion,
} from "framer-motion";

export function FleetHeader() {
  return (
    <motion.header
      initial={{
        opacity: 0,
        y: 18,
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
        duration: 0.6,
      }}
      className="
        flex
        shrink-0
        flex-col
        gap-3
        lg:flex-row
        lg:items-end
        lg:justify-between
      "
    >
      <div className="min-w-0">
        {/* IDENTIFICAÇÃO */}
        <div className="flex items-center gap-3">
          <span className="h-px w-9 shrink-0 bg-yellow-400" />

          <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-yellow-400 sm:text-[11px]">
            Nossa frota
          </span>
        </div>

        {/* TÍTULO EM UMA LINHA */}
        <h2
          className="
            mt-2
            whitespace-nowrap
            font-(family-name:--font-montserrat)
            text-[clamp(0.72rem,2.1vw,1.9rem)]
            font-bold
            leading-none
            tracking-tight
          "
        >
          Conforto e segurança para{" "}

          <span className="text-yellow-400">
            cada tipo de viagem.
          </span>
        </h2>
      </div>

      {/* DESCRIÇÃO */}
      <p
        className="
          max-w-lg
          text-xs
          leading-5
          text-white/45
          sm:text-sm
          sm:leading-6
          lg:text-right
        "
      >
        Escolha um veículo, conheça
        seus detalhes e consulte os
        horários disponíveis.
      </p>
    </motion.header>
  );
}