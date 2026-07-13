import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface IBreadcrumbConfig {
  label: string;
  url?: string;
  active: boolean;
}

@Component({
  selector: 'app-breadcrumb-navigation',
  templateUrl: './breadcrumb-navigation.component.html',
  styleUrls: ['./breadcrumb-navigation.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class BreadcrumbNavigationComponent implements OnInit {
  @Input() config!: Array<IBreadcrumbConfig>;

  constructor() {}

  ngOnInit(): void {}
}
