import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, tap } from 'rxjs';
import { Notification } from '../models/notification.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  public unreadCount = signal(0);

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${environment.apiUrl}/notifications`)
      .pipe(
        tap(notifications => {
          const unread = notifications.filter(n => !n.read).length;
          this.unreadCount.set(unread);
        })
      );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/notifications/${id}/read`, {})
      .pipe(
        tap(() => {
          const current = this.unreadCount();
          if (current > 0) {
            this.unreadCount.set(current - 1);
          }
        })
      );
  }

  startPolling(): Observable<Notification[]> {
    return interval(30000).pipe(
      switchMap(() => this.getNotifications())
    );
  }
}
