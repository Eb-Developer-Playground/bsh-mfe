import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-theming',
  templateUrl: './theming.component.html',
  styleUrls: ['./theming.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class ThemingComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
