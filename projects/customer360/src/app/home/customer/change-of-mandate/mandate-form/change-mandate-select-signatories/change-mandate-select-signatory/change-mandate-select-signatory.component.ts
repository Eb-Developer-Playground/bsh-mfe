import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { NgForOf, NgIf } from '@angular/common';
import { IMandate } from '../../../models/change-madate.model';

@Component({
  selector: 'app-change-mandate-select-signatory',
  templateUrl: './change-mandate-select-signatory.component.html',
  styleUrls: ['./change-mandate-select-signatory.component.scss'],
  imports: [
    NgForOf,
    NgIf,
  ],
})
export class ChangeMandateSelectSignatoryComponent implements OnInit {
  @Input() title!: string;
  @Input() signatories!: IMandate[];
  @Output() signatoryEvent = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  public getAvatarName(name: string): string {
    let avatarArray: string;

    const nameArray = name.split(' ');
    switch (nameArray.length) {
      case 3:
        avatarArray = nameArray
          .splice(0, 2)
          .map(v => v.charAt(0).toUpperCase())
          .join(' ');
        break;
      case 4:
        avatarArray = nameArray
          .splice(0, 3)
          .map(v => v.charAt(0).toUpperCase())
          .join(' ');
        break;
      default:
        avatarArray = nameArray.map(v => v.charAt(0).toUpperCase()).join(' ');
        break;
    }

    return avatarArray;
  }

  public onChange(
    event: MatCheckboxChange,
    signatory: { name: string; current: boolean }
  ) {
    signatory.current = event.checked;
    this.signatoryEvent.emit(signatory);
  }
}
