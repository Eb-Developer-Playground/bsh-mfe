import { Component, EventEmitter, Input, OnInit, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';
import { Finger } from '../../models';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class HandComponent implements OnInit {
  @Input() label!: string;
  @Input() hand!: Finger[];
  @Input() disabled!: boolean;
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
