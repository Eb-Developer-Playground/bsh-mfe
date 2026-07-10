import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketNoteComponent } from './ticket-note.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [TicketNoteComponent],
  imports: [CommonModule, MatIconModule],
  exports: [TicketNoteComponent],
})
export class TicketNoteModule {}
