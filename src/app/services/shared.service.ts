import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  async shareElement(selector: string): Promise<void> {
    const element: any = document.querySelector(selector);

    if (element) {
      const canvas = await html2canvas(element);
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
