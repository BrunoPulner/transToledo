"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  Accessibility,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  PlugZap,
  Refrigerator,
  Snowflake,
  Sofa,
  Tv,
  Usb,
  UsersRound,
  Wifi,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  PublicVehicleCalendar,
} from "./PublicVehicleCalendar";

import type {
  Vehicle,
} from "@/types/vehicles";

type FleetInformationProps = {
  vehicle: Vehicle;
};

const featureDetails = [
  {
    key: "airConditioning",
    label: "Ar-condicionado",
    icon: Snowflake,
  },
  {
    key: "wifi",
    label: "Wi-Fi",
    icon: Wifi,
  },
  {
    key: "usb",
    label: "Entradas USB",
    icon: Usb,
  },
  {
    key: "powerOutlet",
    label: "Tomadas",
    icon: PlugZap,
  },
  {
    key: "recliningSeats",
    label: "Bancos reclináveis",
    icon: Sofa,
  },
  {
    key: "accessibility",
    label: "Acessibilidade",
    icon: Accessibility,
  },
  {
    key: "television",
    label: "Televisão",
    icon: Tv,
  },
  {
    key: "refrigerator",
    label: "Refrigerador",
    icon: Refrigerator,
  },
] as const;

const luggageLabels = {
  small: "Pequeno",
  medium: "Médio",
  large: "Amplo",
};

