import { CommonModule } from '@angular/common';
import { Component, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { TranslatePipe } from '@ngx-translate/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';

export interface IRadioOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface IRadioOptionsDialogData {
    title?: string;
    subTitle?: string;
    message?: string;
    icon?: string;
    options: IRadioOption[];
    selectedValue?: string;
    cancelButtonText?: string;
    confirmButtonText?: string;
}

@Component({
    selector: 'radio-options-dialog',
    templateUrl: 'radio-options.dialog.html',
    styleUrls: ['radio-options.dialog.scss'],
    imports: [
        CommonModule,
        FormsModule,
        FlexLayoutModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatRadioModule,
        TranslatePipe,
        COMPAT_IMPORTS,
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class RadioOptionsDialog {
    selectedOption: string;

    constructor(
        public dialogRef: MatDialogRef<RadioOptionsDialog>,
        @Inject(MAT_DIALOG_DATA) public data: IRadioOptionsDialogData,
    ) {
        this.selectedOption = data.selectedValue || '';
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onConfirm(): void {
        this.dialogRef.close(this.selectedOption);
    }

    onOptionChange(value: string): void {
        this.selectedOption = value;
    }
}
