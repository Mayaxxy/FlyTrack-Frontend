import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaggageService } from '../../services/baggage.service';
import { BaggageReport, BaggageReportRequest, BaggageReportStatus } from '../../models/baggage.model';
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

  reports = signal<BaggageReport[]>([]);
  loading = signal(true);
  error = signal('');
  showForm = signal(false);

  flightCode = signal('');
  description = signal('');
  baggageTag = signal('');
  submitting = signal(false);
  submitError = signal('');

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    this.baggageService.getMyReports().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los reportes');
        this.loading.set(false);
      }
    });
  }

  toggleForm(): void {
    this.showForm.set(!this.showForm());
    if (this.showForm()) {
      this.resetForm();
    }
  }

  canCreateReport(): boolean {
    const activeReports = this.reports().filter(
      r => r.status === BaggageReportStatus.PENDING || r.status === BaggageReportStatus.IN_PROGRESS
    );
    return activeReports.length < 5;
  }

  onSubmit(): void {
    if (!this.flightCode() || !this.description() || !this.baggageTag()) {
      this.submitError.set('Por favor complete todos los campos');
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    const request: BaggageReportRequest = {
      flightCode: this.flightCode(),
      description: this.description(),
      baggageTag: this.baggageTag()
    };

    this.baggageService.createReport(request).subscribe({
      next: (report) => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.resetForm();
        this.loadReports();
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err.error?.message || 'Error al crear el reporte');
      }
    });
  }

  resetForm(): void {
    this.flightCode.set('');
    this.description.set('');
    this.baggageTag.set('');
    this.submitError.set('');
  }

  getStatusClass(status: BaggageReportStatus): string {
    switch (status) {
      case BaggageReportStatus.PENDING:
        return 'status-pending';
      case BaggageReportStatus.IN_PROGRESS:
        return 'status-in-progress';
      case BaggageReportStatus.RESOLVED:
        return 'status-resolved';
      default:
        return '';
    }
  }

  getStatusText(status: BaggageReportStatus): string {
    switch (status) {
      case BaggageReportStatus.PENDING:
        return 'Pendiente';
      case BaggageReportStatus.IN_PROGRESS:
        return 'En Proceso';
      case BaggageReportStatus.RESOLVED:
        return 'Resuelto';
      default:
        return status;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
