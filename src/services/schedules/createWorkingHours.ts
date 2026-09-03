import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase/client";

import type {
  CreateVehicleWorkingHoursInput,
} from "@/types/schedule";

function isValidTime(time: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
    time,
  );
}

export async function createWorkingHours(
  workingHours: CreateVehicleWorkingHoursInput,
) {
  const {
    vehicleId,
    weekday,
    enabled,
    startsAt,
    endsAt,
  } = workingHours;

  if (!vehicleId.trim()) {
    throw new Error(
      "Selecione um veículo.",
    );
  }

  if (
    weekday < 0 ||
    weekday > 6
  ) {
    throw new Error(
      "O dia da semana informado é inválido.",
    );
  }

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

  /*
   * Criamos um ID previsível para impedir
   * mais de um horário para o mesmo veículo
   * no mesmo dia da semana.
   *
   * Exemplo:
   * idDaVan_1 = segunda-feira
   */
  const workingHoursId =
    `${vehicleId}_${weekday}`;

  const workingHoursReference =
    doc(
      db,
      "vehicleWorkingHours",
      workingHoursId,
    );

  const workingHoursData = {
    vehicleId,
    weekday,
    enabled,

    startsAt: enabled
      ? startsAt
      : "",

    endsAt: enabled
      ? endsAt
      : "",

    createdAt:
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  /*
   * O merge impede que outros campos
   * existentes sejam apagados.
   *
   * Caso o horário desse dia já exista,
   * ele será atualizado em vez de duplicado.
   */
  await setDoc(
    workingHoursReference,
    workingHoursData,
    {
      merge: true,
    },
  );

  return workingHoursId;
}