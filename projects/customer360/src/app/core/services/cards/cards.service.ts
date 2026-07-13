import { inject, Injectable } from '@angular/core';
import { ApiService, SessionService } from '@shared/services';
import { CardDetails } from '@app/core/services/cards/models';
import { ContextManager } from '@shared/modules/stepper';
import { Router } from '@angular/router';
import { BehaviorSubject, EMPTY, forkJoin, Observable, of, pipe } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { uuid4 } from '@shared/utils';
import { BlockCardReason } from '@app/home/customer/cards/block-card/options';
import { TicketsService } from '@app/core/services';
import { ActionFlows } from '@shared/services/tickets/ticket-routing';
import {
  BlockCardTypes,
  SkipBioData,
} from '@app/home/customer/cards/cards.types';
import { BioVerifyInput } from '@shared/modules/fingerprints/models';
import { MessageBoxType, ToastService } from '@shared/modules/toast';
import { ConfirmBlockDialogComponent } from '@app/home/customer/cards/block-cards/confirm-block-dialog/confirm-block-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FingerprintsService } from '@shared/modules/fingerprints';
import { CardAction } from '@app/home/customer/cards/bank-card/bank-card.component';
import { AbstractControl } from '@angular/forms';

export interface CreateTicketData {
  actionFlow: string;
  taskType: string;
}

