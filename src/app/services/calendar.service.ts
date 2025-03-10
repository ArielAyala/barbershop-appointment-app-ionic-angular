// src/app/services/calendar.service.ts
import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';
import { DateUtils } from '../utils/date-utils';
import { Appointment } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  // Plantilla por defecto de horarios
  private readonly defaultTimeSlots: string[] = [
    '08:00', '08:40', '09:20', '10:00', '10:40',
    '12:20', '13:00', '13:40', '14:20', '15:00',
    '15:40', '16:20', '17:00', '17:40', '18:20',
    '19:00', '19:40', '20:20'
  ];

  /**
   * Formatea la fecha a un formato amigable: YYYY-MM-DD usando DateUtils.
   */
  private formatDate(date: string): string {
    return DateUtils.formatDate(new Date(date));
  }

  /**
   * Retorna los horarios configurados para la fecha indicada.
   * - Si ya existe la configuración para esa fecha, se retorna.
   * - Si no existe y la fecha es de hoy o futura, se inicializa con la plantilla por defecto y se persiste.
   * - Para fechas pasadas, se retorna un arreglo vacío.
   */
  getTimeSlotsForDate(dateFilter: string): string[] {
    // Asumimos que 'date' ya está en formato "YYYY-MM-DD"
    const storedObjectStr = localStorage.getItem(STORAGE_KEYS.TIME_SLOTS);
    let timeslotsByDate = storedObjectStr ? JSON.parse(storedObjectStr) : {};

    // Obtener la fecha actual en formato "YYYY-MM-DD"
    const today = DateUtils.getCurrentDate();

    // Si la fecha seleccionada es hoy o futura
    if (dateFilter >= today) {
      if (timeslotsByDate[dateFilter]) {
        return timeslotsByDate[dateFilter];
      } else {
        // Inicializar con la plantilla por defecto y guardar
        const defaultSlots = this.getDefaultTimeSlots();
        timeslotsByDate[dateFilter] = defaultSlots;
        localStorage.setItem(STORAGE_KEYS.TIME_SLOTS, JSON.stringify(timeslotsByDate));
        return this.defaultTimeSlots;
      }
    } else {
      // Para fechas pasadas, retornamos un arreglo vacío
      return [];
    }
  }

  private getDefaultTimeSlots(): string[] {
    const stored = localStorage.getItem(STORAGE_KEYS.DEFAULT_TIME_SLOTS);
    if (stored) {
      return JSON.parse(stored);
    } else {
      // Si no existe, guarda la plantilla interna en el storage y retorna ese valor
      localStorage.setItem(STORAGE_KEYS.DEFAULT_TIME_SLOTS, JSON.stringify(this.defaultTimeSlots));
      return this.defaultTimeSlots;
    }
  }

  /**
   * Retorna todas las citas almacenadas agrupadas por fecha.
   */
  private getAppointmentsMapping(): { [date: string]: Appointment[] } {
    const savedMapping = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return savedMapping ? JSON.parse(savedMapping) : {};
  }

  /**
   * Permite guardar o actualizar una configuración personalizada de horarios para una fecha.
   */
  setTimeSlotsForDate(date: string, timeSlots: string[]): void {
    const formattedDate = this.formatDate(date);
    const storedObjectStr = localStorage.getItem(STORAGE_KEYS.TIME_SLOTS);
    let timeslotsByDate = storedObjectStr ? JSON.parse(storedObjectStr) : {};
    timeslotsByDate[formattedDate] = timeSlots;
    localStorage.setItem(STORAGE_KEYS.TIME_SLOTS, JSON.stringify(timeslotsByDate));
  }

  /* ==========================
     Lógica de Citas (Appointments)
  ========================== */

  /**
   * Retorna todas las citas en un array (sin agrupar).
   */
  getAppointments(): Appointment[] {
    const mapping = this.getAppointmentsMapping();
    return Object.values(mapping).reduce((acc: Appointment[], curr: Appointment[]) => acc.concat(curr), []);
  }


  /**
   * Retorna las citas para una fecha específica.
   */
  getAppointmentsForDate(date: string): Appointment[] {
    const formattedDate = this.formatDate(date);
    const mapping = this.getAppointmentsMapping();
    const appointments = mapping[formattedDate];
    return Array.isArray(appointments) ? appointments : [];
  }

  /**
   * Guarda o actualiza una cita en la estructura agrupada.
   */
  saveAppointment(appointment: Appointment): void {
    const formattedDate = this.formatDate(appointment.date);
    const mapping = this.getAppointmentsMapping();
    let appointmentsForDate = mapping[formattedDate] || [];
    const index = appointmentsForDate.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      appointmentsForDate[index] = appointment;
    } else {
      appointmentsForDate.push(appointment);
    }
    mapping[formattedDate] = appointmentsForDate;
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(mapping));
  }

  /**
   * Elimina una cita dado su ID.
   */
  deleteAppointment(appointmentId: string): void {
    const mapping = this.getAppointmentsMapping();
    for (const date in mapping) {
      mapping[date] = mapping[date].filter(a => a.id !== appointmentId);
    }
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(mapping));
  }

  /**
   * Genera un ID basado en la fecha y el horario.
   * Ejemplo: si la fecha es "2025-02-08" y el horario "10:30",
   * se generará "20250208-1030".
   */
  generateAppointmentId(date: string, time: string): string {
    const formattedDate = this.formatDate(date).replace(/-/g, '');
    const formattedTime = time.replace(':', '');
    return `${formattedDate}-${formattedTime}`;
  }
}
