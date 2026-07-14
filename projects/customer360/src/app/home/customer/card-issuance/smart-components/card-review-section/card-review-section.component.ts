import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { InstantCardIssuanceFormKeysT } from '@app/home/customer/card-issuance/card-issuance.models';
import { CardIssuanceService } from '@app/home/customer/card-issuance/services/card-issuance.service';
import { CardSectionComponent } from '@app/home/customer/card-issuance/components/card-section/card-section.component';

@Component({
  selector: 'app-card-review-section',
  templateUrl: './card-review-section.component.html',
  styleUrls: [
    '../../card-issuance.component.scss',
    './card-review-section.component.scss',
  ],
  imports: [CardSectionComponent],
})
export class CardReviewSectionComponent implements OnChanges {
  @Input() issuanceData: InstantCardIssuanceFormKeysT | null = null;
  @Input() selectedCardName: string = '';
  @Input() activeAccountBalance: string = '';
  @Input() activeStepperIndex: string = '';
  selectedCardType = '';
  constructor(private cardIssuanceService: CardIssuanceService) {}

  ngOnChanges(changes: SimpleChanges) {
  }

  setupCardTypeName() {
    this.cardIssuanceService.setupCardTypes(
      (
        loader: boolean,
        data?: {
          name: string;
          id: string;
        }[]
      ) => {
        if (data) {
          this.selectedCardType =
            data.find(
              card => String(card.id) === String(this.issuanceData?.cardType)
            )?.name || '';
        }
      }
    );
  }
  setupBranches() {
    this.cardIssuanceService.setupBranches((_, branches: any) => {
    });
  }
}
