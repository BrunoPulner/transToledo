export type VehicleStatus =
  | "active"
  | "maintenance"
  | "inactive";

export type VehicleMediaType =
  | "image"
  | "video";

export type VehicleMedia = {
  url: string;
  type: VehicleMediaType;
  isCover?: boolean;
};

export type LuggageSize =
  | "small"
  | "medium"
  | "large";

export type LuggageDimensions = {
  widthCm: number;
  heightCm: number;
  depthCm: number;
};

export type VehicleFeatures = {
  airConditioning: boolean;
  wifi: boolean;
  usb: boolean;
  powerOutlet: boolean;
  recliningSeats: boolean;
  accessibility: boolean;
  television: boolean;
  refrigerator: boolean;
};

export type Vehicle = {
  id: string;

  model: string;
  year: number;

  passengerCapacity: number;

  luggageSize: LuggageSize;
  luggageCapacityLiters: number;

  luggageDimensions?: LuggageDimensions;

  status: VehicleStatus;

  features: VehicleFeatures;

  media: VehicleMedia[];

  createdAt?: Date;
  updatedAt?: Date;
};