import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

import { ServiceSection } from '../shared/models';
import { SERVICE_SECTIONS } from '../shared/static';
import { MoneyTransferDialog, NotificationDialog } from './dialogs';

@Component({
  selector: 'app-services',
  imports: [MatCardModule, MatIconModule, MatDividerModule, TranslatePipe],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent implements OnInit {
  serviceSections: ServiceSection[] = SERVICE_SECTIONS;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  onClick(title: string): void {
    this.openDialog();
  }

  openVerificationDialog(data: any): void {
    this.dialog.open(NotificationDialog, {
      width: '450px',
      data: {
        title: data.title,
        subTitle: data.subTitle,
        body: data.body,
      },
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(MoneyTransferDialog, {
      width: '450px',
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.data?.body) {
        this.openVerificationDialog(result.data);
      }
    });
  }
}
