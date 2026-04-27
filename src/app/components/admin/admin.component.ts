import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FlightService } from '../../services/flight.service';
import { Flight, Airplane } from '../../models/flight.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private authService = inject(AuthService);
  private flightService = inject(FlightService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  flights = signal<Flight[]>([]);
  allFlights = signal<Flight[]>([]);
  loading = signal(false);
  error   = signal('');
  success = signal('');
  showForm = signal(false);
  activeTab = signal<'flights' | 'airplanes' | 'history'>('flights');

  // Form fields
  flightCode   = signal('');
  originCountry = signal('');
  origin       = signal('');
  destinationCountry = signal('');
  destination  = signal('');
  departureDate = signal('');
  departureTime = signal('');
  arrivalDate  = signal('');
  arrivalTime  = signal('');
  gate         = signal('');
  airplaneId   = signal<number | null>(null);
  submitting   = signal(false);

  // Form fields - Airplane
  airplaneRegistration = signal('');
  airplaneModel = signal('');
  airplaneManufacturer = signal('');
  airplaneCapacity = signal<number | null>(null);
  airplaneYear = signal<number | null>(null);
  
  // Airplane errors
  airplaneRegistrationError = signal('');
  airplaneModelError = signal('');
  airplaneManufacturerError = signal('');
  airplaneCapacityError = signal('');

  // Available airplanes
  availableAirplanes = signal<Airplane[]>([]);
  allAirplanes = signal<Airplane[]>([]); // Todos los aviones para la tabla

  // Field errors
  flightCodeError = signal('');
  originError = signal('');
  destinationError = signal('');
  departureDateError = signal('');
  arrivalDateError = signal('');

  // Países disponibles
  countries = [
    { code: 'CO', name: 'Colombia' },
    { code: 'MX', name: 'México' },
    { code: 'PA', name: 'Panamá' },
    { code: 'PE', name: 'Perú' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'CL', name: 'Chile' },
    { code: 'AR', name: 'Argentina' },
    { code: 'BR', name: 'Brasil' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'CU', name: 'Cuba' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'ES', name: 'España' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'FR', name: 'Francia' },
    { code: 'IT', name: 'Italia' },
    { code: 'NL', name: 'Países Bajos' },
    { code: 'DE', name: 'Alemania' },
    { code: 'PT', name: 'Portugal' }
  ];

  // Aeropuertos organizados por país
  airportsByCountry: Record<string, Array<{code: string, name: string}>> = {
    'CO': [
      { code: 'BOG', name: 'Bogotá - El Dorado' },
      { code: 'MDE', name: 'Medellín - José María Córdova' },
      { code: 'CLO', name: 'Cali - Alfonso Bonilla Aragón' },
      { code: 'CTG', name: 'Cartagena - Rafael Núñez' },
      { code: 'BAQ', name: 'Barranquilla - Ernesto Cortissoz' },
      { code: 'SMR', name: 'Santa Marta - Simón Bolívar' },
      { code: 'BGA', name: 'Bucaramanga - Palonegro' },
      { code: 'PEI', name: 'Pereira - Matecaña' },
      { code: 'ADZ', name: 'San Andrés - Gustavo Rojas Pinilla' },
      { code: 'AXM', name: 'Armenia - El Edén' },
      { code: 'CUC', name: 'Cúcuta - Camilo Daza' },
      { code: 'MTR', name: 'Montería - Los Garzones' },
      { code: 'VVC', name: 'Villavicencio - Vanguardia' },
      { code: 'IBE', name: 'Ibagué - Perales' },
      { code: 'NVA', name: 'Neiva - Benito Salas' },
      { code: 'PSO', name: 'Pasto - Antonio Nariño' },
      { code: 'LET', name: 'Leticia - Alfredo Vásquez Cobo' }
    ],
    'MX': [
      { code: 'MEX', name: 'Ciudad de México - Benito Juárez' },
      { code: 'CUN', name: 'Cancún' },
      { code: 'GDL', name: 'Guadalajara' }
    ],
    'PA': [{ code: 'PTY', name: 'Ciudad de Panamá - Tocumen' }],
    'PE': [{ code: 'LIM', name: 'Lima - Jorge Chávez' }],
    'EC': [
      { code: 'GYE', name: 'Guayaquil - José Joaquín de Olmedo' },
      { code: 'UIO', name: 'Quito - Mariscal Sucre' }
    ],
    'CL': [{ code: 'SCL', name: 'Santiago - Arturo Merino Benítez' }],
    'AR': [{ code: 'EZE', name: 'Buenos Aires - Ezeiza' }],
    'BR': [
      { code: 'GRU', name: 'São Paulo - Guarulhos' },
      { code: 'GIG', name: 'Río de Janeiro - Galeão' }
    ],
    'VE': [{ code: 'CCS', name: 'Caracas - Simón Bolívar' }],
    'CU': [{ code: 'HAV', name: 'La Habana - José Martí' }],
    'CR': [{ code: 'SJO', name: 'San José - Juan Santamaría' }],
    'SV': [{ code: 'SAL', name: 'San Salvador - Monseñor Óscar Romero' }],
    'US': [
      { code: 'MIA', name: 'Miami' },
      { code: 'JFK', name: 'Nueva York - JFK' },
      { code: 'LAX', name: 'Los Ángeles' },
      { code: 'ATL', name: 'Atlanta' },
      { code: 'ORD', name: 'Chicago - O\'Hare' },
      { code: 'DFW', name: 'Dallas/Fort Worth' },
      { code: 'IAH', name: 'Houston' },
      { code: 'FLL', name: 'Fort Lauderdale' },
      { code: 'MCO', name: 'Orlando' }
    ],
    'ES': [
      { code: 'MAD', name: 'Madrid - Barajas' },
      { code: 'BCN', name: 'Barcelona - El Prat' }
    ],
    'GB': [{ code: 'LHR', name: 'Londres - Heathrow' }],
    'FR': [{ code: 'CDG', name: 'París - Charles de Gaulle' }],
    'IT': [{ code: 'FCO', name: 'Roma - Fiumicino' }],
    'NL': [{ code: 'AMS', name: 'Ámsterdam - Schiphol' }],
    'DE': [{ code: 'FRA', name: 'Frankfurt' }],
    'PT': [{ code: 'LIS', name: 'Lisboa - Portela' }]
  };

  // Aeropuertos filtrados según país seleccionado
  get originAirports() {
    return this.originCountry() ? this.airportsByCountry[this.originCountry()] || [] : [];
  }

  get destinationAirports() {
    return this.destinationCountry() ? this.airportsByCountry[this.destinationCountry()] || [] : [];
  }

  // Fecha mínima (hoy)
  get minDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Fecha mínima de llegada (fecha de salida o hoy)
  get minArrivalDate(): string {
    return this.departureDate() || this.minDate;
  }

  // Habilitar campos de llegada solo si hay fecha y hora de salida
  get canEnterArrival(): boolean {
    return !!(this.departureDate() && this.departureTime());
  }

  // Resetear aeropuerto cuando cambia el país
  onOriginCountryChange(): void {
    this.origin.set('');
  }

  onDestinationCountryChange(): void {
    this.destination.set('');
  }

  // Validar fecha/hora de salida en tiempo real
  onDepartureDateTimeChange(): void {
    if (this.departureDate() && this.departureTime()) {
      const departureDateTime = `${this.departureDate()}T${this.departureTime()}`;
      const departure = new Date(departureDateTime);
      const now = new Date();
      
      if (departure < now) {
        this.departureDateError.set('La fecha y hora de salida no pueden ser en el pasado');
      } else {
        this.departureDateError.set('');
      }
    }
  }

  // Validar fecha/hora de llegada en tiempo real
  onArrivalDateTimeChange(): void {
    if (this.arrivalDate() && this.arrivalTime() && this.departureDate() && this.departureTime()) {
      const departureDateTime = `${this.departureDate()}T${this.departureTime()}`;
      const arrivalDateTime = `${this.arrivalDate()}T${this.arrivalTime()}`;
      const departure = new Date(departureDateTime);
      const arrival = new Date(arrivalDateTime);
      
      if (arrival <= departure) {
        this.arrivalDateError.set('La llegada debe ser posterior a la salida');
      } else {
        this.arrivalDateError.set('');
      }
    }
  }

  ngOnInit(): void {
    // Verificar que sea admin
    this.authService.currentUser$.subscribe(user => {
      if (user && user.role !== 'ADMIN') {
        this.router.navigate(['/dashboard']);
      }
    });
    
    // Leer el parámetro de query para la pestaña activa
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'flights' || tab === 'airplanes' || tab === 'history') {
        this.activeTab.set(tab);
      }
    });
    
    this.loadFlights();
    this.loadAvailableAirplanes();
    this.loadAllAirplanes();
    this.loadAllFlights();
  }

  loadFlights(): void {
    this.loading.set(true);
    this.flightService.getUpcomingFlights().subscribe({
      next: (data) => { this.flights.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar vuelos'); this.loading.set(false); }
    });
  }

  loadAllFlights(): void {
    this.flightService.getAllFlights().subscribe({
      next: (data) => { this.allFlights.set(data); },
      error: () => { console.error('Error al cargar historial'); }
    });
  }

  loadAvailableAirplanes(): void {
    this.flightService.getAvailableAirplanes().subscribe({
      next: (data) => { this.availableAirplanes.set(data); },
      error: () => { console.error('Error al cargar aviones disponibles'); }
    });
  }

  loadAllAirplanes(): void {
    this.loading.set(true);
    this.flightService.getAllAirplanes().subscribe({
      next: (data) => { this.allAirplanes.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar aviones'); this.loading.set(false); }
    });
  }

  onSubmitAirplane(): void {
    this.error.set('');
    this.success.set('');
    this.clearAirplaneErrors();

    let hasErrors = false;

    if (!this.airplaneRegistration()) {
      this.airplaneRegistrationError.set('La matrícula es obligatoria');
      hasErrors = true;
    }

    if (!this.airplaneModel()) {
      this.airplaneModelError.set('El modelo es obligatorio');
      hasErrors = true;
    }

    if (!this.airplaneManufacturer()) {
      this.airplaneManufacturerError.set('El fabricante es obligatorio');
      hasErrors = true;
    }

    if (!this.airplaneCapacity() || this.airplaneCapacity()! <= 0) {
      this.airplaneCapacityError.set('La capacidad debe ser mayor a 0');
      hasErrors = true;
    }

    if (hasErrors) return;

    this.submitting.set(true);

    const payload = {
      registration: this.airplaneRegistration().toUpperCase().trim(),
      model: this.airplaneModel().trim(),
      manufacturer: this.airplaneManufacturer().trim(),
      capacity: this.airplaneCapacity()!,
      yearManufactured: this.airplaneYear() || undefined,
      status: 'AVAILABLE'
    };

    this.flightService.createAirplane(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set('Avión creado exitosamente');
        this.showForm.set(false);
        this.resetAirplaneForm();
        this.loadAllAirplanes();
        this.loadAvailableAirplanes();
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Error al crear el avión');
      }
    });
  }

  private resetAirplaneForm(): void {
    this.airplaneRegistration.set('');
    this.airplaneModel.set('');
    this.airplaneManufacturer.set('');
    this.airplaneCapacity.set(null);
    this.airplaneYear.set(null);
    this.clearAirplaneErrors();
  }

  private clearAirplaneErrors(): void {
    this.airplaneRegistrationError.set('');
    this.airplaneModelError.set('');
    this.airplaneManufacturerError.set('');
    this.airplaneCapacityError.set('');
  }

  onSubmit(): void {
    this.error.set('');
    this.success.set('');
    this.clearFieldErrors();

    // Validar campos
    let hasErrors = false;

    if (!this.flightCode()) {
      this.flightCodeError.set('El código de vuelo es obligatorio');
      hasErrors = true;
    } else if (!/^[A-Z]{2}[0-9]{3,4}$/.test(this.flightCode().toUpperCase())) {
      this.flightCodeError.set('Formato inválido (ej: AV123)');
      hasErrors = true;
    }

    if (!this.origin()) {
      this.originError.set('Debes seleccionar un aeropuerto de origen');
      hasErrors = true;
    }

    if (!this.destination()) {
      this.destinationError.set('Debes seleccionar un aeropuerto de destino');
      hasErrors = true;
    }

    if (this.origin() && this.destination() && this.origin() === this.destination()) {
      this.destinationError.set('El destino debe ser diferente al origen');
      hasErrors = true;
    }

    if (!this.departureDate() || !this.departureTime()) {
      this.departureDateError.set('Fecha y hora de salida obligatorias');
      hasErrors = true;
    }

    if (!this.arrivalDate() || !this.arrivalTime()) {
      this.arrivalDateError.set('Fecha y hora de llegada obligatorias');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    // Combinar fecha y hora
    const departureDateTime = `${this.departureDate()}T${this.departureTime()}`;
    const arrivalDateTime = `${this.arrivalDate()}T${this.arrivalTime()}`;

    // Validar que las fechas no sean en el pasado y llegada > salida
    const now = new Date();
    const departure = new Date(departureDateTime);
    const arrival = new Date(arrivalDateTime);

    if (departure < now) {
      this.departureDateError.set('La fecha de salida no puede ser en el pasado');
      return;
    }

    if (arrival <= departure) {
      this.arrivalDateError.set('Debe ser posterior a la fecha de salida');
      return;
    }

    this.submitting.set(true);

    const payload = {
      flightCode:        this.flightCode().toUpperCase().trim(),
      originAirport:     this.origin().toUpperCase().trim(),
      destinationAirport: this.destination().toUpperCase().trim(),
      departureTime:     departureDateTime,
      arrivalTime:       arrivalDateTime,
      gate:              this.gate().trim() || undefined,
      airplaneId:        this.airplaneId() || undefined
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
        const errorMsg = err.error?.errors?.flightCode || err.error?.message || 'Error al crear el vuelo. Verifica que el backend esté corriendo.';
        this.error.set(errorMsg);
      }
    });
  }

  updateStatus(flightCode: string, status: string): void {
    if (!status) return;
    
    this.flightService.updateFlightStatus(flightCode, status).subscribe({
      next: () => {
        this.success.set(`Estado del vuelo ${flightCode} actualizado`);
        this.loadFlights();
      },
      error: () => {
        this.error.set('Error al actualizar el estado del vuelo');
      }
    });
  }

  private resetForm(): void {
    this.flightCode.set('');
    this.originCountry.set('');
    this.origin.set('');
    this.destinationCountry.set('');
    this.destination.set('');
    this.departureDate.set('');
    this.departureTime.set('');
    this.arrivalDate.set('');
    this.arrivalTime.set('');
    this.gate.set('');
    this.airplaneId.set(null);
    this.clearFieldErrors();
  }

  private clearFieldErrors(): void {
    this.flightCodeError.set('');
    this.originError.set('');
    this.destinationError.set('');
    this.departureDateError.set('');
    this.arrivalDateError.set('');
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
