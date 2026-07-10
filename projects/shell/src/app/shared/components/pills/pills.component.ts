import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pills',
  templateUrl: './pills.component.html',
  styleUrls: ['./pills.component.scss'],
  imports: [MatIconModule, CommonModule, TranslatePipe],
})
export class PillsComponent implements OnInit {
  @Input() color!: string;
  @Input() icon!: string;
  @Input() text!: string;

  constructor() {}

  ngOnInit(): void {}
}
