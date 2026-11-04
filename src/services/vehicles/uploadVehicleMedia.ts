
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/lib/firebase/client";

import type { VehicleMedia } from "@/types/vehicles";

const VIDEO_LIMIT = 100 * 1024 * 1024;

export function validateVehicleMedia(
  file: File,
): string | null {
  if (
    file.type !== "image/webp" &&
    file.type !== "video/mp4"
  ) {
    return "Formato inválido. As imagens devem ser convertidas para WebP antes do envio.";
  }

  if (
    file.type === "video/mp4" &&
    file.size > VIDEO_LIMIT
  ) {
    return `O vídeo "${file.name}" ultrapassa 100 MB.`;
  }

  return null;
}

export async function uploadVehicleMedia(
  files: File[],
  folderId: string,
): Promise<VehicleMedia[]> {
  return Promise.all(
    files.map(async (file) => {
      const validationError = validateVehicleMedia(file);

      if (validationError) {
        throw new Error(validationError);
      }

      const isImage = file.type === "image/webp";

      const extension = isImage ? "webp" : "mp4";

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const fileReference = ref(
        storage,
        `vehicles/${folderId}/${fileName}`,
      );

      const snapshot = await uploadBytes(
        fileReference,
        file,
        {
          contentType: file.type,
        },
      );

      const downloadUrl = await getDownloadURL(
        snapshot.ref,
      );

      return {
        url: downloadUrl,
        type: isImage ? "image" : "video",
      } satisfies VehicleMedia;
    }),
  );
}
