// src/app/pages/calendar/calendar.page.ts
import { Component } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { closeCircleOutline, saveOutline, shareSocialOutline, trashOutline } from 'ionicons/icons';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { CalendarService, Appointment } from 'src/app/services/calendar.service';
import { SharedIonicModule } from 'src/app/shared/shared-ionic.module';
import { DateUtils } from 'src/app/utils/date-utils';
import html2canvas from 'html2canvas';

registerLocaleData(localeEs, 'es');


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
  // Se inicializa usando DateUtils para obtener la fecha local en formato YYYY-MM-DD
  selectedDate: string = DateUtils.getCurrentDate();
  availableTimes: string[] = [];
  appointments: Appointment[] = [];
  pastAppointments: Appointment[] = [];
  showToast: boolean = false;
  toastMessage: string = '';
  isModalOpen: boolean = false;
  selectedTime: string = '';
  currentAppointment: Appointment | null = null; // Cita actual (para editar)

  // Datos del formulario
  clientName: string = '';
  paid: boolean = false;
  amountStr: string = '';
  notes: string = '';

  constructor(private readonly calendarService: CalendarService) {
    addIcons({ closeCircleOutline, saveOutline, trashOutline, shareSocialOutline });
  }

  ionViewWillEnter(): void {
    this.selectedDate = DateUtils.getCurrentDate();
    this.loadDataForSelectedDate();
  }

  /**
   * Determina si la fecha seleccionada es pasada.
   * Compara el string en formato "YYYY-MM-DD" con la fecha actual.
   */
  isPastDate(): boolean {
    const today = DateUtils.getCurrentDate();
    return this.selectedDate < today;
  }

  /**
   * Carga los datos según la fecha seleccionada.
   * - Si la fecha es pasada, carga las citas registradas para ese día.
   * - Si es hoy o futura, carga los turnos disponibles.
   */
  private loadDataForSelectedDate(): void {
    if (this.isPastDate()) {
      this.pastAppointments = this.calendarService.getAppointmentsForDate(this.selectedDate);
      this.availableTimes = [];
    } else {
      this.availableTimes = this.calendarService.getTimeSlotsForDate(this.selectedDate);
      this.pastAppointments = [];
    }
    this.appointments = this.calendarService.getAppointments();
  }

  /**
   * Evento al cambiar la fecha en el ion-datetime.
   * Convierte el valor recibido al formato local YYYY-MM-DD usando DateUtils.
   */
  onDateSelected(event: any): void {
    //this.selectedDate = DateUtils.formatDate(new Date(fullDate));
    this.selectedDate = event.detail.value;
    this.loadDataForSelectedDate();
  }

  /**
   * Verifica si un turno ya está ocupado en la fecha seleccionada.
   */
  isTimeSlotBooked(time: string): boolean {
    const appointmentsForDay = this.calendarService.getAppointmentsForDate(this.selectedDate);
    return appointmentsForDay.some(appointment => appointment.time === time);
  }

  /**
   * Guarda o actualiza una cita delegando la lógica en el servicio.
   */
  saveAppointment(): void {
    const appointment: Appointment = {
      id: this.currentAppointment?.id || this.calendarService.generateAppointmentId(this.selectedDate, this.selectedTime),
      date: this.selectedDate,
      time: this.selectedTime,
      clientName: this.clientName,
      paid: this.paid,
      amount:  this.amountStr ? parseFloat(this.amountStr) : 0,
      notes: this.notes
    };

    this.calendarService.saveAppointment(appointment);
    this.loadDataForSelectedDate();
    this.showToastMessage('Cita guardada correctamente');
    this.closeModal();
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
   * Se usa para fechas actuales/futuras.
   */
  openModal(time: string): void {
    this.selectedTime = time;
    this.currentAppointment = this.appointments.find(
      appointment =>
        appointment.date === this.selectedDate && appointment.time === time
    ) || null;

    if (this.currentAppointment) {
      this.clientName = this.currentAppointment.clientName;
      this.paid = this.currentAppointment.paid;
      this.amountStr = this.currentAppointment.amount.toString();
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
    this.amountStr = '';
    this.notes = '';
  }

  /**
   * Elimina la cita actual delegando en el servicio.
   */
  deleteAppointment(): void {
    if (this.currentAppointment) {
      this.calendarService.deleteAppointment(this.currentAppointment.id);
      this.loadDataForSelectedDate();
      this.showToastMessage('Cita eliminada correctamente');
      this.closeModal();
    }
  }

  async shareSchedule(): Promise<void> {
    const scheduleElement: any = document.querySelector('.time-slots-container');

    if (scheduleElement) {
      const canvas = await html2canvas(scheduleElement);
      const image = canvas.toDataURL('image/png');

      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], "horarios.png", { type: "image/png" });

        navigator.share({
          files: [file],
          title: 'Horarios disponibles',
          text: 'Aquí están los horarios disponibles para agendar.',
        }).catch(err => console.log('Error al compartir', err));
      } else {
        console.log('La API de compartir no está soportada');
      }
    }
  }
}
