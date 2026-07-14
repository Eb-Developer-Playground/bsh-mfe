import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-loading-section',
  imports: [],
  templateUrl: './loading-section.component.html',
  styleUrls: [
    '../../card-issuance.component.scss',
    './loading-section.component.scss',
  ],
})
export class LoadingSectionComponent {
  @Input() sectionType: 'inputSection' | 'buttonSection' = 'inputSection';
}
