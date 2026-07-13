import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-restricted-country-dialog',
  templateUrl: './restricted-country.dialog.html',
  styleUrls: ['./restricted-country.dialog.scss'],
  imports: [A11yModule, MatButtonModule, MatDialogModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class RestrictedCountryDialog {}
