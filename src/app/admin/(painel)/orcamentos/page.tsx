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
  pending: { label: "Pendente", className: "border-amber-400/20 bg-amber-400/10 text-amber-300" },
  approved: { label: "Aprovado", className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" },
  rejected: { label: "Recusado", className: "border-red-400/20 bg-red-400/10 text-red-300" },
} satisfies Record<QuoteRequestStatus, { label: string; className: string }>;

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
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
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
  }), [requests]);

  const filteredRequests = useMemo(
    () => selectedFilter === "all" ? requests : requests.filter((item) => item.status === selectedFilter),
    [requests, selectedFilter],
  );

  async function registerDecision(decision: "approved" | "rejected") {
    if (!selectedRequest || updating) return;
    if (decision === "approved" && !window.confirm("Deseja aprovar esta solicitação de orçamento?")) return;

    setUpdating(true);
    setError("");
    try {
      const response = await fetch("/api/admin/quote-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteRequestId: selectedRequest.id,
          decision,
          rejectionReason,
        }),
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message ?? "Não foi possível registrar a decisão.");
      }

      const updated = {
        ...selectedRequest,
        status: decision,
        rejectionReason: decision === "rejected" ? rejectionReason.trim() : null,
        reviewedAt: new Date().toISOString(),
      } satisfies QuoteRequestRecord;

      setRequests((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSelectedRequest(updated);
      setRejectionOpen(false);
      setRejectionReason("");
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
            <p className="mt-2 text-sm text-white/50">Analise as solicitações enviadas pelos clientes.</p>
          </div>
          <button type="button" onClick={() => void loadRequests()} disabled={loading} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-white/65 transition hover:border-yellow-400/30 hover:text-yellow-400 disabled:opacity-50">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Atualizar
          </button>
        </header>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Statistic title="Total" value={counts.all} icon={ClipboardList} />
          <Statistic title="Pendentes" value={counts.pending} icon={Clock3} tone="amber" />
          <Statistic title="Aprovados" value={counts.approved} icon={CheckCircle2} tone="emerald" />
          <Statistic title="Recusados" value={counts.rejected} icon={XCircle} tone="red" />
        </div>

        {error && <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</p>}

        <div className="mt-7 flex flex-wrap gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((filter) => (
            <button key={filter} type="button" onClick={() => setSelectedFilter(filter)} className={`rounded-full border px-4 py-2 text-xs font-bold transition ${selectedFilter === filter ? "border-yellow-400 bg-yellow-400 text-slate-950" : "border-white/10 bg-white/4 text-white/50 hover:text-white"}`}>
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
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredRequests.map((quote) => <QuoteCard key={quote.id} quote={quote} onOpen={() => { setSelectedRequest(quote); setRejectionOpen(false); setRejectionReason(""); }} />)}
            </div>
          )}
        </section>
      </div>

      {selectedRequest && (
        <QuoteDetails
          quote={selectedRequest}
          updating={updating}
          rejectionOpen={rejectionOpen}
          rejectionReason={rejectionReason}
          onClose={() => setSelectedRequest(null)}
          onApprove={() => void registerDecision("approved")}
          onOpenRejection={() => setRejectionOpen(true)}
          onCancelRejection={() => { setRejectionOpen(false); setRejectionReason(""); }}
          onRejectionReasonChange={setRejectionReason}
          onReject={() => void registerDecision("rejected")}
        />
      )}
    </main>
  );
}

function QuoteCard({ quote, onOpen }: { quote: QuoteRequestRecord; onOpen: () => void }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/3 p-5 transition hover:border-white/20">
      <div className="flex items-start justify-between gap-3"><div><StatusBadge status={quote.status} /><h2 className="mt-3 text-lg font-bold text-white">{quote.customer.name}</h2><p className="mt-1 text-xs text-white/35">Solicitado em {formatDate(quote.createdAt)}</p></div><span className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 font-mono text-[9px] text-white/30">{quote.id.slice(0, 8)}</span></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <SmallInfo icon={BusFront} label="Veículo" value={quote.vehicleName} />
        <SmallInfo icon={UsersRound} label="Passageiros" value={String(quote.trip.passengers)} />
        <SmallInfo icon={MapPin} label="Destino" value={quote.trip.destination.address} />
        <SmallInfo icon={CalendarDays} label="Saída" value={formatDate(quote.startsAt)} />
      </div>
      <button type="button" onClick={onOpen} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-white/65 transition hover:border-yellow-400/30 hover:text-yellow-400">Ver solicitação <ChevronRight size={14} /></button>
    </article>
  );
}

