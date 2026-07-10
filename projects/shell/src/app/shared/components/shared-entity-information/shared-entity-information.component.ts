import { Component, Input, OnInit } from '@angular/core';

import { Unsub } from '@app/shared/utils/unsub';

@Component({
  selector: 'app-shared-entity-information',
  templateUrl: './shared-entity-information.component.html',
  styleUrls: ['./shared-entity-information.component.scss'],
})
export class SharedEntityInformationComponent extends Unsub implements OnInit {
  @Input() data!: any;

  constructor() {
    super();
  }

  ngOnInit() {}
}
