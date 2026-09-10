"use client";

import {
  Check,
  ChevronRight,
  MapPinned,
  Route,
  type LucideIcon,
} from "lucide-react";

import type {
  QuoteTripMode,
} from "@/types/quote";

type TripTypeSelectorProps = {
  selectedMode: QuoteTripMode | null;

  onSelect: (
    mode: QuoteTripMode,
  ) => void;
};

type TripTypeOption = {
  id: QuoteTripMode;
  title: string;
  description: string;
  detail: string;
  icon: LucideIcon;
};

const tripTypeOptions: TripTypeOption[] = [
  {
    id: "registered",
    title: "Viagens frequentes",
    description:
      "Escolha um destino já realizado pela TransToledo.",
    detail:
      "Consulte cidades, locais, duração média e outras informações.",
    icon: Route,
  },
  {
    id: "custom",
    title: "Escolha seu destino",
    description:
      "Informe o endereço da viagem e escolha o local pelo mapa.",
    detail:
      "Pesquise pelo nome, endereço ou CEP e ajuste o pin.",
    icon: MapPinned,
  },
];

export function TripTypeSelector({
  selectedMode,
  onSelect,
}: TripTypeSelectorProps) {
  return (
    <div
      className="
        grid
        gap-3
        md:grid-cols-2
      "
    >
      {tripTypeOptions.map(
        (option) => {
          const Icon =
            option.icon;

          const selected =
            selectedMode ===
            option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                onSelect(
                  option.id,
                )
              }
              aria-pressed={
                selected
              }
              className={`
                group
                relative
                flex
                min-h-44
                w-full
                items-start
                gap-4
                overflow-hidden
                rounded-3xl
                border
                p-4
                text-left
                transition
                duration-300
                sm:p-5
                ${
                  selected
                    ? `
                      border-yellow-400
                      bg-yellow-400/8
                      shadow-xl
                      shadow-yellow-400/10
                    `
                    : `
                      border-white/10
                      bg-white/4
                      hover:-translate-y-0.5
                      hover:border-yellow-400/35
                      hover:bg-white/7
                    `
                }
              `}
            >
              <span
                className={`
                  flex
                  size-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  transition
                  sm:size-14
                  ${
                    selected
                      ? `
                        border-yellow-400
                        bg-yellow-400
                        text-slate-950
                      `
                      : `
                        border-white/10
                        bg-white/5
                        text-yellow-400
                        group-hover:border-yellow-400/30
                        group-hover:bg-yellow-400/10
                      `
                  }
                `}
              >
                <Icon
                  size={23}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >
                  <strong
                    className="
                      text-base
                      font-bold
                      text-white
                      sm:text-lg
                    "
                  >
                    {
                      option.title
                    }
                  </strong>

                  {selected ? (
                    <span
                      className="
                        flex
                        size-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-yellow-400
                        text-slate-950
                      "
                    >
                      <Check
                        size={15}
                      />
                    </span>
                  ) : (
                    <ChevronRight
                      size={18}
                      className="
                        mt-1
                        shrink-0
                        text-white/20
                        transition
                        group-hover:translate-x-0.5
                        group-hover:text-yellow-400
                      "
                    />
                  )}
                </span>

                <span
                  className="
                    mt-2
                    block
                    text-xs
                    leading-5
                    text-white/55
                    sm:text-sm
                  "
                >
                  {
                    option.description
                  }
                </span>

                <span
                  className="
                    mt-3
                    block
                    text-[10px]
                    leading-4
                    text-white/30
                    sm:text-[11px]
                  "
                >
                  {
                    option.detail
                  }
                </span>

                <span
                  className={`
                    mt-4
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    px-2.5
                    py-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wider
                    transition
                    ${
                      selected
                        ? `
                          border-yellow-400/30
                          bg-yellow-400/10
                          text-yellow-300
                        `
                        : `
                          border-white/8
                          bg-white/3
                          text-white/30
                        `
                    }
                  `}
                >
                  {selected
                    ? "Opção selecionada"
                    : "Selecionar opção"}
                </span>
              </span>

              <span
                aria-hidden="true"
                className={`
                  pointer-events-none
                  absolute
                  -bottom-16
                  -right-16
                  size-36
                  rounded-full
                  blur-3xl
                  transition
                  ${
                    selected
                      ? "bg-yellow-400/15"
                      : "bg-white/3"
                  }
                `}
              />
            </button>
          );
        },
      )}
    </div>
  );
}