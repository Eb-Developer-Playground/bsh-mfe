import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-iconography',
  templateUrl: './iconography.component.html',
  styleUrls: ['./iconography.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class IconographyComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
