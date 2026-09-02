import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type {
  Vehicle,
  VehicleFeatures,
  VehicleMedia,
} from "@/types/vehicles";

const defaultFeatures: VehicleFeatures = {
  airConditioning: false,
  wifi: false,
  usb: false,
  powerOutlet: false,
  recliningSeats: false,
  accessibility: false,
  television: false,
  refrigerator: false,
};

export function subscribeToVehicles(
  onVehiclesChange: (vehicles: Vehicle[]) => void,
  onError?: (error: Error) => void,
) {
  const vehiclesQuery = query(
    collection(db, "vehicles"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    vehiclesQuery,
    (snapshot) => {
      const vehicles = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,
          model: String(data.model ?? ""),
          year: Number(data.year ?? 0),
          passengerCapacity: Number(
            data.passengerCapacity ?? 0,
          ),

          luggageSize: data.luggageSize ?? "medium",
          luggageCapacityLiters: Number(
            data.luggageCapacityLiters ?? 0,
          ),
          luggageDimensions:
            data.luggageDimensions ?? undefined,

          status: data.status ?? "inactive",

          features: {
            ...defaultFeatures,
            ...(data.features ?? {}),
          },

          media: Array.isArray(data.media)
            ? (data.media as VehicleMedia[])
            : [],

          createdAt: data.createdAt?.toDate?.(),
          updatedAt: data.updatedAt?.toDate?.(),
        } as Vehicle;
      });

      onVehiclesChange(vehicles);
    },
    (firebaseError) => {
      console.error(
        "Erro ao consultar veículos:",
        firebaseError,
      );

      onError?.(
        firebaseError instanceof Error
          ? firebaseError
          : new Error("Não foi possível consultar a frota."),
      );
    },
  );
}