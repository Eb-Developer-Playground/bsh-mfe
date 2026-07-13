import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

export type InfoBoxType = 'success' | 'warning' | 'info' | 'danger';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss'],
  imports: [CommonModule, MatCardModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class InfoBoxComponent implements OnInit {
  @Input() type!: InfoBoxType;
  @Input() messageTitle!: string;
  @Input() messageDetail!: string;

  constructor() {}

  ngOnInit(): void {}
}
