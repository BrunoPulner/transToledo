import { FirebaseError } from "firebase/app";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";

import { db, storage } from "@/lib/firebase/client";
import type { VehicleMedia } from "@/types/vehicles";

async function deleteMediaFile(url: string) {
  try {
    const fileReference = ref(storage, url);

    await deleteObject(fileReference);
  } catch (error) {
    if (
      error instanceof FirebaseError &&
      error.code === "storage/object-not-found"
    ) {
      return;
    }

    throw error;
  }
}

export async function deleteVehicle(
  vehicleId: string,
  media: VehicleMedia[],
) {
  await Promise.all(
    media.map((mediaItem) =>
      deleteMediaFile(mediaItem.url),
    ),
  );

  await deleteDoc(doc(db, "vehicles", vehicleId));
}