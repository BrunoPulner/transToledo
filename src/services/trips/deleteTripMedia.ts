import {
  deleteObject,
  ref,
} from "firebase/storage";

import {
  storage,
} from "@/lib/firebase/client";

export async function deleteTripMedia(
  urls: string[]
) {
  if (urls.length === 0) {
    return;
  }

  const deletionResults =
    await Promise.allSettled(
      urls.map((url) => {
        const mediaReference = ref(
          storage,
          url
        );

        return deleteObject(
          mediaReference
        );
      })
    );

  const failedDeletions =
    deletionResults.filter(
      (result) =>
        result.status === "rejected"
    );

  if (failedDeletions.length > 0) {
    console.warn(
      `${failedDeletions.length} mídia(s) não puderam ser removidas do Storage.`,
      failedDeletions
    );
  }
}