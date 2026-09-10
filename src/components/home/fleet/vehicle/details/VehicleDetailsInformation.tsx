import { BriefcaseBusiness, Calendar, Ruler, UsersRound, type LucideIcon } from "lucide-react";
import type { Vehicle } from "@/types/vehicles";

const luggageLabels = { small: "Pequeno", medium: "Médio", large: "Amplo" };

export function VehicleDetailsInformation({ vehicle }: { vehicle: Vehicle }) {
  const dimensions = vehicle.luggageDimensions;
  return (
    <section>
      <h3 className="text-sm font-bold text-white">Informações do veículo</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Info icon={Calendar} label="Ano" value={String(vehicle.year)} />
        <Info icon={UsersRound} label="Capacidade" value={`${vehicle.passengerCapacity} passageiros`} />
        <Info icon={BriefcaseBusiness} label="Bagageiro" value={`${luggageLabels[vehicle.luggageSize]} • ${vehicle.luggageCapacityLiters} litros`} />
        <Info icon={Ruler} label="Dimensões do bagageiro" value={dimensions ? `${dimensions.widthCm} × ${dimensions.heightCm} × ${dimensions.depthCm} cm` : "Não informadas"} />
      </div>
    </section>
  );
}

function Info({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/5 p-3"><Icon size={16} className="text-yellow-400" /><p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-white/30">{label}</p><p className="mt-1 text-xs font-semibold text-white/75">{value}</p></div>;
}