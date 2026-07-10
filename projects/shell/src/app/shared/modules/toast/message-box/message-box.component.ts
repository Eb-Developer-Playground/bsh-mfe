import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { MessageBoxType } from '../models';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class MessageBoxComponent implements OnInit {
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() text!: string;
  @Input() type!: MessageBoxType;

  constructor() {}

  ngOnInit(): void {}
}
