import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Finger } from '../../models';

@Component({
  selector: 'app-hand',
  templateUrl: './hand.component.html',
  styleUrls: ['./hand.component.scss'],
})
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
