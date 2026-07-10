import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-change-of-signature-success',
  templateUrl: './change-of-signature-success.component.html',
  styleUrls: ['./change-of-signature-success.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class ChangeOfSignatureSuccessComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}
  onClick() {
    this.router.navigate(['/dashboard']);
  }
}
