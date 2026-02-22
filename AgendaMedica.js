"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgendaMedica = void 0;
class AgendaMedica {
    medico;
    horarios = [];
    constructor(medico) {
        this.medico = medico;
    }
    agregarHorario(horario) {
        this.horarios.push(horario);
    }
    obtenerHorarios() {
        return this.horarios;
    }
    estaDisponible(fecha, hora) {
        return this.horarios.some(h => h.fecha === fecha && h.hora === hora);
    }
    removerHorario(fecha, hora) {
        this.horarios = this.horarios.filter(h => !(h.fecha === fecha && h.hora === hora));
    }
}
exports.AgendaMedica = AgendaMedica;
//# sourceMappingURL=AgendaMedica.js.map