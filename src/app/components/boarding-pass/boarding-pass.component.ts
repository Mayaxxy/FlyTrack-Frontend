import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { CheckInService } from '../../services/checkin.service';
import { ReceptionistService } from '../../services/receptionist.service';
import { AuthService } from '../../services/auth.service';
import { BoardingPass } from '../../models/checkin.model';
import { NavbarComponent } from '../navbar/navbar.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-boarding-pass',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './boarding-pass.component.html',
  styleUrls: ['./boarding-pass.component.css']
})
export class BoardingPassComponent implements OnInit, OnDestroy {
  private checkInService = inject(CheckInService);
  private receptionistService = inject(ReceptionistService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  boardingPass = signal<BoardingPass | null>(null);
  qrCodeUrl = signal<SafeUrl | null>(null);
  loading = signal(true);
  error = signal('');
  timeUntilExpiry = signal('');
  qrStatus = signal<'active' | 'expiring' | 'expired'>('active');
  isReceptionist = signal(false);

  private refreshSubscription?: Subscription;
  private expiryCheckSubscription?: Subscription;

  ngOnInit(): void {
    // Check if user is receptionist
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.isReceptionist.set(user.role === 'RECEPCIONISTA');
      }
    });

    const checkInId = this.route.snapshot.paramMap.get('checkInId');
    if (checkInId) {
      this.loadBoardingPass(Number(checkInId));
      this.startAutoRefresh(Number(checkInId));
      this.startExpiryCheck();
    }
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.expiryCheckSubscription?.unsubscribe();
  }

  loadBoardingPass(checkInId: number): void {
    const service = this.isReceptionist() 
      ? this.receptionistService.getBoardingPass(checkInId)
      : this.checkInService.getBoardingPass(checkInId);

    service.subscribe({
      next: (boardingPass) => {
        this.boardingPass.set(boardingPass);
        const qr = boardingPass.qrCodeBase64 || boardingPass.qrCode || '';
        this.updateQRCode(qr);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el pase de abordaje');
        this.loading.set(false);
      }
    });
  }

  private updateQRCode(base64Data: string): void {
    const url = `data:image/png;base64,${base64Data}`;
    this.qrCodeUrl.set(this.sanitizer.bypassSecurityTrustUrl(url));
  }

  private startAutoRefresh(checkInId: number): void {
    this.refreshSubscription = interval(45000).subscribe(() => {
      this.loadBoardingPass(checkInId);
    });
  }

  private startExpiryCheck(): void {
    this.expiryCheckSubscription = interval(1000).subscribe(() => {
      const bp = this.boardingPass();
      if (bp) {
        const departureTime = new Date(bp.flight?.departureTime || bp.departureTime);
        const now = new Date();
        const minutesUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60);

        if (minutesUntilDeparture < 0) {
          this.timeUntilExpiry.set('Expirado');
          this.qrStatus.set('expired');
        } else if (minutesUntilDeparture < 15) {
          const mins = Math.floor(minutesUntilDeparture);
          this.timeUntilExpiry.set(`Expira en ${mins} minuto${mins !== 1 ? 's' : ''}`);
          this.qrStatus.set('expiring');
        } else {
          this.timeUntilExpiry.set('');
          this.qrStatus.set('active');
        }
      }
    });
  }

  manualRefresh(): void {
    const bp = this.boardingPass();
    if (bp) {
      this.loadBoardingPass(bp.checkInId);
    }
  }

  qrStatusClass(): string {
    return `qr-status-${this.qrStatus()}`;
  }

  qrStatusText(): string {
    const status = this.qrStatus();
    if (status === 'active') return '✓ Activo';
    if (status === 'expiring') return '⚠ Próximo a expirar';
    return '✕ Expirado';
  }

  expiryClass(): string {
    const status = this.qrStatus();
    if (status === 'expiring') return 'warning';
    if (status === 'expired') return 'danger';
    return '';
  }

  expiryIcon(): string {
    const status = this.qrStatus();
    if (status === 'expiring') return '⚠️';
    if (status === 'expired') return '🚫';
    return '';
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
