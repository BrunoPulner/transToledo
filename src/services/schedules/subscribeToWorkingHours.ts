import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase/client";

import type {
  VehicleWorkingHours,
  Weekday,
} from "@/types/schedule";

export function subscribeToWorkingHours(
  vehicleId: string,

  onWorkingHoursChange: (
    workingHours:
      VehicleWorkingHours[],
  ) => void,

  onError?: (
    error: Error,
  ) => void,
) {
  if (!vehicleId.trim()) {
    onWorkingHoursChange([]);

    /*
     * Mantém o mesmo formato de retorno
     * do onSnapshot: uma função para
     * cancelar a inscrição.
     */
    return () => {};
  }

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

  return onSnapshot(
    workingHoursQuery,

    (snapshot) => {
      const workingHours =
        snapshot.docs.map(
          (document) => {
            const data =
              document.data();

            return {
              id: document.id,

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
                data.createdAt
                  ?.toDate?.(),

              updatedAt:
                data.updatedAt
                  ?.toDate?.(),
            } satisfies VehicleWorkingHours;
          },
        );

      /*
       * O Firestore retorna os documentos
       * sem uma ordem garantida.
       *
       * Ordenamos do domingo (0)
       * até o sábado (6).
       */
      workingHours.sort(
        (first, second) =>
          first.weekday -
          second.weekday,
      );

      onWorkingHoursChange(
        workingHours,
      );
    },

    (firebaseError) => {
      console.error(
        "Erro ao consultar horários de trabalho:",
        firebaseError,
      );

      onError?.(
        firebaseError instanceof
          Error
          ? firebaseError
          : new Error(
              "Não foi possível consultar os horários de trabalho.",
            ),
      );
    },
  );
}