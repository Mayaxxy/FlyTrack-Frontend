import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight } from '../models/flight.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private http = inject(HttpClient);

  getUpcomingFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${environment.apiUrl}/flights/public/upcoming`);
  }

  getFlightsByOrigin(origin: string): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${environment.apiUrl}/flights/public/origin/${origin}`);
  }

  getFlightsByDestination(destination: string): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${environment.apiUrl}/flights/public/destination/${destination}`);
  }
}
