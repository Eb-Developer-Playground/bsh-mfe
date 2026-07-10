import { Component, Inject, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { from, map, mergeMap, Subject, switchMap, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/shared/services';
import { SupportDocuments } from '../../known-agent/known-agent-customer-image/known-agent-customer-image.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-dialog-document-agent-preview',
  templateUrl: './dialog-document-agent-preview.component.html',
  styleUrls: ['./dialog-document-agent-preview.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DialogDocumentAgentPreviewComponent implements OnInit, OnDestroy {
  anchor!: HTMLAnchorElement;
  imageUrl: any;
  showImage = false;
  supportDocuments!: any[];

  public customerPhotos: any = {};
  private destroy$ = new Subject<any>();

  constructor(
    public dialogRef: MatDialogRef<DialogDocumentAgentPreviewComponent>,
    private api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.getDocuments();
  }

  getDocuments(): void {
    this.api
      .get<any>(
        `/v1/knownagentservice-v1/api/agents/GetTicketIdForSavedAgent/${this.data?.agent?.agentid}`
      )
      .pipe(
        switchMap(
          (response: {
            data: string;
            isReqSuccessful: boolean;
            message: string;
          }) => {
            const data = {
              ticketNumber: response.data /*this.ticketId*/,
              service: 'NewGen',
              Cif: '', // this.data.PersonalDetails.CustomerId || this.data.personalDetails.CustomerId
            };
            return this.api.post<any>('/v2/documents/search', data);
          }
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(
        (res: { responseObject: any }) => {
          this.supportDocuments = res.responseObject;
          this.fetchCustomerImage();
        },
        error => {
          console.log(error);
        }
      );
  }

  fetchCustomerImage() {
    const _supportDocuments = this.supportDocuments.filter(data => {
      return ['photo', 'signature'].includes(data.filename);
    });

    _supportDocuments.forEach(doc => {
      this.previewDocument(doc)
        .pipe()
        .subscribe((b64: any) => {
          const _data = { data: b64 };

          let key!: string;

          if (_data.data.filename.includes('photo')) {
            key = 'photo';
          } else if (_data.data.filename.includes('signature')) {
            key = 'signaturePhoto';
          }
          this.customerPhotos[key] = _data.data.data;
        });
    });
  }

  previewDocument(obj: SupportDocuments, type: 'NewGen' | 'Blob' = 'Blob') {
    return this.api
      .postBlob('/v2/documents/download', {
        id: obj.id.toString(),
        service: type,
      })
      .pipe(
        mergeMap((stream: any) => {
          return from(
            new Promise((resolve, _) => {
              const isPDF =
                obj?.filename?.split('.')[1]?.toLowerCase() === 'pdf';
              const contentType = isPDF ? 'application/pdf' : 'octet/stream';
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(new Blob([stream], { type: contentType }));
            })
          );
        }),
        map(data => {
          return {
            data,
            filename: obj.filename,
          };
        }),
        takeUntil(this.destroy$)
      );
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
