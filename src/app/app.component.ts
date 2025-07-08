import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { VERSION } from '../environments/version';
import { SharedIonicModule } from './shared/shared-ionic.module';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonApp,
    IonRouterOutlet,
    RouterModule,
    SharedIonicModule
  ],
})
export class AppComponent {
  version = VERSION;
  constructor() { }
}
