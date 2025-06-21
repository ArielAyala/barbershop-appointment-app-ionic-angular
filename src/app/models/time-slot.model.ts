import { Appointment } from "./appointment.model";

export interface TimeSlot {
    time: string;
    booked: boolean;
    appointment?: Appointment;
}