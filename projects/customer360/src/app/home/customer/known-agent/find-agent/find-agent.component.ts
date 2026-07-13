import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '@app/core/services/account/account.service';
@Component({
  selector: 'app-find-agent',
  templateUrl: './find-agent.component.html',
  styleUrls: ['./find-agent.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatDividerModule,
    TranslatePipe,
  ],
})
export class FindAgentComponent implements OnInit, OnDestroy {
  findForm!: ReturnType<UntypedFormBuilder['group']>;

  @Output() findFormEvent = new EventEmitter<{ value: any; valid: boolean }>();
  private destroySubject$ = new Subject();

  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private accountService: AccountService
  ) {
    this.findForm = this.fb.group({
      id_type: [null, Validators.required],
      id_number: [null, [Validators.required, Validators.maxLength(20)]],
    });
  }

  ngOnInit(): void {
    this.findForm.valueChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(data => {
        if (this.findForm.valid) {
          this.findFormEvent.emit({
            value: this.findForm.value,
            valid: this.findForm.valid,
          });
        }
      });

    this.accountService.getCountryInfo().subscribe((res: any) => {
      localStorage.setItem('countryInfo', JSON.stringify(res));
    });
  }

  ngOnDestroy(): void {
    this.destroySubject$.next('');
    this.destroySubject$.complete();
  }
}
