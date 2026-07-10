import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendTermsDialogComponent } from './send-terms-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SessionService } from '../../services/session/session.service';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

describe('SendTermsDialogComponent', () => {
  let component: SendTermsDialogComponent;
  let fixture: ComponentFixture<SendTermsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SendTermsDialogComponent],
      imports: [MatDialogModule, HttpClientTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        SessionService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SendTermsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
