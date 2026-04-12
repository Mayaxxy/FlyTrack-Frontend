import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Notification, NotificationType } from '../../models/notification.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications = signal<Notification[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las notificaciones');
        this.loading.set(false);
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          const updated = this.notifications().map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          );
          this.notifications.set(updated);
        }
      });
    }
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.GATE_CHANGE:
        return '🚪';
      case NotificationType.TIME_CHANGE:
        return '⏰';
      case NotificationType.DELAY:
        return '⏱️';
      case NotificationType.CANCELLATION:
        return '❌';
      case NotificationType.BOARDING_STARTED:
        return '✈️';
      default:
        return '📢';
    }
  }

  getNotificationClass(type: NotificationType): string {
    switch (type) {
      case NotificationType.GATE_CHANGE:
        return 'notification-gate';
      case NotificationType.TIME_CHANGE:
        return 'notification-time';
      case NotificationType.DELAY:
        return 'notification-delay';
      case NotificationType.CANCELLATION:
        return 'notification-cancellation';
      case NotificationType.BOARDING_STARTED:
        return 'notification-boarding';
      default:
        return '';
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-CO');
  }
}