function QuoteDetails({ quote, updating, rejectionOpen, rejectionReason, onClose, onApprove, onOpenRejection, onCancelRejection, onRejectionReasonChange, onReject }: {
  quote: QuoteRequestRecord; updating: boolean; rejectionOpen: boolean; rejectionReason: string; onClose: () => void; onApprove: () => void; onOpenRejection: () => void; onCancelRejection: () => void; onRejectionReasonChange: (value: string) => void; onReject: () => void;
}) {
  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#11151b] shadow-2xl sm:max-w-3xl sm:rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-white/10 bg-[#11151b]/95 px-5 py-4 backdrop-blur-xl sm:px-6"><div><StatusBadge status={quote.status} /><h2 className="mt-2 text-xl font-bold">Solicitação de {quote.customer.name}</h2><p className="mt-1 font-mono text-[10px] text-white/30">{quote.id}</p></div><button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-xl border border-white/10 text-white/50"><X size={17} /></button></header>

        <div className="space-y-5 p-5 sm:p-6">
          <DetailSection title="Cliente" icon={UserRound}><DetailGrid><SmallInfo icon={UserRound} label="Nome" value={quote.customer.name} /><SmallInfo icon={Mail} label="E-mail" value={quote.customer.email} /><SmallInfo icon={Phone} label="WhatsApp" value={quote.customer.phone} /></DetailGrid></DetailSection>
          <DetailSection title="Veículo e período" icon={BusFront}><DetailGrid><SmallInfo icon={BusFront} label="Veículo" value={quote.vehicleName} /><SmallInfo icon={CalendarDays} label="Saída" value={formatDate(quote.startsAt)} /><SmallInfo icon={CalendarDays} label="Retorno" value={formatDate(quote.endsAt)} /></DetailGrid></DetailSection>
          <DetailSection title="Viagem" icon={Route}><div className="grid gap-3 sm:grid-cols-2"><SmallInfo icon={Route} label="Tipo" value={quote.trip.mode === "registered" ? quote.trip.name : "Destino personalizado"} /><SmallInfo icon={UsersRound} label="Passageiros" value={String(quote.trip.passengers)} /><SmallInfo icon={MapPin} label="Local de saída" value={quote.trip.origin.address} /><SmallInfo icon={MapPin} label="Destino" value={quote.trip.destination.address} /></div>{quote.trip.notes && <p className="mt-3 rounded-xl border border-white/8 bg-black/15 p-3 text-xs leading-5 text-white/55"><strong className="text-white/75">Observações:</strong> {quote.trip.notes}</p>}</DetailSection>

          {quote.rejectionReason && <div className="rounded-xl border border-red-400/20 bg-red-400/8 p-4"><p className="text-[9px] font-bold uppercase tracking-wider text-red-300">Motivo da recusa</p><p className="mt-2 text-xs leading-5 text-red-100/65">{quote.rejectionReason}</p></div>}

          {quote.status === "pending" && (
            <div className="border-t border-white/10 pt-5">
              {rejectionOpen ? (
                <div><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Motivo da recusa</label><textarea value={rejectionReason} onChange={(event) => onRejectionReasonChange(event.target.value)} maxLength={500} rows={3} placeholder="Informe por que a solicitação não será aprovada" className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-red-400/50" /><div className="mt-3 flex justify-end gap-2"><button type="button" onClick={onCancelRejection} disabled={updating} className="h-10 rounded-xl border border-white/10 px-4 text-xs font-bold text-white/55">Cancelar</button><button type="button" onClick={onReject} disabled={updating || rejectionReason.trim().length < 3} className="flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white disabled:opacity-40">{updating && <LoaderCircle size={14} className="animate-spin" />}Confirmar recusa</button></div></div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onOpenRejection} disabled={updating} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-400/8 px-5 text-xs font-bold text-red-300"><XCircle size={16} />Recusar</button><button type="button" onClick={onApprove} disabled={updating} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-xs font-bold text-white disabled:opacity-50">{updating ? <LoaderCircle size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}Aprovar orçamento</button></div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Statistic({ title, value, icon: Icon, tone = "default" }: { title: string; value: number; icon: typeof ClipboardList; tone?: "default" | "amber" | "emerald" | "red" }) {
  const tones = { default: "text-yellow-400 bg-yellow-400/10", amber: "text-amber-300 bg-amber-400/10", emerald: "text-emerald-300 bg-emerald-400/10", red: "text-red-300 bg-red-400/10" };
  return <article className="rounded-2xl border border-white/10 bg-white/3 p-4"><span className={`flex size-9 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={18} /></span><p className="mt-4 text-xs text-white/40">{title}</p><p className="mt-1 text-2xl font-bold">{value}</p></article>;
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