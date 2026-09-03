export type Weekday =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6;

export type ScheduleEntryType =
  | "booking"
  | "blocked";

export type ScheduleEntrySource =
  | "manual"
  | "approved_quote";

export type ScheduleEntryStatus =
  | "active"
  | "cancelled";

/**
 * Define o horário semanal de trabalho
 * de um veículo.
 *
 * Exemplo:
 * Segunda-feira, das 08:00 às 18:00.
 */
export type VehicleWorkingHours = {
  id: string;

  vehicleId: string;
  weekday: Weekday;

  enabled: boolean;

  startsAt: string;
  endsAt: string;

  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateVehicleWorkingHoursInput = {
  vehicleId: string;
  weekday: Weekday;

  enabled: boolean;

  startsAt: string;
  endsAt: string;
};

export type UpdateVehicleWorkingHoursInput = Partial<
  Pick<
    VehicleWorkingHours,
    | "enabled"
    | "startsAt"
    | "endsAt"
  >
>;

/**
 * Representa um período específico
 * ocupado ou bloqueado na agenda.
 */
export type VehicleScheduleEntry = {
  id: string;

  vehicleId: string;

  /**
   * booking:
   * Viagem confirmada após aprovação
   * do orçamento.
   *
   * blocked:
   * Manutenção, folga ou bloqueio
   * administrativo.
   */
  type: ScheduleEntryType;

  source: ScheduleEntrySource;
  status: ScheduleEntryStatus;

  title: string;
  notes?: string;

  startsAt: Date;
  endsAt: Date;

  quoteId?: string;
  tripId?: string;

  createdAt?: Date;
  updatedAt?: Date;
};

export type CreateVehicleScheduleInput = Omit<
  VehicleScheduleEntry,
  | "id"
  | "createdAt"
  | "updatedAt"
>;

export type UpdateVehicleScheduleInput = Partial<
  Omit<
    VehicleScheduleEntry,
    | "id"
    | "vehicleId"
    | "createdAt"
    | "updatedAt"
  >
>;

export type VehicleAvailabilityReason =
  | "available"
  | "vehicle_not_found"
  | "vehicle_inactive"
  | "invalid_period"
  | "outside_working_hours"
  | "schedule_conflict";

export type VehicleAvailabilityResult = {
  available: boolean;

  reason: VehicleAvailabilityReason;

  conflictingSchedule?:
    VehicleScheduleEntry;
};