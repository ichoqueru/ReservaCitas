import { Medico } from "../domain/Medico";
import { Especialidad } from "../domain/Especialidad";
import { Turno } from "../domain/Turno";

export class ListaMedicos {

    static obtener(especialidades: Especialidad[], medicinaGeneral: Especialidad ): Medico[] {
    return [
      // Cardiología
      new Medico(1,  "Dr. Juan Pérez",        especialidades[0]!, Turno.MAÑANA),
      new Medico(2,  "Dra. Ana Torres",        especialidades[0]!, Turno.MAÑANA),
      new Medico(3,  "Dr. Luis Campos",        especialidades[0]!, Turno.TARDE),

      // Dermatología
      new Medico(4,  "Dra. María López",       especialidades[1]!, Turno.MAÑANA),
      new Medico(5,  "Dr. Pedro Salas",        especialidades[1]!, Turno.MAÑANA),
      new Medico(6,  "Dra. Rosa Quispe",       especialidades[1]!, Turno.TARDE),

      // Pediatría
      new Medico(7,  "Dr. Carlos Ruiz",        especialidades[2]!, Turno.MAÑANA),
      new Medico(8,  "Dra. Lucía Mendoza",     especialidades[2]!, Turno.MAÑANA),
      new Medico(9,  "Dr. Diego Flores",       especialidades[2]!, Turno.TARDE),

      // Neurología
      new Medico(10, "Dr. Liam Sanchez",       especialidades[3]!, Turno.MAÑANA),
      new Medico(11, "Dra. Sofia Quispe",      especialidades[3]!, Turno.MAÑANA),
      new Medico(12, "Dr. Marco Huanca",       especialidades[3]!, Turno.TARDE),

      // Traumatología
      new Medico(13, "Dr. Adrian Apaza",       especialidades[4]!, Turno.MAÑANA),
      new Medico(14, "Dra. Valeria Cruz",      especialidades[4]!, Turno.MAÑANA),
      new Medico(15, "Dr. Sergio Mamani",      especialidades[4]!, Turno.TARDE),

      // Medicina General
      new Medico(16, "Dr. Roberto Vargas",     medicinaGeneral,    Turno.MAÑANA),
      new Medico(17, "Dra. Carmen Huanca",     medicinaGeneral,    Turno.MAÑANA),
      new Medico(18, "Dr. Félix Condori",      medicinaGeneral,    Turno.TARDE),

    ];
  }
}
