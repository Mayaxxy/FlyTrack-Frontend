import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FlightService } from '../../services/flight.service';
import { AdminService } from '../../services/admin.service';
import { Flight, Airplane } from '../../models/flight.model';
import { AdminUser, AdminCreateUserRequest, AdminUpdateUserRequest, AuditLog, Role } from '../../models/admin.model';
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
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  flights = signal<Flight[]>([]);
  allFlights = signal<Flight[]>([]);
  loading = signal(false);
  error   = signal('');
  success = signal('');
  showForm = signal(false);
  activeTab = signal<'flights' | 'airplanes' | 'history' | 'users' | 'audit'>('flights');

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

  // ── Gestión de Usuarios ───────────────────────────────────────────────────
  users = signal<AdminUser[]>([]);
  auditLogs = signal<AuditLog[]>([]);
  userFilterRole = signal<Role | ''>('');
  userFilterActive = signal<'all' | 'true' | 'false'>('all');
  showUserForm = signal(false);
  editingUser = signal<AdminUser | null>(null);
  showResetPasswordForm = signal<number | null>(null);

  // Formulario crear/editar usuario
  uFirstName = signal('');
  uLastName = signal('');
  uEmail = signal('');
  uPhone = signal('');
  uDocumentType = signal('CC');
  uDocumentId = signal('');
  uPassword = signal('');
  uRole = signal<Role>('RECEPCIONISTA');
  uNewPassword = signal('');
  uSubmitting = signal(false);

  // Errores formulario usuario
  uFirstNameError = signal('');
  uLastNameError = signal('');
  uEmailError = signal('');
  uPhoneError = signal('');
  uDocumentIdError = signal('');
  uPasswordError = signal('');
  uNewPasswordError = signal('');

  readonly roles: Role[] = ['ADMIN', 'RECEPCIONISTA'];
  readonly documentTypes = ['CC', 'PASSPORT', 'CE'];

  get filteredUsers(): AdminUser[] {
    return this.users().filter(u => {
      const roleMatch = !this.userFilterRole() || u.role === this.userFilterRole();
      const activeMatch = this.userFilterActive() === 'all' ||
        (this.userFilterActive() === 'true' ? u.active : !u.active);
      return roleMatch && activeMatch;
    });
  }

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
      if (tab === 'flights' || tab === 'airplanes' || tab === 'history' || tab === 'users' || tab === 'audit') {
        this.activeTab.set(tab);
      }
    });
    
    this.loadFlights();
    this.loadAvailableAirplanes();
    this.loadAllAirplanes();
    this.loadAllFlights();
    this.loadUsers();
    this.loadAuditLogs();
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

  // ── Gestión de Usuarios ───────────────────────────────────────────────────

  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (data) => this.users.set(data),
      error: () => this.error.set('Error al cargar usuarios')
    });
  }

  loadAuditLogs(): void {
    this.adminService.getAuditLogs().subscribe({
      next: (data) => this.auditLogs.set(data),
      error: () => {}
    });
  }

  openCreateUserForm(): void {
    this.editingUser.set(null);
    this.resetUserForm();
    this.showUserForm.set(true);
  }

  openEditUserForm(user: AdminUser): void {
    this.editingUser.set(user);
    this.uFirstName.set(user.firstName);
    this.uLastName.set(user.lastName);
    this.uEmail.set(user.email);
    this.uPhone.set(user.phone);
    this.uDocumentType.set(user.documentType);
    this.uDocumentId.set(user.documentId);
    this.uRole.set(user.role);
    this.uPassword.set('');
    this.showUserForm.set(true);
  }

  cancelUserForm(): void {
    this.showUserForm.set(false);
    this.editingUser.set(null);
    this.resetUserForm();
  }

  onSubmitUser(): void {
    this.error.set('');
    this.success.set('');
    this.clearUserErrors();

    let hasErrors = false;

    // Nombre
    const fn = this.uFirstName().trim();
    if (!fn) { this.uFirstNameError.set('El nombre es obligatorio'); hasErrors = true; }
    else if (fn.length < 2 || fn.length > 50) { this.uFirstNameError.set('Entre 2 y 50 caracteres'); hasErrors = true; }
    else if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/.test(fn)) { this.uFirstNameError.set('Solo letras'); hasErrors = true; }

    // Apellido
    const ln = this.uLastName().trim();
    if (!ln) { this.uLastNameError.set('El apellido es obligatorio'); hasErrors = true; }
    else if (ln.length < 2 || ln.length > 50) { this.uLastNameError.set('Entre 2 y 50 caracteres'); hasErrors = true; }
    else if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/.test(ln)) { this.uLastNameError.set('Solo letras'); hasErrors = true; }

    // Documento
    const docId = this.uDocumentId().trim();
    if (!docId) { this.uDocumentIdError.set('El documento es obligatorio'); hasErrors = true; }
    else {
      const docType = this.uDocumentType();
      if (docType === 'CC' && !/^[0-9]{6,10}$/.test(docId)) {
        this.uDocumentIdError.set('La cédula debe tener entre 6 y 10 dígitos numéricos'); hasErrors = true;
      } else if (docType === 'PASSPORT' && !/^[A-Z]{1,2}[0-9]{6,7}$/.test(docId)) {
        this.uDocumentIdError.set('Formato inválido. Ej: AB123456'); hasErrors = true;
      } else if (docType === 'CE' && !/^[0-9]{4,6}$/.test(docId)) {
        this.uDocumentIdError.set('La cédula de extranjería debe tener entre 4 y 6 dígitos'); hasErrors = true;
      }
    }

    // Teléfono
    const ph = this.uPhone().trim();
    if (!ph) { this.uPhoneError.set('El teléfono es obligatorio'); hasErrors = true; }
    else if (!/^\+?[0-9]{7,15}$/.test(ph)) { this.uPhoneError.set('Solo números (7-15 dígitos)'); hasErrors = true; }

    const editing = this.editingUser();
    if (!editing) {
      // Email
      const em = this.uEmail().trim();
      if (!em) { this.uEmailError.set('El email es obligatorio'); hasErrors = true; }
      else if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(em)) {
        this.uEmailError.set('Formato de email inválido'); hasErrors = true;
      }

      // Contraseña
      const pw = this.uPassword();
      if (!pw) { this.uPasswordError.set('La contraseña es obligatoria'); hasErrors = true; }
      else if (pw.length < 8) { this.uPasswordError.set('Mínimo 8 caracteres'); hasErrors = true; }
      else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw)) {
        this.uPasswordError.set('Debe tener mayúscula, minúscula, número y carácter especial');
        hasErrors = true;
      }
    }

    if (hasErrors) return;
    this.uSubmitting.set(true);

    if (editing) {
      const req: AdminUpdateUserRequest = {
        firstName: this.uFirstName().trim(),
        lastName: this.uLastName().trim(),
        phone: this.uPhone().trim(),
        documentId: this.uDocumentId().trim(),
        documentType: this.uDocumentType()
      };
      this.adminService.updateUser(editing.id, req).subscribe({
        next: () => {
          this.uSubmitting.set(false);
          this.success.set('Usuario actualizado correctamente');
          this.cancelUserForm();
          this.loadUsers();
          this.loadAuditLogs();
        },
        error: (err: any) => {
          this.uSubmitting.set(false);
          this.error.set(err.error?.message || 'Error al actualizar usuario');
        }
      });
    } else {
      const req: AdminCreateUserRequest = {
        firstName: this.uFirstName().trim(),
        lastName: this.uLastName().trim(),
        email: this.uEmail().trim().toLowerCase(),
        phone: this.uPhone().trim(),
        documentType: this.uDocumentType(),
        documentId: this.uDocumentId().trim(),
        password: this.uPassword(),
        role: this.uRole()
      };
      this.adminService.createUser(req).subscribe({
        next: (u) => {
          this.uSubmitting.set(false);
          this.success.set(`Usuario ${u.email} creado correctamente`);
          this.cancelUserForm();
          this.loadUsers();
          this.loadAuditLogs();
        },
        error: (err: any) => {
          this.uSubmitting.set(false);
          this.error.set(err.error?.message || 'Error al crear usuario');
        }
      });
    }
  }

  changeUserRole(user: AdminUser, newRole: Role): void {
    if (user.role === newRole) return;
    this.adminService.changeRole(user.id, { role: newRole }).subscribe({
      next: () => {
        this.success.set(`Rol de ${user.email} cambiado a ${newRole}`);
        this.loadUsers();
        this.loadAuditLogs();
      },
      error: (err: any) => this.error.set(err.error?.message || 'Error al cambiar rol')
    });
  }

  toggleUserActive(user: AdminUser): void {
    if (user.active) {
      this.adminService.deactivateUser(user.id).subscribe({
        next: () => {
          this.success.set(`Usuario ${user.email} desactivado`);
          this.loadUsers();
          this.loadAuditLogs();
        },
        error: (err: any) => this.error.set(err.error?.message || 'Error al desactivar usuario')
      });
    } else {
      this.adminService.reactivateUser(user.id).subscribe({
        next: () => {
          this.success.set(`Usuario ${user.email} reactivado`);
          this.loadUsers();
          this.loadAuditLogs();
        },
        error: (err: any) => this.error.set(err.error?.message || 'Error al reactivar usuario')
      });
    }
  }

  deleteUser(user: AdminUser): void {
    if (!confirm(`¿Eliminar permanentemente a ${user.email}? Esta acción no se puede deshacer.`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.success.set(`Usuario ${user.email} eliminado`);
        this.loadUsers();
        this.loadAuditLogs();
      },
      error: (err: any) => this.error.set(err.error?.message || 'Error al eliminar usuario')
    });
  }

  openResetPassword(userId: number): void {
    this.showResetPasswordForm.set(userId);
    this.uNewPassword.set('');
    this.uNewPasswordError.set('');
  }

  cancelResetPassword(): void {
    this.showResetPasswordForm.set(null);
    this.uNewPassword.set('');
    this.uNewPasswordError.set('');
  }

  submitResetPassword(userId: number): void {
    this.uNewPasswordError.set('');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(this.uNewPassword())) {
      this.uNewPasswordError.set('Mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial');
      return;
    }
    this.adminService.resetPassword(userId, { newPassword: this.uNewPassword() }).subscribe({
      next: () => {
        this.success.set('Contraseña restablecida correctamente');
        this.cancelResetPassword();
        this.loadAuditLogs();
      },
      error: (err: any) => this.error.set(err.error?.message || 'Error al restablecer contraseña')
    });
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      ADMIN: 'Admin', RECEPCIONISTA: 'Recepcionista', PASSENGER: 'Pasajero'
    };
    return map[role] || role;
  }

  getAuditActionLabel(action: string): string {
    const map: Record<string, string> = {
      CREATE: 'Creación', UPDATE: 'Actualización', ROLE_CHANGE: 'Cambio de Rol',
      DEACTIVATE: 'Desactivación', REACTIVATE: 'Reactivación', DELETE: 'Eliminación'
    };
    return map[action] || action;
  }

  private resetUserForm(): void {
    this.uFirstName.set(''); this.uLastName.set(''); this.uEmail.set('');
    this.uPhone.set(''); this.uDocumentType.set('CC'); this.uDocumentId.set('');
    this.uPassword.set(''); this.uRole.set('RECEPCIONISTA');
    this.clearUserErrors();
  }

  private clearUserErrors(): void {
    this.uFirstNameError.set(''); this.uLastNameError.set(''); this.uEmailError.set('');
    this.uPhoneError.set(''); this.uDocumentIdError.set(''); this.uPasswordError.set('');
  }
}
