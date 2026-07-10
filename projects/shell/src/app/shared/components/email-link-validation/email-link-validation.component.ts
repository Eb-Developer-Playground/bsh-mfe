import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { UntypedFormGroup } from '@angular/forms';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-email-link-validation',
  templateUrl: './email-link-validation.component.html',
  styleUrls: ['./email-link-validation.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class EmailLinkValidationComponent implements OnInit {
  @Input() form!: UntypedFormGroup;

  constructor() {}

  ngOnInit(): void {}
}
