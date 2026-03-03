"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Medico = void 0;
class Medico {
    id;
    nombre;
    especialidad;
    turno;
    constructor(id, nombre, especialidad, turno) {
        this.id = id;
        this.nombre = nombre;
        this.especialidad = especialidad;
        this.turno = turno;
    }
    horariosPorTurno(turno) {
        return turno.generarHorarios();
    }
}
exports.Medico = Medico;
//# sourceMappingURL=Medico.js.map