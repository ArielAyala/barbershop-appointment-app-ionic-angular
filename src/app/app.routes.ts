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
  // {
  //   path: 'report-day-appointment',
  //   loadComponent: () => import('./pages/report-day-appointment/report-day-appointment.page').then( m => m.ReportDayAppointmentPage)
  // },
  {
    path: 'manage-data',
    loadComponent: () => import('./pages/manage-data/manage-data.page').then( m => m.ManageDataPage)
  },

];
