import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-remove-agent-dialog',
  templateUrl: './remove-agent.component.html',
  styleUrls: ['./remove-agent.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    MatDialogModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
})
export class RemoveAgentDialog implements OnInit {
  serviceForm!: ReturnType<UntypedFormBuilder['group']>;

  constructor(
    translateService: TranslateService,
    public dialogRef: MatDialogRef<RemoveAgentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: UntypedFormBuilder,
    private router: Router
  ) {
    this.serviceForm = this.formBuilder.group({
      service: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  navigateSuccess(): void {
    this.dialogRef.close();
    this.router.navigate(['/dashboard/know-agent-success/']);
  }

  navigateDocuments(): void {
    this.dialogRef.close();
    this.router.navigate(['./services/known-agent/upload-agent-documents']);
  }
}
