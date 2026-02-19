import { SistemaCitas } from "./SistemaCitas";
import { Especialidad } from "./Especialidad";
import { Medico } from "./Medico";
import { Paciente } from "./Paciente";
import { HorarioDisponible } from "./HorarioDisponible";


const sistema = new SistemaCitas();

const esp = new Especialidad("Cardiología");
const medico = new Medico(1, "Juan Pérez", esp);

medico.agenda.agregarHorario(new HorarioDisponible("2026-02-20", "10:00"));
medico.agenda.agregarHorario(new HorarioDisponible("2026-02-20", "11:00"));

const paciente = new Paciente(1, "María López");

const cita = sistema.reservarCita(
    paciente,
    medico,
    "2026-02-20",
    "10:00",
);

console.log("Estado cita:", cita.estado);
