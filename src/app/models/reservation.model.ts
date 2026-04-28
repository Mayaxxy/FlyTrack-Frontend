import { Flight } from './flight.model';

export type ReservationStatus = 'ACTIVE' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: number;
  reservationCode: string;
  status: ReservationStatus;
  flight: Flight;
  checkInId?: number;
  hasCheckIn: boolean;
  seatNumber?: string;
}

export interface PassengerSearchResult {
  passenger: {
    id: number;
    documentId: string;
    documentType: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  reservations: Reservation[];
}
