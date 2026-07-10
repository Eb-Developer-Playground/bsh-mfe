import { Component, EventEmitter, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-photo-signature',
  imports: [MatCheckboxModule, TranslatePipe],
  templateUrl: './photo-signature.component.html',
  styleUrl: './photo-signature.component.scss'
})
export class PhotoSignatureComponent {
   @Output() reuseChanged = new EventEmitter<boolean>();

  onReuseChange(checked: boolean) {
    this.reuseChanged.emit(checked);
  }
}
