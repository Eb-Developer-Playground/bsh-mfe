import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';

export type InfoBoxType = 'success' | 'warning' | 'info' | 'danger';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class InfoBoxComponent implements OnInit {
  @Input() type!: InfoBoxType;
  @Input() messageTitle!: string;
  @Input() messageDetail!: string;

  constructor() {}

  ngOnInit(): void {}
}
