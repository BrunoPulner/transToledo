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

type VehicleFeatureListProps = {
  features: VehicleFeatures;
};

export function VehicleFeatureList({ features }: VehicleFeatureListProps) {
  const enabled = featureItems.filter(([key]) => features[key]);

  return (
    <section aria-labelledby="vehicle-features-title">
      <h3
        id="vehicle-features-title"
        className="text-xs font-bold text-white sm:text-sm"
      >
        Conforto e benefícios
      </h3>

      {enabled.length > 0 ? (
        <ul className="mt-2.5 grid grid-cols-2 gap-1.5">
          {enabled.map(([key, label, Icon]) => (
            <li
              key={key}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[11px] leading-4 text-white/75"
            >
              <Icon
                size={14}
                aria-hidden="true"
                className="shrink-0 text-yellow-400"
              />
              <span className="min-w-0 wrap-break-word">{label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2.5 text-[11px] text-white/40">
          Nenhum benefício adicional informado.
        </p>
      )}
    </section>
  );
}
