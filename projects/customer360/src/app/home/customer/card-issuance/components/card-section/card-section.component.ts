import { Component, Input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-card-section',
  templateUrl: './card-section.component.html',
  styleUrl: './../../card-issuance.component.scss',
  imports: [
    NgTemplateOutlet,
    MatExpansionModule,
    MatDividerModule,
  ],
})
export class CardSectionComponent {
  @Input() sectionHeader: string = '';
  @Input() isNoPadding: boolean = false;
  @Input() isApprovalRejectBtns: boolean = false;
  @Input() sectionTitle: string = '';
  @Input() btns: {
    classes: string;
    icon: string;
    label: string;
    isProcessing: boolean;
  }[] = [];
  @Input() sectionSubTitle: string = '';
  @Input() isExpansionPanel: boolean = false;
}
