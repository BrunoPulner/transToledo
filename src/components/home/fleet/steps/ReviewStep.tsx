"use client";

import {
  BusFront,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ImageIcon,
  Mail,
  MapPin,
  MessageSquareText,
  Pencil,
  Phone,
  Route,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import Image from "next/image";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  useFleetPreview,
} from "@/app/hooks/fleet/useFleetPreview";

import {
  subscribeToTrips,
} from "@/services/trips/subscribeToTrips";

import type {
  QuoteDraft,
  QuoteStep,
} from "@/types/quote";

import type {
  FrequentTrip,
  TripMedia,
} from "@/types/trip";

import type {
  VehicleMedia,
} from "@/types/vehicles";

type ReviewStepProps = {
  quoteDraft: QuoteDraft;
  submissionError: string;
  submittedQuoteId: string | null;

  onEditStep: (
    step: QuoteStep,
  ) => void;
};

const dateFormatter =
  new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

export function ReviewStep({
  quoteDraft,
  submissionError,
  submittedQuoteId,
  onEditStep,
}: ReviewStepProps) {
  const {
    activeVehicles,
  } = useFleetPreview();

  const [
    trips,
    setTrips,
  ] = useState<FrequentTrip[]>(
    [],
  );

  /*
   * Carrega as viagens cadastradas para
   * localizar a mídia da viagem selecionada.
   */
  useEffect(() => {
    if (
      quoteDraft.tripMode !==
      "registered"
    ) {
      return;
    }

    return subscribeToTrips(
      setTrips,

      () => {
        setTrips([]);
      },
    );
  }, [
    quoteDraft.tripMode,
  ]);

  /*
   * Localiza o veículo selecionado.
   */
  const selectedVehicle =
    useMemo(
      () =>
        activeVehicles.find(
          (vehicle) =>
            vehicle.id ===
            quoteDraft.vehicleId,
        ) ?? null,
      [
        activeVehicles,
        quoteDraft.vehicleId,
      ],
    );

  /*
   * Localiza a viagem selecionada.
   */
  const selectedTrip =
    useMemo(
      () =>
        trips.find(
          (trip) =>
            trip.id ===
            quoteDraft.frequentTripId,
        ) ?? null,
      [
        trips,
        quoteDraft.frequentTripId,
      ],
    );

  const vehicleCover =
    selectedVehicle
      ? getVehicleCover(
          selectedVehicle.media,
        )
      : null;

  const tripCover =
    selectedTrip
      ? getTripCover(
          selectedTrip.media,
        )
      : null;

  /*
   * Exibe a confirmação depois
   * que o orçamento for salvo.
   */
  if (submittedQuoteId) {
    return (
      <SuccessState
        quoteRequestId={
          submittedQuoteId
        }
      />
    );
  }

  return (
    <div>
      <header
        className="
          flex
          items-start
          gap-3
        "
      >
        <span
          className="
            flex
            size-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-yellow-400/10
            text-yellow-400
          "
        >
          <ClipboardCheck
            size={19}
          />
        </span>

        <div>
          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-yellow-400
            "
          >
            Quarta etapa
          </p>

          <h3
            className="
              mt-1
              text-xl
              font-bold
              text-white
              sm:text-2xl
            "
          >
            Confira a solicitação
          </h3>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-white/45
            "
          >
            Revise os dados antes de
            enviar seu pedido.
          </p>
        </div>
      </header>

      <div
        className="
          mt-5
          grid
          items-stretch
          gap-4
          lg:grid-cols-2
        "
      >
        {/*
         * BLOCO 1:
         * Veículo e período.
         */}
        <ReviewCard
          number="1"
          icon={BusFront}
          title="Veículo e período"
          onEdit={() =>
            onEditStep(
              "vehicle",
            )
          }
        >
          <div
            className="
              flex
              h-full
              flex-col
              gap-3
            "
          >
            {/*
             * A imagem cresce para ocupar
             * o espaço disponível no card.
             */}
            <MediaPreview
              media={
                vehicleCover
              }
              alt={
                quoteDraft.vehicleName
              }
              fallbackIcon={
                BusFront
              }
              contain
              fillAvailable
            />

            <div
              className="
                grid
                shrink-0
                min-w-0
                gap-2
                sm:grid-cols-3
              "
            >
              <CompactLine
                icon={BusFront}
                label="Veículo"
                value={
                  quoteDraft.vehicleName
                }
              />

              <CompactLine
                icon={
                  CalendarDays
                }
                label="Saída"
                value={formatDate(
                  quoteDraft.departureDate,
                )}
              />

              <CompactLine
                icon={
                  CalendarDays
                }
                label="Retorno"
                value={formatDate(
                  quoteDraft.returnDate,
                )}
              />
            </div>
          </div>
        </ReviewCard>

        {/*
         * BLOCO 2:
         * Informações da viagem.
         */}
        <ReviewCard
          number="2"
          icon={Route}
          title="Informações da viagem"
          onEdit={() =>
            onEditStep(
              "trip",
            )
          }
        >
          <div className="space-y-3">
            {quoteDraft.tripMode ===
            "registered" ? (
              <MediaPreview
                media={
                  tripCover
                }
                alt={
                  quoteDraft.tripName
                }
                fallbackIcon={
                  ImageIcon
                }
              />
            ) : (
              <CustomRoutePreview />
            )}

            <div
              className="
                grid
                min-w-0
                gap-2
                sm:grid-cols-2
              "
            >
              <CompactLine
                icon={Route}
                label="Viagem"
                value={
                  quoteDraft.tripMode ===
                  "registered"
                    ? quoteDraft.tripName
                    : "Destino personalizado"
                }
              />

              <CompactLine
                icon={
                  UsersRound
                }
                label="Passageiros"
                value={`${
                  quoteDraft.passengers
                } ${
                  quoteDraft.passengers ===
                  1
                    ? "passageiro"
                    : "passageiros"
                }`}
              />
            </div>
          </div>

          <div
            className="
              mt-3
              grid
              gap-2
              sm:grid-cols-2
            "
          >
            <CompactLine
              icon={MapPin}
              label="Saída"
              value={
                quoteDraft.origin
              }
            />

            <CompactLine
              icon={MapPin}
              label="Destino"
              value={
                quoteDraft.destination
              }
            />
          </div>

          {quoteDraft.notes
            .trim() && (
            <div className="mt-2">
              <CompactLine
                icon={
                  MessageSquareText
                }
                label="Observações"
                value={
                  quoteDraft.notes
                }
              />
            </div>
          )}
        </ReviewCard>

        {/*
         * BLOCO 3:
         * Informações de contato.
         */}
        <ReviewCard
          number="3"
          icon={UserRound}
          title="Dados de contato"
          onEdit={() =>
            onEditStep(
              "contact",
            )
          }
          className="
            lg:col-span-2
          "
        >
          <div
            className="
              grid
              gap-2
              sm:grid-cols-3
            "
          >
            <CompactLine
              icon={UserRound}
              label="Nome"
              value={
                quoteDraft
                  .contact
                  .name
              }
            />

            <CompactLine
              icon={Mail}
              label="E-mail"
              value={
                quoteDraft
                  .contact
                  .email
              }
            />

            <CompactLine
              icon={Phone}
              label="WhatsApp verificado"
              value={
                quoteDraft
                  .contact
                  .phone
              }
              verified
            />
          </div>
        </ReviewCard>
      </div>

      <div
        className="
          mt-4
          flex
          items-start
          gap-3
          rounded-xl
          border
          border-blue-400/15
          bg-blue-400/8
          px-4
          py-3
        "
      >
        <ShieldCheck
          size={17}
          className="
            mt-0.5
            shrink-0
            text-blue-300
          "
        />

        <p
          className="
            text-[11px]
            leading-5
            text-blue-100/65
          "
        >
          A solicitação ficará pendente
          para análise. O veículo e o
          período serão reservados
          somente após a aprovação.
        </p>
      </div>

      {submissionError && (
        <p
          className="
            mt-3
            rounded-xl
            border
            border-red-400/20
            bg-red-400/8
            px-4
            py-3
            text-xs
            leading-5
            text-red-300
          "
        >
          {submissionError}
        </p>
      )}
    </div>
  );
}

