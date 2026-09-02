import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type {
  TripMedia,
  TripType,
} from "@/types/trip";

export type CreateTripInput = {
  name: string;
  city: string;
  state: string;
  location: string;

  latitude: number | null;
  longitude: number | null;

  averageDurationMinutes: number;

  type: TripType;
  description: string;

  media: TripMedia[];

  active: boolean;
  featured: boolean;
};

export async function createTrip(
  trip: CreateTripInput
) {
  const tripData = {
    name: trip.name.trim(),
    city: trip.city.trim(),
    state: trip.state.trim().toUpperCase(),
    location: trip.location.trim(),

    latitude: trip.latitude,
    longitude: trip.longitude,

    averageDurationMinutes:
      trip.averageDurationMinutes,

    type: trip.type,
    description: trip.description.trim(),

    media: trip.media,

    active: trip.active,
    featured: trip.featured,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const tripReference = await addDoc(
    collection(db, "frequentTrips"),
    tripData
  );

  return {
    id: tripReference.id,
    ...tripData,
  };
}