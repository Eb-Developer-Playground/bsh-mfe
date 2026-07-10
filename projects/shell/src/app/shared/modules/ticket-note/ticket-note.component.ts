import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ticket-note',
  templateUrl: './ticket-note.component.html',
  styleUrls: ['./ticket-note.component.scss'],
})
export class TicketNoteComponent implements OnInit {
  @Input() sender!: string;
  @Input() note!: string;
  @Input() time!: string | Date;
  @Input() status: 'sent' | 'received' | 'pending' | null = 'sent';

  constructor() {}

  ngOnInit(): void {}
}
