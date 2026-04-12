import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DocumentType, RegisterRequest } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  documentType        = signal<DocumentType>('CC');
  documentId          = signal('');
  firstName           = signal('');
  middleName          = signal('');
  lastName            = signal('');
  secondLastName      = signal('');
  birthDate           = signal('');
  email               = signal('');
  phoneCountry        = signal('+57');
  phone               = signal('');
  phoneDisplay        = signal('');
  password            = signal('');
  confirmPassword     = signal('');
  showPassword        = signal(false);
  showConfirmPassword = signal(false);
  acceptedDataPolicy  = signal(false);
  showPolicyModal     = signal(false);
  loading             = signal(false);
  error               = signal('');

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

  documentPlaceholder = computed(() => {
    switch (this.documentType()) {
      case 'CC':       return 'Ej: 1234567890 (6-10 dígitos)';
      case 'PASSPORT': return 'Ej: AB123456';
      case 'CE':       return 'Ej: 123456 (4-6 dígitos)';
    }
  });

  documentError = computed(() => {
    const id = this.documentId();
    if (!id) return '';
    switch (this.documentType()) {
      case 'CC':
        return /^[0-9]{6,10}$/.test(id) ? '' : 'La cédula debe tener entre 6 y 10 dígitos numéricos';
      case 'PASSPORT':
        return /^[A-Z]{1,2}[0-9]{6,7}$/.test(id) ? '' : 'Formato inválido. Ej: AB123456';
      case 'CE':
        return /^[0-9]{4,6}$/.test(id) ? '' : 'La cédula de extranjería debe tener entre 4 y 6 dígitos';
    }
  });

  nameError = computed(() => {
    const n = this.firstName();
    if (!n) return '';
    if (n.length < 2 || n.length > 50) return 'Entre 2 y 50 caracteres';
    if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/.test(n)) return 'Solo letras';
    return '';
  });

  lastNameError = computed(() => {
    const n = this.lastName();
    if (!n) return '';
    if (n.length < 2 || n.length > 50) return 'Entre 2 y 50 caracteres';
    if (!/^[A-Za-záéíóúÁÉÍÓÚñÑ ]+$/.test(n)) return 'Solo letras';
    return '';
  });

  ageError = computed(() => {
    const d = this.birthDate();
    if (!d) return '';
    const birth = new Date(d);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 18) return 'Debes tener al menos 18 años para registrarte';
    if (age > 120) return 'Fecha de nacimiento no válida';
    return '';
  });

  maxBirthDate = computed(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  });

  isEmailValid = computed(() =>
    /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(this.email())
  );

  phoneError = computed(() => {
    const p = this.phone();
    if (!p) return '';
    const d = this.selectedCountry().digits;
    return p.length === d ? '' : `Ingresa ${d} dígitos para ${this.selectedCountry().name}`;
  });

  passwordRules = computed(() => {
    const p = this.password();
    return {
      length:    p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number:    /[0-9]/.test(p),
      special:   /[^A-Za-z0-9]/.test(p),
    };
  });

  passwordStrength = computed(() => {
    const score = Object.values(this.passwordRules()).filter(Boolean).length;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'fair';
    if (score === 4) return 'good';
    return 'strong';
  });

  isPasswordValid = computed(() => Object.values(this.passwordRules()).every(Boolean));

  togglePassword():        void { this.showPassword.update(v => !v); }
  toggleConfirmPassword(): void { this.showConfirmPassword.update(v => !v); }
  openPolicy():   void { this.showPolicyModal.set(true); }
  closePolicy():  void { this.showPolicyModal.set(false); }
  acceptPolicy(): void { this.acceptedDataPolicy.set(true); this.showPolicyModal.set(false); }

  onDocumentInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    if (this.documentType() === 'PASSPORT') {
      val = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else {
      val = val.replace(/\D/g, '');
    }
    input.value = val;
    this.documentId.set(val);
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, this.selectedCountry().digits);
    this.phone.set(digits);
    let fmt = '';
    if (digits.length <= 3)      fmt = digits;
    else if (digits.length <= 6) fmt = `${digits.slice(0,3)} ${digits.slice(3)}`;
    else if (digits.length <= 8) fmt = `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
    else                         fmt = `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6,8)} ${digits.slice(8)}`;
    this.phoneDisplay.set(fmt);
    input.value = fmt;
  }

  onBirthDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.value) { this.birthDate.set(''); return; }
    const parts = input.value.split('-');
    if (parts[0] && parts[0].length > 4) {
      parts[0] = parts[0].slice(0, 4);
      input.value = parts.join('-');
    }
    this.birthDate.set(input.value);
  }

  onSubmit(): void {
    this.error.set('');

    if (!this.documentId() || !this.firstName() || !this.lastName() ||
        !this.birthDate() || !this.email() || !this.phone() || !this.password()) {
      this.error.set('Por favor complete todos los campos obligatorios');
      return;
    }
    if (this.documentError())    { this.error.set(this.documentError()!); return; }
    if (this.nameError())        { this.error.set(this.nameError()!); return; }
    if (this.lastNameError())    { this.error.set(this.lastNameError()!); return; }
    if (this.ageError())         { this.error.set(this.ageError()!); return; }
    if (!this.isEmailValid())    { this.error.set('El formato del correo electrónico no es válido'); return; }
    if (this.phoneError())       { this.error.set(this.phoneError()!); return; }
    if (!this.isPasswordValid()) { this.error.set('La contraseña no cumple los requisitos de seguridad'); return; }
    if (this.password() !== this.confirmPassword()) { this.error.set('Las contraseñas no coinciden'); return; }
    if (!this.acceptedDataPolicy()) { this.error.set('Debes aceptar la política de tratamiento de datos'); return; }

    this.loading.set(true);

    const request: RegisterRequest = {
      documentType:       this.documentType(),
      documentId:         this.documentId(),
      firstName:          this.firstName().trim(),
      middleName:         this.middleName().trim() || undefined,
      lastName:           this.lastName().trim(),
      secondLastName:     this.secondLastName().trim() || undefined,
      birthDate:          this.birthDate(),
      email:              this.email().toLowerCase().trim(),
      phone:              this.fullPhone(),
      password:           this.password(),
      acceptedDataPolicy: true
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al registrarse');
      }
    });
  }
}
