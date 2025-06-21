import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import { SHARE_CONFIG, ShareOverlayOptions, ShareScheduleData } from '../configs/share-config';

@Injectable({ providedIn: 'root' })
export class SharedService {

  /** Punto de entrada único */
  async shareElement(input: string | ShareScheduleData): Promise<void> {
    if (typeof input === 'string') {
      // señal DOM: tu lógica actual
      if (SHARE_CONFIG.enhanced) {
        return this.shareWithOverlay(input, SHARE_CONFIG);
      } else {
        return this.shareSimple(input);
      }
    } else {
      // vinieron datos: dibujamos póster custom
      return this.shareFromData(input, SHARE_CONFIG);
    }
  }

  private async shareSimple(selector: string): Promise<void> {
    const canvas = await this.captureElement(selector);
    if (!canvas) { return; }

    await this.shareCanvas(canvas, 'Horarios disponibles', 'Aquí están los horarios disponibles para agendar.');
  }

  private async captureElement(selector: string): Promise<HTMLCanvasElement | null> {
    const element = document.querySelector(selector) as HTMLElement | null;
    if (!element) {
      console.warn(`SharedService: selector "${selector}" no encontrado.`);
      return null;
    }
    // puedes ajustar scale, backgroundColor, etc. aquí si quisieras
    return html2canvas(element);
  }

  private async shareCanvas(canvas: HTMLCanvasElement, title: string, text: string): Promise<void> {
    if (!navigator.share) {
      console.warn('API de compartir no soportada.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'horarios.png', { type: 'image/png' });

    try {
      await navigator.share({ files: [file], title, text });
    } catch (e) {
      console.error('Error al compartir:', e);
    }
  }


  /** Versión “enriquecida” con fondo, logo y contacto, inyectada OFFSCREEN */
  private async shareWithOverlay(selector: string, cfg: ShareOverlayOptions): Promise<void> {
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
    combined.width = w;
    combined.height = h;
    const ctx = combined.getContext('2d')!;

    // 3) Dibujamos el fondo (si hay)
    if (cfg.backgroundUrl) {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = cfg.backgroundUrl!;
        img.onload = () => {
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
          const logoH = logoW * (logo.height / logo.width);
          ctx.drawImage(logo, 16, 16, logoW, logoH);
          resolve();
        };
        logo.onerror = reject;
      });
    }

    // 6) Dibujamos el texto de contacto (si hay)
    if (cfg.contactText) {
      ctx.save();
      ctx.font = 'bold 20px sans-serif';
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

  private async shareFromData(data: ShareScheduleData, cfg: ShareOverlayOptions): Promise<void> {
    const { dayLabel, timeSlots } = data;

    // 1) Creamos un canvas grande. Ajusta a tamaño de story de WhatsApp, ej. 1080×1920:
    const W = 1080, H = 1920;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // 2) Fondo
    if (cfg.backgroundUrl) {
      await this.drawImageOnCtx(ctx, cfg.backgroundUrl, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, W, H);
    }

    // 3) Fecha en la parte superior
    const headerH = 150;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    this.roundRect(ctx, W / 2 - 300, 60, 600, 60, 30, true, false);
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.font = 'italic bold 64px serif';
    ctx.fillText(dayLabel.toUpperCase(), W / 2, 110);

    // 4) Pintar horarios en dos columnas
    const cols = 2;
    const marginX = 80;
    const gapX = 40;
    const slotW = (W - 2 * marginX - (cols - 1) * gapX) / cols;
    const slotH = 100;
    const startY = headerH + 120;
    const gapY = 30;

    // cargamos icono de reloj
    const clockImgUrl = 'assets/img/clock-icon.png';
    const clockImg = await this.loadImage(clockImgUrl);

    ctx.font = '28px sans-serif';
    ctx.textAlign = 'left';
    for (let i = 0; i < timeSlots.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = marginX + col * (slotW + gapX);
      const y = startY + row * (slotH + gapY);

      // píldora
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      this.roundRect(ctx, x, y, slotW, slotH, 50, true, false);

      // ícono
      const iconSize = 40;
      ctx.drawImage(
        clockImg,
        x + 16,
        y + (slotH - iconSize) / 2,
        iconSize, iconSize
      );

      // texto del horario
      ctx.fillStyle = '#000';
      ctx.fillText(
        timeSlots[i] + ' HS',
        x + 16 + iconSize + 12,
        y + slotH / 2 + 10
      );
    }

    // 5) Logo central adaptado al 50% del ancho
    if (cfg.logoUrl) {
      const logoImg = await this.loadImage(cfg.logoUrl);
      // Queremos que el ancho sea W * 0.5 y la altura mantenga proporción
      const logoW = W * 0.5;
      const aspectRatio = logoImg.height / logoImg.width;
      const logoH = logoW * aspectRatio;

      // Lo situamos horizontalmente centrado, justo debajo de los slots
      const cols = 2;
      const slotH = 100;
      const gapY = 30;
      const rows = Math.ceil(timeSlots.length / cols);
      const startY = headerH + 120;
      const logoY = startY + rows * (slotH + gapY) + 20;

      ctx.drawImage(
        logoImg,
        W / 2 - logoW / 2,
        logoY,
        logoW,
        logoH
      );
    }


    // 6) Texto de contacto inferior
    if (cfg.contactText) {
      ctx.font = 'bold 32px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 8;
      ctx.fillText(cfg.contactText, W / 2, H - 80);
    }

    // 7) Compartir
    const dataUrl = canvas.toDataURL('image/png');
    if (navigator.share) {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'horarios.png', { type: 'image/png' });
      try {
        await navigator.share({ files: [file], title: 'Horarios', text: '' });
      } catch (e) {
        console.error(e);
      }
    } else {
      console.warn('Web Share API no soportada');
    }
  }

  // —————————————————————————————————————————————————————————
  // Helpers:

  /** Dibuja un rectángulo redondeado */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number,
    fill: boolean, stroke: boolean
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  /** Carga una imagen y resuelve con el objeto HTMLImageElement */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => res(img);
      img.onerror = rej;
    });
  }

  /** Dibuja una imagen sobre el contexto */
  private async drawImageOnCtx(
    ctx: CanvasRenderingContext2D,
    src: string,
    x: number, y: number, w: number, h: number
  ) {
    const img = await this.loadImage(src);
    ctx.drawImage(img, x, y, w, h);
  }


}
