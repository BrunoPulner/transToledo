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
   * Impede parâmetros muito grandes
   * ou claramente inválidos.
   */
  if (vehicleId.length > 128) {
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
     * e está ativo.
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
      vehicleData?.status !==
      "active"
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
     * Consulta os registros da agenda
     * vinculados ao veículo.
     *
     * O filtro principal utiliza apenas
     * vehicleId para evitar a necessidade
     * de vários índices compostos.
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

    const now = new Date();

    const busyPeriods:
  PublicBusyPeriod[] =
    schedulesSnapshot.docs
    .map((document) => {
      const schedule =
        document.data();

      const startsAt =
        schedule.startsAt
          ?.toDate?.();

      const endsAt =
        schedule.endsAt
          ?.toDate?.();

      return {
        type:
          schedule.type,

        status:
          schedule.status,

        startsAt:
          startsAt instanceof Date
            ? startsAt
            : null,

        endsAt:
          endsAt instanceof Date
            ? endsAt
            : null,
      };
    })

    /*
     * Somente viagens confirmadas
     * e bloqueios ativos.
     */
    .filter(
      (schedule) =>
        schedule.status ===
          "active" &&
        (schedule.type ===
          "booking" ||
          schedule.type ===
            "blocked"),
    )

    /*
     * Confirma que as datas
     * foram carregadas corretamente.
     */
    .filter(
      (
        schedule,
      ): schedule is {
        type:
          | "booking"
          | "blocked";

        status: "active";

        startsAt: Date;
        endsAt: Date;
      } =>
        schedule.startsAt instanceof
  Date &&
schedule.endsAt instanceof
  Date &&
schedule.endsAt > now,
    )

    /*
     * Ordena os períodos.
     */
    .sort(
      (
        firstSchedule,
        secondSchedule,
      ) =>
        firstSchedule.startsAt.getTime() -
        secondSchedule.startsAt.getTime(),
    )

    /*
     * Resposta pública.
     */
    .map((schedule) => ({
      startsAt:
        schedule.startsAt.toISOString(),

      endsAt:
        schedule.endsAt.toISOString(),

      type:
        schedule.type,
    }));

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
      },
    );
  }
}