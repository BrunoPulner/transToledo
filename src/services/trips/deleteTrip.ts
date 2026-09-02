import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase/client";
import type { TripMedia } from "@/types/trip";

export async function deleteTrip(tripId: string, media: TripMedia[]) {
  await Promise.allSettled(
    media.map((item) => deleteObject(ref(storage, item.url)))
  );
  await deleteDoc(doc(db, "frequentTrips", tripId));
}
