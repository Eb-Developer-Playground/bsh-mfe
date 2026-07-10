import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    RadioOptionsDialog,
    IRadioOptionsDialogData,
    IRadioOption,
} from './radio-options.dialog';

/**
 * Example usage of the RadioOptionsDialog component
 *
 * This example demonstrates how to open the dialog and handle the user's selection
 */
@Component({
    template: '',
})
export class RadioOptionsDialogExample {
    constructor(private dialog: MatDialog) {}

    openInstrumentManagementDialog(): void {
        const options: IRadioOption[] = [
            { value: 'chequebook', label: 'Chequebook management' },
            { value: 'bankers_cheque', label: 'Bankers cheque management' },
            { value: 'hologram', label: 'Hologram management' },
        ];

        const dialogData: IRadioOptionsDialogData = {
            title: 'Instrument management',
            subTitle: 'Select instrument to action',
            message: 'Please choose one of the following options to continue:',
            icon: 'ic-info',
            options: options,
            selectedValue: '', // Optional: pre-select an option
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Continue',
        };

        const dialogRef = this.dialog.open(RadioOptionsDialog, {
            width: '400px',
            data: dialogData,
            disableClose: true, // Prevent closing by clicking outside
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log('Selected option:', result);
                // Handle the selected option
                switch (result) {
                    case 'chequebook':
                        // Handle chequebook management
                        break;
                    case 'bankers_cheque':
                        // Handle bankers cheque management
                        break;
                    case 'hologram':
                        // Handle hologram management
                        break;
                }
            } else {
                console.log('Dialog was cancelled');
            }
        });
    }

    openSimpleRadioDialog(): void {
        const options: IRadioOption[] = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3', disabled: true },
        ];

        const dialogData: IRadioOptionsDialogData = {
            title: 'Select an option',
            options: options,
        };

        const dialogRef = this.dialog.open(RadioOptionsDialog, {
            width: '350px',
            data: dialogData,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log('Selected:', result);
            }
        });
    }
}
