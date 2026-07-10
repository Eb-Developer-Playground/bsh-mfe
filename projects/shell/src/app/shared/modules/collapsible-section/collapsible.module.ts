import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollapsibleComponent } from './collapsible.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [CollapsibleComponent],
  exports: [CollapsibleComponent],
  imports: [CommonModule, MatDividerModule, MatExpansionModule, MatIconModule],
})
export class CollapsibleModule {}
