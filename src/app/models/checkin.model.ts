export interface CheckInRequest {
  reservationCode: string;
}

export interface BoardingPass {
  id: number;
  checkInId: number;
  passengerName: string;
  flightCode: string;
  gate: string;
  seatNumber: string;
  departureTime: string;
  qrCodeBase64: string;
  /** @deprecated use qrCodeBase64 */
  qrCode?: string;
  generatedAt: string;
  validUntil: string;
  flight?: {
    flightCode: string;
    gate: string;
    departureTime: string;
    originAirport: string;
    destinationAirport: string;
  };
}
