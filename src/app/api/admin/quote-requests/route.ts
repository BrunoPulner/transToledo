import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/admin";

import type {
  QuoteRequestStatus,
} from "@/types/quote-request";

export const dynamic = "force-dynamic";

/*
 * GET
 *
 * Retorna as solicitações de orçamento
 * para o painel administrativo.
 */
export async function GET() {
  const administrator =
    await getAdministrator();

  if (!administrator) {
    return unauthorized();
  }

  try {
    const snapshot = await adminDb
      .collection("quoteRequests")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const requests = snapshot.docs.map(
      (document) => {
        const data = document.data();

        return {
          id: document.id,

          vehicleId: String(
            data.vehicleId ?? "",
          ),

          vehicleName: String(
            data.vehicleName ?? "Veículo",
          ),

          customer: {
            name: String(
              data.customer?.name ?? "",
            ),

            email: String(
              data.customer?.email ?? "",
            ),

            phone: String(
              data.customer?.phone ?? "",
            ),
          },

          trip: {
            mode:
              data.trip?.mode === "registered"
                ? "registered"
                : "custom",

            frequentTripId:
              typeof data.trip?.frequentTripId ===
              "string"
                ? data.trip.frequentTripId
                : null,

            name: String(
              data.trip?.name ?? "Viagem",
            ),

            origin: {
              address: String(
                data.trip?.origin?.address ?? "",
              ),

              latitude: Number(
                data.trip?.origin?.latitude ?? 0,
              ),

              longitude: Number(
                data.trip?.origin?.longitude ?? 0,
              ),
            },

            destination: {
              address: String(
                data.trip?.destination?.address ?? "",
              ),

              latitude: Number(
                data.trip?.destination?.latitude ?? 0,
              ),

              longitude: Number(
                data.trip?.destination?.longitude ?? 0,
              ),
            },

            passengers: Number(
              data.trip?.passengers ?? 0,
            ),

            notes: String(
              data.trip?.notes ?? "",
            ),
          },

          startsAt: toIsoString(
            data.startsAt,
          ),

          endsAt: toIsoString(
            data.endsAt,
          ),

          status: readStatus(
            data.status,
          ),

          source: String(
            data.source ?? "quote_wizard",
          ),

          rejectionReason:
            typeof data.rejectionReason === "string"
              ? data.rejectionReason
              : null,

          scheduleId:
            typeof data.scheduleId === "string"
              ? data.scheduleId
              : null,

          createdAt: toIsoString(
            data.createdAt,
            true,
          ),

          updatedAt: toIsoString(
            data.updatedAt,
            true,
          ),

          reviewedAt: toIsoString(
            data.reviewedAt,
            true,
          ),

          scheduledAt: toIsoString(
            data.scheduledAt,
            true,
          ),
        };
      },
    );

    return NextResponse.json(
      {
        success: true,
        requests,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Erro ao carregar orçamentos:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Não foi possível carregar os orçamentos.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * PATCH
 *
 * Aprova ou rejeita uma solicitação.
 *
 * Quando aprovada, cria também o registro
 * na coleção vehicleSchedules.
 */
export async function PATCH(
  request: Request,
) {
  const administrator =
    await getAdministrator();

  if (!administrator) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as {
      quoteRequestId?: unknown;
      decision?: unknown;
      rejectionReason?: unknown;
    };

    /*
     * Valida os dados básicos da decisão.
     */
    if (
      typeof body.quoteRequestId !== "string" ||
      !body.quoteRequestId.trim() ||
      body.quoteRequestId.length > 128 ||
      (
        body.decision !== "approved" &&
        body.decision !== "rejected"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Decisão inválida.",
        },
        {
          status: 400,
        },
      );
    }

    const quoteRequestId =
      body.quoteRequestId.trim();

    const decision = body.decision;

    const rejectionReason =
      typeof body.rejectionReason === "string"
        ? body.rejectionReason.trim()
        : "";

    /*
     * A recusa precisa ter uma justificativa.
     */
    if (
      decision === "rejected" &&
      rejectionReason.length < 3
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Informe o motivo da recusa.",
        },
        {
          status: 400,
        },
      );
    }

    if (rejectionReason.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message:
            "O motivo deve possuir no máximo 500 caracteres.",
        },
        {
          status: 400,
        },
      );
    }

    const quoteReference = adminDb
      .collection("quoteRequests")
      .doc(quoteRequestId);

    /*
     * O agendamento utiliza o mesmo ID do
     * orçamento. Isso impede que o mesmo
     * orçamento gere dois agendamentos.
     */
    const scheduleReference = adminDb
      .collection("vehicleSchedules")
      .doc(quoteRequestId);

    const result = await adminDb.runTransaction(
      async (transaction) => {
        /*
         * Carrega o orçamento dentro da transação.
         */
        const quoteSnapshot =
          await transaction.get(
            quoteReference,
          );

        if (!quoteSnapshot.exists) {
          throw new QuoteDecisionError(
            "Orçamento não encontrado.",
            404,
          );
        }

        const quoteData =
          quoteSnapshot.data();

        /*
         * Somente orçamentos pendentes podem
         * ser aprovados ou recusados.
         */
        if (
          quoteData?.status !== "pending"
        ) {
          throw new QuoteDecisionError(
            "Este orçamento já foi analisado.",
            409,
          );
        }

        /*
         * Na recusa não é criado nenhum
         * agendamento para o veículo.
         */
        if (decision === "rejected") {
          transaction.update(
            quoteReference,
            {
              status: "rejected",

              rejectionReason,

              reviewedAt:
                FieldValue.serverTimestamp(),

              reviewedBy: {
                uid: administrator.uid,
                email:
                  administrator.email ?? null,
              },

              updatedAt:
                FieldValue.serverTimestamp(),
            },
          );

          return {
            status: "rejected" as const,
            scheduleId: null,
          };
        }

        /*
         * A partir deste ponto o orçamento
         * está sendo aprovado.
         */
        const vehicleId = String(
          quoteData?.vehicleId ?? "",
        ).trim();

        const startsAt =
          readFirestoreDate(
            quoteData?.startsAt,
          );

        const endsAt =
          readFirestoreDate(
            quoteData?.endsAt,
          );

        if (
          !vehicleId ||
          !startsAt ||
          !endsAt ||
          startsAt >= endsAt
        ) {
          throw new QuoteDecisionError(
            "O orçamento possui dados de agendamento inválidos.",
            400,
          );
        }

        const vehicleReference = adminDb
          .collection("vehicles")
          .doc(vehicleId);

        const schedulesQuery = adminDb
          .collection("vehicleSchedules")
          .where(
            "vehicleId",
            "==",
            vehicleId,
          );

        /*
         * Todos os documentos necessários são
         * lidos antes das gravações.
         */
        const [
          vehicleSnapshot,
          existingScheduleSnapshot,
          schedulesSnapshot,
        ] = await Promise.all([
          transaction.get(
            vehicleReference,
          ),

          transaction.get(
            scheduleReference,
          ),

          transaction.get(
            schedulesQuery,
          ),
        ]);

        /*
         * Confirma que o veículo ainda existe.
         */
        if (!vehicleSnapshot.exists) {
          throw new QuoteDecisionError(
            "O veículo deste orçamento não foi encontrado.",
            404,
          );
        }

        const vehicleData =
          vehicleSnapshot.data();

        /*
         * Confirma que o veículo continua ativo.
         */
        if (
          vehicleData?.status !== "active"
        ) {
          throw new QuoteDecisionError(
            "O veículo deste orçamento não está ativo.",
            409,
          );
        }

        /*
         * Proteção contra agendamento duplicado.
         */
        if (
          existingScheduleSnapshot.exists
        ) {
          throw new QuoteDecisionError(
            "Este orçamento já possui um agendamento.",
            409,
          );
        }

        /*
         * Revalida a disponibilidade no momento
         * exato da aprovação.
         *
         * Existe conflito quando:
         *
         * início solicitado < final agendado
         * e
         * final solicitado > início agendado
         */
        const hasConflict =
          schedulesSnapshot.docs.some(
            (document) => {
              const schedule =
                document.data();

              const scheduledStart =
                readFirestoreDate(
                  schedule.startsAt,
                );

              const scheduledEnd =
                readFirestoreDate(
                  schedule.endsAt,
                );

              if (
                !scheduledStart ||
                !scheduledEnd
              ) {
                return false;
              }

              const isActive =
                schedule.status === "active";

              const blocksCalendar =
                schedule.type === "booking" ||
                schedule.type === "blocked";

              return (
                isActive &&
                blocksCalendar &&
                startsAt < scheduledEnd &&
                endsAt > scheduledStart
              );
            },
          );

        if (hasConflict) {
          throw new QuoteDecisionError(
            "Não foi possível aprovar: o veículo já possui um agendamento neste período.",
            409,
          );
        }

        /*
         * Cria o registro que ocupará a agenda.
         */
        transaction.create(
          scheduleReference,
          {
            vehicleId,

            vehicleName: String(
              quoteData?.vehicleName ??
                vehicleData?.model ??
                vehicleData?.name ??
                "Veículo",
            ),

            startsAt:
              quoteData?.startsAt,

            endsAt:
              quoteData?.endsAt,

            /*
             * booking representa uma viagem
             * confirmada pelo administrador.
             */
            type: "booking",

            /*
             * Somente registros ativos devem
             * bloquear o calendário.
             */
            status: "active",

            quoteRequestId,

            source: "quote_request",

            customer: {
              name: String(
                quoteData?.customer?.name ??
                  "",
              ),

              email: String(
                quoteData?.customer?.email ??
                  "",
              ),

              phone: String(
                quoteData?.customer?.phone ??
                  "",
              ),
            },

            trip: {
              mode:
                quoteData?.trip?.mode ===
                "registered"
                  ? "registered"
                  : "custom",

              frequentTripId:
                typeof quoteData?.trip
                  ?.frequentTripId ===
                "string"
                  ? quoteData.trip
                      .frequentTripId
                  : null,

              name: String(
                quoteData?.trip?.name ??
                  "Viagem",
              ),

              origin: {
                address: String(
                  quoteData?.trip?.origin
                    ?.address ?? "",
                ),

                latitude: Number(
                  quoteData?.trip?.origin
                    ?.latitude ?? 0,
                ),

                longitude: Number(
                  quoteData?.trip?.origin
                    ?.longitude ?? 0,
                ),
              },

              destination: {
                address: String(
                  quoteData?.trip?.destination
                    ?.address ?? "",
                ),

                latitude: Number(
                  quoteData?.trip?.destination
                    ?.latitude ?? 0,
                ),

                longitude: Number(
                  quoteData?.trip?.destination
                    ?.longitude ?? 0,
                ),
              },

              passengers: Number(
                quoteData?.trip?.passengers ??
                  0,
              ),

              notes: String(
                quoteData?.trip?.notes ??
                  "",
              ),
            },

            createdBy: {
              uid: administrator.uid,

              email:
                administrator.email ?? null,
            },

            createdAt:
              FieldValue.serverTimestamp(),

            updatedAt:
              FieldValue.serverTimestamp(),
          },
        );

        /*
         * Marca o orçamento como aprovado e
         * salva o vínculo com o agendamento.
         */
        transaction.update(
          quoteReference,
          {
            status: "approved",

            rejectionReason: null,

            scheduleId:
              scheduleReference.id,

            scheduledAt:
              FieldValue.serverTimestamp(),

            reviewedAt:
              FieldValue.serverTimestamp(),

            reviewedBy: {
              uid: administrator.uid,

              email:
                administrator.email ?? null,
            },

            updatedAt:
              FieldValue.serverTimestamp(),
          },
        );

        /*
         * Atualiza uma versão no veículo.
         *
         * Isso também ajuda a evitar que duas
         * aprovações simultâneas reservem o mesmo
         * veículo no mesmo período.
         */
        transaction.update(
          vehicleReference,
          {
            scheduleRevision:
              FieldValue.increment(1),

            scheduleUpdatedAt:
              FieldValue.serverTimestamp(),
          },
        );

        return {
          status: "approved" as const,

          scheduleId:
            scheduleReference.id,
        };
      },
    );

    return NextResponse.json(
      {
        success: true,

        status: result.status,

        scheduleId:
          result.scheduleId,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (
      error instanceof
      QuoteDecisionError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: error.status,
        },
      );
    }

    console.error(
      "Erro ao analisar orçamento:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Não foi possível registrar a decisão.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * Verifica a sessão administrativa.
 */
async function getAdministrator() {
  try {
    const cookieStore =
      await cookies();

    const sessionCookie =
      cookieStore.get(
        "transtoledo_session",
      )?.value;

    if (!sessionCookie) {
      return null;
    }

    return await adminAuth
      .verifySessionCookie(
        sessionCookie,
        true,
      );
  } catch {
    return null;
  }
}

/*
 * Resposta utilizada quando a sessão
 * administrativa é inválida.
 */
function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Sessão administrativa inválida.",
    },
    {
      status: 401,
    },
  );
}

/*
 * Normaliza o status do orçamento.
 */
function readStatus(
  value: unknown,
): QuoteRequestStatus {
  if (
    value === "approved" ||
    value === "rejected"
  ) {
    return value;
  }

  return "pending";
}

/*
 * Converte Timestamp do Firestore para
 * uma data JavaScript.
 */
function readFirestoreDate(
  value: unknown,
): Date | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    const date = (
      value as {
        toDate: () => Date;
      }
    ).toDate();

    if (
      date instanceof Date &&
      !Number.isNaN(
        date.getTime(),
      )
    ) {
      return date;
    }
  }

  if (
    value instanceof Date &&
    !Number.isNaN(
      value.getTime(),
    )
  ) {
    return value;
  }

  return null;
}

/*
 * Converte Timestamp do Firestore para ISO.
 */
function toIsoString(
  value: unknown,
  nullable = false,
): string | null {
  const date =
    readFirestoreDate(value);

  if (date) {
    return date.toISOString();
  }

  return nullable ? null : "";
}

/*
 * Erro controlado de aprovação ou recusa.
 */
class QuoteDecisionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);

    this.name =
      "QuoteDecisionError";
  }
}