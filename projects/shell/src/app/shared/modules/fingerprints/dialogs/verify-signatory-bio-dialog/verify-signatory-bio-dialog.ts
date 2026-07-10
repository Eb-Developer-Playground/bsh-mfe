import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountSignatory, BioVerifyInput } from '../../models';
import { ApiService, SessionService } from '../../../../services';
import { MessageBoxType, ToastService } from '../../../toast';
import { FingerprintsService } from '../../fingerprints.service';
import { BIO_EXEMPTED_USERS } from '../../../../static';
import { environment as envUAT } from '../../../../../../environments/environment.uat';
import { environment as envProd } from '../../../../../../environments/environment.prod';
import { isDev, isDevOrUat, isUat } from '../../../../utils';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-verify-signatory-bio-dialog',
  templateUrl: './verify-signatory-bio-dialog.html',
  styleUrls: ['./verify-signatory-bio-dialog.scss'],
})
export class VerifySignatoryBioDialog implements OnInit, OnDestroy {
  @ViewChild('RIGHT_INDEX_1', { read: ElementRef })
  right_index_finger!: ElementRef;
  defaultImage = 'assets/images/fingerprint-icon.png';
  multipleBioObj: any[] = [];
  rightIndexObj!: any;
  allCaptured!: boolean;
  secugenLicenseStr!: string;
  destroy$: Subject<any> = new Subject<any>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: BioVerifyInput,
    public dialogRef: MatDialogRef<VerifySignatoryBioDialog>,
    private fService: FingerprintsService,
    private session: SessionService,
    private toast: ToastService,
    private api: ApiService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  selectedUser(user: any): void {
    user.active = true;
    this.defaultImage = 'assets/images/fingerprint-icon.png';
    this.captureFingerPrint(user);
  }

  captureFingerPrint(user: AccountSignatory) {
    let uriString: any;
    // this.data.accepted = false;
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
    let bioObj = {
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
      // this.editorBtn = 'activate';
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
      this.verifyAccount(this.rightIndexObj, user);
      // this.data.accepted = true;
      user.captured = true;
      this.allCaptured = this.data.signatories?.every(t => t.captured) || false;
      let multipleFingersObj = {
        cif: user.cif,
        skipBio: false,
        fingerPrints: [this.rightIndexObj],
      };
      this.multipleBioObj.push(multipleFingersObj);
    } else {
      this.fService
        .postCaptureBio(uriString)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          v => {
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
                // this.rt_index = v.BMPBase64;
                bioObj.position = 'RIGHT_INDEX';
                bioObj.image.format = 'BMP';
                bioObj.image.resolutionDpi = v.ImageDPI;
                bioObj.image.data = v.BMPBase64;
                // this.editorBtn = 'activate';
                this.rightIndexObj = bioObj;
                // this.makeActive = false;
                this.verifyAccount(this.rightIndexObj, user);
                // this.data.accepted = true;
                user.captured = true;
                this.allCaptured =
                  this.data.signatories?.every(t => t.captured) || false;
                let multipleFingersObj = {
                  cif: user.cif,
                  skipBio: false,
                  fingerPrints: [this.rightIndexObj],
                };
                if (!this.multipleBioObj.some(obj => obj.cif === user.cif))
                  this.multipleBioObj.push(multipleFingersObj);
              }
            } else if (v.ErrorCode === 54) {
              // timeout error
              //TODO: show alert for time out error
              this.right_index_finger.nativeElement.src =
                'assets/img/Group 5@3x.png';
              // this.editorBtn = 'deactivate';
              this.toast.show(
                'Secugen Bio Error: ',
                this.fService.getBioErrorMessage(v.ErrorCode),
                MessageBoxType.WARNING,
                5000,
                undefined,
                undefined,
                false
              );
              // this.data.accepted = false;
              user.captured = false;
              this.allCaptured =
                this.data.signatories?.every(t => t.captured) || false;
            } else if (v.ErrorCode !== 54 && v.ErrorCode !== 0) {
              // this.data.accepted = false;
              user.captured = false;
              this.allCaptured =
                this.data.signatories?.every(t => t.captured) || false;
              this.toast.show(
                'Secugen Bio Error: ',
                this.fService.getBioErrorMessage(v.ErrorCode),
                MessageBoxType.DANGER,
                5000,
                undefined,
                undefined,
                false
              );
            }
            // no finger error
          },
          error => {
            // this.data.accepted = false;
            user.captured = false;
            this.allCaptured =
              this.data.signatories?.every(t => t.captured) || false;
          }
        );
    }
  }

    verifyAccount(indexObj: any, signatory: any) {
        // this.verifyBioData.emit(this.rightIndexObj);
        this.rightIndexObj = indexObj;
        // this.dialog.closeAll();
        const bioObj = {
            cif: signatory.cif,
            fingerprints: [indexObj],
            CheckerOauth: {},
        };
        if (isDev() || BIO_EXEMPTED_USERS.includes(this.session.currentUser.username?.toLowerCase())) {
            this.toast.show(
                null,
                this.translate.instant('COMMON.ACCOUNT-VERIFIED-SUCCESSFULLY'),
                MessageBoxType.SUCCESS,
                5000, undefined, undefined, true
            );
            // localStorage.setItem('show-bio-captured', 'true');
            // this.verified = true;
        } else {
            this.api.post<any>('/v1/backoffice/account/verify', bioObj).pipe(
                takeUntil(this.destroy$)
            ).subscribe((v) => {
                if (v.successful) {
                    this.toast.show(
                        null,
                        this.translate.instant('COMMON.BIO_VERIFICATION', { status: v.statusMessage }),
                        MessageBoxType.SUCCESS,
                        5000, undefined, undefined, false
                    );
                    // localStorage.setItem('show-bio-captured', 'true');
                    // this.verified = true;
                } else {
                    this.toast.show(
                        null,
                        this.translate.instant('COMMON.BIO_VERIFICATION_FAILED'),
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                }
            });
        }
    }

  getAvatarName(fullName: string): string {
    return fullName
      .split(' ')
      .map(v => v.charAt(0).toUpperCase())
      .join(' ');
  }

  continue(): void {
    this.dialogRef.close({
      skipBio: false,
      success: true,
      fingerprints: this.multipleBioObj,
    });
  }
}
