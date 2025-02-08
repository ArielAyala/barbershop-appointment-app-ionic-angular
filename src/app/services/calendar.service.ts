import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private defaultTimeSlots: string[] = [
    '08:00', '08:40', '09:20', '10:00', '10:40',
    '12:20', '13:00', '13:40', '14:20', '15:00',
    '15:40', '16:20', '17:00', '17:40', '18:20',
    '19:00', '19:40', '20:20'
  ];

  // Clave única para agrupar todos los horarios por fecha
  private storageKey = 'timeSlotsByDate';

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
    const storedObjectStr = localStorage.getItem(this.storageKey);
    // Se obtiene el objeto que agrupa los horarios por fecha; si no existe, se inicializa en {}
    let timeslotsByDate = storedObjectStr ? JSON.parse(storedObjectStr) : {};

    if (timeslotsByDate[formattedDate]) {
      // Ya existe una configuración para esa fecha.
      return timeslotsByDate[formattedDate];
    } else {
      // Comparar la fecha solicitada con la fecha de hoy (ignorando la hora)
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected.getTime() >= today.getTime()) {
        // Para hoy o fechas futuras, se inicializa con la plantilla por defecto y se guarda.
        timeslotsByDate[formattedDate] = this.defaultTimeSlots;
        localStorage.setItem(this.storageKey, JSON.stringify(timeslotsByDate));
        return this.defaultTimeSlots;
      } else {
        // Para fechas pasadas, se retorna un arreglo vacío (puedes ajustar este comportamiento si lo deseas).
        return [];
      }
    }
  }

  /**
   * Permite guardar o actualizar una configuración personalizada de horarios para una fecha.
   */
  setTimeSlotsForDate(date: string, timeSlots: string[]): void {
    const formattedDate = this.formatDate(date);
    const storedObjectStr = localStorage.getItem(this.storageKey);
    let timeslotsByDate = storedObjectStr ? JSON.parse(storedObjectStr) : {};
    timeslotsByDate[formattedDate] = timeSlots;
    localStorage.setItem(this.storageKey, JSON.stringify(timeslotsByDate));
  }
}
