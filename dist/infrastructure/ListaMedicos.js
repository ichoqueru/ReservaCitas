"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListaMedicos = void 0;
const Medico_1 = require("../domain/Medico");
const Turno_1 = require("../domain/Turno");
class ListaMedicos {
    static obtener(especialidades, medicinaGeneral) {
        return [
            // Cardiología
            new Medico_1.Medico(1, "Dr. Juan Pérez", especialidades[0], Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(2, "Dra. Ana Torres", especialidades[0], Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(3, "Dr. Luis Campos", especialidades[0], Turno_1.Turno.TARDE),
            // Dermatología
            new Medico_1.Medico(4, "Dra. María López", especialidades[1], Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(5, "Dr. Pedro Salas", especialidades[1], Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(6, "Dra. Rosa Quispe", especialidades[1], Turno_1.Turno.TARDE),
            // Pediatría
            new Medico_1.Medico(7, "Dr. Carlos Ruiz", especialidades[2], Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(8, "Dra. Lucía Mendoza", especialidades[2], Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(9, "Dr. Diego Flores", especialidades[2], Turno_1.Turno.TARDE),
            // Neurología
            new Medico_1.Medico(10, "Dr. Liam Sanchez", especialidades[3], Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(11, "Dra. Sofia Quispe", especialidades[3], Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(12, "Dr. Marco Huanca", especialidades[3], Turno_1.Turno.TARDE),
            // Traumatología
            new Medico_1.Medico(13, "Dr. Adrian Apaza", especialidades[4], Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(14, "Dra. Valeria Cruz", especialidades[4], Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(15, "Dr. Sergio Mamani", especialidades[4], Turno_1.Turno.TARDE),
            // Medicina General
            new Medico_1.Medico(16, "Dr. Roberto Vargas", medicinaGeneral, Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(17, "Dra. Carmen Huanca", medicinaGeneral, Turno_1.Turno.MAÑANA),
            new Medico_1.Medico(18, "Dr. Félix Condori", medicinaGeneral, Turno_1.Turno.TARDE),
        ];
    }
}
exports.ListaMedicos = ListaMedicos;
//# sourceMappingURL=ListaMedicos.js.map