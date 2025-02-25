import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/calendar/calendar.page')
  },
  {
    path: 'schedule-config',
    loadComponent: () => import('./pages/schedule-config/schedule-config.page')
  },
];
