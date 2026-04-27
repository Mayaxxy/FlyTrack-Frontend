export interface Flight {
  id: number;
  flightCode: string;
  originAirport: string;
  destinationAirport: string;
  departureTime: string;
  arrivalTime: string;
  gate: string;
  status: FlightStatus;
  airplane?: Airplane; // Información del avión asignado (opcional)
}

export interface Airplane {
  id: number;
  registration: string;
  model: string;
  manufacturer: string;
  capacity: number;
  status: string;
  yearManufactured?: number;
}

export enum FlightStatus {
  SCHEDULED = 'SCHEDULED',
  DELAYED = 'DELAYED',
  BOARDING = 'BOARDING',
  DEPARTED = 'DEPARTED',
  ARRIVED = 'ARRIVED',
  CANCELLED = 'CANCELLED'
}
