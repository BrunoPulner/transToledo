import { collection, onSnapshot, orderBy, query, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { FrequentTrip } from "@/types/trip";

function convertTrip(snapshot: QueryDocumentSnapshot<DocumentData>): FrequentTrip {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    name: data.name ?? "Viagem sem nome",
    city: data.city ?? "",
    state: data.state ?? "",
    location: data.location ?? "",
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    averageDurationMinutes: data.averageDurationMinutes ?? 0,
    type: data.type ?? "outro",
    description: data.description ?? "",
    media: Array.isArray(data.media) ? data.media : [],
    active: data.active === true,
    featured: data.featured === true,
    order: data.order,
    createdAt: data.createdAt?.toDate?.(),
    updatedAt: data.updatedAt?.toDate?.(),
  };
}

export function subscribeToTrips(
  onTrips: (trips: FrequentTrip[]) => void,
  onError: (error: Error) => void
) {
  const tripsQuery = query(
    collection(db, "frequentTrips"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    tripsQuery,
    (snapshot) => onTrips(snapshot.docs.map(convertTrip)),
    onError
  );
}