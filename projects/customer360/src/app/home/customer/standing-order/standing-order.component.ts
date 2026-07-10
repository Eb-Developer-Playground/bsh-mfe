import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterOutlet } from "@angular/router";

import { SessionService } from '@shared/services';

@Component({
  selector: 'app-standing-order',
  templateUrl: './standing-order.component.html',
  styleUrls: ['./standing-order.component.scss'],
  imports: [RouterOutlet],
})
export class StandingOrderComponent implements OnInit {
  constructor(
    private sessionService: SessionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    try {
      const country = this.sessionService.subsidiary?.countryCode;
      
      if (!country) {
        this.navigateToOthers();
        return;
      }

      if (country === "CD") {
        this.router.navigate(['bcdc'], { relativeTo: this.route });
      } else {
        this.navigateToOthers();
      }
    } catch (error) {
      this.navigateToOthers();
    }
  }

  private navigateToOthers(): void {
    this.router.navigate(['others'], { relativeTo: this.route });
  }
}
