import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pills',
  template: `<span class="pill" [style.background]="color" [style.color]="'white'" [style.padding]="'2px 8px'" [style.border-radius]="'4px'" [style.font-size]="'12px'">{{ text | translate }}</span>`,
  imports: [CommonModule, TranslatePipe],
})
export class PillsComponent {
  @Input() color = 'gray';
  @Input() text = '';
}
