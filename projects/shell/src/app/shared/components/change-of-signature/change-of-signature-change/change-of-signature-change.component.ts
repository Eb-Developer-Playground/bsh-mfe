import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { WhiteSpaceValidator } from 'src/app/shared/directives/whitespace-validator';

@Component({
  selector: 'app-change-of-signature-change',
  templateUrl: './change-of-signature-change.component.html',
  styleUrls: ['./change-of-signature-change.component.scss'],
})
export class ChangeOfSignatureChangeComponent implements OnInit {
  @Input() readonly = false;
  @Input() effectiveDate = '';
  @Input() expiryDate = '';
  @Input() reasonForChanging = '';
  changeForm!: UntypedFormGroup;
  minDate: Date;
  maxDate: Date;
  @Output() private onSignatureChange = new EventEmitter<any>();
  constructor(private fb: UntypedFormBuilder) {
    this.minDate = new Date();
    this.maxDate = new Date();
  }

  ngOnInit() {
    this.changeForm = this.fb.group({
      effectiveDate: [this.maxDate, Validators.required],
      expiryDate: [null, Validators.required],
      reasonForChanging: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      ],
    });

    this.changeForm.valueChanges.subscribe(() =>
      this.onSignatureChange.emit(this.changeForm)
    );

    this.changeForm.controls['effectiveDate'].disable();
  }
}
