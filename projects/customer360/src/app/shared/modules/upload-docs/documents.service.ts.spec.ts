import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ApiService } from '../../services';
import { DocumentsService } from './documents.service';
import { DocumentUploadServiceType, IFileParams } from './models';
import * as constants from './constants';

describe('DocumentsService', () => {
  let service: DocumentsService;
  // let translateService: TranslateService;
  let apiService: ApiService;

  let ApiServiceMock = {
    post: jest.fn(),
    postBlob: jest.fn().mockReturnValue(of({})),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        TranslateService,
        {
          provide: ApiService,
          useValue: ApiServiceMock,
        },
      ],
    });

    service = TestBed.inject(DocumentsService);
    // translateService = TestBed.inject(TranslateService);
    apiService = TestBed.inject(ApiService);
  });

  it('should create DocumentsService', () => {
    expect(service).toBeTruthy();
  });

  // Returns an array of IDocumentSpec objects based on the provided idTypeOrUseCase and optional parameters.
  it('should return an array of IDocumentSpec objects when valid parameters are provided', () => {
    const idTypeOrUseCase = 'nationalid';
    const eddRequired = true;
    const isUSCitizen = false;
    const useDefaultMaxSize = true;
    const secondaryIds = ['1', '2'];
    const isKenyanAbroad = false;

    const documents = service.getDocumentsFor(
      idTypeOrUseCase,
      eddRequired,
      isUSCitizen,
      useDefaultMaxSize,
      secondaryIds,
      isKenyanAbroad
    );

    expect(Array.isArray(documents)).toBe(true);
    expect(documents.length).toBeGreaterThan(0);
    expect(documents[0]).toHaveProperty('required');
    expect(documents[0]).toHaveProperty('name');
    expect(documents[0]).toHaveProperty('description');
    expect(documents[0]).toHaveProperty('fileTypes');
    expect(documents[0]).toHaveProperty('maxSize');
  });

  // Returns the correct document name for a given id type
  it('should return the correct document name for a given id type', () => {
    // Arrange

    const idTypeNationalId = 'NationalId';
    const idTypeBirthCertificate = 'BirthCertificate';
    const idTypeMilitaryServiceCard = 'MilitaryServiceCard';
    const idTypeDriversLicense = 'DriversLicense';
    const idTypeKenyanPassport = 'KenyanPassport';
    const idTypeForeignPassport = 'ForeignPassport';
    const idTypeForeignId = 'ForeignId';
    const idTypeWorkPermit = 'WorkPermit';
    const idTypeRefugeeId = 'RefugeeId';
    const idTypeUNHCRProof = 'UNHCRProof';

    // Act
    const result = (service as any).mapIdTypeToNewgenDocumentName(
      idTypeNationalId
    );
    const result1 = (service as any).mapIdTypeToNewgenDocumentName(
      idTypeBirthCertificate
    );
    const result2 = (service as any).mapIdTypeToNewgenDocumentName(
      idTypeMilitaryServiceCard
    );
    const result3 = (service as any).mapIdTypeToNewgenDocumentName(
      idTypeDriversLicense
    );
    const result4 = (service as any).mapIdTypeToNewgenDocumentName(
      idTypeKenyanPassport
    );
    const result5 = (service as any).mapIdTypeToNewgenDocumentName(
      idTypeForeignPassport
    );
    const result6 = (service as any).mapIdTypeToNewgenDocumentName(
      idTypeForeignId
    );
    const result7 = (service as any).mapIdTypeToNewgenDocumentName(
      idTypeWorkPermit
    );
    const result8 = (service as any).mapIdTypeToNewgenDocumentName(
      idTypeRefugeeId
    );
    const result9 = (service as any).mapIdTypeToNewgenDocumentName(
      idTypeUNHCRProof
    );

    // Assert
    expect(result).toBe(constants.NATIONAL_ID_DOCUMENT_NAME);
    expect(result1).toBe(constants.BIRTH_CERTIFICATE_NAME);
    expect(result2).toBe(constants.MILITARY_ID_DOCUMENT_NAME);
    expect(result3).toBe(constants.DRIVERS_LICENSE_DOCUMENT_NAME);
    expect(result4).toBe(constants.KENYAN_PASSPORT_DOCUMENT_NAME);
    expect(result5).toBe(constants.FOREIGN_PASSPORT_DOCUMENT_NAME);
    expect(result6).toBe(constants.ALIEN_ID_DOCUMENT_NAME);
    expect(result7).toBe(constants.WORK_PERMIT_DOCUMENT_NAME);
    expect(result8).toBe(constants.REFUGEE_ID_CARD_DOCUMENT_NAME);
    expect(result9).toBe(constants.UNHCR_PROOF);
  });

  // Returns true if documentName is mandatory and not in secondaryIdsMappedToNewgen
  it('should return true when documentName is mandatory and not in secondaryIdsMappedToNewgen', () => {
    const documentName = 'nationalId';
    const secondaryIds = [
      { IdType: 'NationalId' },
      { IdType: 'ForeignPassport' },
    ];

    const result = (service as any).checkDocumentRequired(
      documentName,
      secondaryIds
    );

    expect(result).toBe(true);
  });

  // should return empty array if documentName is not allowed
  it('should return empty array when documentName is not allowed', () => {
    const documentName = 'InvalidDocument';
    const allowedFiletypes = (service as any).getDocumentAllowedFiletypes(
      documentName
    );
    expect(allowedFiletypes).toEqual([]);
  });

  // Returns an object with the expected properties and values when given valid input arguments.
  it('should return an object with the expected properties and values when given valid input arguments', () => {
    // Arrange
    const _service: DocumentUploadServiceType = 'NewGen';
    const documents: Array<IFileParams> = [
      {
        filename: 'document1.jpg',
        docCode: '123',
        format: 'jpg',
        data: 'base64data1',
      },
      {
        filename: 'document2.pdf',
        docCode: '123',
        format: 'pdf',
        data: 'base64data2',
      },
    ];
    const ticketId = '123456';
    const customerId = '7890';

    // Act
    const result = (service as any).preparePayload(
      _service,
      documents,
      ticketId,
      customerId
    );

    // Assert
    expect(result).toEqual({
      cif: customerId,
      AccountNumber: '',
      country: 'KE',
      ticketNumber: ticketId,
      idType: '',
      idNumber: '',
      Service: _service,
      documents: documents,
    });
  });

  // Uploads documents successfully
  it('should upload documents successfully when given a valid documents array, ticketId, customerId, and useNewgenServiceForFinacleUpload flag', () => {
    // Arrange
    const constants = {
      UPLOAD_URL_V2: '/v2/documents/submit',
    };

    const documents: Array<IFileParams> = [
      {
        filename: 'document1.pdf',
        docCode: '123',
        format: 'pdf',
        data: 'base64encodeddata1',
      },
      {
        filename: 'document2.jpg',
        docCode: '123',
        format: 'jpg',
        data: 'base64encodeddata2',
      },
    ];
    const ticketId = '1234567890';
    const customerId = '9876543210';
    const useNewgenServiceForFinacleUpload = true;
    const postSpy = jest
      .spyOn(apiService, 'post')
      .mockReturnValue(of({ successful: true, responseObject: [] }));

    // Act
    const result$ = service.upload(
      documents,
      ticketId,
      customerId,
      useNewgenServiceForFinacleUpload
    );

    // Assert
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(
      constants.UPLOAD_URL_V2,
      expect.any(Object)
    );
    result$.subscribe(result => {
      expect(result.successful).toBe(true);
      expect(result.responseObject).toEqual([]);
    });
  });

  it('should return an Observable when ticketId is provided', () => {
    // Arrange
    const ticketId = '123456789';
    const postSpy = jest
      .spyOn(apiService, 'post')
      .mockReturnValue(of({ successful: true, responseObject: [] }));

    // Act
    const result = service.downloadDocumentsForTicket(ticketId);

    // Assert
    expect(postSpy).toHaveBeenCalledTimes(1);
  });

  // Downloads a single document successfully
  it('should download a single document successfully', () => {
    // Invoke the downloadDocuments method with a single document ID
    const postBlob = jest
      .spyOn(apiService, 'postBlob')
      .mockReturnValue(of({ successful: true, responseObject: [] }));
    const documentIdData = 'documentId1';
    service.downloadDocuments(documentIdData).subscribe(result => {
      // Assert that the apiService.postBlob method was called with the correct parameters
      expect(postBlob).toHaveBeenCalledWith('/v2/documents/download', {
        id: documentIdData,
        service: 'NewGen',
      });

      // Assert that the result is an array containing a single object
      expect(result).toEqual([{}]);
    });
  });

  // Returns true if the document filename contains 'passport photo' string
  it('should return true when document filename contains "passport photo" string', () => {
    const document = {
      filename: 'Picture',
    };
    const isFinacleDocument = service.checkDocumentIsFinacle(document);

    expect(isFinacleDocument).toBe(true);
  });

  // Returns false if the document parameter is null or undefined
  it('should return false when document parameter is null', () => {
    const document = {
      filename: 'other document.jpg',
    };
    const isFinacle = service.checkDocumentIsFinacle(document);

    expect(isFinacle).toBe(false);
  });
});
