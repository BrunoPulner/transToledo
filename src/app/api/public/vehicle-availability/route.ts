import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  adminDb,
} from "@/lib/firebase/admin";

export const dynamic =
  "force-dynamic";

type PublicBusyPeriod = {
  startsAt: string;
  endsAt: string;
  type: "booking" | "blocked";
};

/*
 * GET
 *
 * Retorna os períodos ocupados
 * de um veículo.
 *
 * /api/public/vehicle-availability
 * ?vehicleId=ID_DO_VEICULO
 */
export async function GET(
  request: NextRequest,
) {
  const vehicleId =
    request.nextUrl.searchParams
      .get("vehicleId")
      ?.trim();

  /*
   * Validação do identificador.
   */
  if (!vehicleId) {
    return NextResponse.json(
      {
        success: false,
        message:
          "O veículo não foi informado.",
      },
      {
        status: 400,
      },
    );
  }

  /*
   * IDs de documentos do Firestore
   * não podem conter barras.
   */
  if (
    vehicleId.length > 128 ||
    vehicleId.includes("/")
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Identificador de veículo inválido.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    /*
     * Confirma que o veículo existe
     * e continua ativo.
     */
    const vehicleReference =
      adminDb
        .collection("vehicles")
        .doc(vehicleId);

    const vehicleSnapshot =
      await vehicleReference.get();

    if (!vehicleSnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Veículo não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const vehicleData =
      vehicleSnapshot.data();

    if (
      vehicleData?.status !== "active"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Veículo indisponível.",
        },
        {
          status: 404,
        },
      );
    }

    /*
     * Consulta os registros vinculados
     * ao veículo.
     *
     * O filtro utiliza apenas vehicleId
     * para não exigir um índice composto
     * adicional no Firestore.
     */
    const schedulesSnapshot =
      await adminDb
        .collection(
          "vehicleSchedules",
        )
        .where(
          "vehicleId",
          "==",
          vehicleId,
        )
        .get();

    const now =
      new Date();

    const busyPeriods:
      PublicBusyPeriod[] = [];

    /*
     * Filtra e normaliza os períodos
     * antes de enviá-los ao cliente.
     */
    for (
      const document
      of schedulesSnapshot.docs
    ) {
      const schedule =
        document.data();

      /*
       * Somente registros ativos
       * podem ocupar o calendário.
       */
      if (
        schedule.status !== "active"
      ) {
        continue;
      }

      /*
       * booking:
       * viagem confirmada.
       *
       * blocked:
       * bloqueio manual do veículo.
       */
      if (
        schedule.type !== "booking" &&
        schedule.type !== "blocked"
      ) {
        continue;
      }

      const startsAt =
        readFirestoreDate(
          schedule.startsAt,
        );

      const endsAt =
        readFirestoreDate(
          schedule.endsAt,
        );

      /*
       * Ignora registros com datas
       * ausentes ou inválidas.
       */
      if (
        !startsAt ||
        !endsAt ||
        startsAt >= endsAt
      ) {
        continue;
      }

      /*
       * Períodos totalmente encerrados
       * não precisam ser enviados para
       * o calendário público.
       */
      if (endsAt <= now) {
        continue;
      }

      busyPeriods.push({
        startsAt:
          startsAt.toISOString(),

        endsAt:
          endsAt.toISOString(),

        type:
          schedule.type,
      });
    }

    /*
     * Mantém os períodos ordenados
     * pela data de início.
     */
    busyPeriods.sort(
      (
        firstPeriod,
        secondPeriod,
      ) =>
        new Date(
          firstPeriod.startsAt,
        ).getTime() -
        new Date(
          secondPeriod.startsAt,
        ).getTime(),
    );

    /*
     * A resposta pública contém apenas
     * os dados necessários ao calendário.
     *
     * Dados do cliente, viagem e informações
     * administrativas não são expostos.
     */
    return NextResponse.json(
      {
        success: true,
        vehicleId,
        busyPeriods,
      },
      {
        status: 200,

        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",

          Pragma:
            "no-cache",

          Expires:
            "0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Erro ao consultar disponibilidade pública:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Não foi possível consultar a disponibilidade do veículo.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}

/*
 * Converte Timestamp do Firestore
 * para Date com validação.
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

  /*
   * Mantém compatibilidade caso algum
   * valor já esteja no formato Date.
   */
  if (
    value instanceof Date &&
    !Number.isNaN(
      value.getTime(),
    )
  ) {
    return value;
  }

  /*
   * Mantém compatibilidade caso algum
   * registro antigo esteja salvo em ISO.
   */
  if (
    typeof value === "string"
  ) {
    const date =
      new Date(value);

    if (
      !Number.isNaN(
        date.getTime(),
      )
    ) {
      return date;
    }
  }

  return null;
}