export interface ShareConfig {
  enhanced: boolean;       // si true usamos overlay+fondo+logo; si false usamos la lógica simple
  backgroundUrl?: string;  // ruta a imagen de fondo
  logoUrl?: string;        // ruta a logo
  contactText?: string;    // texto de contacto
}

export const SHARE_CONFIG: ShareConfig = {
  enhanced: true,
  backgroundUrl: 'assets/img/background-share.jpeg',
  logoUrl:       'assets/img/logo.jpg',
  contactText:   'Contacto: +52 55 1234 5678'
};