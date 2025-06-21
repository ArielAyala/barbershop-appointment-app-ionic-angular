import { TimeSlot } from "../models/time-slot.model";



export interface ShareOverlayOptions {
  enhanced: boolean;        // si true usamos overlay sencillo, si false usamos shareData
  backgroundUrl?: string;   // fondo general
  logoUrl?: string;         // logo
  contactText?: string;     // texto de contacto
}

export interface ShareScheduleData {
  dayLabel: string;        // p.ej. "SÁBADO"
  timeSlots: TimeSlot[];      
}

// tu configuración actual:
export const SHARE_CONFIG: ShareOverlayOptions = {
  enhanced: false,
  backgroundUrl: 'assets/img/background-share.jpeg',
  logoUrl:       'assets/img/logo.jpg',
  contactText:   'Contacto: 0972 706 885'
};
