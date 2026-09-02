export type VehicleCategory = "van";

export type VehicleMediaType =
  | "image"
  | "video";

export type VehicleMedia = {
  url: string;
  type: VehicleMediaType;
};

export type Vehicle = {
  id: string;

  name: string;

  model: string;

  capacity: number;

  category: VehicleCategory;

  media: VehicleMedia[];

  active: boolean;

  occupied: boolean;
};