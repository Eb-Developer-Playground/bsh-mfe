import { Component, OnInit, Input } from '@angular/core';

import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-email-link-validation',
  templateUrl: './email-link-validation.component.html',
  styleUrls: ['./email-link-validation.component.scss'],
})
export class EmailLinkValidationComponent implements OnInit {
  @Input() form!: UntypedFormGroup;

  constructor() {}

  ngOnInit(): void {}
}
