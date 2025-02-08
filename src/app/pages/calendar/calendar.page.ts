import { Component, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { addIcons } from 'ionicons';
import { closeCircleOutline, saveOutline, trashOutline } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { CalendarService } from 'src/app/services/calendar.service';
import { SharedIonicModule } from 'src/app/shared/shared-ionic.module';


interface Appointment {
  id: string;       // Identificador único
  date: string;     // Fecha en formato ISO
  time: string;     // Horario en formato 'HH:mm'
  clientName: string; // Nombre del cliente
  paid: boolean;      // Si ya pagó
  amount: number;     // Monto
  notes: string;      // Observaciones
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SharedIonicModule,
    HeaderComponent,
  ]
})
export class CalendarPage {
  selectedDate: string = new Date().toISOString();
  availableTimes: string[] = [];
  appointments: Appointment[] = [];
  showToast: boolean = false;
  toastMessage: string = '';
  isModalOpen: boolean = false;
  selectedTime: string = '';
  currentAppointment: Appointment | null = null; // Cita actual (para editar)

  // Formulario
  clientName: string = '';
  paid: boolean = false;
  amount: number = 0;
  notes: string = '';

  constructor(private calendarService: CalendarService) {
    addIcons({ closeCircleOutline, saveOutline, trashOutline }); // Añadir íconos
  }

  ionViewWillEnter(): void {
    this.loadTimeSlotsForDate(this.selectedDate);
    this.loadAppointments();
  }

  /**
   * Carga los horarios para la fecha indicada delegando en el servicio.
   */
  loadTimeSlotsForDate(date: string): void {
    this.availableTimes = this.calendarService.getTimeSlotsForDate(date);
  }

  // Evento al cambiar la fecha en el ion-datetime
  onDateSelected(event: any): void {
    this.selectedDate = event.detail.value;
    this.loadTimeSlotsForDate(this.selectedDate);
  }

  // Guardar una cita en el localStorage
  saveAppointment(): void {
    const appointment: Appointment = {
      id: this.currentAppointment?.id || this.generateUniqueId(),
      date: this.selectedDate,
      time: this.selectedTime,
      clientName: this.clientName,
      paid: this.paid,
      amount: this.amount,
      notes: this.notes
    };

    // Si la cita ya existe se actualiza; si no, se agrega
    const index = this.appointments.findIndex(a => a.id === appointment.id);
    if (index !== -1) {
      this.appointments[index] = appointment;
    } else {
      this.appointments.push(appointment);
    }

    localStorage.setItem('appointments', JSON.stringify(this.appointments)); // Guardar citas en localStorage
    this.showToastMessage('Cita guardada correctamente'); // Mostrar mensaje de éxito
    this.closeModal(); // Cerrar el modal
  }

  // Cargar citas guardadas desde el localStorage
  loadAppointments(): void {
    const savedAppointments = localStorage.getItem('appointments');
    if (savedAppointments) {
      this.appointments = JSON.parse(savedAppointments);
    }
  }

  // Verificar si un horario ya está ocupado
  isTimeSlotBooked(time: string): boolean {
    return this.appointments.some(
      (appointment) =>
        appointment.date === this.selectedDate && appointment.time === time
    );
  }

  // Generar un ID único para cada cita
  generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  // Mostrar un mensaje Toast
  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000); // Ocultar después de 3 segundos
  }

  // Abrir el modal con los datos de la cita
  openModal(time: string): void {
    this.selectedTime = time;
    this.currentAppointment = this.appointments.find(
      (a) => a.date === this.selectedDate && a.time === time
    ) || null;

    // Cargar datos del formulario si la cita ya existe
    if (this.currentAppointment) {
      this.clientName = this.currentAppointment.clientName;
      this.paid = this.currentAppointment.paid;
      this.amount = this.currentAppointment.amount;
      this.notes = this.currentAppointment.notes;
    } else {
      this.resetForm();
    }

    this.isModalOpen = true; // Abrir el modal
  }

  // Cerrar el modal
  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  // Reiniciar el formulario
  resetForm(): void {
    this.clientName = '';
    this.paid = false;
    this.amount = 0;
    this.notes = '';
  }

  // Borrar una cita
  deleteAppointment(): void {
    if (this.currentAppointment) {
      this.appointments = this.appointments.filter(a => a.id !== this.currentAppointment?.id);
      localStorage.setItem('appointments', JSON.stringify(this.appointments)); // Actualizar localStorage
      this.showToastMessage('Cita eliminada correctamente'); // Mostrar mensaje de éxito
      this.closeModal(); // Cerrar el modal
    }
  }
}
