import { Component, OnInit, Input } from '@angular/core';

export type InfoBoxType = 'success' | 'warning' | 'info' | 'danger';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss'],
})
export class InfoBoxComponent implements OnInit {
  @Input() type!: InfoBoxType;
  @Input() messageTitle!: string;
  @Input() messageDetail!: string;

  constructor() {}

  ngOnInit(): void {}
}
