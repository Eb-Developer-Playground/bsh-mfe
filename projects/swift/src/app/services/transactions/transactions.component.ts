import { Component, inject } from '@angular/core';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { COMPAT_IMPORTS } from '../../shared-stubs/compat-barrel';

@Component({
  selector: 'app-transactions',
  imports: [...COMPAT_IMPORTS],
  template: `
    <div class="container-fluid">
      <div class="p-4 w-full" style="max-width: 1320px; margin: 1rem auto 0">
        <mat-card>
          <div class="flex flex-wrap items-center gap-2 p-4">
            <div class="flex items-center me-auto">
              <h2 class="m-0">{{ 'COMMON.TRANSACTIONS' | translate }}</h2>
              <span class="text-gray-500 hidden sm:inline">&nbsp;|&nbsp;{{ transType }}</span>
            </div>
          </div>
        </mat-card>
        <div class="stepper-body bg-white p-4 mt-2 mb-2">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class TransactionsComponent {
  private route = inject(ActivatedRoute);
  transType: string;

  constructor() {
    this.transType = this.route.snapshot.children[0]?.data?.['title'] || '';
  }
}
