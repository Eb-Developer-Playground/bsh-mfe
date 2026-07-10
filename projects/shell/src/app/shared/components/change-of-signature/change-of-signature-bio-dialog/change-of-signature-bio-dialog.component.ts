import { Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChangeOfSignatureService } from 'src/app/core/services/change-of-signature/change-of-signature.service';
import { ChangeOfSignatureSkipBioComponent } from '../change-of-signature-skip-bio/change-of-signature-skip-bio.component';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
@Component({
  selector: 'app-change-of-signature-bio-dialog',
  templateUrl: './change-of-signature-bio-dialog.component.html',
  styleUrls: ['./change-of-signature-bio-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class ChangeOfSignatureBioDialog implements OnInit, OnDestroy {
  serviceForm!: UntypedFormGroup;
  verifyBioSubscription: any;
  constructor(
    public dialogRef: MatDialogRef<ChangeOfSignatureBioDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      cif: string;
      ticketId: string;
      stakeholderName: string;
      nationalId: string;
      accountNo: string;
      accountType: string;
    },
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public dialog: MatDialog,
    private changeOfSignatureService: ChangeOfSignatureService
  ) {
    this.serviceForm = this.formBuilder.group({
      service: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  get stakeholderInitials() {
    if (this.data) {
      const nameSplit = this.data.stakeholderName.split(/\s/);
      return nameSplit[0].slice(0, 1) + nameSplit[1].slice(0, 1);
    }
    return '';
  }

  reasonBioSkip() {
    this.dialogRef.close();
    const dialogRef = this.dialog.open(ChangeOfSignatureSkipBioComponent, {
      width: '580px',
      data: {
        ...this.data,
        approvalRequired: true,
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      } else {
      }
    });
  }

  onClickVerify() {
    // this.verifyBioSubscription = this.changeOfSignatureService.bioVerify(this.data).subscribe((response) => {
    //     this.navigateSuccess();
    // }, (error) => {
    //     this.dialogRef.close()
    // })
  }

  navigateSuccess(): void {
    this.dialogRef.close();
    this.router.navigate(['/services/change-of-signature/success'], {
      state: {
        ...this.data,
        approvalRequired: false,
      },
    });
  }

  ngOnDestroy(): void {
    if (this.verifyBioSubscription) {
      this.verifyBioSubscription.unsubscribe();
    }
  }
}
