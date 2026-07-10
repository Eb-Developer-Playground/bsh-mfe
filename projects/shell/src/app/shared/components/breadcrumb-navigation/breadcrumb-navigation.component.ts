import { Component, OnInit, Input } from '@angular/core';

export interface IBreadcrumbConfig {
  label: string;
  url?: string;
  active: boolean;
}

@Component({
  selector: 'app-breadcrumb-navigation',
  templateUrl: './breadcrumb-navigation.component.html',
  styleUrls: ['./breadcrumb-navigation.component.scss'],
})
export class BreadcrumbNavigationComponent implements OnInit {
  @Input() config!: Array<IBreadcrumbConfig>;

  constructor() {}

  ngOnInit(): void {}
}
