import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { CheckInService } from '../../services/checkin.service';
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  boardingPass = signal<BoardingPass | null>(null);
  qrCodeUrl = signal<SafeUrl | null>(null);
  loading = signal(true);
  error = signal('');
  timeUntilExpiry = signal('');

  private refreshSubscription?: Subscription;
  private expiryCheckSubscription?: Subscription;

  ngOnInit(): void {
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
    this.checkInService.getBoardingPass(checkInId).subscribe({
      next: (boardingPass) => {
        this.boardingPass.set(boardingPass);
        this.updateQRCode(boardingPass.qrCode);
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
        const departureTime = new Date(bp.departureTime);
        const now = new Date();
        const minutesUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60);

        if (minutesUntilDeparture < 0) {
          this.timeUntilExpiry.set('Expirado');
        } else if (minutesUntilDeparture < 15) {
          this.timeUntilExpiry.set(`Expira en ${Math.floor(minutesUntilDeparture)} minutos`);
        } else {
          this.timeUntilExpiry.set('');
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
