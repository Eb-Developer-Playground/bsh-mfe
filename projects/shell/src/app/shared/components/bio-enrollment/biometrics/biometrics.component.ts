import { Component, Input, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MessageBoxType } from 'src/app/shared/modules/toast/models';
import { Finger, FingerPrintState } from '../models';
import { SkipBioDialog } from './dialogs';
import { MatDialog } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-biometrics',
  templateUrl: './biometrics.component.html',
  styleUrls: ['./biometrics.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class BiometricsComponent implements OnInit, OnDestroy {
  @Input() label!: string;
  @Input() stepperControl!: AbstractControl;
  ticketId!: any;
  action: MessageBoxType = MessageBoxType.DANGER;
  skipBiometricForm!: UntypedFormGroup;
  checkboxValue = false;
  leftFingerArray: any[] = [];
  rightFingerArray: any[] = [];
  fingersArray: any[] = [];
  leftHand: Finger[] = [
    {
      id: 0,
      name: 'Pinky',
      img: '',
      fingerPosition: 'LEFT_LITTLE',
      state: FingerPrintState.NOTCAPTURED,
    },
    {
      id: 1,
      name: 'Ring',
      img: '',
      fingerPosition: 'LEFT_RING',
      state: FingerPrintState.NOTCAPTURED,
    },
    {
      id: 2,
      name: 'Middle',
      img: '',
      fingerPosition: 'LEFT_MIDDLE',
      state: FingerPrintState.NOTCAPTURED,
    },
    {
      id: 3,
      name: 'Index',
      img: '',
      fingerPosition: 'LEFT_INDEX',
      state: FingerPrintState.NOTCAPTURED,
    },
    {
      id: 4,
      name: 'Thumb',
      img: '',
      fingerPosition: 'LEFT_THUMB',
      state: FingerPrintState.NOTCAPTURED,
    },
  ];
  rightHand: Finger[] = [
    {
      id: 0,
      name: 'Pinky',
      img: '',
      fingerPosition: 'RIGHT_LITTLE',
      state: FingerPrintState.NOTCAPTURED,
    },
    {
      id: 1,
      name: 'Ring',
      img: '',
      fingerPosition: 'RIGHT_RING',
      state: FingerPrintState.NOTCAPTURED,
    },
    {
      id: 2,
      name: 'Middle',
      img: '',
      fingerPosition: 'RIGHT_MIDDLE',
      state: FingerPrintState.NOTCAPTURED,
    },
    {
      id: 3,
      name: 'Index',
      img: '',
      fingerPosition: 'RIGHT_INDEX',
      state: FingerPrintState.NOTCAPTURED,
    },
    {
      id: 4,
      name: 'Thumb',
      img: '',
      fingerPosition: 'RIGHT_THUMB',
      state: FingerPrintState.NOTCAPTURED,
    },
  ];

  private destroySubject = new Subject();

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog
    // private service: AccountService,
  ) {
    this.skipBiometricForm = fb.group({
      skipCheckBox: false,
    });
  }

  ngOnInit(): void {
    this.skipBiometricForm.valueChanges
      .pipe(takeUntil(this.destroySubject))
      .subscribe(values => {
        const dialog = this.dialog.open(SkipBioDialog, {
          width: '600px',
          height: '288px',
        });
        dialog
          .afterClosed()
          .pipe(take(1))
          .subscribe((result: any) => {
            if (result && result.step) {
              this.enrollBio();
            }
          });
      });
  }

  // Called when fingerprints have been captured
  removeDuplicates = (array: any[], key: string | number) => {
    return array.reduce((arr, item) => {
      const removed = arr.filter(
        (i: { [x: string]: any }) => i[key] !== item[key]
      );
      return [...removed, item];
    }, []);
  };

  onLeftHand = (event: any) => {
    this.leftFingerArray = event;
    this.fingersArray = [
      ...this.removeDuplicates(this.leftFingerArray, 'position'),
      ...this.removeDuplicates(this.rightFingerArray, 'position'),
    ];
  };

  onRightHand = (event: any) => {
    this.rightFingerArray = event;
    this.fingersArray = [
      ...this.removeDuplicates(this.leftFingerArray, 'position'),
      ...this.removeDuplicates(this.rightFingerArray, 'position'),
    ];
  };

  enrollBio() {
    let enrolBioUrl;
    let ticketId;
  }

  ngOnDestroy() {
    this.destroySubject.next('');
    this.destroySubject.complete();
  }
}
