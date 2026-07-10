import { Component, EventEmitter, Input, OnInit, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';
import { Finger, FingerPrintState } from '../../models';
import { FingerprintsService } from '../../fingerprints.service';
import { MessageBoxType, ToastService } from '../../../toast';
import { environment as envUAT } from 'src/environments/environment.uat';
import { environment as envProd } from 'src/environments/environment.prod';
import { isProd, isUat } from '../../../../utils';

@Component({
  selector: 'app-finger',
  templateUrl: './finger.component.html',
  styleUrls: ['./finger.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class FingerComponent implements OnInit {
  @Input() finger: Finger = {
    id: null,
    name: null,
    img: null,
    fingerPosition: null,
    state: FingerPrintState.NOTCAPTURED,
  };
  @Input() disabled!: boolean;
  @Output() onCapture: EventEmitter<any> = new EventEmitter<any>();
  fingerprint: any = 'assets/icons/icon-fingerprint-not-captured.svg';
  fingerPrintIcon = '';
  fingerPrintClass = '';

  private secugenLicense!: string;

  constructor(
    private bioService: FingerprintsService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initSecugenLicense();
  }

  initSecugenLicense = () => {
    if (isUat()) {
      this.secugenLicense = (envUAT as any).secugenLicenseUAT;
    }

    if (isProd()) {
      this.secugenLicense = (envProd as any).secugenLicenseProd;
    }
  };

  captureFingerPrint = (fingervalue: any) => {
    if (this.disabled) return;
    const uriString = `timeout=10000&quality=50&licstr=${encodeURIComponent(this.secugenLicense)}&srvhandle=&FingerPos=${this.finger.fingerPosition}`;
    const bioObj: any = {
      position: '',
      image: {
        format: '',
        resolutionDpi: '',
        data: '',
      },
    };

    this.bioService.postCaptureBio(uriString).subscribe(v => {
      if (v.ErrorCode === 0) {
        if (v.ImageQuality < 50) {
        } else {
          this.fingerprint = 'data:image/png;base64,' + v.BMPBase64;
          bioObj.position = fingervalue.fingerPosition;
          bioObj.image.format = 'BMP';
          bioObj.image.resolutionDpi = v.ImageDPI;
          bioObj.image.data = v.BMPBase64;
          this.fingerPrintClass = 'fingerprint-icon';
          this.onCapture.emit(bioObj);
        }
      } else if (v.ErrorCode === 54) {
        // timeout error
        //TODO: show alert for time out error
        this.toast.show(
          null,
          'Fingerprint: Timeout! Try again.',
          MessageBoxType.WARNING,
          5000,
          undefined,
          undefined,
          false
        );
      }
    });
  };

  private fingerPrint() {
    switch (this.finger.state) {
      case FingerPrintState.CAPTURED:
        this.fingerPrintClass = 'fp-captured';
        this.fingerPrintIcon = `ic-${this.fingerPrintClass}`;
        break;
      case FingerPrintState.NOTCAPTURED:
        this.fingerPrintClass = 'fp-not-captured';
        this.fingerPrintIcon = `ic-${this.fingerPrintClass}`;
        break;
      case FingerPrintState.INPROGRESS:
        this.fingerPrintClass = 'fp-in-progress';
        this.fingerPrintIcon = `ic-${this.fingerPrintClass}`;
    }
  }
}
