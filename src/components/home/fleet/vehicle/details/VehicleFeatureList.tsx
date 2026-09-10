import {
  Accessibility,
  Armchair,
  PlugZap,
  Refrigerator,
  Snowflake,
  Tv,
  Usb,
  Wifi,
} from "lucide-react";
import type { VehicleFeatures } from "@/types/vehicles";

const featureItems = [
  ["airConditioning", "Ar-condicionado", Snowflake],
  ["wifi", "Wi-Fi", Wifi],
  ["usb", "Entradas USB", Usb],
  ["powerOutlet", "Tomadas", PlugZap],
  ["recliningSeats", "Assentos reclináveis", Armchair],
  ["accessibility", "Acessibilidade", Accessibility],
  ["television", "Televisão", Tv],
  ["refrigerator", "Geladeira", Refrigerator],
] as const;

export function VehicleFeatureList({ features }: { features: VehicleFeatures }) {
  const enabled = featureItems.filter(([key]) => features[key]);

  return (
    <section>
      <h3 className="text-sm font-bold text-white">Conforto e benefícios</h3>
      {enabled.length ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {enabled.map(([key, label, Icon]) => (
            <div key={key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
              <span className="flex size-8 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400"><Icon size={16} /></span>
              {label}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-white/35">Nenhum benefício adicional informado.</p>
      )}
    </section>
  );
}