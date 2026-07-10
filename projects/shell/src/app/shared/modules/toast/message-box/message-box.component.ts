import { Component, Input, OnInit } from '@angular/core';
import { MessageBoxType } from '../models';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss'],
})
export class MessageBoxComponent implements OnInit {
  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() text!: string;
  @Input() type!: MessageBoxType;

  constructor() {}

  ngOnInit(): void {}
}
