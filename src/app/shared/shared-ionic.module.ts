// src/app/shared/shared-ionic.module.ts
import { NgModule } from '@angular/core';
import { IONIC_IMPORTS } from './ionic-imports';

@NgModule({
  imports: [...IONIC_IMPORTS],
  exports: [...IONIC_IMPORTS],
})
export class SharedIonicModule {}
