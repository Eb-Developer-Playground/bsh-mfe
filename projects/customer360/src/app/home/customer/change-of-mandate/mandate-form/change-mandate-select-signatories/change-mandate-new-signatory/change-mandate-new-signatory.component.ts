import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-change-mandate-new-signatory',
  templateUrl: './change-mandate-new-signatory.component.html',
  styleUrls: ['./change-mandate-new-signatory.component.scss'],
  imports: [
    TranslatePipe,
  ],
})
export class ChangeMandateNewSignatoryComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
