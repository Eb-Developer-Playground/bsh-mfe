import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader.component';
import { SkeletonLoaderComponent } from '@app/shared/components/skeleton-loader/skeleton-loader.component';

@NgModule({
  declarations: [LoaderComponent],
  imports: [CommonModule, SkeletonLoaderComponent],
  exports: [LoaderComponent],
})
export class LoaderModule {}
