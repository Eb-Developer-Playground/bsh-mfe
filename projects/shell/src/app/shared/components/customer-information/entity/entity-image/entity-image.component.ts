import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';
import { ApiService } from '@app/shared/services/api.service';
@Component({
  selector: 'app-entity-image',
  templateUrl: './entity-image.component.html',
  styleUrls: ['./entity-image.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class EntityImageComponent implements OnInit {
  @Input() acc: any;
  @Input() customerDetails: any;
  @Input() customerStatus!: string;
  types: any[] = [];
  constructor(
    private accountManagementService: AccountManagementService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    // this.getTypes();
    this.customerDetails = this.accountManagementService['getCustomerDetails']();
  }

  getTypes() {
    this.api.get<any>(`/v1/backoffice/entities/businessType`).subscribe(
      resp => {
        this.types = resp?.responseObject;
      },
      err => {}
    );
  }
}
