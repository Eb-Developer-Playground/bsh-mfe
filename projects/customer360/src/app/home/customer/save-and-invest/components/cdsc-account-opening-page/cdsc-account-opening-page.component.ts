import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IBreadcrumbConfig } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { BreadcrumbNavigationComponent } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';
import { CdscAccountOpeningService } from 'src/app/core/services/cdsc-account-opening/cdsc-account-opening.service';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { InfoBoxComponent } from 'src/app/shared/components/info-box/info-box.component';
import { CustomerDetailsComponent } from './components/customer-details/customer-details.component';
import { ContactDetailsComponent } from './components/contact-details/contact-details.component';
import { NextOfKinComponent } from './components/next-of-kin/next-of-kin.component';
import { AdditionalInformationComponent } from './components/additional-information/additional-information.component';

@Component({
  selector: 'app-cdsc-account-opening-page',
  templateUrl: './cdsc-account-opening-page.component.html',
  styleUrls: ['./cdsc-account-opening-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BreadcrumbNavigationComponent,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    TranslatePipe,
    InfoBoxComponent,
    CustomerDetailsComponent,
    ContactDetailsComponent,
    NextOfKinComponent,
    AdditionalInformationComponent,
  ],
})
export class CdscAccountOpeningPageComponent implements OnInit {
  public breadcrumbsConfig: Array<IBreadcrumbConfig> = [
    {
      label: 'Service portal',
      url: 'services',
      active: false,
    },
    {
      label: 'Customer 360°',
      url: 'services/customer-360',
      active: false,
    },
    {
      label: 'Save&Invest',
      url: 'services/customer-360/save-and-invest-profile',
      active: false,
    },
    {
      label: 'CDS Account Opening',
      active: true,
    },
  ];

  public form: UntypedFormGroup;

  public customer: any;
  public displayWarningMessage!: boolean;

  public existingFormData?: any;

  public displayForm = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private accountManagementService: AccountManagementService,
    private cdscAccountOpeningService: CdscAccountOpeningService
  ) {
    this.form = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.initCustomer();
    this.initAccountNumber();
    this.initExistingFormData();
  }

  initAccountNumber = () => {
    this.cdscAccountOpeningService.fetchAccountNumber(
      this.initView,
      this.cancel
    );
  };

  initView = () => {
    this.displayForm = true;
    this.initDisplayWarningMessage();
  };

  initCustomer = () => {
    this.customer = this.accountManagementService.getCustomerCifData();
  };

  submit = () => {
    this.accountManagementService.setsaveAndInvestDetails(
      this.form.getRawValue()
    );
    this.router.navigateByUrl(
      'services/customer-360/save-and-invest/review/cdsc-account-opening'
    );
  };

  cancel = () => {
    this.router.navigateByUrl('services/customer-360/save-and-invest-profile');
  };

  initDisplayWarningMessage = () => {
    setTimeout(() => (this.displayWarningMessage = !this.form.valid), 1);
  };

  initExistingFormData = () => {
    this.existingFormData =
      this.accountManagementService.getsaveAndInvestDetails();
  };
}
