import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../models/reservation.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PassengerService {
  private http = inject(HttpClient);

  getMyReservations(status?: string): Observable<Reservation[]> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<Reservation[]>(`${environment.apiUrl}/passengers/my-reservations${params}`);
  }

  createReservation(flightId: number): Observable<Reservation> {
    return this.http.post<Reservation>(`${environment.apiUrl}/passengers/reservations`, { flightId });
  }

  cancelReservation(reservationId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/passengers/reservations/${reservationId}`);
  }
}
