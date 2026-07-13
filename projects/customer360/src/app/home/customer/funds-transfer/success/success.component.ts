import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IFundsTransferFromData } from '../funds-transfer.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  imports: [TranslatePipe, MatCardModule, MatButtonModule, RouterLink],
})
export class SuccessComponent implements OnInit, OnDestroy {
  public data!: IFundsTransferFromData;

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    const data = localStorage.getItem('review_details');
    if (data) {
      this.data = JSON.parse(data);
    }
  }
  onClick() {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    localStorage.removeItem('review_details');
  }
}