type ReviewCardProps = {
  number: string;
  icon: LucideIcon;
  title: string;
  onEdit: () => void;
  className?: string;
  children: ReactNode;
};

function ReviewCard({
  number,
  icon: Icon,
  title,
  onEdit,
  className = "",
  children,
}: ReviewCardProps) {
  return (
    <section
      className={`
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-black/15
        ${className}
      `}
    >
      <header
        className="
          flex
          shrink-0
          items-center
          justify-between
          gap-3
          border-b
          border-white/8
          px-4
          py-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-2.5
          "
        >
          <span
            className="
              flex
              size-7
              items-center
              justify-center
              rounded-lg
              bg-yellow-400
              text-[10px]
              font-black
              text-slate-950
            "
          >
            {number}
          </span>

          <Icon
            size={15}
            className="
              text-yellow-400
            "
          />

          <h4
            className="
              text-xs
              font-bold
              text-white
              sm:text-sm
            "
          >
            {title}
          </h4>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="
            flex
            items-center
            gap-1.5
            rounded-lg
            border
            border-white/10
            bg-white/5
            px-2.5
            py-1.5
            text-[10px]
            font-bold
            text-white/55
            transition
            hover:border-yellow-400/40
            hover:text-yellow-400
          "
        >
          <Pencil size={11} />
          Editar
        </button>
      </header>

      <div
        className="
          flex-1
          p-3
          sm:p-4
        "
      >
        {children}
      </div>
    </section>
  );
}

type CompactLineProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  verified?: boolean;
};

function CompactLine({
  icon: Icon,
  label,
  value,
  verified = false,
}: CompactLineProps) {
  return (
    <div
      className="
        flex
        min-w-0
        items-start
        gap-2.5
        rounded-lg
        border
        border-white/7
        bg-white/3
        px-3
        py-2.5
      "
    >
      <Icon
        size={14}
        className="
          mt-0.5
          shrink-0
          text-yellow-400
        "
      />

      <div
        className="
          min-w-0
          flex-1
        "
      >
        <div
          className="
            flex
            items-center
            gap-1.5
          "
        >
          <p
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-wider
              text-white/30
            "
          >
            {label}
          </p>

          {verified && (
            <CheckCircle2
              size={11}
              className="
                text-emerald-300
              "
            />
          )}
        </div>

        <p
          className="
            mt-0.5
            line-clamp-2
            wrap-break-word
            text-[11px]
            font-semibold
            leading-4
            text-white/75
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}

type MediaPreviewProps = {
  media:
    | VehicleMedia
    | TripMedia
    | null;

  alt: string;
  fallbackIcon: LucideIcon;

  /*
   * Mantém a imagem inteira, sem cortes.
   */
  contain?: boolean;

  /*
   * Faz a mídia crescer para preencher
   * o espaço vertical disponível.
   */
  fillAvailable?: boolean;
};

function MediaPreview({
  media,
  alt,
  fallbackIcon: FallbackIcon,
  contain = false,
  fillAvailable = false,
}: MediaPreviewProps) {
  return (
    <div
      className={`
        relative
        w-full
        overflow-hidden
        rounded-xl
        border
        border-white/10
        bg-black/30
        ${
          fillAvailable
            ? `
              min-h-56
              flex-1
              sm:min-h-64
            `
            : `
              h-40
              sm:h-44
            `
        }
      `}
    >
      {!media ? (
        <div
          className="
            flex
            size-full
            items-center
            justify-center
          "
        >
          <FallbackIcon
            size={34}
            className="
              text-white/15
            "
          />
        </div>
      ) : media.type ===
        "image" ? (
        <Image
          src={media.url}
          alt={alt}
          fill
          unoptimized
          sizes="
            (max-width: 1024px)
            100vw,
            50vw
          "
          className={
            contain
              ? "object-contain p-2"
              : "object-cover"
          }
        />
      ) : (
        <video
          src={media.url}
          muted
          playsInline
          preload="metadata"
          className={
            contain
              ? "size-full object-contain"
              : "size-full object-cover"
          }
        />
      )}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          bg-linear-to-t
          from-black/80
          to-transparent
          px-3
          pb-2
          pt-7
        "
      >
        <p
          className="
            truncate
            text-[10px]
            font-bold
            text-white/85
          "
        >
          {alt}
        </p>
      </div>
    </div>
  );
}

function CustomRoutePreview() {
  return (
    <div
      className="
        flex
        h-40
        w-full
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-yellow-400/15
        bg-yellow-400/5
        sm:h-44
      "
    >
      <div
        className="
          flex
          items-center
        "
      >
        <span
          className="
            flex
            size-9
            items-center
            justify-center
            rounded-full
            bg-emerald-400/15
            text-emerald-300
          "
        >
          <MapPin size={16} />
        </span>

        <span
          className="
            mx-2
            h-px
            w-10
            border-t
            border-dashed
            border-yellow-400/50
          "
        />

        <span
          className="
            flex
            size-9
            items-center
            justify-center
            rounded-full
            bg-yellow-400/15
            text-yellow-300
          "
        >
          <Route size={16} />
        </span>
      </div>

      <p
        className="
          mt-3
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          text-white/35
        "
      >
        Rota personalizada
      </p>
    </div>
  );
}

function SuccessState({
  quoteRequestId,
}: {
  quoteRequestId: string;
}) {
  return (
    <div
      className="
        flex
        min-h-80
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-emerald-400/20
        bg-emerald-400/6
        px-5
        py-8
        text-center
      "
    >
      <span
        className="
          flex
          size-14
          items-center
          justify-center
          rounded-2xl
          bg-emerald-400/15
          text-emerald-300
        "
      >
        <CheckCircle2
          size={29}
        />
      </span>

      <h3
        className="
          mt-4
          text-xl
          font-bold
          text-white
        "
      >
        Solicitação enviada!
      </h3>

      <p
        className="
          mt-2
          max-w-lg
          text-sm
          leading-6
          text-white/50
        "
      >
        Seu orçamento está aguardando
        análise. A equipe da TransToledo
        entrará em contato pelo WhatsApp
        informado.
      </p>

      <div
        className="
          mt-4
          rounded-xl
          border
          border-white/10
          bg-black/15
          px-4
          py-2.5
        "
      >
        <p
          className="
            text-[8px]
            font-bold
            uppercase
            tracking-wider
            text-white/30
          "
        >
          Protocolo
        </p>

        <p
          className="
            mt-1
            font-mono
            text-xs
            font-bold
            text-yellow-300
          "
        >
          {quoteRequestId}
        </p>
      </div>
    </div>
  );
}

/*
 * Procura primeiro a imagem definida
 * como capa do veículo.
 */
function getVehicleCover(
  media: VehicleMedia[],
) {
  return (
    media.find(
      (item) =>
        item.isCover &&
        item.type === "image",
    ) ??
    media.find(
      (item) =>
        item.type === "image",
    ) ??
    media[0] ??
    null
  );
}

/*
 * Procura primeiro a mídia definida
 * como capa da viagem.
 */
function getTripCover(
  media: TripMedia[],
) {
  return (
    media.find(
      (item) =>
        item.isCover,
    ) ??
    media.find(
      (item) =>
        item.type === "image",
    ) ??
    media[0] ??
    null
  );
}

function formatDate(
  date: Date | null,
) {
  return date
    ? dateFormatter.format(
        date,
      )
    : "Não informada";
}