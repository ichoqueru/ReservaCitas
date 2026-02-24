import * as readline from "readline";
import { Paciente } from "./Paciente";
import { Medico } from "./Medico";
import { Especialidad } from "./Especialidad";
import { CitaMedica } from "./CitaMedica";
import { EstadoCita } from "./EstadoCita";
import { Notificacion } from "./Notificacion";
import { Turno } from "./Turno";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const cancelar = (input: string): boolean => {
  if (input.trim().toLowerCase() === "cancelar") {
    console.log("\n Proceso cancelado por el usuario.");
    rl.close();
    return true;
  }
  return false;
};

const normalizar = (texto: string) =>
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ===== Especialidades disponibles =====
const especialidades = [
  new Especialidad("Cardiología"),
  new Especialidad("Dermatología"),
  new Especialidad("Pediatría"),
  new Especialidad("Neurología"),
  new Especialidad("Traumatología")
];

//MEDICOS
const medicos = [
  // Cardiología
  new Medico(1,  "Dr. Juan Pérez",      especialidades[0]!, ["08:00", "09:00", "10:00", "14:00", "15:00"]),
  new Medico(2,  "Dra. Ana Torres",     especialidades[0]!, ["09:00", "11:00", "13:00", "16:00"]),
  // Dermatología
  new Medico(3,  "Dra. María López",    especialidades[1]!, ["08:00", "10:00", "11:00", "15:00"]),
  new Medico(4,  "Dr. Pedro Salas",     especialidades[1]!, ["09:00", "10:00", "14:00", "17:00"]),
  // Pediatría
  new Medico(5,  "Dr. Carlos Ruiz",     especialidades[2]!, ["08:00", "10:00", "14:00", "16:00"]),
  new Medico(6,  "Dra. Lucía Mendoza",  especialidades[2]!, ["09:00", "11:00", "13:00", "15:00"]),
  // Neurología
  new Medico(7,  "Dr. Liam Sanchez",    especialidades[3]!, ["09:00", "11:00", "14:00", "17:00"]),
  new Medico(8,  "Dra. Sofia Quispe",   especialidades[3]!, ["08:00", "10:00", "15:00", "16:00"]),
  // Traumatología
  new Medico(9,  "Dr. Adrian Apaza",    especialidades[4]!, ["10:00", "11:00", "15:00", "16:00"]),
  new Medico(10, "Dra. Valeria Cruz",   especialidades[4]!, ["08:00", "09:00", "13:00", "17:00"]),
];


console.clear();
console.log("=== SISTEMA DE CITAS MÉDICAS ===\n");

//  PRIMERO DNI
rl.question("Ingrese DNI del paciente: ", (dni) => {

  if (!/^\d{8}$/.test(dni)) {
    console.log("\n DNI inválido (debe tener 8 dígitos)");
    rl.close();
    return;
  }

  //  LUEGO NOMBRE
  rl.question("Ingrese nombre del paciente: ", (nombre) => {

    if (!nombre.trim()) {
      console.log("\n El nombre no puede estar vacío");
      rl.close();
      return;
    }

    const paciente = new Paciente(dni, nombre.trim());

    //ESPECIALIDAD
    console.log("\nEspecialidades disponibles:");
    especialidades.forEach((esp) => {
      console.log(`- ${esp.nombre}`);
    });

    rl.question("Ingrese la especialidad: ", (nombreEsp) => {
      const especialidad = especialidades.find(
        (esp) => normalizar(esp.nombre) === normalizar(nombreEsp.trim())
      );

    if (!especialidad) {
      console.log("\n Especialidad no encontrada");
      rl.close();
      return;
    }

    // TURNO
    console.log("\nTurnos disponibles:");
    console.log("1. Mañana");
    console.log("2. Tarde");
    console.log('(Escribe "cancelar" en cualquier momento para salir)\n');

    rl.question("Seleccione turno: ", (opcionTurno) => {
      if (cancelar(opcionTurno)) return;

      const turno = opcionTurno.trim();

      if (turno !== "1" && turno !== "2") {
        console.log("\n Turno inválido");
        rl.close();
        return;
      }

      const turnoSeleccionado = turno === "1" ? Turno.MAÑANA : Turno.TARDE;
      
      // MÉDICOS disponibles para esa especialidad y turno
      const medicosDisponibles = medicos.filter(
        (med) =>
          normalizar(med.especialidad.nombre) === normalizar(especialidad.nombre) &&
          med.horariosPorTurno(turnoSeleccionado).length > 0
      );

      if (medicosDisponibles.length === 0) {
        console.log(`\n No hay médicos disponibles para ${especialidad.nombre} en el turno ${turnoSeleccionado.nombre}`);
        rl.close();
        return;
      }

      console.log(`\nMédicos disponibles (${especialidad.nombre} - Turno ${turnoSeleccionado.nombre}):`);
      medicosDisponibles.forEach((med, i) => {
        console.log(`${i + 1}. ${med.nombre}`);
      });

      rl.question("Seleccione médico: ", (opcionMedico) => {
        if (cancelar(opcionMedico)) return;

        const indexMedico = Number(opcionMedico) - 1;
        const medico = medicosDisponibles[indexMedico];

        if (!medico) {
          console.log("\n Médico inválido");
          rl.close();
          return;
        }

    //HORARIOS          
    const horariosFiltrados = medico.horariosPorTurno(turnoSeleccionado);

    console.log(`\nHorarios disponibles (Turno ${turnoSeleccionado.nombre}):`);
    horariosFiltrados.forEach((hora, i) => {
      console.log(`${i + 1}. ${hora}`);
    });

    rl.question("Seleccione horario: ", (opcionHora) => {
      if (cancelar(opcionHora)) return;

      const indexHora = Number(opcionHora) - 1;
      const hora = horariosFiltrados[indexHora];

      if (!hora) {
         console.log("\n Horario inválido");
         rl.close();
         return;
      }

      //VALIDAR LA CITA

      console.log("\n=== RESUMEN DE LA CITA ===");
      console.log(`Paciente:     ${paciente.nombre}`);
      console.log(`Doctor:       ${medico.nombre}`);
      console.log(`Especialidad: ${especialidad.nombre}`);
      console.log(`Turno:        ${turnoSeleccionado.nombre}`);
      console.log(`Fecha:        2026-02-20`);
      console.log(`Hora:         ${hora}`);

      rl.question("\n¿Confirma la cita? (si/no): ", (respuesta) => {
        if (cancelar(respuesta)) return;


        //CITA
      
        if (normalizar(respuesta.trim()) === "si") {
          const cita = new CitaMedica(
            paciente,
            medico,
            "2026-02-20",
            hora,
            EstadoCita.PROGRAMADA
          );
          Notificacion.enviar(cita);
        
        } else {
          const cita = new CitaMedica(
            paciente,
            medico,
            "2026-02-20",
            hora,
            EstadoCita.CANCELADA
          );
          console.log("\n Cita cancelada.");
          console.log(`Estado: ${cita.estado}`);
        }

        rl.close();
            });
          });
        });
      });
    });
  });
});