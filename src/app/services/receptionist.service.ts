import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PassengerSearchResult } from '../models/reservation.model';
import { BoardingPass } from '../models/checkin.model';
import { BaggageReport, BaggageReportStatus } from '../models/baggage.model';
import { environment } from '../../environments/environment';

export interface ReceptionistCheckInRequest {
  passengerId: number;
  reservationId: number;
}

@Injectable({ providedIn: 'root' })
export class ReceptionistService {
  private http = inject(HttpClient);

  searchByDocument(documentId: string): Observable<PassengerSearchResult> {
    return this.http.get<PassengerSearchResult>(
      `${environment.apiUrl}/receptionist/passengers/search?documentId=${documentId}`
    );
  }

  searchById(passengerId: number): Observable<PassengerSearchResult> {
    return this.http.get<PassengerSearchResult>(
      `${environment.apiUrl}/receptionist/passengers/search?passengerId=${passengerId}`
    );
  }

  performCheckIn(request: ReceptionistCheckInRequest): Observable<BoardingPass> {
    return this.http.post<BoardingPass>(`${environment.apiUrl}/receptionist/checkin`, request);
  }

  getBoardingPass(checkInId: number): Observable<BoardingPass> {
    return this.http.post<BoardingPass>(`${environment.apiUrl}/receptionist/boarding-pass/${checkInId}`, {});
  }

  getAllReports(): Observable<BaggageReport[]> {
    return this.http.get<BaggageReport[]>(`${environment.apiUrl}/receptionist/baggage-reports`);
  }

  updateReportStatus(reportId: number, status: BaggageReportStatus): Observable<BaggageReport> {
    return this.http.put<BaggageReport>(
      `${environment.apiUrl}/receptionist/baggage-reports/${reportId}/status?status=${status}`,
      {}
    );
  }
}
