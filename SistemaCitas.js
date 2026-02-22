"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SistemaCitas = void 0;
const CitaMedica_1 = require("./CitaMedica");
const HorarioDisponible_1 = require("./HorarioDisponible");
const EstadoCita_1 = require("./EstadoCita");
const Notificacion_1 = require("./Notificacion");
class SistemaCitas {
    citas = [];
    reservarCita(paciente, medico, fecha, hora) {
        if (!medico.agenda.estaDisponible(fecha, hora)) {
            throw new Error("Horario no disponible.");
        }
        const cita = new CitaMedica_1.CitaMedica(paciente, medico, fecha, hora);
        this.citas.push(cita);
        paciente.historial.agregarCita(cita);
        medico.agenda.removerHorario(fecha, hora);
        Notificacion_1.Notificacion.enviar(`Cita reservada para ${paciente.nombre} con Dr. ${medico.nombre}`);
        return cita;
    }
    reprogramarCita(cita, nuevaFecha, nuevaHora) {
        if (cita.estado !== EstadoCita_1.EstadoCita.PROGRAMADA) {
            throw new Error("Solo citas programadas pueden reprogramarse.");
        }
        if (!cita.medico.agenda.estaDisponible(nuevaFecha, nuevaHora)) {
            throw new Error("Nuevo horario no disponible.");
        }
        cita.medico.agenda.agregarHorario(new HorarioDisponible_1.HorarioDisponible(cita.fecha, cita.hora));
        cita.fecha = nuevaFecha;
        cita.hora = nuevaHora;
        cita.medico.agenda.removerHorario(nuevaFecha, nuevaHora);
        Notificacion_1.Notificacion.enviar("Cita reprogramada correctamente.");
    }
}
exports.SistemaCitas = SistemaCitas;
//# sourceMappingURL=SistemaCitas.js.map