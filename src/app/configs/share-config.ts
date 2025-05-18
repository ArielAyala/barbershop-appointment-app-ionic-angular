


export interface ShareOverlayOptions {
  enhanced: boolean;        // si true usamos overlay sencillo, si false usamos shareData
  backgroundUrl?: string;   // fondo general
  logoUrl?: string;         // logo
  contactText?: string;     // texto de contacto
}

export interface ShareScheduleData {
  dayLabel: string;        // p.ej. "SÁBADO"
  timeSlots: string[];      // ["08:00 HS", "08:40 HS", …]
}

// tu configuración actual:
export const SHARE_CONFIG: ShareOverlayOptions = {
  enhanced: true,
  backgroundUrl: 'assets/img/background-share.jpeg',
  logoUrl:       'assets/img/logo.jpg',
  contactText:   'Contacto: 0972 706 885'
};
