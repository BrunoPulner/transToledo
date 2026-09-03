/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase/client";

import type {
  VehicleAvailabilityResult,
  VehicleScheduleEntry,
  VehicleWorkingHours,
  Weekday,
} from "@/types/schedule";

export type CheckVehicleAvailabilityInput = {
  vehicleId: string;
  startsAt: Date;
  endsAt: Date;

  /**
   * Utilizado durante uma edição para
   * ignorar o próprio agendamento.
   */
  ignoredScheduleId?: string;
};

function convertScheduleDocument(
  documentId: string,
  data: Record<string, any>,
): VehicleScheduleEntry {
  return {
    id: documentId,

    vehicleId: String(
      data.vehicleId ?? "",
    ),

    type: data.type,

    source: data.source,

    status:
      data.status ?? "active",

    title: String(
      data.title ?? "",
    ),

    notes: data.notes
      ? String(data.notes)
      : undefined,

    startsAt:
      data.startsAt.toDate(),

    endsAt:
      data.endsAt.toDate(),

    quoteId: data.quoteId
      ? String(data.quoteId)
      : undefined,

    tripId: data.tripId
      ? String(data.tripId)
      : undefined,

    createdAt:
      data.createdAt?.toDate?.(),

    updatedAt:
      data.updatedAt?.toDate?.(),
  };
}

function convertWorkingHoursDocument(
  documentId: string,
  data: Record<string, any>,
): VehicleWorkingHours {
  return {
    id: documentId,

    vehicleId: String(
      data.vehicleId ?? "",
    ),

    weekday: Number(
      data.weekday ?? 0,
    ) as Weekday,

    enabled: Boolean(
      data.enabled,
    ),

    startsAt: String(
      data.startsAt ?? "",
    ),

    endsAt: String(
      data.endsAt ?? "",
    ),

    createdAt:
      data.createdAt?.toDate?.(),

    updatedAt:
      data.updatedAt?.toDate?.(),
  };
}

function createTimeForDate(
  date: Date,
  time: string,
) {
  const [
    hours,
    minutes,
  ] = time
    .split(":")
    .map(Number);

  const result = new Date(date);

  result.setHours(
    hours,
    minutes,
    0,
    0,
  );

  return result;
}

function getStartOfDay(
  date: Date,
) {
  const result = new Date(date);

  result.setHours(
    0,
    0,
    0,
    0,
  );

  return result;
}

function getNextDay(
  date: Date,
) {
  const result =
    getStartOfDay(date);

  result.setDate(
    result.getDate() + 1,
  );

  return result;
}

function isPeriodInsideWorkingHours(
  startsAt: Date,
  endsAt: Date,
  workingHours: VehicleWorkingHours[],
) {
  /*
   * Percorre todos os dias abrangidos
   * pela viagem.
   *
   * Isso permite verificar viagens que
   * começam em um dia e terminam em outro.
   */
  let currentDay =
    getStartOfDay(startsAt);

  while (currentDay < endsAt) {
    const nextDay =
      getNextDay(currentDay);

    const periodStartsAt =
      startsAt > currentDay
        ? startsAt
        : currentDay;

    const periodEndsAt =
      endsAt < nextDay
        ? endsAt
        : nextDay;

    const weekday =
      currentDay.getDay() as Weekday;

    const dayWorkingHours =
      workingHours.find(
        (workingHour) =>
          workingHour.weekday ===
            weekday &&
          workingHour.enabled,
      );

    if (!dayWorkingHours) {
      return false;
    }

    const workStartsAt =
      createTimeForDate(
        currentDay,
        dayWorkingHours.startsAt,
      );

    /*
     * Quando o fim for 23:59,
     * consideramos o final completo
     * daquele dia.
     */
    const workEndsAt =
      dayWorkingHours.endsAt ===
      "23:59"
        ? nextDay
        : createTimeForDate(
            currentDay,
            dayWorkingHours.endsAt,
          );

    const isInsidePeriod =
      periodStartsAt >=
        workStartsAt &&
      periodEndsAt <= workEndsAt;

    if (!isInsidePeriod) {
      return false;
    }

    currentDay = nextDay;
  }

  return true;
}

export async function checkVehicleAvailability({
  vehicleId,
  startsAt,
  endsAt,
  ignoredScheduleId,
}: CheckVehicleAvailabilityInput): Promise<VehicleAvailabilityResult> {
  if (!vehicleId.trim()) {
    return {
      available: false,
      reason:
        "vehicle_not_found",
    };
  }

  if (
    Number.isNaN(
      startsAt.getTime(),
    ) ||
    Number.isNaN(
      endsAt.getTime(),
    ) ||
    startsAt >= endsAt
  ) {
    return {
      available: false,
      reason: "invalid_period",
    };
  }

  const vehicleReference =
    doc(
      db,
      "vehicles",
      vehicleId,
    );

  const workingHoursQuery =
    query(
      collection(
        db,
        "vehicleWorkingHours",
      ),

      where(
        "vehicleId",
        "==",
        vehicleId,
      ),
    );

  const schedulesQuery =
    query(
      collection(
        db,
        "vehicleSchedules",
      ),

      where(
        "vehicleId",
        "==",
        vehicleId,
      ),
    );

  /*
   * As três consultas são executadas
   * simultaneamente.
   */
  const [
    vehicleSnapshot,
    workingHoursSnapshot,
    schedulesSnapshot,
  ] = await Promise.all([
    getDoc(vehicleReference),
    getDocs(workingHoursQuery),
    getDocs(schedulesQuery),
  ]);

  if (!vehicleSnapshot.exists()) {
    return {
      available: false,
      reason:
        "vehicle_not_found",
    };
  }

  const vehicleData =
    vehicleSnapshot.data();

  if (
    vehicleData.status !== "active"
  ) {
    return {
      available: false,
      reason:
        "vehicle_inactive",
    };
  }

  const workingHours =
    workingHoursSnapshot.docs.map(
      (document) =>
        convertWorkingHoursDocument(
          document.id,
          document.data(),
        ),
    );

  const isInsideWorkingHours =
    isPeriodInsideWorkingHours(
      startsAt,
      endsAt,
      workingHours,
    );

  if (!isInsideWorkingHours) {
    return {
      available: false,
      reason:
        "outside_working_hours",
    };
  }

  const schedules =
    schedulesSnapshot.docs
      .filter(
        (document) =>
          document.id !==
          ignoredScheduleId,
      )
      .map((document) =>
        convertScheduleDocument(
          document.id,
          document.data(),
        ),
      )
      .filter(
        (schedule) =>
          schedule.status ===
          "active",
      );

  /*
   * Existe conflito quando:
   *
   * início solicitado < fim existente
   * e
   * fim solicitado > início existente
   */
  const conflictingSchedule =
    schedules.find(
      (schedule) =>
        startsAt <
          schedule.endsAt &&
        endsAt >
          schedule.startsAt,
    );

  if (conflictingSchedule) {
    return {
      available: false,
      reason:
        "schedule_conflict",

      conflictingSchedule,
    };
  }

  return {
    available: true,
    reason: "available",
  };
}