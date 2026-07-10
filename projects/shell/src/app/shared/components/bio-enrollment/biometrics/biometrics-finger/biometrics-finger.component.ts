import { Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';
import { Finger, FingerPrintState } from '../../models/biometric.model';
import { BiometricService } from 'src/app/core/services/biometric/biometric.service';
import { UIService } from 'src/app/shared/services/ui.service';

@Component({
  selector: 'app-biometrics-finger',
  templateUrl: './biometrics-finger.component.html',
  styleUrls: ['./biometrics-finger.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class BiometricsFingerComponent implements OnInit {
  @Input() finger: Finger = {
    id: null,
    name: null,
    img: null,
    fingerPosition: null,
    state: FingerPrintState.NOTCAPTURED,
  };

  @Output() onCapture: EventEmitter<any> = new EventEmitter<any>();

  fingerPrintIcon = '';
  fingerPrintClass = '';
  fingerprint: any = 'assets/icons/icon-fingerprint-not-captured.svg';
  fingerPrintArray: any = [];

  customIcons: { name: string; path: string }[] = [
    {
      name: 'ic-fp-not-captured',
      path: 'assets/icons/icon-fingerprint-not-captured.svg',
    },
    {
      name: 'ic-fp-in-progress',
      path: 'assets/icons/icon-fingerprint-in-progress.svg',
    },
    {
      name: 'ic-fp-captured',
      path: 'assets/icons/icon-fingerprint-captured.svg',
    },
  ];

  constructor(
    private uiService: UIService,
    private biometricService: BiometricService
  ) {
    // Register custom icons
    this.uiService.registerIcons(this.customIcons);
  }

  ngOnInit(): void {}
  captureFingerPrint = (fingervalue: any) => {
    const uriString =
      'timeout=10000&quality=50&licstr=&srvhandle=&FingerPos=RIGHT_INDEX';
    const bioObj: any = {
      position: '',
      image: {
        format: '',
        resolutionDpi: '',
        data: '',
      },
    };

    this.biometricService['postMultipleCapture'](uriString).subscribe((v: any) => {
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
