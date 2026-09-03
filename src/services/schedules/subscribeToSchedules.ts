import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { VehicleScheduleEntry } from "@/types/schedule";

export function subscribeToSchedules(
  onSchedulesChange: (
    schedules: VehicleScheduleEntry[],
  ) => void,

  onError?: (error: Error) => void,

  vehicleId?: string,
) {
  const constraints: QueryConstraint[] = [];

  if (vehicleId) {
    constraints.push(
      where(
        "vehicleId",
        "==",
        vehicleId,
      ),
    );
  }

  constraints.push(
    orderBy(
      "startsAt",
      "asc",
    ),
  );

  const schedulesQuery = query(
    collection(
      db,
      "vehicleSchedules",
    ),
    ...constraints,
  );

  return onSnapshot(
    schedulesQuery,

    (snapshot) => {
      const schedules = snapshot.docs.map(
        (document) => {
          const data = document.data();

          return {
            id: document.id,

            vehicleId: String(
              data.vehicleId ?? "",
            ),

            type:
              data.type ?? "availability",

            source:
              data.source ?? "manual",

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
          } as VehicleScheduleEntry;
        },
      );

      onSchedulesChange(schedules);
    },

    (firebaseError) => {
      console.error(
        "Erro ao consultar agendamentos:",
        firebaseError,
      );

      onError?.(
        firebaseError instanceof Error
          ? firebaseError
          : new Error(
              "Não foi possível consultar os agendamentos.",
            ),
      );
    },
  );
}