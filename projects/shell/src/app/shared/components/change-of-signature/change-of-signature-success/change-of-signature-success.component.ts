import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-of-signature-success',
  templateUrl: './change-of-signature-success.component.html',
  styleUrls: ['./change-of-signature-success.component.scss'],
})
export class ChangeOfSignatureSuccessComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}
  onClick() {
    this.router.navigate(['/dashboard']);
  }
}
