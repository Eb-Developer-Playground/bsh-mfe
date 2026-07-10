import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  imports: [CommonModule],
  exports: [MatCardModule, MatIconModule],
})
export class MaterialModule {}
