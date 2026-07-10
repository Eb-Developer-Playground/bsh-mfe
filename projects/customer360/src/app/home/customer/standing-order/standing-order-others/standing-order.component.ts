import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

import { SessionService } from '@shared/services';

@Component({
  selector: 'app-standing-order',
  template: '',
  imports: [],
})
export class StandingOrderComponent implements OnInit {
  constructor(private sessionService: SessionService, private router: Router) {}

  ngOnInit(): void {
    const country = this.sessionService.subsidiary.countryCode;

    if (country === "CD") {
      this.router.navigate([`/standing-order-bcdc`]).then(() => {});
    } else {
      this.router.navigate([`/standing-order-others`]).then(() => { });
    }
  }
}
