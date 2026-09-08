"use client";

import {
  motion,
} from "framer-motion";

import {
  FleetEmpty,
} from "./fleet/FleetEmpty";

import {
  FleetHeader,
} from "./fleet/FleetHeader";

import {
  FleetInformation,
} from "./fleet/FleetInformation";

import {
  FleetLoading,
} from "./fleet/FleetLoading";

import {
  FleetMediaCarousel,
} from "./fleet/FleetMediaCarousel";

import {
  FleetSidebar,
} from "./fleet/FleetSidebar";

import {
  useFleetPreview,
} from "@/app/hooks/fleet/useFleetPreview";

export function FleetPreview() {
  const {
    activeVehicles,
    selectedVehicle,
    selectedVehicleId,

    menuCollapsed,

    loading,
    error,

    selectVehicle,
    toggleMenu,
  } = useFleetPreview();

  return (
    <section
      id="frota"
      className="
  relative
  scroll-mt-28
  overflow-x-hidden
  bg-slate-950
  py-10
  text-white
  lg:min-h-[calc(100vh-112px)]
  lg:py-6
"
    >
      {/* EFEITOS DE FUNDO */}
      <div className="pointer-events-none absolute -left-40 top-20 size-96 rounded-full bg-yellow-400/8 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 size-96 rounded-full bg-yellow-400/6 blur-3xl" />

      <div
        className="
  relative
  mx-auto
  flex
  min-h-[calc(100vh-112px)]
  w-full
  max-w-375
  flex-col
  px-4
  sm:px-5
  lg:px-10
"
      >
        {/* CABEÇALHO */}
        <FleetHeader />

        {/* CARREGAMENTO */}
        {loading && (
          <FleetLoading />
        )}

        {/* ERRO */}
        {!loading && error && (
          <FleetEmpty
            error={error}
          />
        )}

        {/* NENHUM VEÍCULO */}
        {!loading &&
          !error &&
          !selectedVehicle && (
            <FleetEmpty />
          )}

        {/* CONTEÚDO */}
        {!loading &&
          !error &&
          selectedVehicle && (
            <motion.div
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
                amount: 0.1,
              }}
              transition={{
                duration: 0.55,
              }}
              className={`
                mt-5
                grid
                min-h-0
                flex-1
                gap-4
                transition-[grid-template-columns]
                duration-300
                ${
                  menuCollapsed
                    ? "lg:grid-cols-[5.25rem_minmax(0,1fr)]"
                    : "lg:grid-cols-[17rem_minmax(0,1fr)]"
                }
              `}
            >
              {/* MENU DA FROTA */}
              <FleetSidebar
                vehicles={
                  activeVehicles
                }
                selectedVehicleId={
                  selectedVehicleId
                }
                collapsed={
                  menuCollapsed
                }
                onSelect={
                  selectVehicle
                }
                onToggle={
                  toggleMenu
                }
              />

              {/* VEÍCULO SELECIONADO */}
              <motion.article
                key={
                  selectedVehicle.id
                }
                initial={{
                  opacity: 0,
                  x: 18,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="
                  flex
                  min-h-0
                  flex-col
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/5
                  shadow-2xl
                  shadow-black/25
                "
              >
                {/* IMAGENS E VÍDEOS */}
                <FleetMediaCarousel
                  vehicle={
                    selectedVehicle
                  }
                />

                {/* INFORMAÇÕES INFERIORES */}
                <FleetInformation
                  vehicle={
                    selectedVehicle
                  }
                />
              </motion.article>
            </motion.div>
          )}
      </div>
    </section>
  );
}