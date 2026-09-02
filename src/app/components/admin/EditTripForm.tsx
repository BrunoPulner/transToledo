"use client";

import { ArrowLeft, CheckCircle2, ImagePlus, LoaderCircle, Save, Upload, Video, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { TripLocationMap } from "@/app/admin/TripLocationMap";
import { deleteTripMedia } from "@/services/trips/deleteTripMedia";
import { getTripById } from "@/services/trips/getTripById";
import { updateTrip } from "@/services/trips/updateTrip";
import { uploadTripMedia, validateTripMedia } from "@/services/trips/uploadTripMedia";
import type { TripMedia, TripType } from "@/types/trip";

type MediaItem = {
  id: string;
  type: "image" | "video";
  previewUrl: string;
  file?: File;
  storedUrl?: string;
};

export function EditTripForm({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [type, setType] = useState<TripType>("turismo");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void getTripById(tripId).then((trip) => {
      if (cancelled) return;
      if (!trip) {
        setError("Viagem não encontrada.");
        setLoading(false);
        return;
      }

      setName(trip.name);
      setCity(trip.city);
      setState(trip.state);
      setLocation(trip.location);
      setLatitude(trip.latitude === null ? "" : String(trip.latitude));
      setLongitude(trip.longitude === null ? "" : String(trip.longitude));
      setHours(String(Math.floor(trip.averageDurationMinutes / 60)));
      setMinutes(String(trip.averageDurationMinutes % 60));
      setType(trip.type);
      setDescription(trip.description);
      setActive(trip.active);
      setFeatured(trip.featured);

      const items = trip.media.map((item, index) => ({
        id: `stored-${index}`,
        type: item.type,
        previewUrl: item.url,
        storedUrl: item.url,
      }));
      setMedia(items);
      const coverIndex = trip.media.findIndex((item) => item.isCover);
      setCoverMediaId(items[coverIndex >= 0 ? coverIndex : 0]?.id ?? null);
      setLoading(false);
    }).catch((loadError) => {
      console.error("Erro ao carregar viagem:", loadError);
      if (!cancelled) {
        setError("Não foi possível carregar a viagem.");
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [tripId]);

  function addMedia(files: FileList | null) {
    if (!files) return;
    const added: MediaItem[] = [];
    for (const file of Array.from(files)) {
      const validationError = validateTripMedia(file);
      if (validationError) {
        added.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        setError(validationError);
        return;
      }
      added.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        type: file.type.startsWith("image/") ? "image" : "video",
      });
    }
    if (!coverMediaId && media.length === 0 && added[0]) setCoverMediaId(added[0].id);
    setMedia((current) => [...current, ...added]);
    setError("");
  }

  function removeMedia(id: string) {
    const item = media.find((candidate) => candidate.id === id);
    if (!item) return;
    if (item.file) URL.revokeObjectURL(item.previewUrl);
    if (item.storedUrl) setRemovedUrls((current) => [...current, item.storedUrl!]);
    const remaining = media.filter((candidate) => candidate.id !== id);
    setMedia(remaining);
    if (coverMediaId === id) setCoverMediaId(remaining[0]?.id ?? null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError("");

    const totalMinutes = Number(hours || 0) * 60 + Number(minutes || 0);
    if (!name.trim() || !city.trim() || !state.trim() || !location.trim() || !description.trim() || totalMinutes <= 0) {
      setError("Preencha todas as informações obrigatórias da viagem.");
      return;
    }

    const lat = latitude ? Number(latitude) : null;
    const lng = longitude ? Number(longitude) : null;
    if ((lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) ||
        (lng !== null && (!Number.isFinite(lng) || lng < -180 || lng > 180))) {
      setError("Informe coordenadas válidas.");
      return;
    }

    try {
      setSaving(true);
      const newItems = media.filter((item) => item.file);
      const uploaded = newItems.length
        ? await uploadTripMedia(newItems.map((item) => item.file!), crypto.randomUUID())
        : [];
      let uploadIndex = 0;
      const finalMedia: TripMedia[] = media.map((item) => {
        const saved = item.storedUrl
          ? { url: item.storedUrl, type: item.type }
          : uploaded[uploadIndex++];
        return { ...saved, isCover: item.id === coverMediaId };
      });

      await updateTrip(tripId, {
        name, city, state, location, latitude: lat, longitude: lng,
        averageDurationMinutes: totalMinutes, type, description,
        media: finalMedia, active, featured,
      });
      await deleteTripMedia(removedUrls);
      router.push("/admin/viagens");
      router.refresh();
    } catch (saveError) {
      console.error("Erro ao atualizar viagem:", saveError);
      setError("Não foi possível atualizar a viagem.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex min-h-[70vh] items-center justify-center"><LoaderCircle className="animate-spin text-yellow-400" size={32} /></div>;

  const fieldClass = "h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/50";

  return (
    <div className="px-5 pb-12 pt-26 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <Link href="/admin/viagens" className="inline-flex items-center gap-2 text-sm text-white/45 hover:text-yellow-400"><ArrowLeft size={17} /> Voltar para viagens</Link>
        <header className="mt-7">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">Viagens frequentes</span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Editar viagem</h1>
          <p className="mt-2 text-sm text-white/45">Atualize as informações, localização e mídias da viagem.</p>
        </header>

        <form onSubmit={handleSubmit} className="mt-9 space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
            <h2 className="text-lg font-bold">Informações da viagem</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm text-white/65">Nome<input value={name} onChange={(e) => setName(e.target.value)} className={`${fieldClass} mt-2`} /></label>
              <label className="text-sm text-white/65">Cidade<input value={city} onChange={(e) => setCity(e.target.value)} className={`${fieldClass} mt-2`} /></label>
              <label className="text-sm text-white/65">Estado<input value={state} maxLength={2} onChange={(e) => setState(e.target.value)} className={`${fieldClass} mt-2 uppercase`} /></label>
              <label className="text-sm text-white/65">Tipo<select value={type} onChange={(e) => setType(e.target.value as TripType)} className={`${fieldClass} mt-2 bg-[#111416]`}><option value="turismo">Turismo</option><option value="evento">Evento</option><option value="show">Show</option><option value="universidade">Universidade</option><option value="excursao">Excursão</option><option value="outro">Outro</option></select></label>
              <div><span className="text-sm text-white/65">Duração média</span><div className="mt-2 grid grid-cols-2 gap-3"><input type="number" min="0" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Horas" className={fieldClass} /><input type="number" min="0" max="59" value={minutes} onChange={(e) => setMinutes(e.target.value)} placeholder="Minutos" className={fieldClass} /></div></div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
            <h2 className="text-lg font-bold">Localização</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm text-white/65">Local ou endereço<input value={location} onChange={(e) => setLocation(e.target.value)} className={`${fieldClass} mt-2`} /></label>
              <label className="text-sm text-white/65">Latitude<input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} className={`${fieldClass} mt-2`} /></label>
              <label className="text-sm text-white/65">Longitude<input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} className={`${fieldClass} mt-2`} /></label>
            </div>
            <TripLocationMap address={location} latitude={latitude} longitude={longitude} onLocationChange={(next) => { setLocation(next.address); setLatitude(String(next.latitude)); setLongitude(String(next.longitude)); }} />
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
            <h2 className="text-lg font-bold">Descrição</h2>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={7} className="mt-5 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none focus:border-yellow-400/50" />
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
            <h2 className="text-lg font-bold">Imagens e vídeos</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 hover:border-yellow-400/40"><input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { addMedia(e.target.files); e.target.value = ""; }} /><ImagePlus /><span className="mt-2 text-sm">Adicionar imagens</span></label>
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 hover:border-yellow-400/40"><input type="file" accept="video/mp4" multiple className="sr-only" onChange={(e) => { addMedia(e.target.files); e.target.value = ""; }} /><Video /><span className="mt-2 text-sm">Adicionar vídeos</span></label>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => <div key={item.id} className={`relative aspect-video overflow-hidden rounded-xl border-2 bg-black ${coverMediaId === item.id ? "border-yellow-400" : "border-white/10"}`}>
                {item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.previewUrl} alt="Mídia da viagem" className="h-full w-full object-cover" />
                ) : <video src={item.previewUrl} controls className="h-full w-full object-cover" />}
                {coverMediaId === item.id && <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-black"><CheckCircle2 size={13} /> Capa</span>}
                <button type="button" onClick={() => removeMedia(item.id)} className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/75 hover:bg-red-500"><X size={16} /></button>
                <button type="button" onClick={() => setCoverMediaId(item.id)} disabled={coverMediaId === item.id} className="absolute bottom-2 right-2 rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-bold text-black disabled:bg-black/70 disabled:text-white">{coverMediaId === item.id ? "Selecionada" : "Usar como capa"}</button>
              </div>)}
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-white/30"><Upload size={14} /> Novas mídias serão enviadas quando você salvar.</p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
            <h2 className="text-lg font-bold">Exibição</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-xl border border-white/10 p-4"><span>Viagem ativa</span><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-5 accent-yellow-400" /></label>
              <label className="flex items-center justify-between rounded-xl border border-white/10 p-4"><span>Destacar viagem</span><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="size-5 accent-yellow-400" /></label>
            </div>
          </section>

          {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
            <Link href="/admin/viagens" className="inline-flex h-12 items-center rounded-xl border border-white/10 px-5 text-sm text-white/60">Cancelar</Link>
            <button type="submit" disabled={saving} className="inline-flex h-12 items-center gap-2 rounded-xl bg-yellow-400 px-6 text-sm font-bold text-black disabled:opacity-60">{saving ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}{saving ? "Salvando..." : "Salvar alterações"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
