import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { CreateVehicleScheduleInput } from "@/types/schedule";

export async function createSchedule(
  schedule: CreateVehicleScheduleInput,
) {
  if (schedule.startsAt >= schedule.endsAt) {
    throw new Error(
      "O horário final deve ser posterior ao horário inicial.",
    );
  }

  const scheduleData = {
    vehicleId: schedule.vehicleId,
    type: schedule.type,
    source: schedule.source,
    status: schedule.status,

    title: schedule.title.trim(),
    notes: schedule.notes?.trim() ?? "",

    startsAt: Timestamp.fromDate(schedule.startsAt),
    endsAt: Timestamp.fromDate(schedule.endsAt),

    quoteId: schedule.quoteId ?? null,
    tripId: schedule.tripId ?? null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const scheduleReference = await addDoc(
    collection(db, "vehicleSchedules"),
    scheduleData,
  );

  return scheduleReference.id;
}