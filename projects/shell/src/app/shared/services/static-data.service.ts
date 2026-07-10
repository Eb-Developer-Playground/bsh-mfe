import { Injectable } from '@angular/core';
import { catchError, map, shareReplay, tap, timeout } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { ICounty } from '../models/county';
import { ICountry } from '../models/country';
import { ICountryInfo } from '../models/country-info';
import { IGender } from '../models/gender';
import { IFinacleCity } from '../models/finacle-city';
import { IIncomeNature } from '../models/income-nature';
import { IIndustrySector } from '../models/industry-sector';
import { IMandate } from '../models/mandate';
import { IMaritalStatus } from '../models/marital-status';
import { INationality } from '../models/nationality';
import { IOccupation } from '../models/occupation';
import { IPhysicalAddress } from '../models/physical-address';
import { IProfession } from '../models/profession';
import { IRegion } from '../models/region';
import { IRelation } from '../models/relation';
import { IReligion } from '../models/religion';
import { IRiskCategory } from '../models/risk-category';
import { ISchemeCode } from '../models/scheme-code';
import { ITitle } from '../models/title';
import { ITownCity } from '../models/town-city';
import { default as BUSINESS_TYPES } from '../../../assets/data/business-types.json';
import { default as LEGAL_ENTITY_TYPES } from '../../../assets/data/legal-entity-types.json';
import { default as LEGAL_SEARCH_STATUSES } from '../../../assets/data/legal-search.json';
import { default as populateOptions } from '../../../assets/data/populate-dropdown.json';
import { IDRCRegions } from '../models/regions-drc';
import { IState } from '../models/state';
import { ISubsidiary, SessionService } from './session/session.service';

@Injectable({
  providedIn: 'root',
})
export class StaticDataService {
  dropdownData$!: Observable<{ responseObject: any; successful: boolean }>;
  businessTypesData$!: Observable<any[]>;
  citiesData$!: Observable<IFinacleCity[]>;
  countriesData$!: Observable<ICountry[]>;
  countriesInfoData$!: Observable<ICountryInfo[]>;
  countiesData$!: Observable<ICounty[]>;
  genderData$!: Observable<IGender[]>;
  incomeNatureData$!: Observable<IIncomeNature[]>;
  industrySectorData$!: Observable<IIndustrySector[]>;
  mandateData$!: Observable<IMandate[]>;
  maritalStatusData$!: Observable<IMaritalStatus[]>;
  nationalitiesData$!: Observable<INationality[]>;
  occupationsData$!: Observable<IOccupation[]>;
  physicalAddressesData$!: Observable<IPhysicalAddress[]>;
  professionsData$!: Observable<IProfession[]>;
  regionsData$!: Observable<IRegion[]>;
  relationsData$!: Observable<IRelation[]>;
  religionsData$!: Observable<IReligion[]>;
  riskCategoriesData$!: Observable<IRiskCategory[]>;
  schemeCodeData$!: Observable<ISchemeCode[]>;
  titlesData$!: Observable<ITitle[]>;
  townsOrCitiesData$!: Observable<ITownCity[]>;
  drcRegionsData$!: Observable<IDRCRegions[]>;
  drcStatesData$!: Observable<IState[]>;

  constructor(
    private api: ApiService,
    private session: SessionService
  ) {}

  getDropdownData(): Observable<any> {
    if (!this.dropdownData$)
      this.dropdownData$ = this.api
        .get<any>('/v1/backoffice/StaticDataUpdatePersonal/populate-dropdown')
        .pipe(
          shareReplay<any>(),
          timeout(15000),
          catchError(() => {
            return of(populateOptions);
          }),
          map(d => d.responseObject)
        );
    return this.dropdownData$;
  }

  getBusinessTypes(): Observable<any[]> {
    return of(BUSINESS_TYPES);
  }

  getLegalEntityTypes(): Observable<any[]> {
    return of(LEGAL_ENTITY_TYPES);
  }

  getLegalSearchStatuses(): Observable<any[]> {
    return of(LEGAL_SEARCH_STATUSES);
  }

  getCities(subsidiary?: ISubsidiary): Observable<IFinacleCity[]> {
    const sub = subsidiary || this.session.subsidiary;
    if (!this.citiesData$) {
      this.citiesData$ = this.api
        .post<any>('/v1/account/cities', {
          bankId: sub.bankId,
          country: sub.countryCode,
        })
        .pipe(
          map(resp => {
            return (resp.responseObject?.cities || []).map((c: any) => {
              return {
                cityPlaceCode: c.code,
                cityPlaceName: c.name.toUpperCase(),
              };
            });
          }),
          shareReplay<any>()
        );
      /**
       * For KE if above fails
       * this.citiesData$ = this.getDropdownData().pipe(shareReplay<any>(), timeout(15000), map(d => d.cityPlace));
       */
    }
    return this.citiesData$;
  }

