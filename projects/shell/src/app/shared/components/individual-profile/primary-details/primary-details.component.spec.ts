import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrimaryDetailsComponent } from './primary-details.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ISubsidiary } from '../../../services/session/session.service';
import { ISignature, Stakeholder } from '../../../models/customer/shared';
import { AdditionalPersonalDetails } from '../../../models/customer/individual-formstate';

describe('PrimaryDetailsComponent', () => {
  let component: PrimaryDetailsComponent;
  let fixture: ComponentFixture<PrimaryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimaryDetailsComponent, TranslateModule.forRoot()],
      providers: [TranslateService],
    }).compileComponents();

    fixture = TestBed.createComponent(PrimaryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept subsidiary input', () => {
    const mockSubsidiary: ISubsidiary = {
      bankId: 254,
      countryCode: 'KE',
      countryName: 'Kenya',
      currency: 'KES',
      currencySymbol: 'KSh',
      nationality: 'Kenyan',
      dialCode: '+254',
      icon: 'kenya-icon.png',
      flagPath: '/assets/flags/ke.png',
      operatingCountry: true,
      languages: [
        { id: 'en', name: 'English' },
        { id: 'sw', name: 'Swahili' },
      ],
    };

    component.subsidiary = mockSubsidiary;

    fixture.detectChanges();

    expect(component.subsidiary).toEqual(mockSubsidiary);
  });

  it('should accept signatureAndPhoto input', () => {
    const mockSignatures: ISignature[] = [
      { passport: 'passport1.png', signature: 'signature1.png' },
    ];

    component.signatureAndPhoto = mockSignatures;

    fixture.detectChanges();

    expect(component.signatureAndPhoto).toEqual(mockSignatures);
    expect(component.signatureAndPhoto.length).toBe(1);
    expect(component.signatureAndPhoto[0].passport).toBe('passport1.png');
    expect(component.signatureAndPhoto[0].signature).toBe('signature1.png');
  });

  it('should accept showAccountDetails input', () => {
    component.showAccountDetails = false;
    fixture.detectChanges();

    expect(component.showAccountDetails).toBe(false);
  });

  it('should accept showAccountImagesAndSignatures input', () => {
    component.showAccountImagesAndSignatures = false;
    fixture.detectChanges();

    expect(component.showAccountImagesAndSignatures).toBe(false);
  });

  it('should accept additionalPersonalDetails input', () => {
    const mockDetails: AdditionalPersonalDetails = {
      language: 'English',
      dependants: '2',
      qualification: 'Bachelor',
      institutionName: 'University of Nairobi',
      rentalStatus: 'Owned',
      socialStatus: 'Married',
      spouseName: 'Test Lov',
      socialEconomicLevel: 'Middle',
      averageMonthlyExpenditure: '50000',
      spouses: [
        {
          spousesFullName: 'Test Lov',
          spouseIdentificationNumber: '36000000',
          spouseIdentificationType: 'National ID',
          maidenName: 'Jane Test',
        },
      ],
      smrCode: 'SMR001',
      fateStatus: 'Active',
      disability: 'None',
      numberOfSpouses: '1',
      negativeClientStatus: 'No',
    };

    component.additionalPersonalDetails = mockDetails;

    fixture.detectChanges();

    expect(component.additionalPersonalDetails).toEqual(mockDetails);
    expect(component.additionalPersonalDetails.spouses?.length).toBe(1);
    expect(
      component.additionalPersonalDetails.spouses?.[0].spousesFullName
    ).toBe('Test Lov');
  });

  it('should accept stakeholderDetails input', () => {
    const mockStakeholder: Stakeholder = {
      cif: '54317855337',
      nationality: 'Kenyan',
      countryOfResidence: 'Kenya',
      identificationType: 'National ID',
      documentNumber: '36000000',
      documentSerialNumber: 'SER123456',
      salutation: 'Mr.',
      firstName: 'John',
      middleName: 'Mwangi',
      lastName: 'Doe',
      dateOfBirth: '1985-06-15',
      kraPin: 'A123456789B',
      gender: 'Male',
      religion: 'Christian',
      maritalStatus: 'Married',
      signatureAndPhoto: {
        signature: {
          filename: 'signature.png',
          filePath: '/uploads/signature.png',
        } as any,
        passport: {
          filename: 'passport.png',
          filePath: '/uploads/passport.png',
        } as any,
      },
    };

    component.stakeholderlDetails = mockStakeholder;

    fixture.detectChanges();

    expect(component.stakeholderlDetails).toEqual(mockStakeholder);
    expect(component.stakeholderlDetails.firstName).toBe('John');
    expect(
      component.stakeholderlDetails.signatureAndPhoto?.signature.filename
    ).toBe('signature.png');
  });
});