@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private api = inject(ApiService);
  private ctxManager = inject(ContextManager);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private ticketsService = inject(TicketsService);
  private dialog = inject(MatDialog);
  private bioService = inject(FingerprintsService);
  private toast = inject(ToastService);

  public currentCard$ = new BehaviorSubject<CardDetails | null>(null);
  public currentTicketId$ = new BehaviorSubject<string | null>(null);
  public accountData$ = new BehaviorSubject<any | null>(null);
  public temporaryReasons$ = new BehaviorSubject<BlockCardReason[]>([]);
  public permanentReasons$ = new BehaviorSubject<BlockCardReason[]>([]);

  private taskType: string | null = null;
  private actionFlow: string | null = null;
  public isBioVerificationSkipped: boolean = false;
  activeCards$ = new BehaviorSubject<CardDetails[]>([]);
  blockedCards$ = new BehaviorSubject<CardDetails[]>([]);
  public skipBioReason: string = '';
  private accounts: any[] = [];
  private count = 0;
  allCards$ = new BehaviorSubject<CardDetails[]>([]);
  public availableAccounts$ = new BehaviorSubject<string[]>([]);

  constructor() {
    this.count = this.count + 1;
    console.log('CardsService', this.count);
  }

  get accountData() {
    try {
      const accountData = this.accountData$.getValue();

      console.log('__CARD_SERVICE', accountData);

      if (!accountData) {
        return {};
      }

      if (!this.accounts?.length) {
        return accountData;
      }

      const extendedAccountDetails = this.accounts.find(
        acc => acc?.accountNumber === accountData.accountsId
      );

      return extendedAccountDetails
        ? { ...accountData, ...extendedAccountDetails }
        : accountData;
    } catch (error) {
      console.error('Error in accountData getter:', error);
      return {};
    }
  }

  getAccountCards(
    accountId: string,
    includeVirtualAccounts: boolean = false
  ): Observable<CardDetails[]> {
    if (includeVirtualAccounts) {
      return this.getAccountsByCurrentCif().pipe(
        tap((response: any) => {
          const accountIds = (response.responseObject.accounts as any[])
            .map((account: any) => account.accountNumber as string)
            .filter((value, index, self) => self.indexOf(value) === index);
          this.availableAccounts$.next(['All Accounts', ...accountIds]);
        }),
        switchMap((response: any) => {
          if (response.successful) {
            const virtualAccountIds = response.responseObject.accounts
              .filter((account: any) =>
                ['VA300', 'VA301', 'VA302'].includes(account.schemeCode)
              )
              .map((account: any) => account.accountNumber as string);

            const requests = [...virtualAccountIds, accountId].map((id: any) =>
              this.api.get<any>(`/v1/card/account/${id}`)
            );

            return requests.length ? forkJoin(requests) : of([]);
          }

          return of([]);
        }),
        map((responses: any[]) => {
          return responses.reduce((acc: any[], res: any) => {
            return acc.concat(res.responseObject ?? []);
          }, []);
        }),
        switchMap((responses: any[]) => {
          return of(responses.map(response => response as CardDetails));
        }),
        tap(cards => {
          this.allCards$.next(cards);
        })
      );
    } else {
      return this.getAccountsByCurrentCif().pipe(
        tap((response: any) => {
          const accountIds = (response.responseObject.accounts as any[])
            .map((account: any) => account.accountNumber as string)
            .filter((value, index, self) => self.indexOf(value) === index);
          this.availableAccounts$.next(['All Accounts', ...accountIds]);
        }),
        switchMap(() =>
          this.api.get<any>(`/v1/card/account/${accountId}`).pipe(
            map((response: any) => {
              const cards = response.responseObject as CardDetails[];
              this.allCards$.next(cards);
              return cards;
            })
          )
        )
      );
    }
  }

  getAllCards() {
    return this.getAccountsByCurrentCif().pipe(
      switchMap(response =>
        of(
          (response.responseObject.accounts as any[])
            .map((account: any) => account.accountNumber as string)
            .filter((value, index, self) => self.indexOf(value) === index)
        )
      ),
      tap(accountIds => {
        this.availableAccounts$.next(['All Accounts', ...accountIds]);
      }),
      switchMap(accountIds =>
        forkJoin(
          accountIds.map(accountId =>
            this.api.get<any>(`/v1/card/account/${accountId}`).pipe(
              map((response: any) => {
                return response.responseObject as CardDetails[];
              })
            )
          )
        )
      ),
      switchMap(responses =>
        of(responses.reduce((acc, curr) => acc.concat(curr), []))
      ),
      tap(cards => {
        this.allCards$.next(cards);
      })
    );
  }

  public loadCards(cards$: Observable<CardDetails[]>, groupedByKey: string) {
    cards$
      .pipe(
        map(data =>
          data.reduce(
            (prev: Record<string, CardDetails[]>, curr: CardDetails) => {
              const status = curr.cardContractStatus!;
              if (!prev[status]) {
                prev[status] = [];
              }
              prev[status].push(curr);
              return prev;
            },
            {}
          )
        )
      )
      .subscribe((cardsGrouped: Record<string, CardDetails[]>) => {
        if (groupedByKey === 'ACTIVE') {
          this.activeCards$.next(cardsGrouped[groupedByKey] || []);
        }

        if (groupedByKey === 'BLOCKED') {
          this.blockedCards$.next(cardsGrouped[groupedByKey] || []);
        }
      });
  }

  getAccountsByCurrentCif(): Observable<any> {
    const accountData = this.accountData$.getValue();
    return this.api.get(
      `/v1/backoffice/customer360/accounts/id/${accountData.cif}/idType/customerid`
    );
  }

  getCurrentCardDetails() {
    const cardState: CardDetails | undefined =
      this.router.getCurrentNavigation()?.extras.state?.['card'] ||
      this.ctxManager.contextData['cards']?.currentCard;

    if (cardState) {
      this.ctxManager.patchContextData({
        cards: {
          currentCard: cardState,
        },
      });

      this.currentCard$.next(cardState);
    }
  }

  getReasonsForBlocking() {
    this.api
      .get(
        '/v1/backoffice/lookup?nameS=Permanent_Block_Reason&nameS=Temporary_Block_Reason'
      )
      .subscribe((response: any) => {
        this.permanentReasons$.next([
          ...response.responseObject.Permanent_Block_Reason,
          {
            text: 'Other',
            value: 'Other',
          },
        ]);

        this.temporaryReasons$.next([
          ...response.responseObject.Temporary_Block_Reason,
          {
            text: 'Other',
            value: 'Other',
          },
        ]);
      });
  }

  createTicket({ actionFlow, taskType }: CreateTicketData) {
    this.actionFlow = actionFlow;
    this.taskType = taskType;
    return this.api
      .post('/v3/backoffice/tickets/create', {
        actionFlow,
        taskType,
        associatedId: uuid4(),
        customerName: `${this.accountData.firstName} ${this.accountData.lastName}`,
        customerId: this.accountData.cif,
        // parentTaskId: localStorage.getItem('ticketId'),
      })
      .pipe(
        tap((response: any) => {
          console.log('__TICKET_CREATED', response.responseObject);
          this.currentTicketId$.next(response.responseObject.ticketId);
        }),
        map((response: any) => response.responseObject)
      );
  }

  setPartialData(dataField: string, data: any) {
    const ticketId = this.currentTicketId$.getValue();
    return this.api
      .post(
        `/v3/backoffice/tickets/${ticketId}/${this.actionFlow}/${dataField}/setPartialData`,
        data
      )
      .pipe(map((response: any) => response.responseObject));
  }

  setData(data: any) {
    const ticketId = this.currentTicketId$.getValue();
    let ticketData = data;
    console.log(this.isBioVerificationSkipped, 'isBioVerificationSkipped');
    if (this.actionFlow === ActionFlows.BLOCK_CARD) {
      ticketData = {
        ...data,
        BioVerificationData: this.getSkipBioStaticData({
          reason: '',
          cif: this.accountData.cif,
          comment: '',
          action: ActionFlows.BLOCK_CARD,
        }),
      };
    }
    return this.api
      .post(`/v3/backoffice/tickets/${ticketId}/${this.actionFlow}/setData`, {
        ...ticketData,
        IsCustomerPresent: !this.isBioVerificationSkipped,
      })
      .pipe(map((response: any) => response.responseObject));
  }

  sendBioVerificationData(bioResponse: any) {
    return this.api.post(
      `/v3/backoffice/tickets/${this.currentTicketId$.getValue()}/${this.actionFlow}/verifyBio`,
      {
        SkipBio: bioResponse.skipBio,
        SkipBioReason:
          bioResponse.skipBioReason || bioResponse.skipBioForm?.reason || '',
        BioModels: [
          {
            Cif: bioResponse.bioModel.cif,
            FingerPrints: bioResponse.bioModel.fingerprints.map(
              (print: any) => ({
                Position: print.position,
                Image: {
                  Format: print.image.format,
                  ResolutionDpi: print.image.resolutionDpi,
                  Data: print.image.data,
                },
              })
            ),
          },
        ],
      }
    );
  }

  submitDocuments() {
    return this.api.post(
      `/v3/backoffice/tickets/${this.currentTicketId$.getValue()}/${this.actionFlow}/SubmitDocumentsToNewGenPartial/invoke`,
      {}
    );
  }

  clearCurrentCardDetails() {
    console.log('Clearing card details....');
    this.currentCard$.next(null);
    this.ctxManager.patchCurrentContextData({
      cards: {
        currentCard: null,
      },
    });
  }

  getListOfDocumentsToUpload() {
    return this.api
      .post(
        `/v3/backoffice/tickets/${this.currentTicketId$.getValue()}/${this.actionFlow}/GetListOfDocumentsPartial/invoke`,
        {}
      )
      .pipe(map((response: any) => response.responseObject));
  }

  confirmDocumentUpload() {
    return this.api
      .post(
        `/v3/backoffice/tickets/${this.currentTicketId$.getValue()}/${this.actionFlow}/ConfirmUploadedDocumentsPartial/invoke`,
        {}
      )
      .pipe(map((response: any) => response.responseObject));
  }

  uploadDocs(
    documentsForUpload: any[],
    selectedCard: CardDetails,
    service: string = 'Blob'
  ) {
    const docs = documentsForUpload.filter(doc => !!doc.data);

    if (!docs.length) {
      console.warn('No documents to upload');
      return of(null);
    }

    return this.api.post<any>('/v3/documents/submit', {
      processId: this.accountData.cif,
      idType: this.accountData.idType,
      idNumber: this.accountData.idNumber,
      cif: this.accountData.cif,
      processName: 'CardTransactionManagement',
      accountNumber: selectedCard.rbsNumber,
      country: this.sessionService.subsidiary.countryCode,
      ticketNumber: this.currentTicketId$.getValue()?.toString(),
      Service: service,
      documents: docs,
    });
  }

  cardDetailsValidator(control: AbstractControl) {
    const value = control.value as CardDetails | null;
    if (value) {
      return null;
    }
    return { invalidCard: true };
  }

  updateBioSkippedStatus() {
    of(localStorage.getItem('ticketId'))
      .pipe(
        switchMap(id => {
          if (!id) {
            this.isBioVerificationSkipped = false;
            console.log("Stopping the stream because there's no ticket ID");
            return EMPTY;
          }

          return this.ticketsService.getTicket(id).pipe(
            map(ticket => {
              const taskData = JSON.parse(ticket.taskData || '{}');
              console.log({ taskData: ticket.status }, 'NO____TIME');

              this.skipBioReason = taskData.ProfileViewReason;
              return (
                ticket.actionFlow.name === ActionFlows.VIEW_CUSTOMER_PROFILE &&
                ticket.status === 'Completed'
              );
            })
          );
        })
      )
      .subscribe(skipped => {
        this.isBioVerificationSkipped = skipped;
        console.log('Bio verification skipped:', this.isBioVerificationSkipped);
      });
  }

  getSkipBioStaticData({ reason, comment, action, cif }: SkipBioData) {
    return {
      success: true,
      skipBio: true,
      skipBioForm: {
        reason,
        comment,
        action,
      },
      documents: [],
      bioModel: {
        skipBio: true,
        cif,
        fingerprints: [],
      },
    };
  }

  confirmBlock(
    typeOfBlocking: BlockCardTypes,
    docsToUpload: any[],
    selectedCard: CardDetails,
    onSuccess: (shouldRedirectToDashboard: boolean) => void
  ) {
    const skipBio = this.isBioVerificationSkipped;
    const isPermanent = typeOfBlocking === 'Permanent';
    const isTemporary = typeOfBlocking === 'Temporary';

    const performBlock = () => {
      this.uploadDocs(docsToUpload, selectedCard)
        .pipe(
          switchMap(() => this.validateRequest()),
          switchMap(() => this.submitDocuments())
        )
        .subscribe({
          next: () => onSuccess(skipBio),
          error: (err: any) => {
            console.log(err, 'Error@performBlock');
            this.toast.show(
              'Error',
              'Error occurred while attempting to block',
              MessageBoxType.DANGER
            );
          },
        });
    };
    const handleBlock = () => {
      performBlock();
    };

    const openConfirmationDialog = () => {
      const dialogRef = this.dialog.open(ConfirmBlockDialogComponent, {
        data: { blockType: typeOfBlocking },
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result) {
          handleBlock();
        }
      });
    };

    if (isPermanent) {
      openConfirmationDialog();
    } else if (isTemporary) {
      handleBlock();
    }
  }

  validateRequest() {
    return this.api.post(
      `/v3/backoffice/tickets/${this.currentTicketId$.getValue()}/${this.actionFlow}/ValidateBlockUnblockRequest/invoke`,
      {}
    );
  }

  confirmUnblock(
    selectedCardDetails: CardDetails,
    reason: string,
    onSuccess: (shouldRedirectToDashboard: boolean) => void
  ) {
    const skipBio = this.isBioVerificationSkipped;

    const bioVerifyPayload: BioVerifyInput = {
      customerId: this.accountData.cif,
      customerType: 'Individual',
      inProcess: false,
      fullName: `${this.accountData.firstName} ${this.accountData.lastName}`,
      account: {
        accountName: `${this.accountData.firstName} ${this.accountData.lastName}`,
        accountNumber: this.accountData.accountsId,
        schemeType: this.accountData.schemeType,
        mandate: this.accountData.mandate,
        schemeCode: this.accountData.schemeCode,
      },
      skipBio: false,
    };

    const createTicketObservable = this.createTicket({
      actionFlow: ActionFlows.UNBLOCK_CARD,
      taskType: 'CardTransactionManagement',
    });

    const getBioVerificationData = () => {
      console.log('can skip bio at getBioVerificationData', skipBio);
      if (skipBio) {
        return of(
          this.getSkipBioStaticData({
            reason: '',
            cif: this.accountData.cif,
            comment: '',
            action: ActionFlows.BLOCK_CARD,
          })
        );
      } else {
        return this.bioService.verify(bioVerifyPayload);
      }
    };

    createTicketObservable
      .pipe(
        switchMap(() => {
          return this.setData({
            ticketId: this.currentTicketId$.getValue(),
            customerId: this.accountData.cif,
            accountId: this.accountData.accountsId,
            bankId: this.accountData.bankID,
            source: 'web',
            channel: 'omni',
            countryCode: this.sessionService.subsidiary.countryCode,
            username: this.sessionService.user.username,
            cards: [{ ...selectedCardDetails, reference: uuid4() }],
            reason: reason,
            NotificationDetails: { Sms: true, Email: true },
          });
        }),
        switchMap(() => this.validateRequest()),
        switchMap(() => getBioVerificationData()),
        switchMap(bioResponse => this.sendBioVerificationData(bioResponse))
      )
      .subscribe({
        next: () => {
          onSuccess(skipBio);
        },
        error: error => console.error('Error during transaction:', error),
      });
  }

  viewCardDetail(card: CardDetails) {
    if (card) {
      this.router.navigateByUrl(
        '/services/customer-360/card-detail/' + card.rbsNumber,
        {
          state: {
            card: card,
          },
        }
      );
    }
  }

  public navigateToCardAction(action: CardAction, card: CardDetails) {
    switch (action) {
      case 'block':
        this.gotoBlockCardPage(card);
        break;
      case 'unblock':
        this.gotoBlockCardPage(card);
        break;
      case 'view':
        this.viewCardDetail(card);
        break;
      case 'manage_limit':
        this.goToLimitManagement();
        break;
      default:
        console.warn(`Unexpected card action: ${action}`);
    }
  }

  gotoBlockCardPage(card: CardDetails) {
    const cardStatus = card?.cardStatus.toLowerCase();
    let targetUrl: string;

    switch (cardStatus) {
      case 'blocked':
        targetUrl = '/services/customer-360/unblock-card/';
        break;
      case 'active':
        targetUrl = '/services/customer-360/block-card/';
        break;
      default:
        console.warn(`Unexpected card status: ${card?.cardStatus}`);
        return; // Exit if status is neither blocked nor active
    }

    this.router.navigateByUrl(targetUrl + card?.rbsNumber, {
      state: {
        card: card,
      },
    });
  }

  private goToLimitManagement() {
    const card = this.currentCard$.getValue();
    this.router.navigateByUrl(
      `/services/customer-360/manage-card-limit/${card?.rbsNumber}`,
      {
        state: {
          card: card,
        },
      }
    );
  }

  getAccountData() {
    this.accountData$.next(
      JSON.parse(localStorage.getItem('accMgntObj') || '{}')
    );

    this.accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
  }

  processCardStream(updateAccountsFn: (accounts: string[]) => void) {
    return pipe(
      tap((cards: CardDetails[]) => {
        const uniqueAccounts = cards
          .map(card => card.rbsNumber)
          .filter((value, index, self) => self.indexOf(value) === index);

        updateAccountsFn(uniqueAccounts);
      }),
      map((cards: CardDetails[]) =>
        cards.reduce(
          (acc: Record<string, CardDetails[]>, curr: CardDetails) => {
            const status = curr.cardContractStatus!;
            if (status === 'EXPIRED' || status === 'PERMANENTLY BLOCKED') {
              acc['PERMANENTLY BLOCKED'] = acc['PERMANENTLY BLOCKED'] || [];
              acc['PERMANENTLY BLOCKED'].push(curr);
            } else {
              acc[status] = acc[status] || [];
              acc[status].push(curr);
            }
            return acc;
          },
          {}
        )
      )
    );
  }

  getTicket() {
    return this.api.get(
      `/v1/bsh/v2/tickets/${this.currentTicketId$.getValue()}`
    );
  }
}
