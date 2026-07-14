import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Mandate } from '@app/shared/models/common/mandate.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-signatories-list',
  templateUrl: './signatories-list.component.html',
  styleUrls: ['./signatories-list.component.scss'],
  imports: [CommonModule, MatIconModule, MatDividerModule],
})
export class SignatoriesListComponent implements OnInit, OnDestroy {
  @Input() mandateForm!: UntypedFormGroup;
  @Input() signatories: Mandate[] = [];

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
