"use client";

import Image from "next/image";

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Star,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import type {
  FrequentTrip,
  TripMedia,
} from "@/types/trip";

import {
  formatDuration,
  formatLocation,
  tripTypeLabels,
} from "./destinationUtils";

type DestinationDetailsProps = {
  trip: FrequentTrip;
};

export function DestinationDetails({
  trip,
}: DestinationDetailsProps) {
  const [
    selectedMediaIndex,
    setSelectedMediaIndex,
  ] = useState(0);

  /*
   * Ao trocar de destino, volta para
   * a primeira mídia cadastrada.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedMediaIndex(0);
  }, [trip.id]);

  const selectedMedia =
    trip.media[
      selectedMediaIndex
    ] ??
    trip.media[0] ??
    null;

  const hasMultipleMedia =
    trip.media.length > 1;

  function previousMedia() {
    if (!hasMultipleMedia) {
      return;
    }

    setSelectedMediaIndex(
      (currentIndex) =>
        currentIndex === 0
          ? trip.media.length - 1
          : currentIndex - 1,
    );
  }

  function nextMedia() {
    if (!hasMultipleMedia) {
      return;
    }

    setSelectedMediaIndex(
      (currentIndex) =>
        (
          currentIndex + 1
        ) %
        trip.media.length,
    );
  }

  function scrollToFleet() {
    document
      .querySelector(
        "#frota",
      )
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-white/10 dark:bg-[#10141c] dark:shadow-black/20">
      {/* MÍDIA PRINCIPAL */}
      <div className="relative min-h-80 overflow-hidden bg-slate-200 sm:min-h-96 lg:min-h-120 dark:bg-black/20">
        {selectedMedia ? (
          <DestinationMedia
            media={
              selectedMedia
            }
            name={
              trip.name
            }
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-white/25">
            <MapPin
              size={38}
            />

            <p className="mt-3 text-sm">
              Mídia não cadastrada
            </p>
          </div>
        )}

        {selectedMedia && (
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent" />
        )}

        {hasMultipleMedia && (
          <>
            <button
              type="button"
              onClick={
                previousMedia
              }
              aria-label="Mídia anterior"
              className="
                absolute
                left-4
                top-1/2
                z-10
                flex
                size-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-black/40
                text-white
                backdrop-blur-md
                transition
                hover:bg-black/65
              "
            >
              <ChevronLeft
                size={21}
              />
            </button>

            <button
              type="button"
              onClick={
                nextMedia
              }
              aria-label="Próxima mídia"
              className="
                absolute
                right-4
                top-1/2
                z-10
                flex
                size-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/20
                bg-black/40
                text-white
                backdrop-blur-md
                transition
                hover:bg-black/65
              "
            >
              <ChevronRight
                size={21}
              />
            </button>
          </>
        )}

        {/* INDICADORES DAS MÍDIAS */}
        {hasMultipleMedia && (
          <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-3 py-2 backdrop-blur-md">
            {trip.media.map(
              (
                media,
                index,
              ) => (
                <button
                  key={`${media.url}-${index}`}
                  type="button"
                  onClick={() =>
                    setSelectedMediaIndex(
                      index,
                    )
                  }
                  aria-label={`Exibir mídia ${index + 1}`}
                  className={`
                    h-1.5
                    rounded-full
                    transition-all

                    ${
                      index ===
                      selectedMediaIndex
                        ? "w-6 bg-yellow-400"
                        : "w-1.5 bg-white/55 hover:bg-white"
                    }
                  `}
                />
              ),
            )}
          </div>
        )}

        {/* IDENTIFICAÇÃO DA VIAGEM */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-white sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-yellow-400/30 bg-yellow-400/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-yellow-300 backdrop-blur-md">
              {
                tripTypeLabels[
                  trip.type
                ]
              }
            </span>

            {trip.featured && (
              <span className="flex items-center gap-1 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] font-semibold backdrop-blur-md">
                <Star
                  size={11}
                  className="fill-yellow-400 text-yellow-400"
                />

                Destaque
              </span>
            )}

            {hasMultipleMedia && (
              <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[10px] font-semibold backdrop-blur-md">
                {selectedMediaIndex + 1}
                {" / "}
                {trip.media.length}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {trip.name}
          </h3>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/75">
            <MapPin
              size={15}
              className="shrink-0"
            />

            {formatLocation(
              trip,
            )}
          </p>
        </div>
      </div>

      {/* INFORMAÇÕES */}
      <div className="p-5 sm:p-7">
        <p className="text-sm leading-7 text-slate-600 dark:text-white/55 sm:text-base">
          {trip.description ||
            "Conheça este destino com conforto, segurança e tranquilidade."}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {trip.averageDurationMinutes >
            0 && (
            <InformationCard
              icon={
                <Clock3
                  size={17}
                />
              }
              label="Duração média"
              value={formatDuration(
                trip.averageDurationMinutes,
              )}
            />
          )}

          <InformationCard
            icon={
              <MapPin
                size={17}
              />
            }
            label="Localização"
            value={formatLocation(
              trip,
            )}
          />
        </div>

        <button
          type="button"
          onClick={
            scrollToFleet
          }
          className="
            mt-6
            flex
            w-full
            items-center
            justify-center
            rounded-xl
            bg-red-600
            px-5
            py-3.5
            text-sm
            font-bold
            text-white
            transition
            hover:bg-red-500
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-red-500
            focus-visible:ring-offset-2
            dark:focus-visible:ring-offset-[#10141c]
          "
        >
          Solicitar orçamento
        </button>
      </div>
    </article>
  );
}

function DestinationMedia({
  media,
  name,
}: {
  media: TripMedia;
  name: string;
}) {
  if (
    media.type === "video"
  ) {
    return (
      <video
        key={
          media.url
        }
        src={
          media.url
        }
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <Image
      key={
        media.url
      }
      src={
        media.url
      }
      alt={
        name
      }
      fill
      unoptimized
      priority
      sizes="(max-width: 1024px) 100vw, 60vw"
      className="object-cover"
    />
  );
}

function InformationCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/3">
      <span className="shrink-0 text-yellow-500">
        {icon}
      </span>

      <span className="min-w-0">
        <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-white/30">
          {label}
        </span>

        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-700 dark:text-white/70">
          {value}
        </span>
      </span>
    </div>
  );
}