import {
  NgClass,
  TitleCasePipe,
} from '@angular/common';
import { Component, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { IContactDedupeItem } from '@app/shared/modules/contacts/fields/phone-number/types';
import {
  ISubsidiary,
  SessionService,
} from '@app/shared/services/session/session.service';

@Component({
  selector: 'dialog-matched-profiles',
  standalone: true,
  imports: [
    NgClass,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    TitleCasePipe,
  ],
  templateUrl: './matched-profiles.dialog.html',
  styleUrls: ['./matched-profiles.dialog.scss'],
})
export class MatchedProfilesDialog {
  subsidiary!: ISubsidiary;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      contact: string;
      profiles: IContactDedupeItem[];
    },
    public dialogRef: MatDialogRef<any>,
    public session: SessionService
  ) {}
}
