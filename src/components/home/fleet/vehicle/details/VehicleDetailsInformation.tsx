import {
  BriefcaseBusiness,
  Calendar,
  Ruler,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import type { Vehicle } from "@/types/vehicles";

const luggageLabels = {
  small: "Pequeno",
  medium: "Médio",
  large: "Amplo",
};

export function VehicleDetailsInformation({
  vehicle,
}: {
  vehicle: Vehicle;
}) {
  const dimensions = vehicle.luggageDimensions;

  return (
    <section>
      <h3 className="text-xs font-bold text-white sm:text-[13px]">
        Informações do veículo
      </h3>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <Info
          icon={Calendar}
          label="Ano"
          value={String(vehicle.year)}
        />
        <Info
          icon={UsersRound}
          label="Capacidade"
          value={`${vehicle.passengerCapacity} passageiros`}
        />
        <Info
          icon={BriefcaseBusiness}
          label="Bagageiro"
          value={`${luggageLabels[vehicle.luggageSize]} • ${vehicle.luggageCapacityLiters} litros`}
        />
        <Info
          icon={Ruler}
          label="Dimensões do bagageiro"
          value={
            dimensions
              ? `${dimensions.widthCm} × ${dimensions.heightCm} × ${dimensions.depthCm} cm`
              : "Não informadas"
          }
        />
      </div>
    </section>
  );
}

type InfoProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function Info({ icon: Icon, label, value }: InfoProps) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2.5 sm:px-3">
      <div className="flex items-center gap-1.5">
        <Icon size={13} className="shrink-0 text-yellow-400" />
        <p className="min-w-0 text-[9px] font-bold uppercase leading-tight tracking-wide text-white/40">
          {label}
        </p>
      </div>
      <p className="mt-1.5 wrap-break-word text-[11px] font-semibold leading-4 text-white/80 sm:text-xs">
        {value}
      </p>
    </div>
  );
}
