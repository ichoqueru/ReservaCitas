"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitaMedica = void 0;
const EstadoCita_1 = require("./EstadoCita");
class CitaMedica {
    paciente;
    medico;
    fecha;
    hora;
    estado = EstadoCita_1.EstadoCita.PROGRAMADA;
    constructor(paciente, medico, fecha, hora) {
        this.paciente = paciente;
        this.medico = medico;
        this.fecha = fecha;
        this.hora = hora;
    }
    cancelar() {
        if (this.estado === EstadoCita_1.EstadoCita.CANCELADA) {
            throw new Error("La cita ya fue cancelada.");
        }
        this.estado = EstadoCita_1.EstadoCita.CANCELADA;
    }
    completar() {
        if (this.estado !== EstadoCita_1.EstadoCita.PROGRAMADA) {
            throw new Error("Solo citas programadas pueden completarse.");
        }
        this.estado = EstadoCita_1.EstadoCita.COMPLETADA;
    }
}
exports.CitaMedica = CitaMedica;
//# sourceMappingURL=CitaMedica.js.map