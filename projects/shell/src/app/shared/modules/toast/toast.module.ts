import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ToastService } from './toast.service';
import { ToastComponent } from './toast.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@NgModule({

  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    FlexLayoutModule,
    MatTooltipModule,
    ToastComponent,
    MessageBoxComponent,
  ],
  providers: [ToastService],
  exports: [MessageBoxComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ToastModule {}
