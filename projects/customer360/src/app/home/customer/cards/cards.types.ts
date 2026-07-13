import { FormControl } from '@angular/forms';
import { BlockCardReason } from '@app/home/customer/cards/block-card/options';
import { CardDetails } from '@app/core/services/cards/models';

export interface BlockCardForm {
  typeOfBlocking: FormControl<BlockCardTypes | null>;
  reason: FormControl<BlockCardReason | null>;
  otherReason?: FormControl<string | null>;
  selectedCard?: FormControl<CardDetails | null>;
}

export interface SkipBioData {
  reason: string;
  comment: string;
  action: string;
  cif: string;
}

export type BlockCardSubmissionPhases = 'ticket_creation' | 'document_upload';
export type BlockCardTypes = 'Permanent' | 'Temporary';
