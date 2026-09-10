"use client";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import type { VehicleMedia } from "@/types/vehicles";

export function VehicleMediaDialog({ media, vehicleName, onClose }: { media: VehicleMedia | null; vehicleName: string; onClose: () => void }) {
  useEffect(() => {
    if (!media) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [media, onClose]);
  if (!media) return null;
  return <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
    <button type="button" onClick={onClose} className="absolute right-5 top-5 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white"><X /></button>
    <div className="relative h-[85vh] w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
      {media.type === "image" ? <Image src={media.url} alt={vehicleName} fill unoptimized className="object-contain" /> : <video src={media.url} controls autoPlay playsInline className="size-full object-contain" />}
    </div>
  </div>;
}