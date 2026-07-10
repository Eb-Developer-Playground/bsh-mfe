import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';
@Component({
  selector: 'app-restricted-country-dialog',
  templateUrl: './restricted-country.dialog.html',
  styleUrls: ['./restricted-country.dialog.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class RestrictedCountryDialog {}
