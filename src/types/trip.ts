export type TripType =
  | "turismo"
  | "evento"
  | "show"
  | "universidade"
  | "excursao"
  | "outro";

export type TripMediaType =
  | "image"
  | "video";

export type TripMedia = {
  url: string;
  type: TripMediaType;
};

export type FrequentTrip = {
  id: string;

  name: string;

  city: string;
  state: string;

  location: string;

  latitude: number;
  longitude: number;

  averageDurationMinutes: number;

  type: TripType;

  description: string;

  media: TripMedia[];

  active: boolean;
  featured: boolean;

  order?: number;

  createdAt?: Date;
  updatedAt?: Date;
};