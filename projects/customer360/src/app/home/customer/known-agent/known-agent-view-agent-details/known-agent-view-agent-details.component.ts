import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map, take } from 'rxjs/operators';
import { AccountService } from '@app/core/services/account/account.service';
import { ApiService, SessionService } from '@app/shared/services';
import {
  IKnownAgent,
  IKnownAgentFunctions,
} from '../models/known-agent.models';
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IknownAgentDetails } from '@app/shared/models/common/knownAgent.model';

interface AccountResponse {
  responseObject: any;
  successful: boolean;
}
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { PillsComponent } from '@app/shared/components/pills/pills.component';
import { LegacyCustomerImageComponent } from '@app/shared/components/legacy-customer-image/legacy-customer-image.component';
import { DocumentsReviewComponent } from '@app/shared/modules/upload-docs/review/documents-review.component';

@Component({
  selector: 'app-known-agent-view-agent-details',
  templateUrl: './known-agent-view-agent-details.component.html',
  styleUrls: ['./known-agent-view-agent-details.component.scss'],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatDividerModule,
    MatDialogModule,
    MatButtonModule,
    TranslatePipe,
    PillsComponent,
    LegacyCustomerImageComponent,
    DocumentsReviewComponent,
  ],
})
export class KnownAgentViewAgentDetailsComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() lastStep = false;
  supportDocuments!: any[];
  ticketId!: string;

  @Input() functionsArray: IKnownAgentFunctions[] = [];
  @Input() hideHeader = false;
  @Input() hideFooter = false;
  @Input() photoUrl?: any;
  @Input() signatureUrl?: any;
  @Input() knownAgentDetails?: IknownAgentDetails;
  accountNumber = '';
  customerId: string = '';
  customerPhotos: any = null;
  canDisplayImage = false;
  agentData!: any;
  agentDetails!: any;
  showAgentLimits = false;
  subsidiary: ISubsidiary;
  photoAndSignature: any[] = [];
  imageLoadFailed = false;
  showPlaceholder = false;
  showSignaturePlaceholder = false;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private sessionService: SessionService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private domSanitizer: DomSanitizer,
  ) {this.subsidiary = this.sessionService.subsidiary;}

  ngOnInit(): void {
    this.canDisplayImage = this.sessionService.hasFeatureRole(
      'AccountManagement.ViewSignatureAndPhoto'
    );
    this.customerId = this.knownAgentDetails?.customerId ?? '';
    if (this.route.snapshot.params['id']) {
      this.customerId = this.route.snapshot.params['id'];
      this.getAgentDetails();
      this.agentDetails = JSON.parse(
        localStorage.getItem('agentDetails') || '{}');
    } 
  
    this.agentDetails = JSON.parse(
      localStorage.getItem('agentDetails') || '{}');
  
    this.customerId = this.agentDetails?.personalDetails?.customerId ?? '';
    
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['documentId']?.currentValue || changes?.['lastStep']?.currentValue) {
      this.getAgentDetails();
    }
  }
  handleImageError(type: 'photo' | 'signature'): void {
    if (type === 'photo') {
      this.photoUrl = null;
      this.showPlaceholder = true;
    } else {
      this.signatureUrl = null;
      this.showSignaturePlaceholder = true;
    }
  }
  
  getDocuments(): void {
    const agent: IKnownAgent | any = JSON.parse(
      <string>localStorage.getItem('SELECTEDAGENT')
    );
    
    if (!agent || !agent.ticketId) {
      return;
    }
    
    const dataBlob = {
      ticketNumber: agent.ticketId.toString(),
      service: 'Blob',
      Cif: '',
    };
  
    const httpOptions = {
      headers: { skipToast: 'true', skipLoadingInterceptor: 'true' },
    };
  
    this.api.post<any>('/v3/documents/search', dataBlob, httpOptions)
      .pipe(
        map((blobData) => {
          let documents: any[] = [];
  
          if (blobData?.responseObject) {
            blobData.responseObject.forEach((doc: any) => {
              const docName = doc.fileName || doc.name || '';

              if (docName === 'Customer Photo') {
                this.photoUrl = this.domSanitizer.bypassSecurityTrustUrl(
                  `data:${doc.contentType};base64,${doc.content}`
                );
              } else if (docName === 'Customer Signature') {
                this.signatureUrl = this.domSanitizer.bypassSecurityTrustUrl(
                  `data:${doc.contentType};base64,${doc.content}`
                );
              }
              
              documents.push({
                ...doc,
                service: 'Blob'
              });
            });
          }
          
          return documents;
        }),
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe(documents => {
        this.supportDocuments = documents as any[];
      });
  }
  
  
  private mapFuntionsNames(functionsArray: any[]) {
    return functionsArray.map(_f => {
      if (this.agentData?.isBshFunction) {
        return {
          ..._f,
        };
      } else {
        return {
          ..._f,
        };
      }
    });
  }

  private getAgentDetails() {
    const bankId = this.sessionService.userBank;
    const complementedAgentData: IKnownAgent = JSON.parse(
      <string>localStorage.getItem('SELECTEDAGENT')
    );

    const idUriString = `?Id=${complementedAgentData?.custId || ''}&bankId=${this.sessionService.userBank}&idType=customerid`;
    this.apiService
      .get<any>(`/v1/account${idUriString}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: AccountResponse) => {
        this.agentData = data.responseObject as any;

        if (data?.responseObject?.accounts && data.responseObject.accounts.length > 0) {
          this.accountNumber = data.responseObject.accounts[0].accountNumber || '';
        }
        this.customerId = this.agentData.cif || complementedAgentData?.custId || '';

        this.getDocuments();
        
        let accountCurrency;
        if (this.agentData?.relatedAccounts && this.agentData.relatedAccounts.length > 0) {
          accountCurrency = this.agentData.relatedAccounts[0]?.accountCurrency;
        }
          this.agentData = {
            ...this.agentData,
            currencyCode: accountCurrency,
            custId: complementedAgentData.custId,
            id: complementedAgentData.id || '',
            kra: this.sessionService.subsidiary.countryCode !== 'CD' ? 
            (this.agentData?.kraPin ? this.agentData?.kraPin : complementedAgentData.kra) 
            : '',          
          // id: `${complementedAgentData.id}`,
          avatarName: complementedAgentData.avatarName,
          documentIdType: complementedAgentData?.documentIdType,
          //kra: complementedAgentData.agentKraID,
          datecreated: complementedAgentData.dateCreated,
          agentFunctions: this.mapFuntionsNames(
            complementedAgentData.functions
          ),
            ...(this.subsidiary.countryCode === 'CD' && {
              effectiveDate: complementedAgentData.effectiveDate = new Date(complementedAgentData.effectiveDate)
            }),
            
          agentLimit: complementedAgentData?.agentLimit
            ? complementedAgentData.agentLimit
            : '0',
          phoneNumber1: complementedAgentData.phone
            ? complementedAgentData.phone
            : this.agentData.phoneNumber1,
          phoneNumber2: <string>(
            complementedAgentData?.phone2
          ) /* ? complementedAgentData.phone2 : this.agentData?.phoneNumber2*/,
          email: complementedAgentData.email
            ? complementedAgentData.email
            : this.agentData.email,
          email2: <string>(
            complementedAgentData?.email2
          ) /* ? complementedAgentData.email2 : ''*/,
          firstName: complementedAgentData?.firstName
            ? <string>complementedAgentData.firstName
            : complementedAgentData?.agentName.replace('  ', ' ').split(' ')[0],
          lastName: complementedAgentData?.lastName
            ? <string>complementedAgentData?.lastName
            : complementedAgentData?.agentName.replace('  ', ' ').split(' ')[1],
          backUrl: complementedAgentData?.backUrl,
          isBshFunction: complementedAgentData?.isBshFunction,
        };

        if (!this.accountNumber && data?.responseObject?.accounts && data.responseObject.accounts.length > 0) {
          this.accountNumber = data.responseObject.accounts[0].accountNumber || '';
        }
        if (!this.customerId) {
          this.customerId = this.agentData.cif || '';
        }
        if (!this.accountNumber || !this.customerId) {
          this.getDocuments();
        }

        this.showAgentLimits = this.agentData?.agentLimit
          ? +this.agentData.agentLimit !== 0
          : false;
          if (
            complementedAgentData.getUploads &&
            complementedAgentData.getUploads.length !== 0
          ) {
            this.supportDocuments = complementedAgentData.getUploads;
          } else {
            this.getDocuments();
          }
        });
    }

  getAvatarName(name: string): string {
    if (!name) {
      return '';
    }
    const avatarArray = name
      .split(' ')
      .map(v => v.charAt(0).toUpperCase())
      .join(' ');
    return avatarArray;
  }

  back() {
    const url = this.agentData?.backUrl
      ? this.agentData?.backUrl
      : '/services/known-agent';
    this.router.navigate([url]);
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', () => {});
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
