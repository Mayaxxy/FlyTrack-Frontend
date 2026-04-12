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

  flightCode = signal('');
  reservationCode = signal('');
  loading = signal(false);
  error = signal('');
  success = signal(false);
  boardingPass = signal<BoardingPass | null>(null);

  ngOnInit(): void {
    const flightCodeParam = this.route.snapshot.paramMap.get('flightCode');
    if (flightCodeParam) {
      this.flightCode.set(flightCodeParam);
    }
  }

  onSubmit(): void {
    if (!this.flightCode() || !this.reservationCode()) {
      this.error.set('Por favor complete todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const request: CheckInRequest = {
      flightCode: this.flightCode(),
      reservationCode: this.reservationCode()
    };

    this.checkInService.performCheckIn(request).subscribe({
      next: (boardingPass) => {
        this.loading.set(false);
        this.success.set(true);
        this.boardingPass.set(boardingPass);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al realizar el check-in');
      }
    });
  }

  viewBoardingPass(): void {
    const bp = this.boardingPass();
    if (bp) {
      this.router.navigate(['/boarding-pass', bp.checkInId]);
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
