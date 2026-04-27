import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { FlightService } from '../../services/flight.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Flight, FlightStatus } from '../../models/flight.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { FlightCardComponent } from '../flight-card/flight-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FlightCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private flightService = inject(FlightService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  flights = signal<Flight[]>([]);
  filteredFlights = signal<Flight[]>([]);
  loading = signal(true);
  error = signal('');
  
  originFilter = signal('');
  destinationFilter = signal('');

  private refreshSubscription?: Subscription;
  private notificationSubscription?: Subscription;

  ngOnInit(): void {
    // Si es admin, redirigir al panel de admin
    if (this.isAdmin()) {
      this.router.navigate(['/admin'], { queryParams: { tab: 'flights' } });
      return;
    }
    
    this.loadFlights();
    this.startAutoRefresh();
    this.startNotificationPolling();
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
  }

  loadFlights(): void {
    this.loading.set(true);
    this.error.set('');

    this.flightService.getUpcomingFlights().subscribe({
      next: (flights) => {
        this.flights.set(flights);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los vuelos');
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    let filtered = this.flights();

    if (this.originFilter()) {
      filtered = filtered.filter(f => 
        f.originAirport.toLowerCase().includes(this.originFilter().toLowerCase())
      );
    }

    if (this.destinationFilter()) {
      filtered = filtered.filter(f => 
        f.destinationAirport.toLowerCase().includes(this.destinationFilter().toLowerCase())
      );
    }

    this.filteredFlights.set(filtered);
  }

  onOriginFilterChange(value: string): void {
    this.originFilter.set(value);
    this.applyFilters();
  }

  onDestinationFilterChange(value: string): void {
    this.destinationFilter.set(value);
    this.applyFilters();
  }

  clearFilters(): void {
    this.originFilter.set('');
    this.destinationFilter.set('');
    this.applyFilters();
  }

  private startAutoRefresh(): void {
    this.refreshSubscription = interval(60000).subscribe(() => {
      this.loadFlights();
    });
  }

  private startNotificationPolling(): void {
    this.notificationSubscription = this.notificationService.startPolling().subscribe();
  }

  getStatusClass(status: FlightStatus): string {
    switch (status) {
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

  getStatusText(status: FlightStatus): string {
    switch (status) {
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
        return status;
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
