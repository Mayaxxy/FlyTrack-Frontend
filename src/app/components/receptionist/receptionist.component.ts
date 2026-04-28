import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReceptionistService, ReceptionistCheckInRequest } from '../../services/receptionist.service';
import { PassengerSearchResult, Reservation } from '../../models/reservation.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { Flight } from '../../models/flight.model';
import { FlightService } from '../../services/flight.service';
import { BaggageReport, BaggageReportStatus } from '../../models/baggage.model';

@Component({
  selector: 'app-receptionist',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './receptionist.component.html',
  styleUrls: ['./receptionist.component.css']
})
export class ReceptionistComponent implements OnInit {
  private receptionistService = inject(ReceptionistService);
  private flightService = inject(FlightService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Expose enum to template
  BaggageReportStatus = BaggageReportStatus;

  activeTab = signal<'search' | 'flights' | 'reports'>('search');
  searchQuery = signal('');
  result = signal<PassengerSearchResult | null>(null);
  loading = signal(false);
  error = signal('');
  successMsg = signal('');

  flights = signal<Flight[]>([]);
  reports = signal<BaggageReport[]>([]);
  statusFilter = signal<string>('ACTIVE');
  gateFilter = signal<string>('ALL');
  flightStatusFilter = signal<string>('ALL');

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'] as 'search' | 'flights' | 'reports';
      if (tab) {
        this.activeTab.set(tab);
      }
    });
    this.loadFlights();
    this.loadReports();
  }

  search(): void {
    const q = this.searchQuery().trim();
    if (!q) { this.error.set('Ingresa un criterio de búsqueda'); return; }
    this.loading.set(true);
    this.error.set('');
    this.successMsg.set('');
    this.result.set(null);

    this.receptionistService.searchByDocument(q).subscribe({
      next: (r) => { this.result.set(r); this.loading.set(false); },
      error: (e) => { this.error.set(e.error?.message || 'Pasajero no encontrado'); this.loading.set(false); }
    });
  }

  performCheckIn(r: Reservation): void {
    const res = this.result();
    if (!res) return;
    const req: ReceptionistCheckInRequest = { passengerId: res.passenger.id, reservationId: r.id };
    this.loading.set(true);
    this.receptionistService.performCheckIn(req).subscribe({
      next: (bp) => {
        this.successMsg.set('Check-in exitoso. Redirigiendo al pase de abordaje...');
        this.loading.set(false);
        this.router.navigate(['/boarding-pass', bp.checkInId]);
      },
      error: (e) => { this.error.set(e.error?.message || 'Error en check-in'); this.loading.set(false); }
    });
  }

  viewBoardingPass(r: Reservation): void {
    if (r.checkInId) this.router.navigate(['/boarding-pass', r.checkInId]);
  }

  canCheckIn(r: Reservation): boolean {
    if (r.flight.status === 'CANCELLED' || r.hasCheckIn) return false;
    const hours = (new Date(r.flight.departureTime).getTime() - Date.now()) / 3600000;
    return hours >= 2 && hours <= 24;
  }

  getStatusClass(status: string): string { return `status-${status.toLowerCase()}`; }

  getStatusText(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'Programado', DELAYED: 'Retrasado', BOARDING: 'Abordando',
      DEPARTED: 'Despegado', ARRIVED: 'Arribado', CANCELLED: 'Cancelado'
    };
    return map[status] || status;
  }

  formatTime(d: string): string {
    return new Date(d).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatDateShort(d: string): string {
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  }

  filteredFlights(): Flight[] {
    let filtered = this.flights();
    
    if (this.gateFilter() !== 'ALL') {
      filtered = filtered.filter(f => f.gate === this.gateFilter());
    }
    
    if (this.flightStatusFilter() !== 'ALL') {
      filtered = filtered.filter(f => f.status === this.flightStatusFilter());
    }
    
    return filtered;
  }

  getUniqueGates(): string[] {
    const gates = this.flights().map(f => f.gate).filter(g => g);
    return [...new Set(gates)].sort();
  }

  loadFlights(): void {
    this.flightService.getUpcomingFlights().subscribe({
      next: (f) => this.flights.set(f),
      error: () => this.flights.set([])
    });
  }

  loadReports(): void {
    this.receptionistService.getAllReports().subscribe({
      next: (r) => this.reports.set(r),
      error: () => this.reports.set([])
    });
  }

  filteredReports(): BaggageReport[] {
    const filter = this.statusFilter();
    if (filter === 'ALL') return this.reports();
    return this.reports().filter(r => r.status === filter);
  }

  activeReports(): BaggageReport[] {
    return this.reports().filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS');
  }

  resolvedReports(): BaggageReport[] {
    return this.reports().filter(r => r.status === 'RESOLVED');
  }

  activeReportsCount(): number {
    return this.activeReports().length;
  }

  updateReportStatus(reportId: number, newStatus: BaggageReportStatus): void {
    this.loading.set(true);
    this.receptionistService.updateReportStatus(reportId, newStatus).subscribe({
      next: () => {
        this.successMsg.set('Estado actualizado');
        this.loadReports();
        this.loading.set(false);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (e) => {
        this.error.set(e.error?.message || 'Error al actualizar');
        this.loading.set(false);
        setTimeout(() => this.error.set(''), 3000);
      }
    });
  }

  canTransitionTo(current: BaggageReportStatus, next: BaggageReportStatus): boolean {
    if (current === 'PENDING' && next === 'IN_PROGRESS') return true;
    if (current === 'IN_PROGRESS' && next === 'RESOLVED') return true;
    return false;
  }

  getNextStatus(current: BaggageReportStatus): BaggageReportStatus | null {
    if (current === 'PENDING') return BaggageReportStatus.IN_PROGRESS;
    if (current === 'IN_PROGRESS') return BaggageReportStatus.RESOLVED;
    return null;
  }

  getStatusLabel(status: BaggageReportStatus): string {
    const map: Record<string, string> = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Proceso',
      RESOLVED: 'Resuelto'
    };
    return map[status] || status;
  }

  getNextStatusLabel(status: BaggageReportStatus): string {
    const next = this.getNextStatus(status);
    return next ? this.getStatusLabel(next) : '';
  }
}
