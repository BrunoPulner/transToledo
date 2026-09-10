"use client";

import {
  Check,
  Clock3,
  ImageIcon,
  LoaderCircle,
  MapPin,
  Pause,
  Play,
  Route,
} from "lucide-react";

import Image from "next/image";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import {
  subscribeToTrips,
} from "@/services/trips/subscribeToTrips";

import type {
  FrequentTrip,
  TripMedia,
} from "@/types/trip";

type RegisteredTripSelectorProps = {
  selectedTripId: string;

  onSelect: (
    trip: FrequentTrip,
  ) => void;
};

const tripTypeLabels = {
  turismo: "Turismo",
  evento: "Evento",
  show: "Show",
  universidade: "Universidade",
  excursao: "Excursão",
  outro: "Outro",
};

function getTripCover(
  trip: FrequentTrip,
) {
  return (
    trip.media.find(
      (media) => media.isCover,
    ) ??
    trip.media.find(
      (media) =>
        media.type === "image",
    ) ??
    trip.media.find(
      (media) =>
        media.type === "video",
    ) ??
    null
  );
}

type TripVideoPreviewProps = {
  media: TripMedia;
};

function TripVideoPreview({
  media,
}: TripVideoPreviewProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(
      null,
    );

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  async function playVideo() {
    if (!videoRef.current) {
      return;
    }

    try {
      await videoRef.current.play();
    } catch {
      setIsPlaying(false);
    }
  }

  function pauseVideo() {
    videoRef.current?.pause();
  }

  function supportsHover() {
    return window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
  }

  function handleMouseEnter() {
    if (supportsHover()) {
      void playVideo();
    }
  }

  function handleMouseLeave() {
    if (supportsHover()) {
      pauseVideo();
    }
  }

  function toggleVideo(
    event:
      | MouseEvent
      | KeyboardEvent,
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (videoRef.current?.paused) {
      void playVideo();
      return;
    }

    pauseVideo();
  }

  return (
    <span
      className="absolute inset-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={media.url}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() =>
          setIsPlaying(true)
        }
        onPause={() =>
          setIsPlaying(false)
        }
        className="
          size-full
          object-cover
          transition
          duration-500
          group-hover:scale-105
        "
      />

      <span
        role="button"
        tabIndex={0}
        aria-label={
          isPlaying
            ? "Pausar vídeo"
            : "Reproduzir vídeo"
        }
        title={
          isPlaying
            ? "Pausar vídeo"
            : "Reproduzir vídeo"
        }
        onClick={toggleVideo}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            toggleVideo(event);
          }
        }}
        className="
          absolute
          bottom-3
          right-3
          z-20
          flex
          size-10
          cursor-pointer
          items-center
          justify-center
          rounded-full
          border
          border-white/20
          bg-black/70
          text-white
          shadow-lg
          backdrop-blur-sm
          transition
          hover:scale-105
          hover:bg-black/85
          focus:outline-none
          focus:ring-2
          focus:ring-yellow-400
        "
      >
        {isPlaying ? (
          <Pause size={17} />
        ) : (
          <Play
            size={17}
            className="ml-0.5"
          />
        )}
      </span>
    </span>
  );
}

function formatDuration(
  durationMinutes: number,
) {
  if (
    !durationMinutes ||
    durationMinutes <= 0
  ) {
    return "Duração sob consulta";
  }

  const hours = Math.floor(
    durationMinutes / 60,
  );

  const minutes =
    durationMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}

