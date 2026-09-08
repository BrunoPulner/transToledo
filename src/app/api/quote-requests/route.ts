import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebase/admin";
import {
  hashVerificationValue,
  normalizeBrazilianPhone,
  verifyPhoneVerificationToken,
} from "@/lib/phone-verification";

export const dynamic = "force-dynamic";

type QuoteRequestBody = {
  vehicleId?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  phoneVerificationToken?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuoteRequestBody;
    if (
      typeof body.vehicleId !== "string" ||
      typeof body.startsAt !== "string" ||
      typeof body.endsAt !== "string" ||
      typeof body.name !== "string" ||
      typeof body.email !== "string" ||
      typeof body.phone !== "string" ||
      typeof body.phoneVerificationToken !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Dados da solicitação incompletos." },
        { status: 400 },
      );
    }

    const vehicleId = body.vehicleId.trim();
    const name = body.name.trim();
    const email = body.email.trim().toLowerCase();
    const phone = normalizeBrazilianPhone(body.phone);
    const startsAt = new Date(body.startsAt);
    const endsAt = new Date(body.endsAt);

    if (
      !vehicleId ||
      vehicleId.length > 128 ||
      name.length < 3 ||
      name.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 160 ||
      !phone ||
      Number.isNaN(startsAt.getTime()) ||
      Number.isNaN(endsAt.getTime()) ||
      startsAt >= endsAt ||
      startsAt <= new Date()
    ) {
      return NextResponse.json(
        { success: false, message: "Confira os dados e o período solicitado." },
        { status: 400 },
      );
    }

    if (!verifyPhoneVerificationToken(body.phoneVerificationToken, phone)) {
      return NextResponse.json(
        { success: false, message: "A confirmação do telefone é inválida ou expirou." },
        { status: 403 },
      );
    }

    const quoteReference = adminDb.collection("quoteRequests").doc();
    const consumedTokenReference = adminDb
      .collection("consumedPhoneVerificationTokens")
      .doc(hashVerificationValue(body.phoneVerificationToken));
    const vehicleReference = adminDb.collection("vehicles").doc(vehicleId);
    const schedulesQuery = adminDb
      .collection("vehicleSchedules")
      .where("vehicleId", "==", vehicleId);

    await adminDb.runTransaction(async (transaction) => {
      const [consumedToken, vehicle, schedules] = await Promise.all([
        transaction.get(consumedTokenReference),
        transaction.get(vehicleReference),
        transaction.get(schedulesQuery),
      ]);

      if (consumedToken.exists) {
        throw new QuoteRequestError("Esta confirmação já foi utilizada.", 409);
      }
      if (!vehicle.exists || vehicle.data()?.status !== "active") {
        throw new QuoteRequestError("O veículo não está mais disponível.", 404);
      }

      const hasConflict = schedules.docs.some((document) => {
        const schedule = document.data();
        const scheduledStart = schedule.startsAt?.toDate?.();
        const scheduledEnd = schedule.endsAt?.toDate?.();
        return schedule.status === "active" &&
          (schedule.type === "booking" || schedule.type === "blocked") &&
          scheduledStart instanceof Date &&
          scheduledEnd instanceof Date &&
          scheduledStart < endsAt &&
          scheduledEnd > startsAt;
      });

      if (hasConflict) {
        throw new QuoteRequestError(
          "Este período acabou de ficar indisponível. Escolha outro horário.",
          409,
        );
      }

      transaction.create(quoteReference, {
        vehicleId,
        vehicleName: String(vehicle.data()?.model ?? "Veículo"),
        customer: { name, email, phone },
        startsAt: Timestamp.fromDate(startsAt),
        endsAt: Timestamp.fromDate(endsAt),
        status: "pending",
        source: "fleet_calendar",
        phoneVerifiedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.create(consumedTokenReference, {
        quoteRequestId: quoteReference.id,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
      });
    });

    return NextResponse.json(
      { success: true, quoteRequestId: quoteReference.id },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof QuoteRequestError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status },
      );
    }
    console.error("Erro ao criar solicitação de orçamento:", error);
    return NextResponse.json(
      { success: false, message: "Não foi possível salvar a solicitação." },
      { status: 500 },
    );
  }
}

class QuoteRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "QuoteRequestError";
  }
}
