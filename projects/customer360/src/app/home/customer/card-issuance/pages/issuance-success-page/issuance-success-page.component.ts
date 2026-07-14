import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardIssuanceService } from '@app/home/customer/card-issuance/services/card-issuance.service';
import {
  InstantCardIssuanceRequestDataT,
} from '@app/home/customer/card-issuance/card-issuance.models';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-issuance-success-page',
  templateUrl: './issuance-success-page.component.html',
  styleUrl: '../../card-issuance.component.scss',
  imports: [MatButtonModule],
})
export class IssuanceSuccessPageComponent implements OnInit {
  issuanceRequest: InstantCardIssuanceRequestDataT = JSON.parse(
    <string>localStorage.getItem('Cards-Issuance-RequestData')
  );
  constructor(
    private router: Router,
    private cardIssuanceService: CardIssuanceService
  ) {}

  ngOnInit() {
  }
  goToDashboard() {
    this.router
      .navigate(['/dashboard'], {
        state: { resolve: false },
      })
      .then(r => {});
  }
}
