import Image from "next/image";

import {
  MapPin,
  Star,
} from "lucide-react";

import type {
  FrequentTrip,
} from "@/types/trip";

import {
  formatLocation,
  getCoverMedia,
  tripTypeLabels,
} from "./destinationUtils";

type DestinationCardProps = {
  trip: FrequentTrip;
  selected: boolean;
  onSelect: () => void;
};

export function DestinationCard({
  trip,
  selected,
  onSelect,
}: DestinationCardProps) {
  const cover =
    getCoverMedia(
      trip.media,
    );

  return (
    <button
      type="button"
      onClick={
        onSelect
      }
      aria-pressed={
        selected
      }
      className={`
        group
        flex
        min-w-56
        max-w-72
        shrink-0
        items-center
        gap-3
        rounded-xl
        border
        p-2
        text-left
        transition

        ${
          selected
            ? "border-yellow-500 bg-yellow-50 shadow-md shadow-yellow-500/10 dark:bg-yellow-400/10"
            : "border-slate-200 bg-white hover:border-yellow-500/40 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8"
        }
      `}
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-white/5">
        {cover ? (
          cover.type === "image" ? (
            <Image
              src={
                cover.url
              }
              alt={
                trip.name
              }
              fill
              unoptimized
              sizes="56px"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <video
              src={
                cover.url
              }
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <MapPin
              size={18}
              className="text-slate-400 dark:text-white/25"
            />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          {trip.featured && (
            <Star
              size={11}
              className="fill-yellow-500 text-yellow-500"
            />
          )}

          <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-yellow-600 dark:text-yellow-400">
            {
              tripTypeLabels[
                trip.type
              ]
            }
          </p>
        </div>

        <p className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">
          {trip.name}
        </p>

        <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-slate-500 dark:text-white/40">
          <MapPin
            size={10}
            className="shrink-0"
          />

          <span className="truncate">
            {formatLocation(
              trip,
            )}
          </span>
        </p>
      </div>
    </button>
  );
}