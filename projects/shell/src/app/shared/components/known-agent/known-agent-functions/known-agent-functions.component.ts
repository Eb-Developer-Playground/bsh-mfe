import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-known-agent-functions',
  templateUrl: './known-agent-functions.component.html',
  styleUrls: ['./known-agent-functions.component.scss'],
})
export class KnownAgentFunctionsComponent implements OnInit {
  @Input() assignedFunctions: any;

  constructor() {}

  ngOnInit(): void {}
}
