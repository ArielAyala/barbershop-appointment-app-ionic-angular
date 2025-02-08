import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonDatetime,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  IonToast,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addOutline, removeOutline, saveOutline } from 'ionicons/icons';
import { CalendarService } from 'src/app/services/calendar.service';
import { HeaderComponent } from "../../components/header/header.component";


@Component({
  selector: 'app-schedule-config',
  templateUrl: './schedule-config.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonDatetime,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonToast,
    IonIcon,
    HeaderComponent,
    IonLabel,
]
})
export class ScheduleConfigPage implements OnInit {
  selectedDate: string = new Date().toISOString();
  availableTimes: string[] = [];
  newTime: string = '';
  showToast: boolean = false;
  toastMessage: string = '';

  // Íconos de ionicons
  addOutline = addOutline;
  removeOutline = removeOutline;
  saveOutline = saveOutline;

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.loadTimeSlots();
  }

  /**
   * Carga los horarios para la fecha seleccionada mediante el servicio.
   */
  loadTimeSlots(): void {
    this.availableTimes = this.calendarService.getTimeSlotsForDate(this.selectedDate);
  }

  /**
   * Actualiza la fecha seleccionada y recarga los horarios.
   */
  onDateSelected(event: any): void {
    this.selectedDate = event.detail.value;
    this.loadTimeSlots();
  }

  /**
   * Agrega un nuevo horario a la lista si no está vacío o duplicado.
   */
  addTimeSlot(): void {
    if (this.newTime && !this.availableTimes.includes(this.newTime)) {
      this.availableTimes.push(this.newTime);
      // Opcional: ordenar los horarios (considera que al usar strings en formato "HH:mm" la comparación funciona correctamente)
      this.availableTimes.sort();
      this.newTime = '';
    } else {
      this.showToastMessage('El horario ya existe o está vacío.');
    }
  }

  /**
   * Remueve el horario seleccionado de la lista.
   */
  removeTimeSlot(time: string): void {
    this.availableTimes = this.availableTimes.filter(t => t !== time);
  }

  /**
   * Guarda la configuración de horarios para la fecha seleccionada mediante el servicio.
   */
  saveScheduleConfig(): void {
    this.calendarService.setTimeSlotsForDate(this.selectedDate, this.availableTimes);
    this.showToastMessage('Horarios actualizados correctamente.');
  }

  /**
   * Muestra un mensaje Toast.
   */
  showToastMessage(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
  }
}
