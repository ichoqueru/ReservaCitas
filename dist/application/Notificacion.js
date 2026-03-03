"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notificacion = void 0;
const GestorCitas_1 = require("./GestorCitas");
class Notificacion {
    static enviar(cita) {
        console.log("\n NOTIFICACIÓN DE CITA MÉDICA");
        console.log("Paciente:", cita.paciente.nombre);
        console.log("Doctor:", cita.medico.nombre);
        console.log("Especialidad:", cita.medico.especialidad.nombre);
        console.log("Fecha:", cita.fecha);
        console.log("Hora:", cita.hora);
        console.log("Estado:", cita.estado);
        const contenido = `DNI: ${cita.paciente.dni} | ` +
            `Paciente: ${cita.paciente.nombre} | ` +
            `Doctor: ${cita.medico.nombre} | ` +
            `Especialidad: ${cita.medico.especialidad.nombre} | ` +
            `Turno: ${cita.turno} | ` +
            `Fecha: ${cita.fecha} | ` +
            `Hora: ${cita.hora} | ` +
            `Estado: ${cita.estado}`;
        GestorCitas_1.GestorCitas.guardarCita(cita.medico.especialidad.nombre, contenido);
        console.log("\n Cita programada");
    }
}
exports.Notificacion = Notificacion;
//# sourceMappingURL=Notificacion.js.map