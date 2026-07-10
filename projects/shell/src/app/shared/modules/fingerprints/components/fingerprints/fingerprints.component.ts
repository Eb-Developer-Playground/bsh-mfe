import { Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Finger, FingerPrintState } from '../../models';
import { SkipEnrolBioDialog } from '../../dialogs';
import { MatDialog } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';

@Component({
  selector: 'app-fingerprints',
  templateUrl: './fingerprints.component.html',
  styleUrls: ['./fingerprints.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class FingerprintsComponent implements OnInit, OnDestroy {
  @Input() title = 'Biometrics scan';
  @Input() description: string =
    "To capture the customer's biometric information, scan each finger individually. " +
    'Make sure that you scan the entire fingerprint. You can skip this step if it’s not required.';
  @Output() onSkipped: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCaptured: EventEmitter<any> = new EventEmitter<any>();
  @Input() contentOnly!: boolean;
  @Input() disabled!: boolean;
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
  skipBioForm!: UntypedFormGroup;
  leftFingerArray: any[] = [];
  rightFingerArray: any[] = [];
  fingersArray: any[] = [];

  private destroySubject = new Subject();

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog
  ) {
    this.skipBioForm = fb.group({
      skipCheckBox: false,
    });
  }

  ngOnInit(): void {
    this.skipBioForm.valueChanges
      .pipe(takeUntil(this.destroySubject))
      .subscribe(values => {
        const dialog = this.dialog.open(SkipEnrolBioDialog, {
          width: '600px',
          height: '288px',
        });
        dialog
          .afterClosed()
          .pipe(take(1))
          .subscribe((reason: any) => {
            if (reason) {
              this.onSkipped.emit(reason);
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
    this.onCaptured.emit(this.fingersArray);
  };

  onRightHand = (event: any) => {
    this.rightFingerArray = event;
    this.fingersArray = [
      ...this.removeDuplicates(this.leftFingerArray, 'position'),
      ...this.removeDuplicates(this.rightFingerArray, 'position'),
    ];
    this.onCaptured.emit(this.fingersArray);
  };

  ngOnDestroy() {
    this.destroySubject.next('');
    this.destroySubject.complete();
  }
}
