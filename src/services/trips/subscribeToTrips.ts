import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase/client";

import type {
  FrequentTrip,
  TripMedia,
  TripType,
} from "@/types/trip";

const validTripTypes:
  TripType[] = [
    "turismo",
    "evento",
    "show",
    "universidade",
    "excursao",
    "outro",
  ];

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

function readMedia(
  value: unknown,
): TripMedia[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap(
    (item): TripMedia[] => {
      if (
        !item ||
        typeof item !== "object"
      ) {
        return [];
      }

      const media =
        item as {
          url?: unknown;
          type?: unknown;
          isCover?: unknown;
        };

      if (
        typeof media.url !== "string" ||
        !media.url.trim() ||
        (
          media.type !== "image" &&
          media.type !== "video"
        )
      ) {
        return [];
      }

      return [
        {
          url: media.url.trim(),
          type: media.type,
          isCover:
            media.isCover === true,
        },
      ];
    },
  );
}

function readTripType(
  value: unknown,
): TripType {
  return validTripTypes.includes(
    value as TripType,
  )
    ? (value as TripType)
    : "outro";
}

function convertTrip(
  snapshot:
    QueryDocumentSnapshot<DocumentData>,
): FrequentTrip {
  const data =
    snapshot.data();

  return {
    id:
      snapshot.id,

    name:
      typeof data.name === "string"
        ? data.name
        : "Viagem sem nome",

    city:
      typeof data.city === "string"
        ? data.city
        : "",

    state:
      typeof data.state === "string"
        ? data.state
        : "",

    location:
      typeof data.location === "string"
        ? data.location
        : "",

    latitude:
      readCoordinate(
        data.latitude,
        -90,
        90,
      ),

    longitude:
      readCoordinate(
        data.longitude,
        -180,
        180,
      ),

    averageDurationMinutes:
      typeof data.averageDurationMinutes ===
        "number" &&
      Number.isFinite(
        data.averageDurationMinutes,
      )
        ? data.averageDurationMinutes
        : 0,

    type:
      readTripType(
        data.type,
      ),

    description:
      typeof data.description === "string"
        ? data.description
        : "",

    media:
      readMedia(
        data.media,
      ),

    active:
      data.active === true,

    featured:
      data.featured === true,

    order:
      typeof data.order === "number"
        ? data.order
        : undefined,

    createdAt:
      data.createdAt
        ?.toDate?.(),

    updatedAt:
      data.updatedAt
        ?.toDate?.(),
  };
}

export function subscribeToTrips(
  onTrips: (
    trips: FrequentTrip[],
  ) => void,

  onError: (
    error: Error,
  ) => void,
) {
  const tripsQuery =
    query(
      collection(
        db,
        "frequentTrips",
      ),

      orderBy(
        "createdAt",
        "desc",
      ),
    );

  return onSnapshot(
    tripsQuery,

    (snapshot) => {
      const trips =
        snapshot.docs
          .map(
            convertTrip,
          )

          /*
           * Viagens desativadas não aparecem
           * para os visitantes.
           */
          .filter(
            (trip) =>
              trip.active,
          )

          /*
           * Destacadas aparecem primeiro.
           * Depois respeita o campo order.
           */
          .sort(
            (
              firstTrip,
              secondTrip,
            ) => {
              if (
                firstTrip.featured !==
                secondTrip.featured
              ) {
                return firstTrip.featured
                  ? -1
                  : 1;
              }

              return (
                (
                  firstTrip.order ??
                  Number.MAX_SAFE_INTEGER
                ) -
                (
                  secondTrip.order ??
                  Number.MAX_SAFE_INTEGER
                )
              );
            },
          );

      onTrips(
        trips,
      );
    },

    onError,
  );
}