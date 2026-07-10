import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';

import { Unsub } from '@app/shared/utils/unsub';

@Component({
  selector: 'app-shared-entity-information',
  templateUrl: './shared-entity-information.component.html',
  styleUrls: ['./shared-entity-information.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class SharedEntityInformationComponent extends Unsub implements OnInit {
  @Input() data!: any;

  constructor() {
    super();
  }

  ngOnInit() {}
}
