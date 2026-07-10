import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil, map } from 'rxjs/operators';
import { SaveAndInvestService } from 'src/app/core/services/save-and-invest/save-and-invest.service';
import { SaveAndInvest } from 'src/app/shared/models/save-and-invest/save-and-invest.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { TranslatePipe } from '@ngx-translate/core';
import { GenericErrorStateMatcher } from 'src/app/shared/utils/genericErrorStateMatcher';

@Component({
  selector: 'app-rollover-and-withdraval-details',
  templateUrl: './rollover-and-withdraval-details.component.html',
  styleUrls: ['./rollover-and-withdraval-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    TranslatePipe,
  ],
})
export class RolloverAndWithdravalDetailsComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Input() savingsDetails!: any;
  @Input() form!: UntypedFormGroup;
  public rolloverOptions$!: Observable<
    SaveAndInvest.RollOverResponseObjectArray[]
  >;

  creationType!: string;
  public matcher = new GenericErrorStateMatcher();
  private destroy$ = new Subject<any>();

  constructor(private saveAndInvestService: SaveAndInvestService) {}

  ngOnInit(): void {
    this.creationType = this.savingsDetails?.type;

    this.rolloverOptions$ = this.getRollOverOptions();
  }

  private getRollOverOptions(): Observable<
    SaveAndInvest.RollOverResponseObjectArray[]
  > {
    return this.saveAndInvestService.getRollOverOptions().pipe(
      map(response => response.responseObject),
      takeUntil(this.destroy$)
    );
  }

  ngAfterViewInit(): void {
    if (this.creationType === 'fixed') {
      this.form.controls['withdrawOrRollover'].valueChanges
        .pipe(distinctUntilChanged())
        .subscribe(value => {
          if (value === 'rollover') {
            this.form.controls['rolloverOption'].setValidators(
              Validators.required
            );
          } else {
            this.form.controls['rolloverOption'].setValue('');
            this.form.controls['rolloverOption'].clearValidators();
            this.form.controls['rolloverOption'].updateValueAndValidity();
          }

          this.form.updateValueAndValidity();
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
