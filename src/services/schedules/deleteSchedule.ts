import {
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";

export async function deleteSchedule(
  scheduleId: string,
) {
  await deleteDoc(
    doc(
      db,
      "vehicleSchedules",
      scheduleId,
    ),
  );
}