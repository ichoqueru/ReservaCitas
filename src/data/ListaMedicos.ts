import { Medico } from "../domain/Medico";
import { Especialidad } from "../domain/Especialidad";

export class ListaMedicos {

    static obtener(especialidades: Especialidad[]): Medico[] {
    return [
      // Cardiología
      new Medico(1,  "Dr. Juan Pérez",      especialidades[0]!),
      new Medico(2,  "Dra. Ana Torres",     especialidades[0]!),
      // Dermatología
      new Medico(3,  "Dra. María López",    especialidades[1]!),
      new Medico(4,  "Dr. Pedro Salas",     especialidades[1]!),
      // Pediatría
      new Medico(5,  "Dr. Carlos Ruiz",     especialidades[2]!),
      new Medico(6,  "Dra. Lucía Mendoza",  especialidades[2]!),
      // Neurología
      new Medico(7,  "Dr. Liam Sanchez",    especialidades[3]!),
      new Medico(8,  "Dra. Sofia Quispe",   especialidades[3]!),
      // Traumatología
      new Medico(9,  "Dr. Adrian Apaza",    especialidades[4]!),
      new Medico(10, "Dra. Valeria Cruz",   especialidades[4]!),
    ];
  }
}
