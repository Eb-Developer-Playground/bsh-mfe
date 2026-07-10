import { Component, OnInit, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';

export interface IBreadcrumbConfig {
  label: string;
  url?: string;
  active: boolean;
}

@Component({
  selector: 'app-breadcrumb-navigation',
  templateUrl: './breadcrumb-navigation.component.html',
  styleUrls: ['./breadcrumb-navigation.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class BreadcrumbNavigationComponent implements OnInit {
  @Input() config!: Array<IBreadcrumbConfig>;

  constructor() {}

  ngOnInit(): void {}
}
