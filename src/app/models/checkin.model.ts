export interface CheckInRequest {
  flightCode: string;
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
  qrCode: string;
  generatedAt: string;
}
