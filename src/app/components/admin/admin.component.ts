import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  private apiUrl = 'http://localhost:8080/api';

  flights = signal<any[]>([]);
  loading = signal(false);
  error   = signal('');
  success = signal('');
  showForm = signal(false);

  // Form fields
  flightCode   = signal('');
  origin       = signal('');
  destination  = signal('');
  departureTime = signal('');
  arrivalTime  = signal('');
  gate         = signal('');
  submitting   = signal(false);

  ngOnInit(): void {
    // Verificar que sea admin
    this.authService.currentUser$.subscribe(user => {
      if (user && user.role !== 'ADMIN') {
        this.router.navigate(['/dashboard']);
      }
    });
    this.loadFlights();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadFlights(): void {
    this.loading.set(true);
    this.http.get<any[]>(`${this.apiUrl}/admin/flights`, { headers: this.getHeaders() })
      .subscribe({
        next: (data) => { this.flights.set(data); this.loading.set(false); },
        error: () => { this.error.set('Error al cargar vuelos'); this.loading.set(false); }
      });
  }

  onSubmit(): void {
    this.error.set('');
    this.success.set('');

    if (!this.flightCode() || !this.origin() || !this.destination() || !this.departureTime() || !this.arrivalTime()) {
      this.error.set('Completa todos los campos obligatorios');
      return;
    }

    this.submitting.set(true);

    const payload = {
      flightCode:        this.flightCode().toUpperCase().trim(),
      originAirport:     this.origin().toUpperCase().trim(),
      destinationAirport: this.destination().toUpperCase().trim(),
      departureTime:     this.departureTime(),
      arrivalTime:       this.arrivalTime(),
      gate:              this.gate().trim() || null
    };

    this.http.post<any>(`${this.apiUrl}/admin/flights`, payload, { headers: this.getHeaders() })
      .subscribe({
        next: (flight) => {
          this.submitting.set(false);
          this.success.set(`Vuelo ${flight.flightCode} creado exitosamente`);
          this.showForm.set(false);
          this.resetForm();
          this.loadFlights();
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message || 'Error al crear el vuelo');
        }
      });
  }

  updateStatus(flightCode: string, status: string): void {
    this.http.put(`${this.apiUrl}/flights/${flightCode}/status`,
      { status },
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => { this.success.set(`Estado actualizado`); this.loadFlights(); },
      error: (err) => this.error.set(err.error?.message || 'Error al actualizar estado')
    });
  }

  private resetForm(): void {
    this.flightCode.set('');
    this.origin.set('');
    this.destination.set('');
    this.departureTime.set('');
    this.arrivalTime.set('');
    this.gate.set('');
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'Programado', DELAYED: 'Retrasado',
      BOARDING: 'Abordando', DEPARTED: 'Despegado',
      ARRIVED: 'Llegado', CANCELLED: 'Cancelado'
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'badge-info', DELAYED: 'badge-warning',
      BOARDING: 'badge-success', DEPARTED: 'badge-default',
      ARRIVED: 'badge-success', CANCELLED: 'badge-danger'
    };
    return map[status] || 'badge-default';
  }
}
