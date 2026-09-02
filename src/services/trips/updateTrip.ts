import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";

import type {
  CreateTripInput,
} from "@/services/trips/createTrip";

export async function updateTrip(
  id: string,
  trip: CreateTripInput
) {
  const tripReference = doc(
    db,
    "frequentTrips",
    id
  );

  await updateDoc(tripReference, {
    name: trip.name.trim(),

    city: trip.city.trim(),
    state:
      trip.state.trim().toUpperCase(),

    location: trip.location.trim(),

    latitude: trip.latitude,
    longitude: trip.longitude,

    averageDurationMinutes:
      trip.averageDurationMinutes,

    type: trip.type,

    description:
      trip.description.trim(),

    media: trip.media,

    active: trip.active,
    featured: trip.featured,

    updatedAt: serverTimestamp(),
  });
}