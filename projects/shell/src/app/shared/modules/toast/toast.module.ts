import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ToastService } from './toast.service';
import { ToastComponent } from './toast.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [ToastComponent, MessageBoxComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    FlexLayoutModule,
    MatTooltipModule,
    TranslateModule,
  ],
  providers: [ToastService],
  exports: [MessageBoxComponent],
})
export class ToastModule {}
