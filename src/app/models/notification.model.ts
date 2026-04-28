export interface Notification {
  id: number;
  passengerId?: number;
  flightCode?: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt?: string;
  sentAt: string;
  flight: {
    id: number;
    flightCode: string;
    originAirport: string;
    destinationAirport: string;
    departureTime: string;
    arrivalTime: string;
    gate: string;
    status: string;
  };
}

export enum NotificationType {
  GATE_CHANGE = 'GATE_CHANGE',
  TIME_CHANGE = 'TIME_CHANGE',
  DELAY = 'DELAY',
  CANCELLATION = 'CANCELLATION',
  BOARDING_STARTED = 'BOARDING_STARTED'
}