  getCountries(): Observable<ICountry[]> {
    if (!this.countriesData$)
      this.countriesData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.country)
      );
    return this.countriesData$;
  }

  getCounties(): Observable<ICounty[]> {
    if (!this.countiesData$)
      this.countiesData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.county)
      );
    return this.countiesData$;
  }

  getGenders(): Observable<IGender[]> {
    if (!this.genderData$)
      this.genderData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.gender)
      );
    return this.genderData$;
  }

  getIncomeNature(): Observable<IIncomeNature[]> {
    if (!this.incomeNatureData$)
      this.incomeNatureData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.incomeNature)
      );
    return this.incomeNatureData$;
  }

  getIndustrySectors(): Observable<IIndustrySector[]> {
    if (!this.industrySectorData$)
      this.industrySectorData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.industrySector)
      );
    return this.industrySectorData$;
  }

  getMandates(): Observable<IMandate[]> {
    if (!this.mandateData$)
      this.mandateData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.mandate)
      );
    return this.mandateData$;
  }

  getMaritalStatuses(): Observable<IMaritalStatus[]> {
    if (!this.maritalStatusData$)
      this.maritalStatusData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.maritalStatus)
      );
    return this.maritalStatusData$;
  }

  getNationalities(): Observable<INationality[]> {
    if (!this.nationalitiesData$)
      this.nationalitiesData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.nationality)
      );
    return this.nationalitiesData$;
  }

  getDRCRegions(): Observable<IDRCRegions[]> {
    if (!this.drcRegionsData$)
      this.drcRegionsData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.drcRegions)
      );

    return this.drcRegionsData$;
  }

  getDRCStates(): Observable<IState[]> {
    if (!this.drcStatesData$)
      this.drcStatesData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.drcStates)
      );

    return this.drcStatesData$;
  }

  getOccupations(): Observable<IOccupation[]> {
    if (!this.occupationsData$)
      this.occupationsData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.occupation)
      );
    return this.occupationsData$;
  }

  getPhysicalAddresses(): Observable<IPhysicalAddress[]> {
    if (!this.physicalAddressesData$)
      this.physicalAddressesData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.physicalAddress)
      );
    return this.physicalAddressesData$;
  }

  getProfessions(): Observable<IProfession[]> {
    if (!this.professionsData$)
      this.professionsData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.profession)
      );
    return this.professionsData$;
  }

  getRegions(): Observable<IRegion[]> {
    if (!this.regionsData$)
      this.regionsData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.region)
      );
    return this.regionsData$;
  }

  getRelations(): Observable<IRelation[]> {
    if (!this.relationsData$)
      this.relationsData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.relation)
      );
    return this.relationsData$;
  }

  getReligions(): Observable<IReligion[]> {
    if (!this.religionsData$)
      this.religionsData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.religion)
      );
    return this.religionsData$;
  }

  getRiskCategories(): Observable<IRiskCategory[]> {
    if (!this.riskCategoriesData$)
      this.riskCategoriesData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.riskCategory)
      );
    return this.riskCategoriesData$;
  }

  getSchemeCodes(): Observable<ISchemeCode[]> {
    if (!this.schemeCodeData$)
      this.schemeCodeData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.scheme_Code)
      );
    return this.schemeCodeData$;
  }

  getTitles(): Observable<ITitle[]> {
    if (!this.titlesData$)
      this.titlesData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.title)
      );
    return this.titlesData$;
  }

  getTownsOrCities(): Observable<ITownCity[]> {
    if (!this.townsOrCitiesData$)
      this.townsOrCitiesData$ = this.getDropdownData().pipe(
        shareReplay<any>(),
        timeout(15000),
        map(d => d.townCity)
      );
    return this.townsOrCitiesData$;
  }

  getCountriesInfo(): Observable<ICountryInfo[]> {
    // Use /v1/datalookup/countryInfo - for subsidiaries only
    if (!this.countriesInfoData$)
      this.countriesInfoData$ = this.api
        .get<ICountryInfo[]>('/v1/datalookup/countries')
        .pipe(shareReplay<any>(), timeout(15000));
    return this.countriesInfoData$;
  }
}
