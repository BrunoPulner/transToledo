import {
  deleteDoc,
  doc,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase/client";

export async function deleteWorkingHours(
  workingHoursId: string,
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

  await deleteDoc(
    workingHoursReference,
  );
}