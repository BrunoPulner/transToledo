"use client";

import {
  ChevronLeft,
  ChevronRight,
  Expand,
  ImageIcon,
  Pause,
  Play,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { Vehicle, VehicleMedia } from "@/types/vehicles";
import { VehicleMediaDialog } from "../VehicleMediaDialog";

type Props = { vehicle: Vehicle };

export function VehicleDetailsGallery({ vehicle }: Props) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState<VehicleMedia | null>(null);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const media = vehicle.media[index] ?? null;

  // Reinicia a galeria quando outro veículo é exibido.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(0);
    setPlaying(false);
    setExpanded(null);
  }, [vehicle.id]);

  function selectMedia(nextIndex: number) {
    videoRef.current?.pause();
    setPlaying(false);
    setIndex(nextIndex);
  }

  function move(direction: number) {
    if (vehicle.media.length < 2) return;
    selectMedia((index + direction + vehicle.media.length) % vehicle.media.length);
  }

  async function toggleVideo() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    try {
      await video.play();
    } catch {
      setPlaying(false);
    }
  }

  return (
    <>
      <section className="relative flex min-h-90 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080b10] lg:h-full lg:min-h-0">
        {/* A mídia principal ocupa todo o espaço restante da galeria. */}
        <div className="relative min-h-72 flex-1 overflow-hidden sm:min-h-90 lg:min-h-0">
          {!media ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon size={42} className="text-white/15" />
            </div>
          ) : media.type === "image" ? (
            <Image
              key={media.url}
              src={media.url}
              alt={`${vehicle.model} - imagem ${index + 1}`}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 75vw"
              className="object-contain"
            />
          ) : (
            <video
              key={media.url}
              ref={videoRef}
              src={media.url}
              muted
              loop
              playsInline
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              className="absolute inset-0 size-full object-contain"
            />
          )}

          {media && (
            <button
              type="button"
              onClick={() => setExpanded(media)}
              aria-label="Ampliar mídia"
              title="Ampliar mídia"
              className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur-sm transition hover:bg-black/90"
            >
              <Expand size={16} />
            </button>
          )}

          {media?.type === "video" && (
            <button
              type="button"
              onClick={() => void toggleVideo()}
              aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}
              title={playing ? "Pausar vídeo" : "Reproduzir vídeo"}
              className="absolute bottom-3 right-3 z-10 flex size-10 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur-sm transition hover:bg-black/90"
            >
              {playing ? <Pause size={17} /> : <Play size={17} />}
            </button>
          )}

          {vehicle.media.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Mídia anterior"
                className="absolute left-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Próxima mídia"
                className="absolute right-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90"
              >
                <ChevronRight size={19} />
              </button>
            </>
          )}
        </div>

        {/* Miniaturas compactas, preservando mais altura para a mídia principal. */}
        {vehicle.media.length > 1 && (
          <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-white/10 bg-black/25 p-2 sm:p-2.5">
            {vehicle.media.map((item, itemIndex) => (
              <button
                key={`${item.url}-${itemIndex}`}
                type="button"
                onClick={() => selectMedia(itemIndex)}
                aria-label={`Exibir mídia ${itemIndex + 1}`}
                aria-pressed={itemIndex === index}
                className={`relative h-12 w-19 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-14 sm:w-22 ${
                  itemIndex === index
                    ? "border-yellow-400"
                    : "border-white/10 hover:border-white/40"
                }`}
              >
                {item.type === "image" ? (
                  <Image src={item.url} alt="" fill unoptimized sizes="88px" className="object-cover" />
                ) : (
                  <>
                    <video src={item.url} muted playsInline preload="metadata" className="size-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play size={16} className="text-white drop-shadow" />
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      <VehicleMediaDialog
        media={expanded}
        vehicleName={vehicle.model}
        onClose={() => setExpanded(null)}
      />
    </>
  );
}
