import { Medico } from "../domain/Medico";
import { Especialidad } from "../domain/Especialidad";

export class ListaMedicos {

    static obtener(especialidades: Especialidad[]): Medico[] {
    return [
      // Cardiología
      new Medico(1,  "Dr. Juan Pérez",      especialidades[0]!, ["08:00", "09:00", "10:00", "14:00", "15:00"]),
      new Medico(2,  "Dra. Ana Torres",     especialidades[0]!, ["09:00", "11:00", "13:00", "16:00"]),
      // Dermatología
      new Medico(3,  "Dra. María López",    especialidades[1]!, ["08:00", "10:00", "11:00", "15:00"]),
      new Medico(4,  "Dr. Pedro Salas",     especialidades[1]!, ["09:00", "10:00", "14:00", "17:00"]),
      // Pediatría
      new Medico(5,  "Dr. Carlos Ruiz",     especialidades[2]!, ["08:00", "10:00", "14:00", "16:00"]),
      new Medico(6,  "Dra. Lucía Mendoza",  especialidades[2]!, ["09:00", "11:00", "13:00", "15:00"]),
      // Neurología
      new Medico(7,  "Dr. Liam Sanchez",    especialidades[3]!, ["09:00", "11:00", "14:00", "17:00"]),
      new Medico(8,  "Dra. Sofia Quispe",   especialidades[3]!, ["08:00", "10:00", "15:00", "16:00"]),
      // Traumatología
      new Medico(9,  "Dr. Adrian Apaza",    especialidades[4]!, ["10:00", "11:00", "15:00", "16:00"]),
      new Medico(10, "Dra. Valeria Cruz",   especialidades[4]!, ["08:00", "09:00", "13:00", "17:00"]),
    ];
  }
}
