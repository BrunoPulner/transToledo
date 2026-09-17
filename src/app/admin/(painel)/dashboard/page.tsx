import { Timestamp } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardOverview, type DashboardBooking, type DashboardVehicle } from "@/app/admin/(painel)/DashboardOverview";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

function readText(value: unknown, fallback = "Não informado") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function readDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    const date = value.toDate();

    return date instanceof Date && !Number.isNaN(date.getTime())
      ? date
      : null;
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export default async function DashboardPage() {
  const session = (await cookies()).get("transtoledo_session")?.value;

  if (!session) {
    redirect("/admin");
  }

  try {
    await adminAuth.verifySessionCookie(session, true);
  } catch {
    redirect("/admin");
  }

  const now = new Date();

  const [fleet, pending, trips, schedules] = await Promise.all([
    adminDb.collection("vehicles").get(),

    adminDb
      .collection("quoteRequests")
      .where("status", "==", "pending")
      .count()
      .get(),

    adminDb.collection("frequentTrips").count().get(),

    // Inclui viagens futuras e viagens que já começaram,
    // desde que o horário de retorno ainda não tenha passado.
    adminDb
      .collection("vehicleSchedules")
      .where("endsAt", ">", Timestamp.fromDate(now))
      .get(),
  ]);

  const vehicles: DashboardVehicle[] = fleet.docs.map((document) => {
    const data = document.data();

    const media = Array.isArray(data.media)
      ? data.media as Array<{
          type?: string;
          url?: string;
          isCover?: boolean;
        }>
      : [];

    const cover =
      media.find((item) => item.type === "image" && item.isCover && item.url) ??
      media.find((item) => item.type === "image" && item.url);

    return {
      id: document.id,
      name: readText(data.model, "Veículo"),
      image: cover?.url ?? null,
    };
  });

  const bookings: DashboardBooking[] = schedules.docs
    .flatMap((document) => {
      const data = document.data();

      if (
        data.type !== "booking" ||
        (data.status ?? "active") !== "active"
      ) {
        return [];
      }

      const start = readDate(data.startsAt);
      const end = readDate(data.endsAt);

      if (!start || !end || end <= now) {
        return [];
      }

      return [{
        id: document.id,
        vehicleId: readText(data.vehicleId, ""),
        vehicleName: readText(
          data.vehicleName,
          vehicles.find((vehicle) => vehicle.id === data.vehicleId)?.name ??
            "Veículo",
        ),
        tripName: readText(data.trip?.name ?? data.title, "Viagem confirmada"),
        customerName: readText(data.customer?.name),
        customerPhone: readText(data.customer?.phone),
        customerEmail: readText(data.customer?.email),
        origin: readText(data.trip?.origin?.address),
        destination: readText(data.trip?.destination?.address),
        passengers:
          typeof data.trip?.passengers === "number"
            ? data.trip.passengers
            : null,
        notes:
          typeof data.trip?.notes === "string"
            ? data.trip.notes
            : "",
        quoteId: readText(data.quoteRequestId ?? data.quoteId, ""),
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
      }];
    })
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const agendaCount = schedules.docs.filter((document) => {
    const data = document.data();
    const end = readDate(data.endsAt);

    return (
      (data.status ?? "active") === "active" &&
      end !== null &&
      end > now
    );
  }).length;

  return (
    <DashboardOverview
      vehicles={vehicles}
      bookings={bookings}
      pendingCount={pending.data().count}
      tripCount={trips.data().count}
      agendaCount={agendaCount}
    />
  );
}