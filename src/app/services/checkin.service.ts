import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CheckInRequest, BoardingPass } from '../models/checkin.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckInService {
  private http = inject(HttpClient);

  performCheckIn(request: CheckInRequest): Observable<BoardingPass> {
    return this.http.post<BoardingPass>(`${environment.apiUrl}/checkin`, request);
  }

  getBoardingPass(checkInId: number): Observable<BoardingPass> {
    return this.http.get<BoardingPass>(`${environment.apiUrl}/boarding-pass/${checkInId}`);
  }
}
