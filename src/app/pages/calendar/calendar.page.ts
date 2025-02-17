// src/app/pages/calendar/calendar.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { closeCircleOutline, saveOutline, trashOutline } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { CalendarService, Appointment } from 'src/app/services/calendar.service';
import { SharedIonicModule } from 'src/app/shared/shared-ionic.module';

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
export default class CalendarPage {
  selectedDate: string = new Date().toISOString();
  availableTimes: string[] = [];
  appointments: Appointment[] = [];
  showToast: boolean = false;
  toastMessage: string = '';
  isModalOpen: boolean = false;
  selectedTime: string = '';
  currentAppointment: Appointment | null = null; // Cita actual (para editar)

  // Datos del formulario
  clientName: string = '';
  paid: boolean = false;
  amount: number = 0;
  notes: string = '';

  constructor(private readonly calendarService: CalendarService) {
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

  /**
   * Evento al cambiar la fecha en el ion-datetime.
   */
  onDateSelected(event: any): void {
    this.selectedDate = event.detail.value;
    this.loadTimeSlotsForDate(this.selectedDate);
  }

  /**
   * Guarda o actualiza una cita delegando la lógica en el servicio.
   */
  saveAppointment(): void {
    const appointment: Appointment = {
      id: this.currentAppointment?.id || this.calendarService.generateUniqueId(),
      date: this.selectedDate,
      time: this.selectedTime,
      clientName: this.clientName,
      paid: this.paid,
      amount: this.amount,
      notes: this.notes
    };

    // Delegar el guardado en el servicio
    this.calendarService.saveAppointment(appointment);
    // Refrescar la lista de citas
    this.appointments = this.calendarService.getAppointments();
    this.showToastMessage('Cita guardada correctamente');
    this.closeModal();
  }

  /**
   * Carga las citas almacenadas delegando en el servicio.
   */
  loadAppointments(): void {
    this.appointments = this.calendarService.getAppointments();
  }

  /**
   * Verifica si un horario ya está ocupado.
   */
  isTimeSlotBooked(time: string): boolean {
    return this.appointments.some(
      appointment =>
        appointment.date === this.selectedDate && appointment.time === time
    );
  }

  /**
   * Muestra un mensaje Toast.
   */
  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 3000);
  }

  /**
   * Abre el modal y carga los datos de la cita si ya existe.
   */
  openModal(time: string): void {
    this.selectedTime = time;
    this.currentAppointment = this.appointments.find(
      appointment => appointment.date === this.selectedDate && appointment.time === time
    ) || null;

    if (this.currentAppointment) {
      this.clientName = this.currentAppointment.clientName;
      this.paid = this.currentAppointment.paid;
      this.amount = this.currentAppointment.amount;
      this.notes = this.currentAppointment.notes;
    } else {
      this.resetForm();
    }

    this.isModalOpen = true;
  }

  /**
   * Cierra el modal y reinicia el formulario.
   */
  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  /**
   * Reinicia los datos del formulario.
   */
  resetForm(): void {
    this.clientName = '';
    this.paid = false;
    this.amount = 0;
    this.notes = '';
  }

  /**
   * Elimina la cita actual delegando en el servicio.
   */
  deleteAppointment(): void {
    if (this.currentAppointment) {
      this.calendarService.deleteAppointment(this.currentAppointment.id);
      this.appointments = this.calendarService.getAppointments();
      this.showToastMessage('Cita eliminada correctamente');
      this.closeModal();
    }
  }
}
