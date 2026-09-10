"use client";
import { BusFront, Check, X } from "lucide-react";
import { useEffect } from "react";
import type { Vehicle } from "@/types/vehicles";
import { VehicleDetailsGallery } from "./VehicleDetailsGallery";
import { VehicleDetailsInformation } from "./VehicleDetailsInformation";
import { VehicleFeatureList } from "./VehicleFeatureList";

export function VehicleDetailsDialog({ vehicle, selected, onClose, onSelect }: { vehicle: Vehicle | null; selected: boolean; onClose: () => void; onSelect: (vehicle: Vehicle) => void }) {
  useEffect(() => {
    if (!vehicle) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", close); document.body.style.overflow = previous; };
  }, [vehicle, onClose]);
  if (!vehicle) return null;
  return <div className="fixed inset-x-0 bottom-0 top-28 z-80 bg-black/75 px-3 py-3 backdrop-blur-sm lg:px-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" aria-label={`Detalhes do veículo ${vehicle.model}`} className="mx-auto flex h-full w-full max-w-375 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#121620] shadow-2xl">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6"><div><p className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Detalhes da frota</p><h2 className="mt-1 text-xl font-bold text-white">{vehicle.model}</h2></div><button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"><X size={19} /></button></header>
      <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.75fr)] lg:overflow-hidden lg:p-5"><VehicleDetailsGallery vehicle={vehicle} /><div className="space-y-6 lg:overflow-y-auto lg:pr-1"><VehicleDetailsInformation vehicle={vehicle} /><VehicleFeatureList features={vehicle.features} /></div></div>
      <footer className="flex justify-end border-t border-white/10 bg-black/20 p-3 sm:p-4"><button type="button" onClick={() => onSelect(vehicle)} className={`flex h-11 min-w-48 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold ${selected ? "bg-yellow-400 text-slate-950" : "border border-yellow-400/40 bg-yellow-400/10 text-yellow-300"}`}>{selected ? <Check size={16} /> : <BusFront size={16} />}{selected ? "Veículo selecionado" : "Selecionar veículo"}</button></footer>
    </div>
  </div>;
}
