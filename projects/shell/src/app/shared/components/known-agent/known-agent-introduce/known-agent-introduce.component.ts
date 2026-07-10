import { Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import {
  CompanyDetails,
  PersonalDetails,
} from 'src/app/shared/models/common/cifinquiry.model';

@Component({
  selector: 'app-known-agent-introduce',
  templateUrl: './known-agent-introduce.component.html',
  styleUrls: ['./known-agent-introduce.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class KnownAgentIntroduceComponent implements OnInit, OnChanges {
  @Input() personalDetails!: PersonalDetails;
  @Input() companyDetails!: CompanyDetails;
  @Input() accountNumber!: string;
  @Input() ticketId!: string;
  public showCustomerPhoto = false;
  public customerId!: string;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.showCustomerPhoto =
      this.personalDetails || this.companyDetails ? true : false;
    this.customerId =
      this.personalDetails?.customerId || this.companyDetails?.customerId;
  }

  getAvatarName(name: string): string {
    if (!name) {
      return '';
    }
    const avatarArray = name
      .split(' ')
      .map(v => v.charAt(0).toUpperCase())
      .join(' ');
    return avatarArray;
  }

  mapGender(gender: string) {
    switch (gender) {
    }
  }
}
