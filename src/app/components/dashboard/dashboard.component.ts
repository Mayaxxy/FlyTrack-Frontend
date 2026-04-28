import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { PassengerService } from '../../services/passenger.service';
import { FlightService } from '../../services/flight.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Reservation } from '../../models/reservation.model';
import { Flight, FlightStatus } from '../../models/flight.model';
import { NavbarComponent } from '../navbar/navbar.component';

type Tab = 'explore' | 'reservations' | 'flights';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private passengerService = inject(PassengerService);
  private flightService = inject(FlightService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  activeTab = signal<Tab>('reservations');
  reservations = signal<Reservation[]>([]);
  flights = signal<Flight[]>([]);
  filteredFlights = signal<Flight[]>([]);
  loading = signal(false);
  error = signal('');
  successMsg = signal('');
  originFilter = signal('');
  destinationFilter = signal('');

  /** Solo reservas ACTIVE (CONFIRMADAS) */
  confirmedReservations = computed(() =>
    this.reservations().filter(r => r.status === 'ACTIVE')
  );

  /** Solo reservas ACTIVE con vuelo no cancelado y sin check-in aún → para "Mis Vuelos" */
  activeFlights = computed(() =>
    this.reservations().filter(r => r.status === 'ACTIVE' && r.flight.status !== 'CANCELLED')
  );

  private refreshSub?: Subscription;

  ngOnInit(): void {
    if (this.authService.isAdmin()) { this.router.navigate(['/admin']); return; }
    if (this.authService.isReceptionist()) { this.router.navigate(['/receptionist']); return; }
    this.loadReservations();
    this.refreshSub = interval(60000).subscribe(() => this.loadReservations());
    this.notificationService.startPolling().subscribe();
  }

  ngOnDestroy(): void { this.refreshSub?.unsubscribe(); }

  setTab(tab: Tab): void {
    this.activeTab.set(tab);
    this.error.set('');
    this.successMsg.set('');
    if (tab === 'explore' && this.flights().length === 0) this.loadFlights();
  }

  loadReservations(): void {
    this.loading.set(true);
    this.passengerService.getMyReservations().subscribe({
      next: (r) => { this.reservations.set(r); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar reservas'); this.loading.set(false); }
    });
  }

  loadFlights(): void {
    this.loading.set(true);
    this.flightService.getUpcomingFlights().subscribe({
      next: (f) => { this.flights.set(f); this.applyFilters(); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar vuelos'); this.loading.set(false); }
    });
  }

  applyFilters(): void {
    let f = this.flights();
    if (this.originFilter()) f = f.filter(v => v.originAirport.toLowerCase().includes(this.originFilter().toLowerCase()));
    if (this.destinationFilter()) f = f.filter(v => v.destinationAirport.toLowerCase().includes(this.destinationFilter().toLowerCase()));
    this.filteredFlights.set(f);
  }

  onOriginChange(v: string): void { this.originFilter.set(v); this.applyFilters(); }
  onDestinationChange(v: string): void { this.destinationFilter.set(v); this.applyFilters(); }
  clearFilters(): void { this.originFilter.set(''); this.destinationFilter.set(''); this.applyFilters(); }

  reserve(flight: Flight): void {
    this.error.set(''); this.successMsg.set('');
    this.passengerService.createReservation(flight.id).subscribe({
      next: () => {
        this.successMsg.set(`✅ Reserva confirmada para vuelo ${flight.flightCode}`);
        this.loadReservations();
        this.setTab('reservations');
      },
      error: (e) => this.error.set(e.error?.message || 'Error al crear reserva')
    });
  }

  cancelReservation(r: Reservation): void {
    if (!confirm(`¿Cancelar la reserva ${r.reservationCode}? Esta acción no se puede deshacer.`)) return;
    this.passengerService.cancelReservation(r.id).subscribe({
      next: () => { this.successMsg.set('Reserva cancelada correctamente'); this.loadReservations(); },
      error: (e) => this.error.set(e.error?.message || 'Error al cancelar')
    });
  }

  /** Check-in permitido: reserva ACTIVE, vuelo no cancelado, dentro de 2-24h, sin check-in previo */
  canCheckIn(r: Reservation): boolean {
    if (r.status !== 'ACTIVE' || r.hasCheckIn || r.flight.status === FlightStatus.CANCELLED) return false;
    const hours = (new Date(r.flight.departureTime).getTime() - Date.now()) / 3600000;
    return hours >= 2 && hours <= 24;
  }

  checkInWindowStatus(r: Reservation): string {
    if (r.status !== 'ACTIVE' || r.flight.status === FlightStatus.CANCELLED) return '';
    const hours = (new Date(r.flight.departureTime).getTime() - Date.now()) / 3600000;
    if (hours > 24) return `Check-in disponible en ${Math.floor(hours - 24)}h`;
    if (hours < 2) return 'Ventana de check-in cerrada';
    return '';
  }

  alreadyReserved(flight: Flight): boolean {
    return this.reservations().some(r => r.flight.id === flight.id && r.status === 'ACTIVE');
  }

  goToCheckIn(r: Reservation): void {
    this.router.navigate(['/checkin'], { queryParams: { reservationCode: r.reservationCode } });
  }

  goToBoardingPass(r: Reservation): void {
    if (r.checkInId) this.router.navigate(['/boarding-pass', r.checkInId]);
  }

  statusClass = (s: string) => `status-${s.toLowerCase()}`;
  statusText = (s: string) => ({
    SCHEDULED: 'Programado', DELAYED: 'Retrasado', BOARDING: 'Abordando',
    DEPARTED: 'Despegado', ARRIVED: 'Arribado', CANCELLED: 'Cancelado'
  }[s] || s);
  fmtDate = (d: string) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  fmtTime = (d: string) => new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}
