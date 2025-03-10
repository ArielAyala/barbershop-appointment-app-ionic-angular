export interface Appointment {
  id: string;       // Identificador único
  date: string;     // Fecha en formato ISO (pero usaremos YYYY-MM-DD para comparaciones)
  time: string;     // Horario en formato 'HH:mm'
  clientName: string; // Nombre del cliente
  paid: boolean;      // Si ya pagó
  amount: number;     // Monto
  notes: string;      // Observaciones
}
