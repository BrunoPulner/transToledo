import {
  Ban,
  CalendarCheck,
  XCircle,
} from "lucide-react";

import type {
  VehicleScheduleEntry,
} from "@/types/schedule";

type ScheduleBadgeProps = {
  type:
    VehicleScheduleEntry["type"];

  status?:
    VehicleScheduleEntry["status"];
};

const typeInformation = {
  booking: {
    label: "Viagem confirmada",

    className:
      "border-yellow-400/20 bg-yellow-400/10 text-yellow-400",

    icon: CalendarCheck,
  },

  blocked: {
    label: "Bloqueado",

    className:
      "border-red-500/20 bg-red-500/10 text-red-400",

    icon: Ban,
  },
};

export function ScheduleBadge({
  type,
  status = "active",
}: ScheduleBadgeProps) {
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/40">
        <XCircle size={13} />

        Cancelado
      </span>
    );
  }

  const information =
    typeInformation[type];

  const Icon =
    information.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        ${information.className}
      `}
    >
      <Icon size={13} />

      {information.label}
    </span>
  );
}