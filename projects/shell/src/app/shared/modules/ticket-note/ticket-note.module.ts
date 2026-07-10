import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketNoteComponent } from './ticket-note.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({

  imports: [
      CommonModule,
      MatIconModule,
      TicketNoteComponent,
    ],
  exports: [TicketNoteComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TicketNoteModule {}
