import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Appointment } from 'src/app/models/appointment.model';
import { SharedIonicModule } from 'src/app/shared/shared-ionic.module';

@Component({
  selector: 'app-appointment-modal',
  templateUrl: './appointment-modal.component.html',
  styleUrls: ['./appointment-modal.component.scss'],
  imports: [
    SharedIonicModule,
    CommonModule,
    FormsModule,
  ]
})
export class AppointmentModalComponent {
  @Input() isOpen = false;
  @Input() selectedDate: string = '';
  @Input() selectedTime: string = '';
  @Input() currentAppointment: Appointment | null = null;

  @Output() modalClose = new EventEmitter<void>();
  @Output() appointmentSave = new EventEmitter<Appointment>();
  @Output() appointmentDelete = new EventEmitter<void>();

  clientName: string = '';
  paid: boolean = false;
  amountStr: string = '';
  notes: string = '';

  ngOnChanges() {
    if (this.currentAppointment) {
      this.clientName = this.currentAppointment.clientName;
      this.paid = this.currentAppointment.paid;
      this.amountStr = this.currentAppointment.amount.toString();
      this.notes = this.currentAppointment.notes;
    } else {
      this.resetForm();
    }
  }

  resetForm() {
    this.clientName = '';
    this.paid = false;
    this.amountStr = '';
    this.notes = '';
  }

  closeModal() {
    this.modalClose.emit();
  }

  saveAppointment() {
    const appointment: Appointment = {
      id: this.currentAppointment?.id || '',
      date: this.selectedDate,
      time: this.selectedTime,
      clientName: this.clientName,
      paid: this.paid,
      amount: Number(this.amountStr),
      notes: this.notes
    };
    this.appointmentSave.emit(appointment);
  }

  deleteAppointment() {
    this.appointmentDelete.emit();
  }
}
