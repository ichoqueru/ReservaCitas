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

const cancelar = (input: string): boolean => {
  if (input.trim().toLowerCase() === "cancelar") {
    console.log("\n Proceso cancelado por el usuario.");
    rl.close();
    return true;
  }
  return false;
};

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
  new Medico(1, "Dr. Juan Pérez", especialidades[0]!, ["08:00", "09:00", "10:00"]),
  new Medico(2, "Dra. María López", especialidades[1]!, ["11:00", "12:00"]),
  new Medico(3, "Dr. Carlos Ruiz", especialidades[2]!, ["14:00", "15:00", "16:00"]),
  new Medico(4, "Dr. Liam Sanchez", especialidades[3]!, ["9:30", "11:00", "14:00"]),
  new Medico(5, "Dr. Adrian Apaza", especialidades[4]!, ["10:00", "12:00", "15:00"]),
];


const normalizar = (texto: string) =>
  texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");


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

     //PARTE DE ESPECIALIDAD PERO TRATA DE MEDICO
    const medico = medicos.find(
      (med) => med.especialidad.nombre.toLowerCase() === especialidad.nombre.toLowerCase()
    );

    if (!medico) {
      console.log("\n No hay médico disponible para esa especialidad");
      rl.close();
      return;
    }

    console.log(`\nMédico asignado: ${medico.nombre}`);
      
      
    //HORARIOS 
      console.log("\nHorarios disponibles:");
      medico.horarios.forEach((hora, i) => {
        console.log(`${i + 1}. ${hora}`);
      });

      console.log('(Escribe "cancelar" en cualquier momento para salir)\n');

      rl.question("Seleccione horario: ", (opcionHora) => {
        if (cancelar(opcionHora)) return;

        const indexHora = Number(opcionHora) - 1;
        const hora = medico.horarios[indexHora];

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