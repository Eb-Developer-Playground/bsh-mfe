import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-mm-narration',
  templateUrl: './mm-narration.component.html',
  styleUrl: './mm-narration.component.scss',
  imports: [TranslatePipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
})
export class MmNarrationComponent {
  @Input() form!: FormGroup;
}
