import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';
import { MessageBoxType, ToastService } from '../../../toast';
import { ApiService, SessionService } from '../../../../services';
import { FingerprintsService } from '../../fingerprints.service';
import { VerifySkipBioDialog } from '../../dialogs';
import { BioVerifyInput } from '../../models';
import { BIO_EXEMPTED_USERS } from '../../../../static';
import { environment as envUAT } from '../../../../../../environments/environment.uat';
import { environment as envProd } from '../../../../../../environments/environment.prod';
import { isDev, isDevOrUat, isUat } from '../../../../utils';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';

@Component({
  selector: 'app-verify-bio-dialog',
  templateUrl: './verify-bio-dialog.html',
  styleUrls: ['./verify-bio-dialog.scss'],
})
export class VerifyBioDialog implements OnInit, OnDestroy {
  @ViewChild('RIGHT_INDEX_1', { read: ElementRef })
  right_index_finger!: ElementRef;
  @Output() verifyBioData: EventEmitter<any> = new EventEmitter<any>();
  defaultImage = 'assets/images/fingerprint-icon.png';
  rightIndexObj: any;
  rt_index: any;
  verified = false;
  verifyBioObj: any = [];
  secugenLicenseStr!: string;
  destroy$ = new Subject();

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<VerifyBioDialog>,
    @Inject(MAT_DIALOG_DATA) public data: BioVerifyInput,
    private router: Router,
    private api: ApiService,
    private toast: ToastService,
    private fService: FingerprintsService,
    private session: SessionService
  ) {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  isFeatureAccessibleForContactCenter() {
    return this.session.hasRole('AccountManagement.EfrontUser');
  }

  showBioInterface(): boolean {
    if (
      isDevOrUat() &&
      this.session.userWorkClass === '080' &&
      this.isFeatureAccessibleForContactCenter()
    ) {
      return false;
    }
    return this.isFeatureAccessibleForContactCenter();
  }

  enrollBio() {
    // this.dialogRef.close({data: 'bioEnrollment'});
    // const dialogRef = this.dialog.open(BioEnrollmentComponent, {
    //     data: {
    //         user: this.data.user,
    //     },
    // });
    //
    // dialogRef.afterClosed().subscribe((result) => {
    //     if (!result) {
    //         const dialogRef = this.dialog.open(VerifyBioDialog, {
    //             data: {
    //                 searchFlow: this.data?.searchFlow,
    //                 user: this.data.user,
    //             },
    //         });
    //     }
    // });
  }

  skipBio() {
    if (this.data.inProcess) {
      this.dialogRef.close({
        fingerprints: [],
        success: true,
        skipBio: true,
        skipBioForm: null,
        documents: [],
      });
      return;
    }
    const dialogRef = this.dialog.open(VerifySkipBioDialog, {
      width: '50%',
      data: this.data,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          if (result !== 'back') {
            this.dialogRef.close({
              fingerprints: [],
              success: result.success,
              skipBio: result.skipBio,
              skipBioForm: result.skipBioForm,
              documents: result.documents,
            });
          }
        }
      });
  }

  captureFingerPrint() {
    let uriString: any;
    if (isDev()) {
      uriString = 'timeout=10000&quality=75&licstr=';
    } else if (isUat()) {
      this.secugenLicenseStr = envUAT.secugenLicenseUAT;
      uriString =
        'timeout=10000&quality=50&licstr=' +
        encodeURIComponent(this.secugenLicenseStr) +
        '&srvhandle=&FingerPos=RIGHT_INDEX';
    } else {
      // use this for production once the license is ready
      // this.secugenLicenseStr = environment.secugenLicenseUAT;
      // uriString = 'timeout=10000&quality=50&licstr=' + encodeURIComponent(this.secugenLicenseStr);
      this.secugenLicenseStr = envProd.secugenLicenseProd;
      uriString =
        'timeout=10000&quality=50&licstr=' +
        encodeURIComponent(this.secugenLicenseStr) +
        '&srvhandle=&FingerPos=RIGHT_INDEX';
    }
    const bioObj = {
      position: '',
      image: {
        format: '',
        resolutionDpi: '',
        data: '',
      },
    };

    // used to by-pass bio on localhost and dev url
    if (
      isDev() ||
      BIO_EXEMPTED_USERS.includes(
        this.session.currentUser.username?.toLowerCase()
      )
    ) {
      // return mock obj
      this.rightIndexObj = {
        position: 'RIGHT_INDEX',
        image: {
          format: 'BMP',
          resolutionDpi: 508,
          data: '/6D/qAB6TklTVF9DT00gOQpQSVhfV0lEVEggMjU4ClBJWF9IRUlHSFQgMzM2ClBJWF9ERVBUSCA4ClBQSSA1MDgKTE9TU1kgMQpDT0xPUlNQQUNFIEdSQVkKQ09NUFJFU1NJT04gV1NRCldTUV9CSVRSQVRFIDAuNzUwMDAw/6gACVNlY3VHZW7/pAA6CQcACTLTJc0ACuDzGZoBCkHv8ZoBC44nZM0AC+F5ozMACS7/VgABCvkz0zMBC/KHIZoACiZ32jP',
        },
      };
      this.defaultImage = 'assets/images/captured-fingerprint.png';
      this.verifyAccount(this.rightIndexObj);
      let fingersObj = {
        cif: this.data.customerId,
        skipBio: false,
        fingerPrints: [this.rightIndexObj],
      };
      this.verifyBioObj.push(fingersObj);
    } else {
      this.fService.postCaptureBio(uriString).subscribe(v => {
        if (v.ErrorCode === 0) {
          if (v.ImageQuality < 50) {
            this.toast.show(
              null,
              'Finger Print Quality is less than 50',
              MessageBoxType.DANGER,
              5000,
              undefined,
              undefined,
              false
            );
            this.right_index_finger.nativeElement.src =
              'assets/img/Group 5@3x.png';
          } else {
            this.right_index_finger.nativeElement.src =
              'data:image/bmp;base64,' + v.BMPBase64;
            this.rt_index = v.BMPBase64;
            bioObj.position = 'RIGHT_INDEX';
            bioObj.image.format = 'BMP';
            bioObj.image.resolutionDpi = v.ImageDPI;
            bioObj.image.data = v.BMPBase64;
            this.rightIndexObj = bioObj;
            this.verifyAccount(this.rightIndexObj);
          }
        } else if (v.ErrorCode === 54) {
          // timeout error
          //TODO: show alert for time out error
          this.right_index_finger.nativeElement.src =
            'assets/img/Group 5@3x.png';
          this.toast.show(
            null,
            'Secugen Bio Error: ' +
              this.fService.getBioErrorMessage(v.ErrorCode),
            MessageBoxType.WARNING,
            5000,
            undefined,
            undefined,
            false
          );
        } else if (v.ErrorCode !== 54 && v.ErrorCode !== 0) {
          this.toast.show(
            null,
            'Secugen Bio Error: ' +
              this.fService.getBioErrorMessage(v.ErrorCode),
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
        // no finger error
      });
    }
  }

  verifyAccount(indexObj: any) {
    const bioObj = {
      cif: this.data.customerId,
      fingerprints: [indexObj],
      CheckerOauth: {},
    };
    if (
      isDev() ||
      BIO_EXEMPTED_USERS.includes(
        this.session.currentUser?.username?.toLowerCase()
      )
    ) {
      this.toast.show(
        null,
        'COMMON.ACCOUNT-VERIFIED-SUCCESSFULLY',
        MessageBoxType.SUCCESS,
        5000,
        undefined,
        undefined,
        true
      );
      this.verified = true;
    } else {
      this.api
        .post<any>('/v1/backoffice/account/verify', bioObj)
        .subscribe(v => {
          if (v.successful) {
            this.toast.show(
              null,
              'COMMON.ACCOUNT-VERIFIED-SUCCESSFULLY',
              MessageBoxType.SUCCESS,
              5000,
              undefined,
              undefined,
              true
            );
            this.verified = true;
          } else {
            this.toast.show(
              null,
              'Bio not verified',
              MessageBoxType.DANGER,
              5000,
              undefined,
              undefined,
              false
            );
          }
        });
    }
  }

  continue() {
    this.dialogRef.close({
      skipBio: false,
      success: true,
      fingerprints: [this.rightIndexObj],
    });
  }

  getAvatarName(fullName: string): string {
    return fullName
      .split(' ')
      .map(v => v.charAt(0).toUpperCase())
      .join('');
  }
}
