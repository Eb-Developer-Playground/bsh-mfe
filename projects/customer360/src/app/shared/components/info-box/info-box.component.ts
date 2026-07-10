import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type InfoBoxType = 'success' | 'warning' | 'info' | 'danger';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
  ],
})
export class InfoBoxComponent implements OnInit {
  @Input() type!: InfoBoxType;
  @Input() messageTitle!: string;
  @Input() messageDetail!: string;

  constructor() {}

  ngOnInit(): void {}
}
