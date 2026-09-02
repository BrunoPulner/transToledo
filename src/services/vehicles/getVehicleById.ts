import { doc, getDoc } from "firebase/firestore";

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

export async function getVehicleById(
  vehicleId: string,
): Promise<Vehicle | null> {
  const vehicleReference = doc(
    db,
    "vehicles",
    vehicleId,
  );

  const vehicleSnapshot = await getDoc(vehicleReference);

  if (!vehicleSnapshot.exists()) {
    return null;
  }

  const data = vehicleSnapshot.data();

  return {
    id: vehicleSnapshot.id,

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
}