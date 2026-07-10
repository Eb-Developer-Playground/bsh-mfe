# RadioOptionsDialog - Standalone Component

A standalone Angular dialog component for displaying radio button options to users.

## Features

-   **Standalone Component**: No need to import any module
-   **Flexible Configuration**: Customizable title, subtitle, message, and icon
-   **Radio Button Selection**: Multiple options with support for disabled states
-   **Type Safety**: Full TypeScript interfaces
-   **Material Design**: Uses Angular Material components
-   **Responsive**: Adapts to different screen sizes

## Usage

### Basic Usage

Since this is a standalone component, you can use it directly without importing any module:

```typescript
import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { RadioOptionsDialog, IRadioOptionsDialogData, IRadioOption } from "./radio-options.dialog";

@Component({
    selector: "app-example",
    template: `<button (click)="openDialog()">Open Dialog</button>`,
})
export class ExampleComponent {
    constructor(private dialog: MatDialog) {}

    openDialog(): void {
        const options: IRadioOption[] = [
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" },
            { value: "option3", label: "Option 3", disabled: true },
        ];

        const dialogData: IRadioOptionsDialogData = {
            title: "Select an option",
            subTitle: "Choose one of the following",
            options: options,
        };

        const dialogRef = this.dialog.open(RadioOptionsDialog, {
            width: "400px",
            data: dialogData,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                console.log("Selected option:", result);
            }
        });
    }
}
```

### Advanced Configuration

```typescript
const dialogData: IRadioOptionsDialogData = {
    title: "Instrument Management",
    subTitle: "Select instrument to action",
    message: "Please choose one of the following options to continue:",
    icon: "ic-info",
    options: [
        { value: "chequebook", label: "Chequebook management" },
        { value: "bankers_cheque", label: "Bankers cheque management" },
        { value: "hologram", label: "Hologram management" },
    ],
    selectedValue: "chequebook", // Pre-select an option
    cancelButtonText: "Cancel",
    confirmButtonText: "Continue",
};
```

## Interfaces

### IRadioOption

```typescript
export interface IRadioOption {
    value: string; // The value returned when selected
    label: string; // Display text for the option
    disabled?: boolean; // Whether the option is disabled
}
```

### IRadioOptionsDialogData

```typescript
export interface IRadioOptionsDialogData {
    title?: string; // Dialog title
    subTitle?: string; // Optional subtitle with icon
    message?: string; // Optional message text
    icon?: string; // Icon name for subtitle section
    options: IRadioOption[]; // Array of radio options (required)
    selectedValue?: string; // Pre-selected option value
    cancelButtonText?: string; // Custom cancel button text (default: "Cancel")
    confirmButtonText?: string; // Custom confirm button text (default: "Continue")
}
```

## Return Value

The dialog returns:

-   The selected option's `value` when confirmed
-   `undefined` when cancelled or closed

## Dependencies

The component automatically imports the required modules:

-   `CommonModule`
-   `FormsModule`
-   `FlexLayoutModule`
-   `MatDialogModule`
-   `MatButtonModule`
-   `MatIconModule`
-   `MatRadioModule`

## Styling

The component includes responsive styling that matches the application's design system. The dialog automatically adjusts its width based on content and screen size.
