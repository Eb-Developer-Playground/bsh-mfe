import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-email-link-validation',
  templateUrl: './email-link-validation.component.html',
  styleUrls: ['./email-link-validation.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe,
  ],
})
export class EmailLinkValidationComponent implements OnInit {
  @Input() form!: UntypedFormGroup;

  constructor() {}

  ngOnInit(): void {}
}
