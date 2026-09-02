"use client";

import {
  ArrowLeft,
  Clock3,
  ImagePlus,
  MapPin,
  Route,
  Save,
  Star,
  Upload,
  Video,
} from "lucide-react";

import Link from "next/link";
import { FormEvent, useState } from "react";

type TripType =
  | "turismo"
  | "evento"
  | "show"
  | "universidade"
  | "excursao"
  | "outro";

export default function NewFrequentTripPage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [location, setLocation] =
    useState("");

  const [latitude, setLatitude] =
    useState("");

  const [longitude, setLongitude] =
    useState("");

  const [hours, setHours] =
    useState("");

  const [minutes, setMinutes] =
    useState("");

  const [type, setType] =
    useState<TripType>("turismo");

  const [description, setDescription] =
    useState("");

  const [active, setActive] =
    useState(true);

  const [featured, setFeatured] =
    useState(false);

  const [error, setError] =
    useState("");

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError(
        "Informe o nome da viagem."
      );
      return;
    }

    if (!city.trim()) {
      setError(
        "Informe a cidade."
      );
      return;
    }

    if (!state.trim()) {
      setError(
        "Informe o estado."
      );
      return;
    }

    if (!location.trim()) {
      setError(
        "Informe o local da viagem."
      );
      return;
    }

    if (!description.trim()) {
      setError(
        "Informe uma descrição."
      );
      return;
    }

    const totalMinutes =
      Number(hours || 0) * 60 +
      Number(minutes || 0);

    if (totalMinutes <= 0) {
      setError(
        "Informe a duração média da viagem."
      );
      return;
    }

    /*
     * Por enquanto apenas validamos.
     *
     * No próximo passo vamos enviar
     * estes dados para nossa API e
     * salvar no Firestore.
     */
    console.log({
      name,
      city,
      state,
      location,
      latitude:
        latitude
          ? Number(latitude)
          : null,
      longitude:
        longitude
          ? Number(longitude)
          : null,
      averageDurationMinutes:
        totalMinutes,
      type,
      description,
      active,
      featured,
    });
  }

  return (
    <div className="px-5 pb-12 pt-26 lg:px-10 lg:py-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* VOLTAR */}
        <Link
          href="/admin/viagens"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/45 transition hover:text-yellow-400"
        >
          <ArrowLeft size={17} />

          Voltar para viagens
        </Link>

        {/* CABEÇALHO */}
        <header className="mt-7">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-yellow-400" />

            <span className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
              Viagens frequentes
            </span>
          </div>

          <h1 className="mt-4 font-(family-name:--font-montserrat) text-3xl font-bold tracking-tight sm:text-4xl">
            Nova viagem
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
            Cadastre um destino ou roteiro realizado com frequência pela
            TransToledo.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-9 space-y-6"
        >
          {/* INFORMAÇÕES PRINCIPAIS */}
          <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                <Route size={19} />
              </div>

              <div>
                <h2 className="font-(family-name:--font-montserrat) text-lg font-bold">
                  Informações da viagem
                </h2>

                <p className="mt-1 text-sm text-white/35">
                  Dados principais exibidos para o cliente.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* NOME */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-white/65"
                >
                  Nome da viagem
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Excursão para Barretos"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/50"
                />
              </div>

              {/* CIDADE */}
              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-medium text-white/65"
                >
                  Cidade
                </label>

                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(event) =>
                    setCity(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Barretos"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/50"
                />
              </div>

              {/* ESTADO */}
              <div>
                <label
                  htmlFor="state"
                  className="mb-2 block text-sm font-medium text-white/65"
                >
                  Estado
                </label>

                <input
                  id="state"
                  type="text"
                  value={state}
                  onChange={(event) =>
                    setState(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: SP"
                  maxLength={2}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 uppercase text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/50"
                />
              </div>

              {/* TIPO */}
              <div>
                <label
                  htmlFor="type"
                  className="mb-2 block text-sm font-medium text-white/65"
                >
                  Tipo da viagem
                </label>

                <select
                  id="type"
                  value={type}
                  onChange={(event) =>
                    setType(
                      event.target
                        .value as TripType
                    )
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-[#111416] px-4 text-sm text-white outline-none transition focus:border-yellow-400/50"
                >
                  <option value="turismo">
                    Turismo
                  </option>

                  <option value="evento">
                    Evento
                  </option>

                  <option value="show">
                    Show
                  </option>

                  <option value="universidade">
                    Universidade
                  </option>

                  <option value="excursao">
                    Excursão
                  </option>

                  <option value="outro">
                    Outro
                  </option>
                </select>
              </div>

              {/* DURAÇÃO */}
              <div>
                <label className="mb-2 block text-sm font-medium text-white/65">
                  Duração média
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Clock3
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                    />

                    <input
                      type="number"
                      min="0"
                      value={hours}
                      onChange={(event) =>
                        setHours(
                          event.target.value
                        )
                      }
                      placeholder="Horas"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/50"
                    />
                  </div>

                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(event) =>
                      setMinutes(
                        event.target.value
                      )
                    }
                    placeholder="Minutos"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* LOCALIZAÇÃO */}
          <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                <MapPin size={19} />
              </div>

              <div>
                <h2 className="font-(family-name:--font-montserrat) text-lg font-bold">
                  Localização
                </h2>

                <p className="mt-1 text-sm text-white/35">
                  O local será utilizado posteriormente no mapa exibido ao
                  cliente.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-medium text-white/65"
                >
                  Local ou endereço
                </label>

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(
                      event.target.value
                    )
                  }
                  placeholder="Ex.: Parque do Peão de Barretos, Barretos - SP"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/50"
                />
              </div>

              {/* LATITUDE */}
              <div>
                <label
                  htmlFor="latitude"
                  className="mb-2 block text-sm font-medium text-white/65"
                >
                  Latitude
                </label>

                <input
                  id="latitude"
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(event) =>
                    setLatitude(
                      event.target.value
                    )
                  }
                  placeholder="-20.5531"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/50"
                />
              </div>

              {/* LONGITUDE */}
              <div>
                <label
                  htmlFor="longitude"
                  className="mb-2 block text-sm font-medium text-white/65"
                >
                  Longitude
                </label>

                <input
                  id="longitude"
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(event) =>
                    setLongitude(
                      event.target.value
                    )
                  }
                  placeholder="-48.5698"
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/50"
                />
              </div>
            </div>

            {/* MAPA FUTURO */}
            <div className="mt-5 flex min-h-52 items-center justify-center rounded-xl border border-dashed border-white/10 bg-black/20">
              <div className="max-w-sm text-center">
                <MapPin
                  size={28}
                  className="mx-auto text-white/20"
                />

                <p className="mt-3 text-sm font-medium text-white/40">
                  Pré-visualização do mapa
                </p>

                <p className="mt-1 text-xs leading-5 text-white/25">
                  Na próxima etapa podemos integrar a busca e visualização do
                  Google Maps.
                </p>
              </div>
            </div>
          </section>

          {/* DESCRIÇÃO */}
          <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
            <h2 className="font-(family-name:--font-montserrat) text-lg font-bold">
              Descrição
            </h2>

            <p className="mt-1 text-sm text-white/35">
              Explique o destino, experiência e principais características da
              viagem.
            </p>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              rows={7}
              placeholder="Escreva uma descrição da viagem..."
              className="mt-5 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/50"
            />
          </section>

          {/* MÍDIA */}
          <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                <ImagePlus size={19} />
              </div>

              <div>
                <h2 className="font-(family-name:--font-montserrat) text-lg font-bold">
                  Imagens e vídeos
                </h2>

                <p className="mt-1 text-sm text-white/35">
                  Adicione conteúdos que serão exibidos na apresentação da
                  viagem.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* IMAGENS */}
              <button
                type="button"
                className="group flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/2 p-5 transition hover:border-yellow-400/40 hover:bg-yellow-400/3"
              >
                <ImagePlus
                  size={27}
                  className="text-white/25 transition group-hover:text-yellow-400"
                />

                <span className="mt-3 text-sm font-semibold text-white/60">
                  Adicionar imagens
                </span>

                <span className="mt-1 text-xs text-white/25">
                  JPG, PNG ou WEBP
                </span>
              </button>

              {/* VÍDEOS */}
              <button
                type="button"
                className="group flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/2 p-5 transition hover:border-yellow-400/40 hover:bg-yellow-400/3"
              >
                <Video
                  size={27}
                  className="text-white/25 transition group-hover:text-yellow-400"
                />

                <span className="mt-3 text-sm font-semibold text-white/60">
                  Adicionar vídeos
                </span>

                <span className="mt-1 text-xs text-white/25">
                  MP4
                </span>
              </button>
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-white/25">
              <Upload
                size={14}
                className="mt-0.5 shrink-0"
              />

              O upload será conectado ao Firebase Storage na etapa de
              persistência.
            </div>
          </section>

          {/* EXIBIÇÃO */}
          <section className="rounded-2xl border border-white/10 bg-white/2.5 p-6">
            <h2 className="font-(family-name:--font-montserrat) text-lg font-bold">
              Exibição
            </h2>

            <div className="mt-6 space-y-4">
              {/* ATIVA */}
              <label className="flex cursor-pointer items-center justify-between gap-5 rounded-xl border border-white/10 bg-white/2.5 p-4">
                <div>
                  <p className="text-sm font-semibold">
                    Viagem ativa
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Viagens inativas não serão exibidas para os clientes.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) =>
                    setActive(
                      event.target.checked
                    )
                  }
                  className="size-5 accent-yellow-400"
                />
              </label>

              {/* DESTAQUE */}
              <label className="flex cursor-pointer items-center justify-between gap-5 rounded-xl border border-white/10 bg-white/2.5 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Star
                      size={16}
                      className="text-yellow-400"
                    />

                    <p className="text-sm font-semibold">
                      Destacar viagem
                    </p>
                  </div>

                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Permite utilizar esta viagem em áreas de destaque do site.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(event) =>
                    setFeatured(
                      event.target.checked
                    )
                  }
                  className="size-5 accent-yellow-400"
                />
              </label>
            </div>
          </section>

          {/* ERRO */}
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* AÇÕES */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/admin/viagens"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-semibold text-white/55 transition hover:bg-white/5 hover:text-white"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 text-sm font-bold text-black transition hover:bg-yellow-300"
            >
              <Save size={18} />

              Salvar viagem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}