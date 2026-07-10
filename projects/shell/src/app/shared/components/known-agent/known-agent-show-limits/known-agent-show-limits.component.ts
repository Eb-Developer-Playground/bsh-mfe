import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-known-agent-show-limits',
  templateUrl: './known-agent-show-limits.component.html',
  styleUrls: ['./known-agent-show-limits.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class KnownAgentShowLimitsComponent implements OnInit {
  @Input() agentLimit: any;

  constructor() {}

  ngOnInit(): void {}
}
