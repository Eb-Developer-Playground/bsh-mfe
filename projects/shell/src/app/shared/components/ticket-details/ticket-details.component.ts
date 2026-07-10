import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class TicketDetailsComponent implements OnInit {
  @Input() data!: any;

  constructor() {}

  ngOnInit(): void {}
}
