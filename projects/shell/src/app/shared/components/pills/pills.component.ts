import { Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pills',
  templateUrl: './pills.component.html',
  styleUrls: ['./pills.component.scss'],
  imports: [MatIconModule, CommonModule, TranslateModule],
  standalone: true,
})
export class PillsComponent implements OnInit {
  @Input() color!: string;
  @Input() icon!: string;
  @Input() text!: string;

  constructor() {}

  ngOnInit(): void {}
}
