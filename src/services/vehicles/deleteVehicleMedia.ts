import { FirebaseError } from "firebase/app";
import { deleteObject, ref } from "firebase/storage";

import { storage } from "@/lib/firebase/client";

export async function deleteVehicleMedia(
  mediaUrl: string,
) {
  if (!mediaUrl) {
    return;
  }

  try {
    const mediaReference = ref(storage, mediaUrl);

    await deleteObject(mediaReference);
  } catch (error) {
    // Se o arquivo já tiver sido excluído, não precisamos
    // impedir a atualização do veículo.
    if (
      error instanceof FirebaseError &&
      error.code === "storage/object-not-found"
    ) {
      return;
    }

    throw error;
  }
}