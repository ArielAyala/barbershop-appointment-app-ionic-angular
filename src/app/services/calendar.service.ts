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

  // Genera una clave para guardar/recuperar los horarios de una fecha
  private getKeyForDate(date: string): string {
    return `timeSlots_${date}`;
  }

  /**
   * Retorna los horarios configurados para la fecha indicada.
   * Si ya existen en el localStorage se retornan sin modificarlos.
   * Si no existen y la fecha es de hoy o futura, se inicializan con los horarios por defecto.
   * Para fechas pasadas, se retorna un arreglo vacío.
   */
  getTimeSlotsForDate(date: string): string[] {
    const key = this.getKeyForDate(date);
    const storedSlots = localStorage.getItem(key);

    if (storedSlots) {
      // Existe una configuración previa, se respeta lo personalizado.
      return JSON.parse(storedSlots);
    } else {
      // Comparar la fecha solicitada con la fecha de hoy (sin tener en cuenta la hora)
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selected.getTime() >= today.getTime()) {
        // Para hoy o fechas futuras, se inicializa con la plantilla por defecto y se persiste.
        localStorage.setItem(key, JSON.stringify(this.defaultTimeSlots));
        return this.defaultTimeSlots;
      } else {
        // Para fechas pasadas, se retorna un arreglo vacío (o podrías definir otro comportamiento).
        return [];
      }
    }
  }

  /**
   * Permite guardar o actualizar una configuración personalizada de horarios para una fecha.
   */
  setTimeSlotsForDate(date: string, timeSlots: string[]): void {
    const key = this.getKeyForDate(date);
    localStorage.setItem(key, JSON.stringify(timeSlots));
  }
}
