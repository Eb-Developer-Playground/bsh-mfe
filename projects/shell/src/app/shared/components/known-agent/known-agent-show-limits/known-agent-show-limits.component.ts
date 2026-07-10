import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-known-agent-show-limits',
  templateUrl: './known-agent-show-limits.component.html',
  styleUrls: ['./known-agent-show-limits.component.scss'],
})
export class KnownAgentShowLimitsComponent implements OnInit {
  @Input() agentLimit: any;

  constructor() {}

  ngOnInit(): void {}
}
