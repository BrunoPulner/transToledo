import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase/client";

import type {
  LuggageDimensions,
  LuggageSize,
  VehicleFeatures,
  VehicleMedia,
  VehicleStatus,
} from "@/types/vehicles";

export type CreateVehicleInput = {
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

export async function createVehicle(
  vehicle: CreateVehicleInput
) {
  const vehicleData = {
    model: vehicle.model.trim(),

    year: vehicle.year,

    passengerCapacity:
      vehicle.passengerCapacity,

    luggageSize:
      vehicle.luggageSize,

    luggageCapacityLiters:
      vehicle.luggageCapacityLiters,

    luggageDimensions:
      vehicle.luggageDimensions,

    status: vehicle.status,

    features: vehicle.features,

    media: vehicle.media,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const vehicleReference = await addDoc(
    collection(db, "vehicles"),
    vehicleData
  );

  return {
    id: vehicleReference.id,
    ...vehicleData,
  };
}