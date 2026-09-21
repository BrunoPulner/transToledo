"use client";

import {
  BusFront,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Route,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  QuoteRequestRecord,
  QuoteRequestStatus,
} from "@/types/quote-request";

type Filter = "all" | QuoteRequestStatus;

const statusDetails = {
  pending: { label: "Aguardando análise", className: "border-amber-400/30 bg-amber-400/15 text-amber-200", card: "border-amber-400/25 hover:border-amber-400/60", stripe: "bg-amber-400" },
  approved: { label: "Viagem aprovada", className: "border-emerald-400/30 bg-emerald-400/15 text-emerald-200", card: "border-emerald-400/25 hover:border-emerald-400/60", stripe: "bg-emerald-400" },
  rejected: { label: "Orçamento recusado", className: "border-rose-400/30 bg-rose-400/15 text-rose-200", card: "border-rose-400/25 hover:border-rose-400/60", stripe: "bg-rose-400" },
  cancelled: { label: "Viagem cancelada", className: "border-slate-400/30 bg-slate-400/15 text-slate-200", card: "border-slate-400/25 hover:border-slate-400/60", stripe: "bg-slate-400" },
} satisfies Record<QuoteRequestStatus, { label: string; className: string; card: string; stripe: string }>;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function QuoteRequestsPage() {
  const [requests, setRequests] = useState<QuoteRequestRecord[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<Filter>("pending");
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequestRecord | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected" | "cancelled" | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/quote-requests", { cache: "no-store" });
      const result = (await response.json()) as {
        success?: boolean;
        requests?: QuoteRequestRecord[];
        message?: string;
      };
      if (!response.ok || !result.success || !result.requests) {
        throw new Error(result.message ?? "Não foi possível carregar os orçamentos.");
      }
      setRequests(result.requests);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os orçamentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRequests();
  }, [loadRequests]);

  const counts = useMemo(() => ({
    all: requests.length,
    pending: requests.filter((item) => item.status === "pending").length,
    approved: requests.filter((item) => item.status === "approved").length,
    rejected: requests.filter((item) => item.status === "rejected").length,
    cancelled: requests.filter((item) => item.status === "cancelled").length,
  }), [requests]);

  const filteredRequests = useMemo(
    () => selectedFilter === "all"
      ? [...requests].sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"))
      : requests.filter((item) => item.status === selectedFilter),
    [requests, selectedFilter],
  );

  async function registerDecision() {
    if (!selectedRequest || !decision || updating) return;
    if (decision !== "approved" && reason.trim().length < 3) return;

    setUpdating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/quote-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteRequestId: selectedRequest.id,
          decision,
          rejectionReason: decision === "rejected" ? reason.trim() : undefined,
          cancellationReason: decision === "cancelled" ? reason.trim() : undefined,
        }),
      });
      const result = (await response.json()) as { success?: boolean; message?: string; status?: QuoteRequestStatus; scheduleId?: string | null };
      if (!response.ok || !result.success || result.status !== decision) {
        throw new Error(result.message ?? "Não foi possível registrar a decisão.");
      }

      const updated: QuoteRequestRecord = {
        ...selectedRequest,
        status: decision,
        scheduleId: result.scheduleId ?? selectedRequest.scheduleId,
        rejectionReason: decision === "rejected" ? reason.trim() : selectedRequest.rejectionReason,
        cancellationReason: decision === "cancelled" ? reason.trim() : selectedRequest.cancellationReason,
        cancelledAt: decision === "cancelled" ? new Date().toISOString() : selectedRequest.cancelledAt,
        reviewedAt: decision === "cancelled" ? selectedRequest.reviewedAt : new Date().toISOString(),
      };

      setRequests((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSelectedRequest(updated);
      setDecision(null);
      setReason("");
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : "Não foi possível registrar a decisão.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="px-5 pb-10 pt-26 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-400">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3"><span className="h-px w-10 bg-yellow-400" /><span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">Administração</span></div>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Orçamentos</h1>
            <p className="mt-2 text-sm text-white/50">Acompanhe solicitações, viagens aprovadas e cancelamentos.</p>
          </div>
          <button type="button" onClick={() => void loadRequests()} disabled={loading} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-white/65 transition hover:border-yellow-400/30 hover:text-yellow-400 disabled:opacity-50">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Atualizar
          </button>
        </header>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Statistic title="Total" value={counts.all} icon={ClipboardList} />
          <Statistic title="Pendentes" value={counts.pending} icon={Clock3} tone="amber" />
          <Statistic title="Aprovados" value={counts.approved} icon={CheckCircle2} tone="emerald" />
          <Statistic title="Recusados" value={counts.rejected} icon={XCircle} tone="red" />
          <Statistic title="Cancelados" value={counts.cancelled} icon={XCircle} tone="slate" />
        </div>

        {error && <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

        <div className="mt-7 flex flex-wrap gap-2">
          {(["all", "pending", "approved", "rejected", "cancelled"] as const).map((filter) => (
            <button key={filter} type="button" aria-pressed={selectedFilter === filter} onClick={() => setSelectedFilter(filter)} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${selectedFilter === filter ? "border-yellow-400 bg-yellow-400 text-slate-950" : "border-white/10 bg-white/4 text-white/50 hover:text-white"}`}>
              {filter === "all" ? "Todos" : statusDetails[filter].label} ({counts[filter]})
            </button>
          ))}
        </div>

        <section className="mt-5">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/3"><LoaderCircle size={25} className="animate-spin text-yellow-400" /></div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/2 text-center"><ClipboardList size={32} className="text-white/15" /><p className="mt-3 text-sm text-white/40">Nenhum orçamento encontrado neste filtro.</p></div>
          ) : (
            <div className="space-y-2">
              {filteredRequests.map((quote) => <QuoteCard key={quote.id} quote={quote} onOpen={() => { setSelectedRequest(quote); setDecision(null); setReason(""); setError(""); }} />)}
            </div>
          )}
        </section>
      </div>

      {selectedRequest && (
        <QuoteDetails
          quote={selectedRequest}
          updating={updating}
          decision={decision}
          reason={reason}
          error={error}
          onClose={() => { if (!updating) { setSelectedRequest(null); setDecision(null); setError(""); } }}
          onChoose={(value) => { setDecision(value); setReason(""); setError(""); }}
          onBack={() => { setDecision(null); setReason(""); setError(""); }}
          onReasonChange={setReason}
          onConfirm={() => void registerDecision()}
        />
      )}
    </main>
  );
}

function QuoteCard({ quote, onOpen }: { quote: QuoteRequestRecord; onOpen: () => void }) {
  const detail = statusDetails[quote.status];
  return (
    <article className={`relative overflow-hidden rounded-2xl border bg-[#14171c] transition-colors ${detail.card}`}>
      <span className={`absolute inset-y-0 left-0 w-1 ${detail.stripe}`} />
      <div className="flex flex-col gap-4 p-4 pl-5 lg:flex-row lg:items-center lg:gap-6 lg:p-5 lg:pl-6">
        <div className="min-w-0 lg:w-56 lg:shrink-0">
          <StatusBadge status={quote.status} />
          <h2 className="mt-2 truncate text-base font-bold text-white">{quote.customer.name}</h2>
          <p className="mt-1 text-[11px] text-white/40">Solicitado em {formatDate(quote.createdAt)}</p>
        </div>
        <div className="grid min-w-0 flex-1 gap-3 text-xs sm:grid-cols-3">
          <SmallInfo icon={BusFront} label="Veículo" value={quote.vehicleName} />
          <SmallInfo icon={MapPin} label="Destino" value={quote.trip.destination.address} />
          <SmallInfo icon={CalendarDays} label="Saída" value={formatDate(quote.startsAt)} />
        </div>
        <button type="button" onClick={onOpen} aria-label={`Ver solicitação de ${quote.customer.name}`} className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-bold text-white/75 transition hover:border-yellow-400/50 hover:text-yellow-400">Ver detalhes <ChevronRight size={15} /></button>
      </div>
    </article>
  );
}

function QuoteDetails({ quote, updating, decision, reason, error, onClose, onChoose, onBack, onReasonChange, onConfirm }: {
  quote: QuoteRequestRecord; updating: boolean; decision: "approved" | "rejected" | "cancelled" | null; reason: string; error: string;
  onClose: () => void; onChoose: (decision: "approved" | "rejected" | "cancelled") => void; onBack: () => void;
  onReasonChange: (value: string) => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-label={`Solicitação de ${quote.customer.name}`} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#11151b] shadow-2xl sm:max-w-3xl sm:rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-white/10 bg-[#11151b]/95 px-5 py-4 backdrop-blur-xl sm:px-6"><div><StatusBadge status={quote.status} /><h2 className="mt-2 text-xl font-bold">Solicitação de {quote.customer.name}</h2><p className="mt-1 font-mono text-[10px] text-white/30">{quote.id}</p></div><button type="button" onClick={onClose} disabled={updating} aria-label="Fechar detalhes" className="flex size-9 items-center justify-center rounded-xl border border-white/10 text-white/50 disabled:opacity-50"><X size={17} /></button></header>

        <div className="space-y-5 p-5 sm:p-6">
          <DetailSection title="Cliente" icon={UserRound}><DetailGrid><SmallInfo icon={UserRound} label="Nome" value={quote.customer.name} /><SmallInfo icon={Mail} label="E-mail" value={quote.customer.email} /><SmallInfo icon={Phone} label="WhatsApp" value={quote.customer.phone} /></DetailGrid></DetailSection>
          <DetailSection title="Veículo e período" icon={BusFront}><DetailGrid><SmallInfo icon={BusFront} label="Veículo" value={quote.vehicleName} /><SmallInfo icon={CalendarDays} label="Saída" value={formatDate(quote.startsAt)} /><SmallInfo icon={CalendarDays} label="Retorno" value={formatDate(quote.endsAt)} /></DetailGrid></DetailSection>
          <DetailSection title="Viagem" icon={Route}><div className="grid gap-3 sm:grid-cols-2"><SmallInfo icon={Route} label="Tipo" value={quote.trip.mode === "registered" ? quote.trip.name : "Destino personalizado"} /><SmallInfo icon={UsersRound} label="Passageiros" value={String(quote.trip.passengers)} /><SmallInfo icon={MapPin} label="Local de saída" value={quote.trip.origin.address} /><SmallInfo icon={MapPin} label="Destino" value={quote.trip.destination.address} /></div>{quote.trip.notes && <p className="mt-3 rounded-xl border border-white/8 bg-black/15 p-3 text-xs leading-5 text-white/55"><strong className="text-white/75">Observações:</strong> {quote.trip.notes}</p>}</DetailSection>

          {quote.rejectionReason && <div className="rounded-xl border border-red-400/20 bg-red-400/8 p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-red-300">Motivo da recusa</p><p className="mt-2 text-xs leading-5 text-red-100/65">{quote.rejectionReason}</p></div>}

          {quote.cancellationReason && <div className="rounded-xl border border-slate-400/20 bg-slate-400/8 p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-slate-300">Motivo do cancelamento</p><p className="mt-2 text-xs leading-5 text-white/70">{quote.cancellationReason}</p></div>}

          {quote.status === "cancelled" && quote.cancellationReason && (
            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-200">Avisar o cliente</p>
                <p className="mt-1 text-xs leading-5 text-white/50">A mensagem será aberta preenchida no WhatsApp para você revisar e enviar.</p>
              </div>
              <a href={createCancellationWhatsAppUrl(quote)} target="_blank" rel="noopener noreferrer" className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-xs font-bold text-black transition hover:bg-emerald-400">
                <MessageCircle size={16} />
                Avisar pelo WhatsApp
              </a>
            </div>
          )}
          {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

          {!decision && quote.status === "pending" && (
            <div className="border-t border-white/10 pt-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => onChoose("rejected")} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-5 text-xs font-bold text-rose-200"><XCircle size={16} />Recusar</button><button type="button" onClick={() => onChoose("approved")} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-xs font-bold text-black"><CheckCircle2 size={16} />Aprovar orçamento</button></div>
            </div>
          )}
          {!decision && quote.status === "approved" && (
            <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-white/50">Cancelar libera o veículo na agenda e registra o motivo.</p><button type="button" onClick={() => onChoose("cancelled")} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-5 text-xs font-bold text-rose-200"><XCircle size={16} />Cancelar viagem</button></div>
          )}
          {decision && (
            <div className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-5">
              <h3 className="text-base font-bold">Confirmar {decision === "approved" ? "aprovação" : decision === "rejected" ? "recusa" : "cancelamento"}?</h3>
              <p className="mt-2 text-xs leading-5 text-white/55">{decision === "approved" ? "A viagem será confirmada e reservada na agenda." : decision === "cancelled" ? "A reserva será cancelada e o veículo ficará disponível novamente." : "O orçamento será recusado com o motivo informado abaixo."}</p>
              {decision !== "approved" && <div className="mt-4"><label htmlFor="quote-reason" className="text-xs font-bold text-white/75">Motivo obrigatório</label><textarea id="quote-reason" autoFocus value={reason} onChange={(event) => onReasonChange(event.target.value)} maxLength={500} rows={3} placeholder="Descreva o motivo para o cliente" className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-black/25 p-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-yellow-400/60" /><p className="text-right text-[10px] text-white/40">{reason.length}/500</p></div>}
              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onBack} disabled={updating} className="h-10 rounded-xl border border-white/15 px-4 text-xs font-bold text-white/65 disabled:opacity-50">Voltar</button><button type="button" onClick={onConfirm} disabled={updating || (decision !== "approved" && reason.trim().length < 3)} className={`flex h-10 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold disabled:opacity-40 ${decision === "approved" ? "bg-emerald-500 text-black" : "bg-rose-500 text-white"}`}>{updating && <LoaderCircle size={15} className="animate-spin" />} Confirmar {decision === "approved" ? "aprovação" : decision === "rejected" ? "recusa" : "cancelamento"}</button></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Statistic({ title, value, icon: Icon, tone = "default" }: { title: string; value: number; icon: typeof ClipboardList; tone?: "default" | "amber" | "emerald" | "red" | "slate" }) {
  const tones = { default: "border-yellow-400/20 bg-yellow-400/5 text-yellow-400", amber: "border-amber-400/25 bg-amber-400/8 text-amber-300", emerald: "border-emerald-400/25 bg-emerald-400/8 text-emerald-300", red: "border-rose-400/25 bg-rose-400/8 text-rose-300", slate: "border-slate-400/25 bg-slate-400/8 text-slate-300" };
  return <article className={`rounded-2xl border p-4 ${tones[tone]}`}><Icon size={19} /><p className="mt-4 text-xs text-white/55">{title}</p><p className="mt-1 text-2xl font-bold text-white">{value}</p></article>;
}

function StatusBadge({ status }: { status: QuoteRequestStatus }) {
  const detail = statusDetails[status];
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${detail.className}`}>{detail.label}</span>;
}

function DetailSection({ title, icon: Icon, children }: { title: string; icon: typeof Route; children: React.ReactNode }) {
  return <section><div className="mb-3 flex items-center gap-2"><Icon size={16} className="text-yellow-400" /><h3 className="text-sm font-bold">{title}</h3></div>{children}</section>;
}

function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-3">{children}</div>;
}

function SmallInfo({ icon: Icon, label, value }: { icon: typeof BusFront; label: string; value: string }) {
  return <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-white/8 bg-black/15 p-3"><Icon size={14} className="mt-0.5 shrink-0 text-yellow-400" /><div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-wider text-white/30">{label}</p><p className="mt-1 line-clamp-2 wrap-break-word text-[11px] font-semibold leading-4 text-white/70">{value || "Não informado"}</p></div></div>;
}

function formatDate(value: string | null) {
  if (!value) return "Não informada";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Não informada" : dateFormatter.format(date);
}

function createCancellationWhatsAppUrl(
  quote: QuoteRequestRecord,
) {
  const phoneDigits =
    quote.customer.phone.replace(/\D/g, "");

  const recipient = phoneDigits.startsWith("55")
    ? phoneDigits
    : `55${phoneDigits}`;

  const message = [
    `Olá, ${quote.customer.name}.`,
    "",
    "Informamos que a sua viagem com a TransToledo foi cancelada.",
    `Motivo: ${quote.cancellationReason ?? "Entre em contato conosco para mais informações."}`,
    "",
    "Sentimos muito pelo ocorrido. Entre em contato conosco para que possamos orientar você e verificar as alternativas disponíveis.",
  ].join("\n");

  return `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
}
