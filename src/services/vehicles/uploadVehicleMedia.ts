import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import {
  storage,
} from "@/lib/firebase/client";

import type {
  VehicleMedia,
} from "@/types/vehicles";

const IMAGE_LIMIT =
  10 * 1024 * 1024;

const VIDEO_LIMIT =
  100 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function validateVehicleMedia(
  file: File
) {
  const isImage =
    ALLOWED_IMAGE_TYPES.includes(
      file.type
    );

  const isVideo =
    file.type === "video/mp4";

  if (!isImage && !isVideo) {
    return "Envie somente imagens JPG, PNG, WEBP ou vídeos MP4.";
  }

  if (
    isImage &&
    file.size > IMAGE_LIMIT
  ) {
    return `A imagem ${file.name} ultrapassa o limite de 10 MB.`;
  }

  if (
    isVideo &&
    file.size > VIDEO_LIMIT
  ) {
    return `O vídeo ${file.name} ultrapassa o limite de 100 MB.`;
  }

  return null;
}

export async function uploadVehicleMedia(
  files: File[],
  folderId: string
): Promise<VehicleMedia[]> {
  return Promise.all(
    files.map(async (file) => {
      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ?? "file";

      const fileName =
        `${crypto.randomUUID()}.${extension}`;

      const fileReference = ref(
        storage,
        `vehicles/${folderId}/${fileName}`
      );

      const snapshot = await uploadBytes(
        fileReference,
        file,
        {
          contentType: file.type,
        }
      );

      const downloadUrl =
        await getDownloadURL(
          snapshot.ref
        );

      return {
        url: downloadUrl,

        type: file.type.startsWith(
          "image/"
        )
          ? "image"
          : "video",
      } satisfies VehicleMedia;
    })
  );
}