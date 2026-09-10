export type QuoteRequestStatus =
  | "pending"
  | "approved"
  | "rejected";

export type QuoteRequestRecord = {
  id: string;
  vehicleId: string;
  vehicleName: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  trip: {
    mode: "registered" | "custom";
    frequentTripId: string | null;
    name: string;
    origin: {
      address: string;
      latitude: number;
      longitude: number;
    };
    destination: {
      address: string;
      latitude: number;
      longitude: number;
    };
    passengers: number;
    notes: string;
  };
  startsAt: string;
  endsAt: string;
  status: QuoteRequestStatus;
  source: string;
  rejectionReason: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  reviewedAt: string | null;
};
