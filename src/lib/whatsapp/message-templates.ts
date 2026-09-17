import type {
  WhatsAppMessageTemplate,
} from "@/types/whatsapp-message";

export const whatsappMessageTemplates: WhatsAppMessageTemplate[] = [
  {
    key: "new_quote_admin",
    metaName: "novo_orcamento_admin",
    title: "Novo orçamento",
    description:
      "Avisa o responsável quando uma nova solicitação chega pelo site.",
    audience: "administrator",
    trigger: "Após o cliente enviar o orçamento",
    preview:
      "Olá! Um novo orçamento foi recebido de {{1}} para {{2}}. Saída prevista para {{3}}. Acesse o painel da TransToledo para analisar.",
    variables: ["Nome do cliente", "Destino", "Data de saída"],
    status: "approved",
  },
  {
    key: "quote_approved",
    metaName: "orcamento_aprovado",
    title: "Orçamento aprovado",
    description:
      "Confirma ao solicitante que o orçamento foi aprovado e a viagem agendada.",
    audience: "customer",
    trigger: "Quando o administrador aprovar",
    preview:
      "Olá, {{1}}! Seu orçamento para {{2}} foi aprovado. A viagem está confirmada para {{3}}, às {{4}}.",
    variables: [
      "Nome do cliente",
      "Destino",
      "Data da viagem",
      "Horário",
    ],
    status: "approved",
  },
  {
    key: "quote_rejected",
    metaName: "orcamento_rejeitado",
    title: "Orçamento não aprovado",
    description:
      "Informa ao solicitante que o pedido não foi aprovado e apresenta a orientação definida pela empresa.",
    audience: "customer",
    trigger: "Quando o administrador recusar",
    preview:
      "Olá, {{1}}. No momento, não foi possível aprovar seu orçamento para {{2}}. Motivo: {{3}}. Se precisar, fale com a TransToledo.",
    variables: ["Nome do cliente", "Destino", "Motivo"],
    status: "approved",
  },
  {
    key: "trip_reminder_5h",
    metaName: "lembrete_viagem_5h",
    title: "Lembrete da viagem",
    description:
      "Lembra o solicitante cinco horas antes do início de uma viagem confirmada.",
    audience: "customer",
    trigger: "Cinco horas antes da saída",
    preview:
      "Olá, {{1}}! Sua viagem com a TransToledo começa hoje às {{2}}. Faltam aproximadamente 5 horas. Local de saída: {{3}}.",
    variables: ["Nome do cliente", "Horário", "Local de saída"],
    status: "approved",
  },
];