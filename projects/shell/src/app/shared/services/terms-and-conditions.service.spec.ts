import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TermsAndConditionsService } from './terms-and-conditions.service';
import { ApiService } from './api.service';

describe('TermsAndConditionsService', () => {
  let service: TermsAndConditionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [TermsAndConditionsService, ApiService, TranslateService],
    });
    service = TestBed.inject(TermsAndConditionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
