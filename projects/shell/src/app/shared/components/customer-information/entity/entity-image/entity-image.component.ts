import { Component, Input, OnInit } from '@angular/core';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';
import { ApiService } from 'src/app/shared/services';
@Component({
  selector: 'app-entity-image',
  templateUrl: './entity-image.component.html',
  styleUrls: ['./entity-image.component.scss'],
})
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
    this.customerDetails = this.accountManagementService.getCustomerDetails();
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
