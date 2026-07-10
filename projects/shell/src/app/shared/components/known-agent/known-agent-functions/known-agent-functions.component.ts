import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-known-agent-functions',
  templateUrl: './known-agent-functions.component.html',
  styleUrls: ['./known-agent-functions.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class KnownAgentFunctionsComponent implements OnInit {
  @Input() assignedFunctions: any;

  constructor() {}

  ngOnInit(): void {}
}
