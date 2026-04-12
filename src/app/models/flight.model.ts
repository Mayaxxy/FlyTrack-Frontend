export interface Flight {
  id: number;
  flightCode: string;
  originAirport: string;
  destinationAirport: string;
  departureTime: string;
  arrivalTime: string;
  gate: string;
  status: FlightStatus;
}

export enum FlightStatus {
  SCHEDULED = 'SCHEDULED',
  DELAYED = 'DELAYED',
  BOARDING = 'BOARDING',
  DEPARTED = 'DEPARTED',
  ARRIVED = 'ARRIVED',
  CANCELLED = 'CANCELLED'
}
