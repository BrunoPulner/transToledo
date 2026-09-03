import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase/client";

import type {
  UpdateVehicleWorkingHoursInput,
} from "@/types/schedule";

function isValidTime(time: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
    time,
  );
}

export async function updateWorkingHours(
  workingHoursId: string,
  updates: UpdateVehicleWorkingHoursInput,
) {
  if (!workingHoursId.trim()) {
    throw new Error(
      "O horário de trabalho informado é inválido.",
    );
  }

  const workingHoursReference =
    doc(
      db,
      "vehicleWorkingHours",
      workingHoursId,
    );

  const snapshot = await getDoc(
    workingHoursReference,
  );

  if (!snapshot.exists()) {
    throw new Error(
      "Horário de trabalho não encontrado.",
    );
  }

  const currentWorkingHours =
    snapshot.data();

  const enabled =
    updates.enabled ??
    Boolean(
      currentWorkingHours.enabled,
    );

  const startsAt =
    updates.startsAt ??
    String(
      currentWorkingHours.startsAt ??
        "",
    );

  const endsAt =
    updates.endsAt ??
    String(
      currentWorkingHours.endsAt ??
        "",
    );

  if (enabled) {
    if (
      !isValidTime(startsAt) ||
      !isValidTime(endsAt)
    ) {
      throw new Error(
        "Informe horários válidos.",
      );
    }

    if (startsAt >= endsAt) {
      throw new Error(
        "O horário final deve ser posterior ao horário inicial.",
      );
    }
  }

  const workingHoursData = {
    enabled,

    startsAt: enabled
      ? startsAt
      : "",

    endsAt: enabled
      ? endsAt
      : "",

    updatedAt:
      serverTimestamp(),
  };

  await updateDoc(
    workingHoursReference,
    workingHoursData,
  );
}