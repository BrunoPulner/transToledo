import {
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { UpdateVehicleScheduleInput } from "@/types/schedule";

export async function updateSchedule(
  scheduleId: string,
  updates: UpdateVehicleScheduleInput,
) {
  const scheduleReference = doc(
    db,
    "vehicleSchedules",
    scheduleId,
  );

  const snapshot = await getDoc(scheduleReference);

  if (!snapshot.exists()) {
    throw new Error("Agendamento não encontrado.");
  }

  const currentSchedule = snapshot.data();

  const startsAt =
    updates.startsAt ??
    currentSchedule.startsAt.toDate();

  const endsAt =
    updates.endsAt ??
    currentSchedule.endsAt.toDate();

  if (startsAt >= endsAt) {
    throw new Error(
      "O horário final deve ser posterior ao horário inicial.",
    );
  }

  const scheduleData = {
    ...updates,

    ...(updates.title !== undefined && {
      title: updates.title.trim(),
    }),

    ...(updates.notes !== undefined && {
      notes: updates.notes.trim(),
    }),

    ...(updates.startsAt !== undefined && {
      startsAt: Timestamp.fromDate(updates.startsAt),
    }),

    ...(updates.endsAt !== undefined && {
      endsAt: Timestamp.fromDate(updates.endsAt),
    }),

    updatedAt: serverTimestamp(),
  };

  await updateDoc(
    scheduleReference,
    scheduleData,
  );
}