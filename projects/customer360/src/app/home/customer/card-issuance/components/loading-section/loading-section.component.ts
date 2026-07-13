import { Component, Input } from '@angular/core';
import { NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-loading-section',
  imports: [NgSwitch, NgSwitchCase],
  templateUrl: './loading-section.component.html',
  styleUrls: [
    '../../card-issuance.component.scss',
    './loading-section.component.scss',
  ],
})
export class LoadingSectionComponent {
  @Input() sectionType: 'inputSection' | 'buttonSection' = 'inputSection';
}
