import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);
  submitted = signal(false);

  isEmailValid = computed(() => {
    const e = this.email();
    return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(e);
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
    const r = this.passwordRules();
    const score = Object.values(r).filter(Boolean).length;
    if (score <= 2) return 'weak';
    if (score <= 3) return 'fair';
    if (score === 4) return 'good';
    return 'strong';
  });

  isPasswordValid = computed(() => Object.values(this.passwordRules()).every(Boolean));

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    this.submitted.set(true);

    if (!this.email() || !this.password()) {
      this.error.set('Por favor complete todos los campos');
      return;
    }

    if (!this.isEmailValid()) {
      this.error.set('El formato del correo electrónico no es válido');
      return;
    }

    if (!this.isPasswordValid()) {
      this.error.set('La contraseña no cumple los requisitos de seguridad');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const request: LoginRequest = {
      email: this.email(),
      password: this.password()
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.loading.set(false);
        const role = this.authService.getCurrentUser()?.role;
        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (role === 'RECEPCIONISTA') {
          this.router.navigate(['/receptionist']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Credenciales incorrectas');
      }
    });
  }
}
