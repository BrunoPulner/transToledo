import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "@/lib/firebase/client";
import type { TripMedia } from "@/types/trip";

const IMAGE_LIMIT = 10 * 1024 * 1024;
const VIDEO_LIMIT = 100 * 1024 * 1024;

export function validateTripMedia(file: File) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type === "video/mp4";

  if (!isImage && !isVideo) {
    return "Envie somente imagens ou vídeos MP4.";
  }

  if (isImage && file.size > IMAGE_LIMIT) {
    return `A imagem ${file.name} ultrapassa 10 MB.`;
  }

  if (isVideo && file.size > VIDEO_LIMIT) {
    return `O vídeo ${file.name} ultrapassa 100 MB.`;
  }

  return null;
}

export async function uploadTripMedia(
  files: File[],
  folderId: string
): Promise<TripMedia[]> {
  return Promise.all(
    files.map(async (file) => {
      const extension = file.name.split(".").pop() ?? "file";
      const fileName = `${crypto.randomUUID()}.${extension.toLowerCase()}`;
      const fileReference = ref(
        storage,
        `frequent-trips/${folderId}/${fileName}`
      );

      const snapshot = await uploadBytes(
        fileReference,
        file,
        { contentType: file.type }
      );

      return {
        url: await getDownloadURL(snapshot.ref),
        type: file.type.startsWith("image/")
          ? "image"
          : "video",
      } satisfies TripMedia;
    })
  );
}
