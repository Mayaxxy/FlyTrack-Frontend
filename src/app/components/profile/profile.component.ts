import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { Passenger } from '../../models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);

  user = signal<Passenger | null>(null);

  // Editable fields
  firstName       = signal('');
  middleName      = signal('');
  lastName        = signal('');
  secondLastName  = signal('');
  phoneCountry    = signal('+57');
  phone           = signal('');
  phoneDisplay    = signal('');
  docType         = signal('');
  birthDate       = signal('');

  // Password change
  currentPassword = signal('');
  newPassword     = signal('');
  confirmPassword = signal('');
  showCurrentPwd  = signal(false);
  showNewPwd      = signal(false);

  loading  = signal(false);
  success  = signal('');
  error    = signal('');
  activeTab = signal<'info' | 'password'>('info');

  readonly countries: { code: string; flag: string; name: string; digits: number }[] = [
    { code: '+57',  flag: '🇨🇴', name: 'Colombia',       digits: 10 },
    { code: '+1',   flag: '🇺🇸', name: 'EE.UU / Canadá', digits: 10 },
    { code: '+52',  flag: '🇲🇽', name: 'México',          digits: 10 },
    { code: '+54',  flag: '🇦🇷', name: 'Argentina',       digits: 10 },
    { code: '+55',  flag: '🇧🇷', name: 'Brasil',          digits: 11 },
    { code: '+56',  flag: '🇨🇱', name: 'Chile',           digits: 9  },
    { code: '+51',  flag: '🇵🇪', name: 'Perú',            digits: 9  },
    { code: '+58',  flag: '🇻🇪', name: 'Venezuela',       digits: 10 },
    { code: '+593', flag: '🇪🇨', name: 'Ecuador',         digits: 9  },
    { code: '+34',  flag: '🇪🇸', name: 'España',          digits: 9  },
    { code: '+44',  flag: '🇬🇧', name: 'Reino Unido',     digits: 10 },
    { code: '+33',  flag: '🇫🇷', name: 'Francia',         digits: 9  },
    { code: '+49',  flag: '🇩🇪', name: 'Alemania',        digits: 10 },
  ];

  selectedCountry = computed(() =>
    this.countries.find(c => c.code === this.phoneCountry()) ?? this.countries[0]
  );

  fullPhone = computed(() => `${this.phoneCountry()}${this.phone()}`);

  passwordRules = computed(() => {
    const p = this.newPassword();
    return {
      length:    p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number:    /[0-9]/.test(p),
      special:   /[^A-Za-z0-9]/.test(p),
    };
  });

  isPasswordValid = computed(() => Object.values(this.passwordRules()).every(Boolean));

  ngOnInit(): void {
    this.loading.set(true);
    // Cargar datos frescos del backend
    this.authService.getProfile().subscribe({
      next: (user: Passenger) => {
        this.loading.set(false);
        this.user.set(user);
        this.firstName.set(user.firstName || '');
        this.middleName.set(user.middleName || '');
        this.lastName.set(user.lastName || '');
        this.secondLastName.set(user.secondLastName || '');
        this.docType.set(user.documentType || '');
        this.birthDate.set(user.birthDate || '');
        
        // Parsear teléfono
        if (user.phone) {
          this.parsePhone(user.phone);
        }
      },
      error: () => {
        this.loading.set(false);
        // Fallback al usuario en memoria
        this.authService.currentUser$.subscribe(user => {
          if (user) {
            this.user.set(user);
            this.firstName.set(user.firstName || '');
            this.middleName.set(user.middleName || '');
            this.lastName.set(user.lastName || '');
            this.secondLastName.set(user.secondLastName || '');
            this.docType.set(user.documentType || '');
            this.birthDate.set(user.birthDate || '');
            
            if (user.phone) {
              this.parsePhone(user.phone);
            }
          }
        });
      }
    });
  }

  parsePhone(fullPhone: string): void {
    // Buscar el código de país en el teléfono
    for (const country of this.countries) {
      if (fullPhone.startsWith(country.code)) {
        this.phoneCountry.set(country.code);
        this.phone.set(fullPhone.substring(country.code.length));
        this.formatPhoneDisplay();
        return;
      }
    }
    // Si no encuentra el código, asumir que es Colombia
    this.phoneCountry.set('+57');
    this.phone.set(fullPhone.replace(/\D/g, ''));
    this.formatPhoneDisplay();
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, this.selectedCountry().digits);
    this.phone.set(digits);
    this.formatPhoneDisplay();
    input.value = this.phoneDisplay();
  }

  formatPhoneDisplay(): void {
    const digits = this.phone();
    let fmt = '';
    if (digits.length <= 3)      fmt = digits;
    else if (digits.length <= 6) fmt = `${digits.slice(0,3)} ${digits.slice(3)}`;
    else if (digits.length <= 8) fmt = `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
    else                         fmt = `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,8)} ${digits.slice(8)}`;
    this.phoneDisplay.set(fmt);
  }

  saveInfo(): void {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);

    const payload = {
      firstName:      this.firstName().trim(),
      middleName:     this.middleName().trim() || null,
      lastName:       this.lastName().trim(),
      secondLastName: this.secondLastName().trim() || null,
      phone:          this.fullPhone(),
      documentType:   this.docType(),
      birthDate:      this.birthDate()
    };

    this.authService.updateProfile(payload).subscribe({
      next: (updated: Passenger) => {
        this.loading.set(false);
        this.success.set('Perfil actualizado correctamente');
        this.authService.updateCurrentUser(updated);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al actualizar el perfil');
      }
    });
  }

  savePassword(): void {
    this.error.set('');
    this.success.set('');

    if (!this.isPasswordValid()) {
      this.error.set('La nueva contraseña no cumple los requisitos');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);

    const payload = {
      currentPassword: this.currentPassword(),
      newPassword:     this.newPassword()
    };

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set('Contraseña actualizada correctamente');
        this.currentPassword.set('');
        this.newPassword.set('');
        this.confirmPassword.set('');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al cambiar la contraseña');
      }
    });
  }
}
