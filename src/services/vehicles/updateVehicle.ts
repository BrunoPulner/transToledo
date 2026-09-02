import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type {
  LuggageDimensions,
  LuggageSize,
  VehicleFeatures,
  VehicleMedia,
  VehicleStatus,
} from "@/types/vehicles";

export type UpdateVehicleInput = {
  model: string;
  year: number;
  passengerCapacity: number;

  luggageSize: LuggageSize;
  luggageCapacityLiters: number;

  luggageDimensions:
    | LuggageDimensions
    | null;

  status: VehicleStatus;
  features: VehicleFeatures;
  media: VehicleMedia[];
};

export async function updateVehicle(
  vehicleId: string,
  vehicle: UpdateVehicleInput,
) {
  const vehicleReference = doc(
    db,
    "vehicles",
    vehicleId,
  );

  await updateDoc(vehicleReference, {
    model: vehicle.model.trim(),
    year: vehicle.year,
    passengerCapacity: vehicle.passengerCapacity,

    luggageSize: vehicle.luggageSize,
    luggageCapacityLiters:
      vehicle.luggageCapacityLiters,

    luggageDimensions:
      vehicle.luggageDimensions ?? null,

    status: vehicle.status,
    features: vehicle.features,
    media: vehicle.media,

    updatedAt: serverTimestamp(),
  });
}