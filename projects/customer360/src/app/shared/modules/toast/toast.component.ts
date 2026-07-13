import { Component, Inject, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { MessageBoxType, SnackbarConfig } from './models';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TranslatePipe],
})
export class ToastComponent implements OnInit {
  isExpanded = false;
  private snackBarRef = inject<MatSnackBarRef<ToastComponent>>(MatSnackBarRef);
  
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: SnackbarConfig
  ) {}

  iconType!: string;
  iconColor!: string;

  callBackAction = () => {};

  ngOnInit(): void {
    document.documentElement.style.setProperty(
      '--type',
      this.getColor(this.data.type)
    );
    if (this.data.callBack) {
      this.callBackAction = this.data.callBack;
    }
  }

  toggleArrow() {
    this.isExpanded = !this.isExpanded;
  }

  copyMessage() {
    const message = document.querySelector('.message') as HTMLSpanElement;
    const textToCopy = message?.innerText;
    navigator.clipboard.writeText(textToCopy).then((x: any) => {
      // Optional: Show a feedback message or perform any additional actions after copying
      // console.log('Text copied!');
    });
  }

  public dismiss(action?: number): void {
    if (action) {
      this.snackBarRef.dismissWithAction();
    } else {
      this.snackBarRef.dismiss();
    }
  }

  private getColor(type: MessageBoxType) {
    if (type === MessageBoxType.PRIMARY) {
      this.iconType = 'ic-info';
      this.iconColor = '#E60000';
    } else if (type === MessageBoxType.INFO) {
      this.iconType = 'ic-info';
      this.iconColor = '#24bbfa';
    } else if (type === MessageBoxType.SUCCESS) {
      this.iconType = 'ic-success';
      this.iconColor = '#2F9803';
    } else if (type === MessageBoxType.WARNING) {
      this.iconType = 'ic-warning-caution';
      this.iconColor = '#f8ca3c';
    } else if (type === MessageBoxType.DANGER) {
      this.iconType = 'ic-error';
      this.iconColor = '#E60000';
    }
    return this.iconColor;
  }
}
