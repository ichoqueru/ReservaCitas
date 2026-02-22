"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SistemaCitas_1 = require("./SistemaCitas");
const Especialidad_1 = require("./Especialidad");
const Medico_1 = require("./Medico");
const Paciente_1 = require("./Paciente");
const HorarioDisponible_1 = require("./HorarioDisponible");
const sistema = new SistemaCitas_1.SistemaCitas();
const esp = new Especialidad_1.Especialidad("Cardiología");
const medico = new Medico_1.Medico(1, "Juan Pérez", esp);
medico.agenda.agregarHorario(new HorarioDisponible_1.HorarioDisponible("2026-02-20", "10:00"));
medico.agenda.agregarHorario(new HorarioDisponible_1.HorarioDisponible("2026-02-20", "11:00"));
const paciente = new Paciente_1.Paciente(1, "María López");
const cita = sistema.reservarCita(paciente, medico, "2026-02-20", "10:00");
console.log("Estado cita:", cita.estado);
//# sourceMappingURL=index.js.map