import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollapsibleComponent } from './collapsible.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@NgModule({

  exports: [CollapsibleComponent],
  imports: [
      CommonModule,
      MatDividerModule,
      MatExpansionModule,
      MatIconModule,
      CollapsibleComponent,
    ],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CollapsibleModule {}
