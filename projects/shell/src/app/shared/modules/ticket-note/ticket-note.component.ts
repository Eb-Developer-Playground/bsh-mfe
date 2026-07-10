import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-ticket-note',
  templateUrl: './ticket-note.component.html',
  styleUrls: ['./ticket-note.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class TicketNoteComponent implements OnInit {
  @Input() sender!: string;
  @Input() note!: string;
  @Input() time!: string | Date;
  @Input() status: 'sent' | 'received' | 'pending' | null = 'sent';

  constructor() {}

  ngOnInit(): void {}
}
