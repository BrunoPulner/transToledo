import type {
  FrequentTrip,
  TripMedia,
  TripType,
} from "@/types/trip";

export const tripTypeLabels:
  Record<TripType, string> = {
    turismo: "Turismo",
    evento: "Evento",
    show: "Show",
    universidade: "Universidade",
    excursao: "Excursão",
    outro: "Outro",
  };

export function getCoverMedia(
  media: TripMedia[],
): TripMedia | null {
  return (
    media.find(
      (item) =>
        item.isCover,
    ) ??
    media[0] ??
    null
  );
}

export function formatLocation(
  trip: FrequentTrip,
) {
  const city =
    trip.city.trim();

  const state =
    trip.state.trim();

  if (
    city &&
    state
  ) {
    return `${city} - ${state}`;
  }

  return (
    city ||
    state ||
    trip.location ||
    "Localização não informada"
  );
}

export function formatDuration(
  minutes: number,
) {
  const hours =
    Math.floor(
      minutes / 60,
    );

  const remainingMinutes =
    minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (
    remainingMinutes === 0
  ) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
}

export function createMapQuery(
  trip: FrequentTrip,
) {
  if (
    trip.latitude !== null &&
    trip.longitude !== null
  ) {
    return `${trip.latitude},${trip.longitude}`;
  }

  const location =
    [
      trip.location,
      trip.city,
      trip.state,
    ]
      .filter(Boolean)
      .join(", ");

  return location || null;
}

export function createGoogleMapsEmbedUrl(
  trip: FrequentTrip,
) {
  const query =
    createMapQuery(trip);

  if (!query) {
    return null;
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(
    query,
  )}&z=14&output=embed`;
}

export function createGoogleMapsExternalUrl(
  trip: FrequentTrip,
) {
  const query =
    createMapQuery(trip);

  if (!query) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
}