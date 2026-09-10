import {
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";

import {
  NextResponse,
} from "next/server";

import {
  adminDb,
} from "@/lib/firebase/admin";

import {
  hashVerificationValue,
  normalizeBrazilianPhone,
  verifyPhoneVerificationToken,
} from "@/lib/phone-verification";

export const dynamic =
  "force-dynamic";

type QuoteRequestBody = {
  vehicleId?: unknown;

  startsAt?: unknown;
  endsAt?: unknown;

  tripMode?: unknown;
  frequentTripId?: unknown;
  tripName?: unknown;

  origin?: unknown;
  originLatitude?: unknown;
  originLongitude?: unknown;

  destination?: unknown;
  destinationLatitude?: unknown;
  destinationLongitude?: unknown;

  passengers?: unknown;
  notes?: unknown;

  name?: unknown;
  email?: unknown;
  phone?: unknown;

  phoneVerificationToken?: unknown;
};

/*
 * POST
 *
 * Recebe uma nova solicitação de
 * orçamento enviada pelo cliente.
 *
 * A solicitação é salva como pendente.
 * Ela somente ocupará a agenda depois
 * da aprovação administrativa.
 */
export async function POST(
  request: Request,
) {
  try {
    let body: QuoteRequestBody;

    /*
     * Trata separadamente erros no JSON
     * enviado pelo cliente.
     */
    try {
      body =
        (await request.json()) as
          QuoteRequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "O corpo da solicitação é inválido.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Valida os tipos dos campos
     * obrigatórios.
     */
    if (
      typeof body.vehicleId !== "string" ||
      typeof body.startsAt !== "string" ||
      typeof body.endsAt !== "string" ||
      (
        body.tripMode !== "registered" &&
        body.tripMode !== "custom"
      ) ||
      (
        body.frequentTripId !== undefined &&
        body.frequentTripId !== null &&
        typeof body.frequentTripId !== "string"
      ) ||
      typeof body.tripName !== "string" ||
      typeof body.origin !== "string" ||
      typeof body.destination !== "string" ||
      typeof body.passengers !== "number" ||
      (
        body.notes !== undefined &&
        body.notes !== null &&
        typeof body.notes !== "string"
      ) ||
      typeof body.name !== "string" ||
      typeof body.email !== "string" ||
      typeof body.phone !== "string" ||
      typeof body.phoneVerificationToken !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Dados da solicitação incompletos.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Normaliza os valores recebidos.
     */
    const vehicleId =
      body.vehicleId.trim();

    const startsAt =
      new Date(body.startsAt);

    const endsAt =
      new Date(body.endsAt);

    const tripMode:
      | "registered"
      | "custom" =
      body.tripMode;

    const frequentTripId =
      typeof body.frequentTripId === "string"
        ? body.frequentTripId.trim()
        : "";

    const tripName =
      body.tripName.trim();

    const origin =
      body.origin.trim();

    const destination =
      body.destination.trim();

    const passengers =
      body.passengers;

    const notes =
      typeof body.notes === "string"
        ? body.notes.trim()
        : "";

    const name =
      body.name.trim();

    const email =
      body.email
        .trim()
        .toLowerCase();

    const phone =
      normalizeBrazilianPhone(
        body.phone,
      );

    const phoneVerificationToken =
      body.phoneVerificationToken.trim();

    const originLatitude =
      readCoordinate(
        body.originLatitude,
        -90,
        90,
      );

    const originLongitude =
      readCoordinate(
        body.originLongitude,
        -180,
        180,
      );

    const destinationLatitude =
      readCoordinate(
        body.destinationLatitude,
        -90,
        90,
      );

    const destinationLongitude =
      readCoordinate(
        body.destinationLongitude,
        -180,
        180,
      );

    /*
     * Valida o identificador do veículo.
     */
    if (
      !vehicleId ||
      vehicleId.length > 128
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "O veículo selecionado é inválido.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Valida as datas da solicitação.
     */
    const now =
      new Date();

    if (
      Number.isNaN(
        startsAt.getTime(),
      ) ||
      Number.isNaN(
        endsAt.getTime(),
      ) ||
      startsAt >= endsAt ||
      startsAt <= now
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Confira o período solicitado.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Valida as informações gerais
     * da viagem.
     */
    if (
      !tripName ||
      tripName.length > 160 ||
      !origin ||
      origin.length > 500 ||
      !destination ||
      destination.length > 500 ||
      originLatitude === null ||
      originLongitude === null ||
      destinationLatitude === null ||
      destinationLongitude === null ||
      !Number.isInteger(passengers) ||
      passengers < 1 ||
      passengers > 100 ||
      notes.length > 1500
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Confira as informações da viagem.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Uma viagem cadastrada precisa possuir
     * o identificador da viagem.
     */
    if (
      tripMode === "registered" &&
      (
        !frequentTripId ||
        frequentTripId.length > 128
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A viagem selecionada é inválida.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Uma viagem personalizada não deve
     * possuir um frequentTripId.
     */
    if (
      tripMode === "custom" &&
      frequentTripId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Os dados da viagem personalizada são inválidos.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Valida as informações do cliente.
     */
    if (
      name.length < 3 ||
      name.length > 120 ||
      email.length > 160 ||
      !isValidEmail(email) ||
      !phone
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Confira suas informações de contato.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Valida o tamanho do token antes de
     * executar sua verificação.
     */
    if (
      !phoneVerificationToken ||
      phoneVerificationToken.length > 2048
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A confirmação do telefone é inválida ou expirou.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * Confirma que o telefone foi
     * validado pelo WhatsApp.
     */
    if (
      !verifyPhoneVerificationToken(
        phoneVerificationToken,
        phone,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A confirmação do telefone é inválida ou expirou.",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * Cria previamente a referência do
     * novo orçamento.
     */
    const quoteReference =
      adminDb
        .collection(
          "quoteRequests",
        )
        .doc();

    /*
     * O hash do token será utilizado como
     * identificador para impedir reutilização.
     */
    const consumedTokenReference =
      adminDb
        .collection(
          "consumedPhoneVerificationTokens",
        )
        .doc(
          hashVerificationValue(
            phoneVerificationToken,
          ),
        );

    const vehicleReference =
      adminDb
        .collection(
          "vehicles",
        )
        .doc(
          vehicleId,
        );

    /*
     * Consulta os agendamentos associados
     * ao veículo.
     *
     * O conflito será filtrado dentro da
     * transação considerando:
     *
     * status active
     * type booking ou blocked
     */
    const schedulesQuery =
      adminDb
        .collection(
          "vehicleSchedules",
        )
        .where(
          "vehicleId",
          "==",
          vehicleId,
        );

    /*
     * Quando for uma viagem cadastrada,
     * também será validada a existência
     * dela no Firestore.
     */
    const frequentTripReference =
      tripMode === "registered"
        ? adminDb
            .collection(
              "frequentTrips",
            )
            .doc(
              frequentTripId,
            )
        : null;

    /*
     * A criação ocorre dentro de uma
     * transação.
     *
     * Desse modo, a verificação do token,
     * veículo, viagem e disponibilidade
     * acontece junto com a gravação.
     */
    await adminDb.runTransaction(
      async (transaction) => {
        /*
         * Todas as leituras são realizadas
         * antes das gravações.
         */
        const consumedTokenPromise =
          transaction.get(
            consumedTokenReference,
          );

        const vehiclePromise =
          transaction.get(
            vehicleReference,
          );

        const schedulesPromise =
          transaction.get(
            schedulesQuery,
          );

        const frequentTripPromise =
          frequentTripReference
            ? transaction.get(
                frequentTripReference,
              )
            : Promise.resolve(null);

        const [
          consumedTokenSnapshot,
          vehicleSnapshot,
          schedulesSnapshot,
          frequentTripSnapshot,
        ] = await Promise.all([
          consumedTokenPromise,
          vehiclePromise,
          schedulesPromise,
          frequentTripPromise,
        ]);

        /*
         * O mesmo token de confirmação
         * não pode ser utilizado novamente.
         */
        if (
          consumedTokenSnapshot.exists
        ) {
          throw new QuoteRequestError(
            "Esta confirmação já foi utilizada.",
            409,
          );
        }

        /*
         * Confirma que o veículo existe.
         */
        if (!vehicleSnapshot.exists) {
          throw new QuoteRequestError(
            "O veículo selecionado não foi encontrado.",
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
          throw new QuoteRequestError(
            "O veículo não está mais disponível.",
            409,
          );
        }

        /*
         * Confirma que a quantidade de
         * passageiros cabe no veículo.
         *
         * O fallback para capacity mantém
         * compatibilidade com veículos antigos.
         */
        const vehicleCapacity =
          Number(
            vehicleData?.passengerCapacity ??
            vehicleData?.capacity ??
            0,
          );

        if (
          !Number.isFinite(vehicleCapacity) ||
          vehicleCapacity < 1
        ) {
          throw new QuoteRequestError(
            "A capacidade do veículo não está configurada corretamente.",
            409,
          );
        }

        if (
          passengers > vehicleCapacity
        ) {
          throw new QuoteRequestError(
            "A quantidade de passageiros excede a capacidade do veículo.",
            400,
          );
        }

        /*
         * Confirma que a viagem cadastrada
         * existe e continua ativa.
         */
        if (
          tripMode === "registered" &&
          (
            !frequentTripSnapshot?.exists ||
            frequentTripSnapshot
              .data()
              ?.active !== true
          )
        ) {
          throw new QuoteRequestError(
            "A viagem selecionada não está mais disponível.",
            404,
          );
        }

        /*
         * Verifica se o período solicitado
         * atravessa algum agendamento ativo.
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
          throw new QuoteRequestError(
            "Este período acabou de ficar indisponível. Escolha outro horário.",
            409,
          );
        }

        /*
         * Para uma viagem cadastrada,
         * utiliza o nome salvo no banco.
         */
        const savedTripName =
          tripMode === "registered"
            ? String(
                frequentTripSnapshot
                  ?.data()
                  ?.name ??
                  tripName,
              )
            : tripName;

        /*
         * Utiliza primeiro model e depois name
         * para manter compatibilidade com os
         * documentos existentes de veículos.
         */
        const vehicleName =
          String(
            vehicleData?.model ??
            vehicleData?.name ??
            "Veículo",
          );

        /*
         * Salva a solicitação como pendente.
         *
         * Nenhum documento é criado em
         * vehicleSchedules nesta etapa.
         */
        transaction.create(
          quoteReference,
          {
            vehicleId,
            vehicleName,

            customer: {
              name,
              email,
              phone,
            },

            trip: {
              mode: tripMode,

              frequentTripId:
                tripMode === "registered"
                  ? frequentTripId
                  : null,

              name:
                savedTripName,

              origin: {
                address:
                  origin,

                latitude:
                  originLatitude,

                longitude:
                  originLongitude,
              },

              destination: {
                address:
                  destination,

                latitude:
                  destinationLatitude,

                longitude:
                  destinationLongitude,
              },

              passengers,
              notes,
            },

            startsAt:
              Timestamp.fromDate(
                startsAt,
              ),

            endsAt:
              Timestamp.fromDate(
                endsAt,
              ),

            status:
              "pending",

            source:
              "quote_wizard",

            /*
             * Estes campos somente serão
             * preenchidos após a aprovação.
             */
            scheduleId:
              null,

            scheduledAt:
              null,

            rejectionReason:
              null,

            reviewedAt:
              null,

            reviewedBy:
              null,

            phoneVerifiedAt:
              FieldValue.serverTimestamp(),

            createdAt:
              FieldValue.serverTimestamp(),

            updatedAt:
              FieldValue.serverTimestamp(),
          },
        );

        /*
         * Marca o token como utilizado.
         */
        transaction.create(
          consumedTokenReference,
          {
            quoteRequestId:
              quoteReference.id,

            phone,

            createdAt:
              FieldValue.serverTimestamp(),

            /*
             * Este documento pode ser removido
             * automaticamente no futuro usando
             * TTL do Firestore.
             */
            expiresAt:
              Timestamp.fromMillis(
                Date.now() +
                  24 *
                  60 *
                  60 *
                  1000,
              ),
          },
        );
      },
    );

    return NextResponse.json(
      {
        success: true,

        quoteRequestId:
          quoteReference.id,
      },
      {
        status: 201,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    if (
      error instanceof
      QuoteRequestError
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            error.message,
        },
        {
          status:
            error.status,
        },
      );
    }

    console.error(
      "Erro ao criar solicitação de orçamento:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Não foi possível salvar a solicitação.",
      },
      {
        status: 500,
      },
    );
  }
}

/*
 * Valida uma latitude ou longitude.
 */
function readCoordinate(
  value: unknown,
  minimum: number,
  maximum: number,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    return null;
  }

  return value;
}

/*
 * Converte um Timestamp do Firestore
 * para Date.
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
 * Validação simples de e-mail.
 */
function isValidEmail(
  email: string,
): boolean {
  return (
    email.length <= 160 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email,
    )
  );
}

/*
 * Erro controlado da criação
 * da solicitação.
 */
class QuoteRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);

    this.name =
      "QuoteRequestError";
  }
}