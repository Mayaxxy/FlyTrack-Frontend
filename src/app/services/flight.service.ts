import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight, Airplane } from '../models/flight.model';
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

  createFlight(flightData: CreateFlightRequest): Observable<Flight> {
    return this.http.post<Flight>(`${environment.apiUrl}/flights`, flightData);
  }

  getAllFlights(): Observable<Flight[]> {
    return this.http.get<Flight[]>(`${environment.apiUrl}/flights`);
  }

  getAvailableAirplanes(): Observable<Airplane[]> {
    return this.http.get<Airplane[]>(`${environment.apiUrl}/airplanes/available`);
  }

  getAllAirplanes(): Observable<Airplane[]> {
    return this.http.get<Airplane[]>(`${environment.apiUrl}/airplanes`);
  }

  createAirplane(airplaneData: any): Observable<Airplane> {
    return this.http.post<Airplane>(`${environment.apiUrl}/airplanes`, airplaneData);
  }

  updateFlightStatus(flightCode: string, status: string): Observable<Flight> {
    return this.http.put<Flight>(`${environment.apiUrl}/flights/${flightCode}/status?status=${status}`, {});
  }
}

export interface CreateFlightRequest {
  flightCode: string;
  originAirport: string;
  destinationAirport: string;
  departureTime: string;
  arrivalTime: string;
  gate?: string;
  airplaneId?: number;
}