export function FleetInformation({
  vehicle,
}: FleetInformationProps) {
  const [
    activePanel,
    setActivePanel,
  ] = useState<
    "details" | "calendar"
  >("details");

  const [
    collapsed,
    setCollapsed,
  ] = useState(false);

  const enabledFeatures =
    featureDetails.filter(
      (feature) =>
        vehicle.features[
          feature.key
        ],
    );

  const dimensions =
    vehicle.luggageDimensions;

  return (
    <div
      className="
        shrink-0
        border-t
        border-white/10
        bg-[#121620]
        px-4
        py-3
        lg:px-5
      "
    >
      {/* BARRA SUPERIOR */}
      <div className="flex items-center gap-4">
        {/* IDENTIFICAÇÃO */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-400" />

            <p className="truncate text-[9px] font-bold uppercase tracking-[0.17em] text-yellow-400 sm:text-[10px]">
              Disponível para sua viagem
            </p>
          </div>

          <div className="mt-1 flex items-center gap-3">
            <h3 className="truncate font-(family-name:--font-montserrat) text-lg font-bold text-white sm:text-xl">
              {vehicle.model}
            </h3>

            <span className="shrink-0 text-[11px] text-white/35">
              {vehicle.year}
            </span>
          </div>
        </div>

        {/* ABAS */}
        {!collapsed && (
          <div
            className="
              hidden
              w-64
              shrink-0
              grid-cols-2
              rounded-xl
              border
              border-white/5
              bg-black/20
              p-1
              sm:grid
            "
          >
            <PanelButton
              active={
                activePanel ===
                "details"
              }
              onClick={() =>
                setActivePanel(
                  "details",
                )
              }
            >
              <BriefcaseBusiness
                size={13}
              />

              Detalhes
            </PanelButton>

            <PanelButton
              active={
                activePanel ===
                "calendar"
              }
              onClick={() =>
                setActivePanel(
                  "calendar",
                )
              }
            >
              <CalendarDays
                size={13}
              />

              Agenda
            </PanelButton>
          </div>
        )}

        {/* RECOLHER INFORMAÇÕES */}
        <button
          type="button"
          onClick={() =>
            setCollapsed(
              (current) =>
                !current,
            )
          }
          title={
            collapsed
              ? "Exibir informações"
              : "Recolher informações"
          }
          aria-label={
            collapsed
              ? "Exibir informações do veículo"
              : "Recolher informações do veículo"
          }
          className="
            flex
            size-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-white/5
            text-white/50
            transition
            hover:border-yellow-400/40
            hover:bg-yellow-400/10
            hover:text-yellow-400
          "
        >
          {collapsed ? (
            <Maximize2 size={16} />
          ) : (
            <Minimize2 size={16} />
          )}
        </button>
      </div>

      {/* ABAS NO CELULAR */}
      {!collapsed && (
        <div className="mt-3 grid grid-cols-2 rounded-xl border border-white/5 bg-black/20 p-1 sm:hidden">
          <PanelButton
            active={
              activePanel ===
                "details"
            }
            onClick={() =>
              setActivePanel(
                "details",
              )
            }
          >
            <BriefcaseBusiness
              size={13}
            />

            Detalhes
          </PanelButton>

          <PanelButton
            active={
              activePanel ===
                "calendar"
            }
            onClick={() =>
              setActivePanel(
                "calendar",
              )
            }
          >
            <CalendarDays
              size={13}
            />

            Agenda
          </PanelButton>
        </div>
      )}

      {/* CONTEÚDO RECOLHÍVEL */}
      <AnimatePresence
        initial={false}
      >
        {!collapsed && (
          <motion.div
            key="vehicle-information"
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="overflow-hidden"
          >
            {activePanel ===
            "details" ? (
              <div
                className="
                  mt-3
                  grid
                  items-center
                  gap-2
                  sm:grid-cols-2
                  lg:grid-cols-[auto_auto_minmax(0,1fr)_auto]
                "
              >
                {/* CAPACIDADE */}
                <InformationItem
                  icon={UsersRound}
                  label="Capacidade"
                  value={`${vehicle.passengerCapacity} passageiros`}
                />

                {/* BAGAGEM */}
                <InformationItem
                  icon={
                    BriefcaseBusiness
                  }
                  label="Bagageiro"
                  value={
                    luggageLabels[
                      vehicle.luggageSize
                    ]
                  }
                  description={
                    vehicle.luggageCapacityLiters >
                    0
                      ? `${vehicle.luggageCapacityLiters} litros`
                      : undefined
                  }
                />

                {/* COMODIDADES */}
                <div
                  className="
                    min-w-0
                    rounded-xl
                    border
                    border-white/7
                    bg-white/4
                    px-3
                    py-2.5
                    sm:col-span-2
                    lg:col-span-1
                  "
                >
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/30">
                    Comodidades
                  </p>

                  {enabledFeatures.length >
                  0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {enabledFeatures.map(
                        (
                          feature,
                        ) => {
                          const Icon =
                            feature.icon;

                          return (
                            <span
                              key={
                                feature.key
                              }
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-full
                                border
                                border-white/10
                                bg-black/10
                                px-2
                                py-1
                                text-[10px]
                                text-white/65
                              "
                            >
                              <Icon
                                size={
                                  11
                                }
                                className="shrink-0 text-yellow-400"
                              />

                              {
                                feature.label
                              }
                            </span>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-[11px] text-white/35">
                      Nenhuma comodidade informada.
                    </p>
                  )}
                </div>

                {/* ORÇAMENTO */}
                <Link
                  href={`/orcamento?vehicleId=${vehicle.id}`}
                  className="
                    group
                    flex
                    h-11
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    bg-red-600
                    px-4
                    text-xs
                    font-bold
                    text-white
                    shadow-lg
                    shadow-red-950/20
                    transition
                    hover:bg-red-500
                    sm:col-span-2
                    lg:col-span-1
                    lg:w-44
                  "
                >
                  Solicitar orçamento

                  <ArrowRight
                    size={16}
                    className="shrink-0 transition-transform group-hover:translate-x-1"
                  />
                </Link>

                {/* INFORMAÇÕES COMPLEMENTARES */}
                {(dimensions ||
                  vehicle.luggageCapacityLiters >
                    0) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-[10px] text-white/30 sm:col-span-2 lg:col-span-4">
                    {dimensions && (
                      <span>
                        Dimensões do bagageiro:{" "}
                        {
                          dimensions.widthCm
                        }{" "}
                        ×{" "}
                        {
                          dimensions.heightCm
                        }{" "}
                        ×{" "}
                        {
                          dimensions.depthCm
                        }{" "}
                        cm
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
  className="
    mt-3
    rounded-2xl
    border
    border-white/8
    bg-black/15
    p-2
    sm:p-3
  "
>
                <PublicVehicleCalendar
                  vehicleId={
                    vehicle.id
                  }
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTÃO PARA REABRIR */}
      {collapsed && (
        <button
          type="button"
          onClick={() =>
            setCollapsed(false)
          }
          className="mt-1 flex items-center gap-1 text-[10px] font-medium text-white/35 transition hover:text-yellow-400"
        >
          <ChevronUp size={12} />

          Exibir informações
        </button>
      )}

      {!collapsed && (
        <button
          type="button"
          onClick={() =>
            setCollapsed(true)
          }
          className="mx-auto mt-2 flex items-center gap-1 text-[9px] font-medium text-white/25 transition hover:text-yellow-400"
        >
          <ChevronDown
            size={11}
          />

          Recolher
        </button>
      )}
    </div>
  );
}

type PanelButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function PanelButton({
  active,
  onClick,
  children,
}: PanelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        items-center
        justify-center
        gap-1.5
        rounded-lg
        px-3
        py-2
        text-[11px]
        font-semibold
        transition
        ${
          active
            ? "bg-yellow-400 text-slate-950"
            : "text-white/40 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      {children}
    </button>
  );
}

type InformationItemProps = {
  icon: typeof UsersRound;
  label: string;
  value: string;
  description?: string;
};

function InformationItem({
  icon: Icon,
  label,
  value,
  description,
}: InformationItemProps) {
  return (
    <div
      className="
        flex
        h-full
        min-w-44
        items-center
        gap-3
        rounded-xl
        border
        border-white/7
        bg-white/4
        px-3
        py-2.5
      "
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400">
        <Icon size={15} />
      </span>

      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-widest text-white/30">
          {label}
        </p>

        <p className="mt-0.5 truncate text-[11px] font-semibold text-white">
          {value}
        </p>

        {description && (
          <p className="text-[9px] text-white/30">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}