import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-legal-search',
  templateUrl: './legal-search.component.html',
  styleUrls: ['./legal-search.component.scss'],
})
export class LegalSearchComponent implements OnInit {
  @Input() legalSearchCode!: '001' | '002' | '004' | string;

  legalSearchinfo!: {
    icon: string;
    label: string;
    action?: string;
  };

  ngOnInit(): void {
    this.legalSearchinfo = this.setIconAndLabel();
  }

  private setIconAndLabel() {
    switch (this.legalSearchCode) {
      case '001':
        return {
          icon: 'ic-legal-search-okey',
          label: 'CUSTOMER.CUSTOMER-INFORMATION.LEGAL-SEARCH.OKAY',
          //action: 'CUSTOMER.CUSTOMER-INFORMATION.LEGAL-SEARCH.START-NEW-SEARCH'
        };
      case '002':
        return {
          icon: 'ic-legal-search-pending',
          label: 'CUSTOMER.CUSTOMER-INFORMATION.LEGAL-SEARCH.PENDING',
          action: 'CUSTOMER.CUSTOMER-INFORMATION.LEGAL-SEARCH.VIEW-PROGRESS',
        };
      case '004':
        return {
          icon: 'ic-legal-search-not-okey',
          label: 'CUSTOMER.CUSTOMER-INFORMATION.LEGAL-SEARCH.NOT-OKAY',
          action: 'CUSTOMER.CUSTOMER-INFORMATION.LEGAL-SEARCH.VERIFY-AGAIN',
        };

      default:
        return {
          icon: '',
          label: '',
        };
    }
  }
}
