import {
  ArrowUpRight,
  MapPin,
} from "lucide-react";

import type {
  FrequentTrip,
} from "@/types/trip";

import {
  createGoogleMapsEmbedUrl,
  createGoogleMapsExternalUrl,
  formatLocation,
} from "./destinationUtils";

type DestinationMapProps = {
  trip: FrequentTrip;
};

export function DestinationMap({
  trip,
}: DestinationMapProps) {
  const embedUrl =
    createGoogleMapsEmbedUrl(
      trip,
    );

  const externalUrl =
    createGoogleMapsExternalUrl(
      trip,
    );

  const locationTitle =
    trip.location.trim() ||
    formatLocation(
      trip,
    );

  return (
    <article className="flex min-h-128 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:border-white/10 dark:bg-[#10141c] dark:shadow-black/20 lg:min-h-0">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MapPin
              size={15}
              className="shrink-0 text-yellow-500"
            />

            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-600 dark:text-yellow-400">
              Localização
            </p>
          </div>

          <h3 className="mt-2 truncate font-bold text-slate-900 dark:text-white">
            {locationTitle}
          </h3>

          <p className="mt-1 text-xs text-slate-500 dark:text-white/40">
            Posição aproximada do destino
          </p>
        </div>

        {externalUrl && (
          <a
            href={
              externalUrl
            }
            target="_blank"
            rel="noreferrer"
            className="
              flex
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              px-4
              py-2.5
              text-xs
              font-semibold
              text-slate-700
              transition
              hover:border-yellow-500
              hover:text-yellow-600
              dark:border-white/10
              dark:text-white/70
              dark:hover:border-yellow-400/50
              dark:hover:text-yellow-400
            "
          >
            Abrir no Maps

            <ArrowUpRight
              size={15}
            />
          </a>
        )}
      </div>

      {/* MAPA */}
      <div className="relative min-h-128 flex-1 bg-slate-100 dark:bg-white/3 lg:min-h-152">
        {embedUrl ? (
          <iframe
            key={
              embedUrl
            }
            src={
              embedUrl
            }
            title={`Mapa de ${trip.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
              <MapPin
                size={28}
              />
            </span>

            <h4 className="mt-4 font-bold text-slate-800 dark:text-white/80">
              Localização não cadastrada
            </h4>

            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-white/40">
              Este destino ainda não possui uma posição disponível no mapa.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}