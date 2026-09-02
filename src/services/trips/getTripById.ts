import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { FrequentTrip } from "@/types/trip";

export async function getTripById(
  id: string
): Promise<FrequentTrip | null> {
  const tripReference = doc(
    db,
    "frequentTrips",
    id
  );

  const snapshot = await getDoc(
    tripReference
  );

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,

    name: data.name ?? "",

    city: data.city ?? "",
    state: data.state ?? "",

    location: data.location ?? "",

    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,

    averageDurationMinutes:
      data.averageDurationMinutes ?? 0,

    type: data.type ?? "outro",

    description: data.description ?? "",

    media: Array.isArray(data.media)
      ? data.media
      : [],

    active: data.active === true,
    featured: data.featured === true,

    order: data.order,

    createdAt:
      data.createdAt?.toDate?.(),

    updatedAt:
      data.updatedAt?.toDate?.(),
  };
}