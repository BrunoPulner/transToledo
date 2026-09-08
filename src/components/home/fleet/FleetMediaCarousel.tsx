"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  BusFront,
  ChevronLeft,
  ChevronRight,
  Expand,
  ImageIcon,
  Play,
} from "lucide-react";

import Image from "next/image";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  Vehicle,
  VehicleMedia,
} from "@/types/vehicles";

type FleetMediaCarouselProps = {
  vehicle: Vehicle;
};

const AUTOPLAY_DELAY = 5000;

function getInitialMedia(
  media: VehicleMedia[],
) {
  return (
    media.find(
      (item) =>
        item.isCover,
    ) ??
    media[0] ??
    null
  );
}

export function FleetMediaCarousel({
  vehicle,
}: FleetMediaCarouselProps) {
  const mediaContainerRef =
    useRef<HTMLDivElement>(null);

  const [
    selectedMediaUrl,
    setSelectedMediaUrl,
  ] = useState("");

  const [
    mediaHovered,
    setMediaHovered,
  ] = useState(false);

  const [
    videoPlaying,
    setVideoPlaying,
  ] = useState(false);

  /*
   * Imagens e vídeos cadastrados
   * para o veículo selecionado.
   */
  const mediaItems = useMemo(
    () => vehicle.media ?? [],
    [vehicle.media],
  );

  /*
   * Procura a mídia selecionada.
   *
   * Quando o usuário troca de veículo,
   * a URL anterior não será encontrada
   * e a capa do novo veículo será usada.
   */
  const selectedMedia =
    mediaItems.find(
      (media) =>
        media.url ===
        selectedMediaUrl,
    ) ??
    getInitialMedia(
      mediaItems,
    );

  const selectedMediaIndex =
    Math.max(
      0,
      mediaItems.findIndex(
        (media) =>
          media.url ===
          selectedMedia?.url,
      ),
    );

  /*
   * Define uma mídia pelo índice.
   */
  function selectMedia(
    index: number,
  ) {
    const media =
      mediaItems[index];

    if (!media) {
      return;
    }

    setSelectedMediaUrl(
      media.url,
    );

    setVideoPlaying(false);
  }

  /*
   * Retorna para a mídia anterior.
   */
  function handlePreviousMedia() {
    if (
      mediaItems.length < 2
    ) {
      return;
    }

    const previousIndex =
      selectedMediaIndex === 0
        ? mediaItems.length - 1
        : selectedMediaIndex - 1;

    selectMedia(
      previousIndex,
    );
  }

  /*
   * Avança para a próxima mídia.
   */
  function handleNextMedia() {
    if (
      mediaItems.length < 2
    ) {
      return;
    }

    const nextIndex =
      selectedMediaIndex ===
      mediaItems.length - 1
        ? 0
        : selectedMediaIndex + 1;

    selectMedia(
      nextIndex,
    );
  }

  /*
   * Abre ou fecha a visualização
   * em tela cheia.
   */
  async function handleFullscreen() {
    const container =
      mediaContainerRef.current;

    if (!container) {
      return;
    }

    try {
      if (
        document.fullscreenElement
      ) {
        await document.exitFullscreen();
        return;
      }

      await container.requestFullscreen();
    } catch (fullscreenError) {
      console.error(
        "Não foi possível abrir a mídia em tela cheia:",
        fullscreenError,
      );
    }
  }

  /*
   * Autoplay do carrossel.
   *
   * A troca automática é interrompida:
   * - durante o hover;
   * - quando a mídia é um vídeo;
   * - enquanto um vídeo estiver tocando;
   * - quando existe apenas uma mídia.
   */
  useEffect(() => {
    if (
      mediaHovered ||
      videoPlaying ||
      selectedMedia?.type ===
        "video" ||
      mediaItems.length < 2
    ) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        const nextIndex =
          selectedMediaIndex ===
          mediaItems.length - 1
            ? 0
            : selectedMediaIndex +
              1;

        setSelectedMediaUrl(
          mediaItems[
            nextIndex
          ].url,
        );
      }, AUTOPLAY_DELAY);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    mediaHovered,
    videoPlaying,
    selectedMedia?.type,
    selectedMediaIndex,
    mediaItems,
  ]);

  /*
   * Estado sem nenhuma mídia.
   */
  if (!selectedMedia) {
    return (
      <div className="flex min-h-80 flex-1 items-center justify-center rounded-2xl bg-[#080b14]">
        <div className="text-center">
          <BusFront
            size={54}
            className="mx-auto text-white/15"
          />

          <p className="mt-3 text-sm text-white/35">
            Nenhuma mídia cadastrada
            para este veículo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-72 flex-1 p-3 pb-0">
      <div
        ref={
          mediaContainerRef
        }
        className="
          group
          relative
          size-full
          min-h-72
          overflow-hidden
          rounded-2xl
          bg-[#080b14]
          fullscreen:rounded-none
        "
        onMouseEnter={() =>
          setMediaHovered(true)
        }
        onMouseLeave={() =>
          setMediaHovered(false)
        }
      >
        {/* MÍDIA ATUAL */}
        <AnimatePresence mode="wait">
          <motion.div
            key={
              selectedMedia.url
            }
            initial={{
              opacity: 0,
              scale: 1.01,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.45,
              ease: "easeInOut",
            }}
            className="absolute inset-0"
          >
            {selectedMedia.type ===
            "video" ? (
              <video
                src={
                  selectedMedia.url
                }
                controls
                playsInline
                preload="metadata"
                onPlay={() =>
                  setVideoPlaying(
                    true,
                  )
                }
                onPause={() =>
                  setVideoPlaying(
                    false,
                  )
                }
                onEnded={() => {
                  setVideoPlaying(
                    false,
                  );

                  handleNextMedia();
                }}
                className="
                  size-full
                  bg-black
                  object-contain
                "
              />
            ) : (
              <div className="relative size-full overflow-hidden bg-black">
                {/* FUNDO DESFOCADO */}
                <Image
                  src={
                    selectedMedia.url
                  }
                  alt=""
                  fill
                  unoptimized
                  aria-hidden="true"
                  sizes="(max-width: 1024px) 100vw, 75vw"
                  className="scale-110 object-cover opacity-25 blur-2xl"
                />

                {/* IMAGEM COMPLETA */}
                <Image
                  src={
                    selectedMedia.url
                  }
                  alt={`Veículo ${vehicle.model} da TransToledo`}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 75vw"
                  className="relative z-10 object-contain"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* SOMBREAMENTO */}
        {selectedMedia.type ===
          "image" && (
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-black/10" />
        )}

        {/* ANO */}
        <span className="absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
          {vehicle.year}
        </span>

        {/* TIPO DA MÍDIA */}
        <span className="absolute left-4 top-15 z-20 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/75 backdrop-blur-md">
          {selectedMedia.type ===
          "video" ? (
            <>
              <Play size={11} />

              Vídeo
            </>
          ) : (
            <>
              <ImageIcon
                size={11}
              />

              Imagem
            </>
          )}
        </span>

        {/* TELA CHEIA */}
        <button
          type="button"
          onClick={
            handleFullscreen
          }
          aria-label="Visualizar mídia em tela cheia"
          title="Tela cheia"
          className="
            absolute
            right-4
            top-4
            z-30
            flex
            size-10
            items-center
            justify-center
            rounded-full
            border
            border-white/15
            bg-black/45
            text-white
            backdrop-blur-md
            transition
            hover:border-yellow-400
            hover:bg-yellow-400
            hover:text-slate-950
          "
        >
          <Expand size={18} />
        </button>

        {/* SETAS LATERAIS */}
        {mediaItems.length >
          1 && (
          <>
            <button
              type="button"
              onClick={
                handlePreviousMedia
              }
              aria-label="Mídia anterior"
              className="
                absolute
                left-4
                top-1/2
                z-30
                flex
                size-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                bg-black/45
                text-white
                opacity-0
                backdrop-blur-md
                transition
                hover:border-yellow-400
                hover:bg-yellow-400
                hover:text-slate-950
                group-hover:opacity-100
                focus:opacity-100
              "
            >
              <ChevronLeft
                size={21}
              />
            </button>

            <button
              type="button"
              onClick={
                handleNextMedia
              }
              aria-label="Próxima mídia"
              className="
                absolute
                right-4
                top-1/2
                z-30
                flex
                size-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                bg-black/45
                text-white
                opacity-0
                backdrop-blur-md
                transition
                hover:border-yellow-400
                hover:bg-yellow-400
                hover:text-slate-950
                group-hover:opacity-100
                focus:opacity-100
              "
            >
              <ChevronRight
                size={21}
              />
            </button>
          </>
        )}

        {/* INDICADORES INFERIORES */}
        {mediaItems.length >
          1 && (
          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-md">
            {mediaItems.map(
              (
                media,
                index,
              ) => (
                <button
                  key={`${media.url}-${index}`}
                  type="button"
                  onClick={() =>
                    selectMedia(
                      index,
                    )
                  }
                  aria-label={`Exibir ${
                    media.type ===
                    "video"
                      ? "vídeo"
                      : "imagem"
                  } ${index + 1}`}
                  title={
                    media.type ===
                    "video"
                      ? "Vídeo"
                      : "Imagem"
                  }
                  className={`
                    relative
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

        {/* CONTADOR */}
        {mediaItems.length >
          1 && (
          <span className="absolute bottom-4 right-4 z-20 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-[10px] font-semibold text-white/75 backdrop-blur-md">
            {selectedMediaIndex +
              1}
            /
            {
              mediaItems.length
            }
          </span>
        )}
      </div>
    </div>
  );
}
