import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SessionService } from '../shared/services/session/session.service';

@Component({
  selector: 'app-auth-callback',
  template: '<p>Signing you in...</p>',
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  ngOnInit(): void {
    const reissueToken = this.route.snapshot.queryParamMap.get('rt') || '';
    const bankId = this.route.snapshot.queryParamMap.get('bankId') || '';
    const language = this.route.snapshot.queryParamMap.get('lang') || '';
    const returnPath = this.session.getUrlParameters() || '/';

    if (language) {
      localStorage.setItem('user-locale', JSON.stringify({ language }));
    }

    if (!reissueToken) {
      this.session.login(returnPath, undefined, bankId);
      return;
    }

    this.session.updateSession(reissueToken, bankId).subscribe({
      next: isLoggedIn => {
        if (!isLoggedIn) {
          this.session.login(returnPath, undefined, bankId);
          return;
        }

        this.router
          .navigateByUrl(returnPath)
          .then(() => this.session.removeUrlParameters());
      },
      error: () => this.session.login(returnPath, undefined, bankId),
    });
  }
}
