// src/app/services/shared.service.ts
import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { SHARE_CONFIG, ShareConfig } from '../configs/share-config';

@Injectable({ providedIn: 'root' })
export class SharedService {

  /** Punto de entrada único */
  async shareElement(selector: string): Promise<void> {
    if (SHARE_CONFIG.enhanced) {
      return this.shareWithOverlay(selector, SHARE_CONFIG);
    } else {
      return this.shareSimple(selector);
    }
  }

  /** Versión original “simple” */
  private async shareSimple(selector: string): Promise<void> {
    const element: HTMLElement|null = document.querySelector(selector);
    if (!element) { return; }

    const canvas = await html2canvas(element);
    const dataUrl = canvas.toDataURL('image/png');
    if (navigator.share) {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'horarios.png', { type: 'image/png' });
      try {
        await navigator.share({
          files: [file],
          title: 'Horarios disponibles',
          text: 'Aquí están los horarios disponibles para agendar.',
        });
      } catch (e) {
        console.error('Error al compartir (simple):', e);
      }
    } else {
      console.warn('API de compartir no soportada (simple).');
    }
  }

  /** Versión “enriquecida” con fondo, logo y contacto, inyectada OFFSCREEN */
  private async shareWithOverlay(selector: string, cfg: ShareConfig): Promise<void> {
    const target = document.querySelector(selector) as HTMLElement;
    if (!target) {
      console.warn(`SharedService: selector "${selector}" no encontrado.`);
      return;
    }

    // 1) Capturamos el elemento tal cual aparece
    const originalCanvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: null
    });

    // 2) Creamos un nuevo canvas con mismo tamaño
    const w = originalCanvas.width;
    const h = originalCanvas.height;
    const combined = document.createElement('canvas');
    combined.width  = w;
    combined.height = h;
    const ctx = combined.getContext('2d')!;

    // 3) Dibujamos el fondo (si hay)
    if (cfg.backgroundUrl) {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = cfg.backgroundUrl!;
        img.onload  = () => {
          ctx.drawImage(img, 0, 0, w, h);
          resolve();
        };
        img.onerror = reject;
      });
    }

    // 4) Dibujamos la captura original encima
    ctx.drawImage(originalCanvas, 0, 0, w, h);

    // 5) Dibujamos el logo (si hay)
    if (cfg.logoUrl) {
      await new Promise<void>((resolve, reject) => {
        const logo = new Image();
        logo.src = cfg.logoUrl!;
        logo.onload = () => {
          const logoW = w * 0.15;           // p.ej. 15% ancho
          const logoH = logoW * (logo.height/logo.width);
          ctx.drawImage(logo, 16, 16, logoW, logoH);
          resolve();
        };
        logo.onerror = reject;
      });
    }

    // 6) Dibujamos el texto de contacto (si hay)
    if (cfg.contactText) {
      ctx.save();
      ctx.font      = 'bold 20px sans-serif';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'right';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 4;
      ctx.fillText(
        cfg.contactText!,
        w - 16,
        h - 16
      );
      ctx.restore();
    }

    // 7) Convertimos a data URL y compartimos
    const dataUrl = combined.toDataURL('image/png');
    if (navigator.share) {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'horarios.png', { type: 'image/png' });
      try {
        await navigator.share({
          files: [file],
          title: 'Horarios disponibles',
          text: 'Aquí están los horarios disponibles para agendar.',
        });
      } catch (e) {
        console.error('Error al compartir (overlay):', e);
      }
    } else {
      console.warn('API de compartir no soportada (overlay).');
    }
  }


}
