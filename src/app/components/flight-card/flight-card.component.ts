import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Flight, FlightStatus } from '../../models/flight.model';

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flight-card.component.html',
  styleUrls: ['./flight-card.component.css']
})
export class FlightCardComponent {
  private router = inject(Router);

  @Input({ required: true }) flight!: Flight;

  canCheckIn(): boolean {
    if (this.flight.status === FlightStatus.CANCELLED) {
      return false;
    }

    const departureTime = new Date(this.flight.departureTime);
    const now = new Date();
    const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilDeparture >= 2 && hoursUntilDeparture <= 48;
  }

  getStatusClass(): string {
    switch (this.flight.status) {
      case FlightStatus.SCHEDULED:
        return 'status-scheduled';
      case FlightStatus.DELAYED:
        return 'status-delayed';
      case FlightStatus.BOARDING:
        return 'status-boarding';
      case FlightStatus.DEPARTED:
        return 'status-departed';
      case FlightStatus.ARRIVED:
        return 'status-arrived';
      case FlightStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(): string {
    switch (this.flight.status) {
      case FlightStatus.SCHEDULED:
        return 'Programado';
      case FlightStatus.DELAYED:
        return 'Retrasado';
      case FlightStatus.BOARDING:
        return 'Abordando';
      case FlightStatus.DEPARTED:
        return 'Despegado';
      case FlightStatus.ARRIVED:
        return 'Arribado';
      case FlightStatus.CANCELLED:
        return 'Cancelado';
      default:
        return this.flight.status;
    }
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  goToCheckIn(): void {
    this.router.navigate(['/checkin', this.flight.flightCode]);
  }
}