export function RegisteredTripSelector({
  selectedTripId,
  onSelect,
}: RegisteredTripSelectorProps) {
  const [
    trips,
    setTrips,
  ] = useState<FrequentTrip[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    const unsubscribe =
      subscribeToTrips(
        (
          registeredTrips,
        ) => {
          setTrips(
            registeredTrips,
          );

          setLoading(false);
          setError("");
        },

        () => {
          setLoading(false);

          setError(
            "Não foi possível carregar as viagens neste momento.",
          );
        },
      );

    return unsubscribe;
  }, []);

  const activeTrips =
    useMemo(
      () =>
        trips.filter(
          (trip) =>
            trip.active,
        ),
      [trips],
    );

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-56
          flex-col
          items-center
          justify-center
          rounded-2xl
          border
          border-white/10
          bg-white/3
          text-center
        "
      >
        <LoaderCircle
          size={25}
          className="
            animate-spin
            text-yellow-400
          "
        />

        <p
          className="
            mt-3
            text-xs
            font-medium
            text-white/45
          "
        >
          Carregando viagens...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
          flex
          min-h-48
          flex-col
          items-center
          justify-center
          rounded-2xl
          border
          border-red-500/20
          bg-red-500/5
          px-5
          text-center
        "
      >
        <Route
          size={26}
          className="text-red-300"
        />

        <p
          className="
            mt-3
            text-sm
            font-semibold
            text-red-200
          "
        >
          {error}
        </p>
      </div>
    );
  }

  if (
    activeTrips.length === 0
  ) {
    return (
      <div
        className="
          flex
          min-h-48
          flex-col
          items-center
          justify-center
          rounded-2xl
          border
          border-dashed
          border-white/10
          bg-white/2
          px-5
          text-center
        "
      >
        <Route
          size={28}
          className="text-white/20"
        />

        <h4
          className="
            mt-3
            text-sm
            font-bold
            text-white/70
          "
        >
          Nenhuma viagem frequente
          disponível
        </h4>

        <p
          className="
            mt-1
            max-w-sm
            text-xs
            leading-5
            text-white/35
          "
        >
          Você ainda pode utilizar a
          opção “Escolha seu destino”
          para informar uma viagem
          personalizada.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="
          mb-4
          flex
          flex-col
          gap-2
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h4
            className="
              text-sm
              font-bold
              text-white
            "
          >
            Selecione uma viagem
          </h4>

          <p
            className="
              mt-1
              text-[11px]
              text-white/35
            "
          >
            Escolha um dos destinos
            realizados pela
            TransToledo.
          </p>
        </div>

        <span
          className="
            w-fit
            rounded-full
            border
            border-white/10
            bg-white/5
            px-3
            py-1.5
            text-[10px]
            font-semibold
            text-white/45
          "
        >
          {activeTrips.length}{" "}
          {activeTrips.length === 1
            ? "destino disponível"
            : "destinos disponíveis"}
        </span>
      </div>

      <div
        className="
          grid
          gap-3
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {activeTrips.map(
          (trip) => {
            const selected =
              selectedTripId ===
              trip.id;

            const cover =
              getTripCover(
                trip,
              );

            return (
              <button
                key={trip.id}
                type="button"
                onClick={() =>
                  onSelect(
                    trip,
                  )
                }
                aria-pressed={
                  selected
                }
                className={`
                  group
                  flex
                  h-full
                  flex-col
                  overflow-hidden
                  rounded-2xl
                  border
                  text-left
                  transition
                  duration-300
                  ${
                    selected
                      ? `
                        border-yellow-400
                        bg-yellow-400/8
                        shadow-lg
                        shadow-yellow-400/10
                      `
                      : `
                        border-white/10
                        bg-white/4
                        hover:-translate-y-0.5
                        hover:border-yellow-400/30
                        hover:bg-white/7
                      `
                  }
                `}
              >
                <div
                  className="
                    relative
                    aspect-video
                    w-full
                    overflow-hidden
                    bg-black/25
                  "
                >
                  {cover ? (
                    cover.type ===
                    "video" ? (
                      <TripVideoPreview
                        media={cover}
                      />
                    ) : (
                      <Image
                        src={cover.url}
                        alt={trip.name}
                        fill
                        unoptimized
                        sizes="
                          (max-width: 768px) 100vw,
                          (max-width: 1280px) 50vw,
                          33vw
                        "
                        className="
                          object-cover
                          transition
                          duration-500
                          group-hover:scale-105
                        "
                      />
                    )
                  ) : (
                    <div
                      className="
                        flex
                        size-full
                        items-center
                        justify-center
                      "
                    >
                      <ImageIcon
                        size={38}
                        className="text-white/15"
                      />
                    </div>
                  )}
                  <span
                    className="
                      absolute
                      left-3
                      top-3
                      rounded-full
                      border
                      border-white/10
                      bg-black/70
                      px-2.5
                      py-1
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-white
                      backdrop-blur-sm
                    "
                  >
                    {
                      tripTypeLabels[
                        trip.type
                      ]
                    }
                  </span>

                  {selected && (
                    <span
                      className="
                        absolute
                        right-3
                        top-3
                        flex
                        items-center
                        gap-1.5
                        rounded-full
                        bg-yellow-400
                        px-2.5
                        py-1
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-slate-950
                      "
                    >
                      <Check
                        size={12}
                      />

                      Selecionada
                    </span>
                  )}
                </div>

                <div
                  className="
                    flex
                    flex-1
                    flex-col
                    p-4
                  "
                >
                  <h5
                    className="
                      text-base
                      font-bold
                      text-white
                    "
                  >
                    {trip.name}
                  </h5>

                  <div
                    className="
                      mt-2
                      flex
                      items-start
                      gap-1.5
                      text-[11px]
                      text-white/45
                    "
                  >
                    <MapPin
                      size={13}
                      className="
                        mt-0.5
                        shrink-0
                        text-yellow-400
                      "
                    />

                    <span>
                      {trip.location ||
                        `${trip.city} - ${trip.state}`}
                    </span>
                  </div>

                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      gap-1.5
                      text-[11px]
                      text-white/40
                    "
                  >
                    <Clock3
                      size={13}
                      className="text-yellow-400"
                    />

                    {formatDuration(
                      trip.averageDurationMinutes,
                    )}
                  </div>

                  {trip.description && (
                    <p
                      className="
                        mt-3
                        line-clamp-3
                        text-[11px]
                        leading-5
                        text-white/35
                      "
                    >
                      {
                        trip.description
                      }
                    </p>
                  )}

                  <span
                    className={`
                      mt-auto
                      flex
                      h-10
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      px-3
                      pt-3
                      text-xs
                      font-bold
                      ${
                        selected
                          ? "text-yellow-300"
                          : "text-white/40 group-hover:text-yellow-400"
                      }
                    `}
                  >
                    {selected ? (
                      <>
                        <Check
                          size={14}
                        />

                        Destino selecionado
                      </>
                    ) : (
                      <>
                        <Route
                          size={14}
                        />

                        Selecionar destino
                      </>
                    )}
                  </span>
                </div>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}
