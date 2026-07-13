import { Component } from '@angular/core';

export enum CardAction {
  BLOCK = 'block',
  UNBLOCK = 'unblock',
  VIEW = 'view',
  MANAGE_LIMIT = 'manage_limit',
}

@Component({
  selector: 'app-bank-card',
  template: '<div>Bank card placeholder</div>',
  standalone: true,
})
export class BankCardComponent {}
