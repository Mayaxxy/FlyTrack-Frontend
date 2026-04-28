import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaggageReport, BaggageReportRequest } from '../models/baggage.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BaggageService {
  private http = inject(HttpClient);

  createReport(request: BaggageReportRequest): Observable<BaggageReport> {
    return this.http.post<BaggageReport>(`${environment.apiUrl}/baggage-reports`, request);
  }

  getMyReports(): Observable<BaggageReport[]> {
    return this.http.get<BaggageReport[]>(`${environment.apiUrl}/baggage-reports/my-reports`);
  }
}
