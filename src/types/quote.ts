export type QuoteStep =
  | "vehicle"
  | "trip"
  | "contact"
  | "review";

export type QuoteTripMode =
  | "registered"
  | "custom";

export type QuoteContact = {
  name: string;
  email: string;
  phone: string;
  phoneVerificationToken: string;
};

export type QuoteDraft = {
  vehicleId: string;
  vehicleName: string;

  tripMode: QuoteTripMode | null;
  frequentTripId: string;
  tripName: string;

  origin: string;
  destination: string;

destinationLatitude: number | null;
  destinationLongitude: number | null;

  originLatitude: number | null;
originLongitude: number | null;


  departureDate: Date | null;
  returnDate: Date | null;

  passengers: number;
  notes: string;

  contact: QuoteContact;
};

export const initialQuoteDraft: QuoteDraft = {
  vehicleId: "",
  vehicleName: "",

  tripMode: null,
  frequentTripId: "",
  tripName: "",

  origin: "",
  destination: "",

  destinationLatitude: null,
  destinationLongitude: null,

  originLatitude: null,
  originLongitude: null,

  departureDate: null,
  returnDate: null,

  passengers: 1,
  notes: "",

  contact: {
    name: "",
    email: "",
    phone: "",
    phoneVerificationToken: "",
  },
};