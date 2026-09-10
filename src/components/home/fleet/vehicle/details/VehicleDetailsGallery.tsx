"use client";
import { ChevronLeft, ChevronRight, Expand, ImageIcon, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Vehicle, VehicleMedia } from "@/types/vehicles";
import { VehicleMediaDialog } from "../VehicleMediaDialog";

export function VehicleDetailsGallery({ vehicle }: { vehicle: Vehicle }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState<VehicleMedia | null>(null);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const media = vehicle.media[index] ?? null;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIndex(0); setPlaying(false); }, [vehicle.id]);
  function move(direction: number) { videoRef.current?.pause(); setPlaying(false); setIndex((index + direction + vehicle.media.length) % vehicle.media.length); }
  async function toggleVideo() { if (!videoRef.current) return; if (videoRef.current.paused) await videoRef.current.play(); else videoRef.current.pause(); }

  return <>
    <section className="relative flex min-h-105 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/35 lg:h-full lg:min-h-0">
      <div className="relative min-h-80 flex-1">
        {!media ? <div className="flex size-full items-center justify-center"><ImageIcon size={44} className="text-white/15" /></div> : media.type === "image" ? <Image src={media.url} alt={vehicle.model} fill unoptimized className="object-contain p-2" /> : <video ref={videoRef} src={media.url} muted loop playsInline preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} className="size-full object-contain" />}
        {media && <button type="button" onClick={() => setExpanded(media)} className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-black/70 text-white" aria-label="Ampliar mídia"><Expand size={17} /></button>}
        {media?.type === "video" && <button type="button" onClick={() => void toggleVideo()} className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-black/70 text-white" aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}>{playing ? <Pause size={17} /> : <Play size={17} />}</button>}
        {vehicle.media.length > 1 && <><button type="button" onClick={() => move(-1)} className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white"><ChevronLeft size={19} /></button><button type="button" onClick={() => move(1)} className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-white"><ChevronRight size={19} /></button></>}
      </div>
      {vehicle.media.length > 1 && <div className="flex shrink-0 gap-2 overflow-x-auto border-t border-white/10 bg-black/20 p-3">{vehicle.media.map((item, itemIndex) => <button key={`${item.url}-${itemIndex}`} type="button" onClick={() => setIndex(itemIndex)} className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${itemIndex === index ? "border-yellow-400" : "border-white/10"}`}>{item.type === "image" ? <Image src={item.url} alt="" fill unoptimized className="object-cover" /> : <video src={item.url} muted preload="metadata" className="size-full object-cover" />}</button>)}</div>}
    </section>
    <VehicleMediaDialog media={expanded} vehicleName={vehicle.model} onClose={() => setExpanded(null)} />
  </>;
}
