import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [MatDividerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class HeaderComponent implements OnInit {
  @Input() title!: string;
  @Input() subTitle: string = '';
  constructor() {}

  ngOnInit(): void {}
}
