import {
  z,
} from "zod";

const timeRegex =
  /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Valida os horários semanais
 * de trabalho de um veículo.
 */
export const workingHoursSchema =
  z
    .object({
      vehicleId: z
        .string()
        .trim()
        .min(
          1,
          "Selecione um veículo.",
        ),

      weekday: z.coerce
        .number()
        .int()
        .min(
          0,
          "Dia da semana inválido.",
        )
        .max(
          6,
          "Dia da semana inválido.",
        ),

      enabled: z.boolean(),

      startsAt: z.string(),

      endsAt: z.string(),
    })
    .superRefine(
      (data, context) => {
        /*
         * Quando o dia estiver
         * desativado, os horários
         * podem ficar vazios.
         */
        if (!data.enabled) {
          return;
        }

        if (
          !timeRegex.test(
            data.startsAt,
          )
        ) {
          context.addIssue({
            code:
              "custom",
            path: ["startsAt"],
            message:
              "Informe um horário inicial válido.",
          });
        }

        if (
          !timeRegex.test(
            data.endsAt,
          )
        ) {
          context.addIssue({
            code:
              "custom",
            path: ["endsAt"],
            message:
              "Informe um horário final válido.",
          });
        }

        /*
         * Só compara os horários
         * quando ambos são válidos.
         */
        if (
          timeRegex.test(
            data.startsAt,
          ) &&
          timeRegex.test(
            data.endsAt,
          ) &&
          data.startsAt >=
            data.endsAt
        ) {
          context.addIssue({
            code:
              "custom",
            path: ["endsAt"],
            message:
              "O horário final deve ser posterior ao horário inicial.",
          });
        }
      },
    );

/**
 * Valida reservas e bloqueios
 * específicos da agenda.
 */
export const scheduleSchema =
  z
    .object({
      vehicleId: z
        .string()
        .trim()
        .min(
          1,
          "Selecione um veículo.",
        ),

      type: z.enum([
        "booking",
        "blocked",
      ]),

      source: z.enum([
        "manual",
        "approved_quote",
      ]),

      status: z
        .enum([
          "active",
          "cancelled",
        ])
        .default("active"),

      title: z
        .string()
        .trim()
        .min(
          3,
          "O título deve possuir pelo menos 3 caracteres.",
        )
        .max(
          100,
          "O título deve possuir no máximo 100 caracteres.",
        ),

      notes: z
        .string()
        .trim()
        .max(
          500,
          "As observações devem possuir no máximo 500 caracteres.",
        )
        .optional()
        .or(
          z.literal(""),
        ),

      startsAt:
        z.coerce.date({
          error:
            "Informe uma data inicial válida.",
        }),

      endsAt:
        z.coerce.date({
          error:
            "Informe uma data final válida.",
        }),

      quoteId: z
        .string()
        .trim()
        .optional(),

      tripId: z
        .string()
        .trim()
        .optional(),
    })
    .superRefine(
      (data, context) => {
        if (
          data.startsAt >=
          data.endsAt
        ) {
          context.addIssue({
            code:
              "custom",
            path: ["endsAt"],
            message:
              "A data final deve ser posterior à data inicial.",
          });
        }

        /*
         * Uma viagem confirmada deve
         * obrigatoriamente vir de um
         * orçamento aprovado.
         */
        if (
          data.type ===
            "booking" &&
          data.source !==
            "approved_quote"
        ) {
          context.addIssue({
            code:
              "custom",
            path: ["source"],
            message:
              "Uma viagem confirmada deve vir de um orçamento aprovado.",
          });
        }

        if (
          data.type ===
            "booking" &&
          !data.quoteId
        ) {
          context.addIssue({
            code:
              "custom",
            path: ["quoteId"],
            message:
              "A viagem confirmada precisa estar vinculada a um orçamento.",
          });
        }

        if (
          data.type ===
            "booking" &&
          !data.tripId
        ) {
          context.addIssue({
            code:
              "custom",
            path: ["tripId"],
            message:
              "A viagem confirmada precisa estar vinculada a uma viagem.",
          });
        }

        /*
         * Bloqueios são cadastrados
         * manualmente pelo administrador.
         */
        if (
          data.type ===
            "blocked" &&
          data.source !== "manual"
        ) {
          context.addIssue({
            code:
              "custom",
            path: ["source"],
            message:
              "Um bloqueio deve possuir origem manual.",
          });
        }
      },
    );

/**
 * Schema específico para o
 * formulário de bloqueio.
 */
export const blockedScheduleSchema =
  scheduleSchema.safeExtend({
    type:
      z.literal("blocked"),

    source:
      z.literal("manual"),

    title: z
      .string()
      .trim()
      .min(
        3,
        "Informe o motivo do bloqueio.",
      )
      .max(
        100,
        "O motivo deve possuir no máximo 100 caracteres.",
      ),
  });

export type WorkingHoursFormData =
  z.infer<
    typeof workingHoursSchema
  >;

export type ScheduleFormData =
  z.infer<
    typeof scheduleSchema
  >;

export type BlockedScheduleFormData =
  z.infer<
    typeof blockedScheduleSchema
  >;