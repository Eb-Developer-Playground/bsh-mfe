import { Component, OnInit, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';
import { Finger } from 'src/app/shared/components/bio-enrollment/models/biometric.model';

@Component({
  selector: 'app-biometric-hand',
  templateUrl: './biometric-hand.component.html',
  styleUrls: ['./biometric-hand.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class BiometricHandComponent implements OnInit {
  @Input() label!: string;
  @Input() hand!: Finger[];
  @Output() handChangePrints: EventEmitter<any> = new EventEmitter<any>();
  leftFingerPrintArray: any = [];
  rightFingerPrintArray: any = [];
  constructor() {}

  ngOnInit(): void {}

  getCapturedFingerPrints = (event: any) => {
    if (event.position.startsWith('LEFT')) {
      this.leftFingerPrintArray.push(event);
      this.handChangePrints.emit(this.leftFingerPrintArray);
    } else {
      this.rightFingerPrintArray.push(event);
      this.handChangePrints.emit(this.rightFingerPrintArray);
    }
  };
}
