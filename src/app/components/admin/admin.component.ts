import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FlightService } from '../../services/flight.service';
import { Flight } from '../../models/flight.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private authService = inject(AuthService);
  private flightService = inject(FlightService);
  private router = inject(Router);

  flights = signal<Flight[]>([]);
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

  loadFlights(): void {
    this.loading.set(true);
    this.flightService.getUpcomingFlights().subscribe({
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

    // Validar que las fechas no sean en el pasado
    const now = new Date();
    const departure = new Date(this.departureTime());
    const arrival = new Date(this.arrivalTime());

    if (departure < now) {
      this.error.set('La fecha de salida no puede ser en el pasado');
      return;
    }

    if (arrival < now) {
      this.error.set('La fecha de llegada no puede ser en el pasado');
      return;
    }

    if (arrival <= departure) {
      this.error.set('La fecha de llegada debe ser posterior a la fecha de salida');
      return;
    }

    this.submitting.set(true);

    const payload = {
      flightCode:        this.flightCode().toUpperCase().trim(),
      originAirport:     this.origin().toUpperCase().trim(),
      destinationAirport: this.destination().toUpperCase().trim(),
      departureTime:     this.departureTime(),
      arrivalTime:       this.arrivalTime(),
      gate:              this.gate().trim() || undefined
    };

    this.flightService.createFlight(payload).subscribe({
      next: (flight) => {
        this.submitting.set(false);
        this.success.set(`Vuelo ${flight.flightCode} creado exitosamente`);
        this.showForm.set(false);
        this.resetForm();
        this.loadFlights();
      },
      error: (err) => {
        this.submitting.set(false);
        const errorMsg = err.error?.errors?.flightCode || err.error?.message || 'Error al crear el vuelo';
        this.error.set(errorMsg);
      }
    });
  }

  updateStatus(flightCode: string, status: string): void {
    // Este método requiere un endpoint PUT en el backend que ya existe
    // Por ahora lo dejamos comentado hasta que se implemente completamente
    this.success.set('Funcionalidad de actualización de estado próximamente');
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

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
