import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaggageService } from '../../services/baggage.service';
import { PassengerService } from '../../services/passenger.service';
import { BaggageReport, BaggageReportRequest, BaggageReportStatus } from '../../models/baggage.model';
import { Reservation } from '../../models/reservation.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-baggage',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './baggage.component.html',
  styleUrls: ['./baggage.component.css']
})
export class BaggageComponent implements OnInit {
  private baggageService = inject(BaggageService);
  private passengerService = inject(PassengerService);

  reports = signal<BaggageReport[]>([]);
  /** Solo reservas ACTIVE o COMPLETED — no canceladas */
  validReservations = signal<Reservation[]>([]);
  loading = signal(true);
  error = signal('');
  showForm = signal(false);
  activeTab = signal<'active' | 'resolved'>('active');

  selectedFlightId = signal<number | null>(null);
  description = signal('');
  submitting = signal(false);
  submitError = signal('');

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.baggageService.getMyReports().subscribe({
      next: (r) => { this.reports.set(r); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar reportes'); this.loading.set(false); }
    });
    this.passengerService.getMyReservations().subscribe({
      next: (res) => this.validReservations.set(res.filter(r => r.status === 'ACTIVE' || r.status === 'COMPLETED'))
    });
  }

  activeReports(): BaggageReport[] {
    return this.reports().filter(r => r.status === BaggageReportStatus.PENDING || r.status === BaggageReportStatus.IN_PROGRESS);
  }

  resolvedReports(): BaggageReport[] {
    return this.reports().filter(r => r.status === BaggageReportStatus.RESOLVED);
  }

  canCreateReport(): boolean {
    return this.activeReports().length < 3;
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) { this.resetForm(); }
  }

  onSubmit(): void {
    if (!this.selectedFlightId() || !this.description().trim()) {
      this.submitError.set('Selecciona un vuelo e ingresa una descripción');
      return;
    }
    this.submitting.set(true);
    this.submitError.set('');
    const req: BaggageReportRequest = { flightId: this.selectedFlightId()!, description: this.description() };
    this.baggageService.createReport(req).subscribe({
      next: () => { this.submitting.set(false); this.showForm.set(false); this.resetForm(); this.loadData(); },
      error: (e) => { this.submitting.set(false); this.submitError.set(e.error?.message || 'Error al crear reporte'); }
    });
  }

  resetForm(): void { this.selectedFlightId.set(null); this.description.set(''); this.submitError.set(''); }

  statusClass = (s: BaggageReportStatus) => ({ PENDING: 'status-pending', IN_PROGRESS: 'status-progress', RESOLVED: 'status-resolved' }[s] || '');
  statusText = (s: BaggageReportStatus) => ({ PENDING: 'Pendiente', IN_PROGRESS: 'En Proceso', RESOLVED: 'Resuelto' }[s] || s);
  fmtDate = (d: string) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' } as any);
}
