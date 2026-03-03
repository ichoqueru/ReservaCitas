"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitaMedica = void 0;
class CitaMedica {
    paciente;
    medico;
    fecha;
    hora;
    estado;
    turno;
    constructor(paciente, medico, fecha, hora, estado, turno) {
        this.paciente = paciente;
        this.medico = medico;
        this.fecha = fecha;
        this.hora = hora;
        this.estado = estado;
        this.turno = turno;
    }
}
exports.CitaMedica = CitaMedica;
//# sourceMappingURL=CitaMedica.js.map