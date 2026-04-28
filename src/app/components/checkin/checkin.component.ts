import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckInService } from '../../services/checkin.service';
import { CheckInRequest, BoardingPass } from '../../models/checkin.model';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.css']
})
export class CheckInComponent implements OnInit {
  private checkInService = inject(CheckInService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  reservationCode = signal('');
  loading = signal(false);
  error = signal('');
  success = signal(false);
  boardingPass = signal<BoardingPass | null>(null);

  ngOnInit(): void {
    // reservationCode puede venir como query param
    const code = this.route.snapshot.queryParamMap.get('reservationCode');
    if (code) this.reservationCode.set(code);
  }

  onSubmit(): void {
    if (!this.reservationCode()) {
      this.error.set('Por favor ingresa el código de reserva');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    const request: CheckInRequest = { reservationCode: this.reservationCode() };

    this.checkInService.performCheckIn(request).subscribe({
      next: (bp) => {
        this.loading.set(false);
        this.success.set(true);
        this.boardingPass.set(bp);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al realizar el check-in');
      }
    });
  }

  viewBoardingPass(): void {
    const bp = this.boardingPass();
    if (bp) this.router.navigate(['/boarding-pass', bp.checkInId]);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
