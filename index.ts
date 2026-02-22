import * as readline from "readline";
import { Paciente } from "./Paciente";
import { Medico } from "./Medico";
import { Especialidad } from "./Especialidad";
import { CitaMedica } from "./CitaMedica";
import { EstadoCita } from "./EstadoCita";
import { Notificacion } from "./Notificacion";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ===== Especialidades disponibles =====
const especialidades = [
    new Especialidad("Cardiología"),
    new Especialidad("Dermatología"),
    new Especialidad("Pediatría")
];

console.log("=== SISTEMA DE CITAS MÉDICAS ===\n");

rl.question("Ingrese nombre del paciente: ", (nombre) => {

    const paciente = new Paciente(1, nombre);

    console.log("\nSeleccione una especialidad:");

    especialidades.forEach((esp, i) => {
        console.log(`${i + 1}. ${esp.nombre}`);
    });

    rl.question("Opción: ", (opcionEsp) => {

        const especialidad = especialidades[Number(opcionEsp) - 1];

        if (!especialidad) {
            console.log(" Especialidad inválida");
            rl.close();
            return;
        }

        const medico = new Medico(1, "Dr. Juan Pérez", especialidad);

        const horarios = ["10:00", "11:00"];

        console.log("\nHorarios disponibles:");

        horarios.forEach((hora, i) => {
            console.log(`${i + 1}. ${hora}`);
        });

        rl.question("Seleccione horario: ", (opcionHora) => {

            const hora = horarios[Number(opcionHora) - 1];

            if (!hora) {
                console.log(" Horario inválido");
                rl.close();
                return;
            }

            const cita = new CitaMedica(
                paciente,
                medico,
                especialidad,
                "2026-02-20",
                hora,
                EstadoCita.RESERVADA
            );

            Notificacion.enviar(cita);

            rl.close();
        });
    });
});