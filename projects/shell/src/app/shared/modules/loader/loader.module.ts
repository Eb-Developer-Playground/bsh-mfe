import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderComponent } from './loader.component';
import { SkeletonLoaderComponent } from '@app/shared/components/skeleton-loader/skeleton-loader.component';

@NgModule({

  imports: [
      CommonModule,
      SkeletonLoaderComponent,
      LoaderComponent,
    ],
  exports: [LoaderComponent],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LoaderModule {}
