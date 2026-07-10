import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MessageBoxType } from '../models';

@Component({
  selector: 'app-message-box',
  templateUrl: './message-box.component.html',
  styleUrls: ['./message-box.component.scss'],
  standalone: true,
  imports: [MatCardModule],
})
export class MessageBoxComponent {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly text = input<string>();
  readonly type = input<MessageBoxType>();
}
