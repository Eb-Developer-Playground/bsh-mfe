import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  VerifyBioDialog,
  VerifySignatoryBioDialog,
  VerifySignatoryDialog,
} from './dialogs';
import { BioVerifyInput, BioVerifyResult } from './models';
import { environment } from '@env/environment';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-type': 'application/x-www-form-urlencoded',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class FingerprintsService {
  constructor(
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  postCaptureBio(values: any): Observable<any> {
    const url = environment.secugenApi + '/SGIFPCapture';
    return this.http.post<any>(url, values, httpOptions);
  }

  launchBio() {
    const url = environment.bioExtPage;
    window.open(url, '_blank');
  }

  verify(inputData: BioVerifyInput): Observable<BioVerifyResult> {
    if (inputData.customerType === 'Entity') {
      return this.verifyBioSignatories(inputData);
    } else {
      const dialogRef = this.dialog.open(VerifyBioDialog, {
        width: '50%',
        data: inputData,
      });
      return dialogRef.afterClosed().pipe(
        switchMap(result =>
          of({
            success: result.success,
            skipBio: result.skipBio,
            skipBioForm: result?.skipBioForm,
            documents: result?.documents,
            bioModel: {
              skipBio: result.skipBio,
              cif: inputData.customerId,
              fingerprints: result.fingerprints,
            },
          })
        )
      );
    }
  }

  private verifyBioSignatories(
    inputData: BioVerifyInput
  ): Observable<BioVerifyResult | any> {
    const dialogRef = this.dialog.open(VerifySignatoryDialog, {
      width: '50%',
      height: 'auto',
      data: inputData,
    });
    return dialogRef.afterClosed().pipe(
      map(result => {
        if (result) {
          if (!result.skipBio && result?.signatories?.length) {
            return this.dialog.open(VerifySignatoryBioDialog, {
              data: {
                ...inputData,
                signatories: result.signatories,
              },
            });
          }
          return result;
        }
        return {
          success: false,
          skipBio: false,
          documents: [],
          skipBioForm: null,
          bioModel: [],
        };
      }),
      switchMap(dialogRef => {
        // @ts-ignore
        if (dialogRef instanceof MatDialogRef<VerifySignatoryBioDialog>) {
          return dialogRef.afterClosed().pipe(
            switchMap(result =>
              of({
                success: result?.success,
                skipBio: result?.skipBio,
                skipBioForm: result?.skipBioForm,
                documents: result?.documents,
                bioModel: result?.fingerprints,
              })
            )
          );
        } else {
          return of({
            success: dialogRef?.success,
            skipBio: dialogRef?.skipBio,
            skipBioForm: dialogRef?.skipBioForm,
            documents: dialogRef?.documents,
            bioModel: dialogRef?.fingerprints,
          });
        }
      })
    );
  }

  getBioErrorMessage(ErrorCode: any) {
    let Description;
    switch (ErrorCode) {
      // 0 - 999 - Comes from SgFplib.h
      // 1,000 - 9,999 - SGIBioSrv errors
      // 10,000 - 99,999 license errors
      case 1:
        Description =
          'Creation failed (fingerprint reader not correctly installed or driver files error)';
        break;
      case 2:
        Description =
          'Function failed (wrong type of fingerprint reader or not correctly installed)';
        break;
      case 3:
        Description = 'Internal (invalid parameters to sensor API)';
        break;
      case 5:
        Description = 'DLL load failed';
        break;
      case 6:
        Description = 'DLL load failed for driver';
        break;
      case 7:
        Description = 'DLL load failed for algorithm';
        break;
      case 51:
        Description = 'System file load failure';
        break;
      case 52:
        Description = 'Sensor chip initialization failed';
        break;
      case 53:
        Description = 'Device not found';
        break;
      case 54:
        Description = 'Fingerprint image capture timeout';
        break;
      case 55:
        Description = 'No device available';
        break;
      case 56:
        Description = 'Driver load failed';
        break;
      case 57:
        Description = 'Wrong Image';
        break;
      case 58:
        Description = 'Lack of bandwidth';
        break;
      case 59:
        Description = 'Device Busy';
        break;
      case 60:
        Description = 'Cannot get serial number of the device';
        break;
      case 61:
        Description = 'Unsupported device';
        break;
      case 63:
        Description = "SgiBioSrv didn't start; Try image capture again";
        break;
      case 101:
        Description = 'Very low minutiae count';
        break;
      case 102:
        Description = 'Wrong template type';
        break;
      case 103:
        Description = 'Invalid template';
        break;
      case 104:
        Description = 'Invalid template';
        break;
      case 105:
        Description = 'Could not extract features';
        break;
      case 106:
        Description = 'Match failed';
        break;
      case 1000:
        Description = 'No memory';
        break;
      case 2000:
        Description = 'Internal error';
        break;
      case 3000:
        Description = 'Internal error extended';
        break;
      case 4000:
        Description = 'Invalid parameter passed to service';
        break;
      case 6000:
        Description = 'Certificate error cannot decode';
        break;
      case 10001:
        Description = 'License error';
        break;
      case 10002:
        Description = 'Invalid domain';
        break;
      case 10003:
        Description = 'License expired';
        break;
      case 10004:
        Description =
          'WebAPI may not have received the origin header from the browser';
        break;
      default:
        Description =
          'Unknown error code or Update code to reflect latest result';
        break;
    }
    return Description;
  }
}
