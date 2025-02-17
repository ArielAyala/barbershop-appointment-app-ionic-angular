import { Injectable } from '@angular/core';

export interface Appointment {
  id: string;       // Identificador único
  date: string;     // Fecha en formato ISO
  time: string;     // Horario en formato 'HH:mm'
  clientName: string; // Nombre del cliente
  paid: boolean;      // Si ya pagó
  amount: number;     // Monto
  notes: string;      // Observaciones
}
@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  // Plantilla por defecto de horarios
  private defaultTimeSlots: string[] = [
    '08:00', '08:40', '09:20', '10:00', '10:40',
    '12:20', '13:00', '13:40', '14:20', '15:00',
    '15:40', '16:20', '17:00', '17:40', '18:20',
    '19:00', '19:40', '20:20'
  ];

  // Clave para agrupar los horarios por fecha
  private timeSlotsStorageKey = 'timeSlotsByDate';

  // Clave para almacenar las citas
  private appointmentsStorageKey = 'appointments';


  /**
   * Formatea la fecha a un formato amigable: YYYY-MM-DD
   */
  private formatDate(date: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Retorna los horarios configurados para la fecha indicada.
   * - Si ya existe la configuración para esa fecha, se retorna.
   * - Si no existe y la fecha es de hoy o futura, se inicializa con la plantilla por defecto y se persiste.
   * - Para fechas pasadas, se retorna un arreglo vacío.
   */
  getTimeSlotsForDate(date: string): string[] {
    const formattedDate = this.formatDate(date);
    const storedObjectStr = localStorage.getItem(this.timeSlotsStorageKey);
    let timeslotsByDate = storedObjectStr ? JSON.parse(storedObjectStr) : {};
    console.log(timeslotsByDate);

    if (timeslotsByDate[formattedDate]) {
      return timeslotsByDate[formattedDate];
    } else {
      // Comparar la fecha solicitada con la fecha de hoy (sin tener en cuenta la hora)
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected.getTime() >= today.getTime()) {
        // Para hoy o fechas futuras, se inicializa con la plantilla por defecto y se guarda.
        timeslotsByDate[formattedDate] = this.defaultTimeSlots;
        localStorage.setItem(this.timeSlotsStorageKey, JSON.stringify(timeslotsByDate));
        return this.defaultTimeSlots;
      } else {
        // Para fechas pasadas, se retorna un arreglo vacío.
        return [];
      }
    }
  }

  /**
   * Permite guardar o actualizar una configuración personalizada de horarios para una fecha.
   */
  setTimeSlotsForDate(date: string, timeSlots: string[]): void {
    const formattedDate = this.formatDate(date);
    const storedObjectStr = localStorage.getItem(this.timeSlotsStorageKey);
    let timeslotsByDate = storedObjectStr ? JSON.parse(storedObjectStr) : {};
    timeslotsByDate[formattedDate] = timeSlots;
    localStorage.setItem(this.timeSlotsStorageKey, JSON.stringify(timeslotsByDate));
  }

  /* ==========================
     Lógica de Citas (Appointments)
  ========================== */

  /**
   * Retorna todas las citas almacenadas.
   */
  getAppointments(): Appointment[] {
    const savedAppointments = localStorage.getItem(this.appointmentsStorageKey);
    return savedAppointments ? JSON.parse(savedAppointments) : [];
  }

  /**
   * Guarda o actualiza una cita.
   * Si la cita ya existe (basada en el ID), se actualiza; de lo contrario, se agrega.
   */
  saveAppointment(appointment: Appointment): void {
    const appointments = this.getAppointments();
    const index = appointments.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      appointments[index] = appointment;
    } else {
      appointments.push(appointment);
    }
    localStorage.setItem(this.appointmentsStorageKey, JSON.stringify(appointments));
  }

  /**
   * Elimina una cita dado su ID.
   */
  deleteAppointment(appointmentId: string): void {
    let appointments = this.getAppointments();
    appointments = appointments.filter(a => a.id !== appointmentId);
    localStorage.setItem(this.appointmentsStorageKey, JSON.stringify(appointments));
  }

  /**
   * Genera un ID único para cada cita.
   */
  generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
