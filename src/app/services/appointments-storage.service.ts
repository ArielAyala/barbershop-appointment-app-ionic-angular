import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys.constants';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsStorageService {

  /** Deletes all appointments from localStorage */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
  }

  /** Returns the complete mapping, or {} if it doesn't exist */
  getMapping(): { [date: string]: any[] } {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return raw ? JSON.parse(raw) : {};
  }

  /** Saves the complete mapping */
  saveMapping(mapping: { [date: string]: any[] }): void {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(mapping));
  }
}
