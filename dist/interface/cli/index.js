"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const Paciente_1 = require("../../domain/Paciente");
const Especialidad_1 = require("../../domain/Especialidad");
const CitaMedica_1 = require("../../domain/CitaMedica");
const EstadoCita_1 = require("../../domain/EstadoCita");
const Notificacion_1 = require("../../application/Notificacion");
const Turno_1 = require("../../domain/Turno");
const GestorFecha_1 = require("../../application/GestorFecha");
const ListaMedicos_1 = require("../../infrastructure/ListaMedicos");
const GestorCancelacion_1 = require("../../application/GestorCancelacion");
const GestorReprogramacion_1 = require("../../application/GestorReprogramacion");
const GestorCitas_1 = require("../../application/GestorCitas");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const cancelar = (input) => {
    if (GestorCancelacion_1.GestorCancelacion.esCancelacion(input)) {
        GestorCancelacion_1.GestorCancelacion.cancelar();
        rl.close();
        return true;
    }
    return false;
};
const normalizar = (texto) => texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const especialidades = [
    new Especialidad_1.Especialidad("Cardiología"),
    new Especialidad_1.Especialidad("Dermatología"),
    new Especialidad_1.Especialidad("Pediatría"),
    new Especialidad_1.Especialidad("Neurología"),
    new Especialidad_1.Especialidad("Traumatología")
];
const medicinaGeneral = new Especialidad_1.Especialidad("Medicina General");
const medicos = ListaMedicos_1.ListaMedicos.obtener(especialidades, medicinaGeneral);
const diasDisponibles = GestorFecha_1.GestorFecha.obtenerDiasDisponibles();
if (diasDisponibles.length === 0) {
    console.log("\n No hay fecha configurada");
    process.exit(0);
}
if (!GestorFecha_1.GestorFecha.esDiaDeReserva()) {
    const fechaReserva = GestorFecha_1.GestorFecha.obtenerFechaReserva();
    console.log(`\n Las reservas solo se pueden realizar el día ${GestorFecha_1.GestorFecha.nombreDia(fechaReserva)}`);
    console.log(" Vuelva ese día para reservar su cita");
    process.exit(0);
}
//============= MENÚ PRINCIPAL =============
console.clear();
console.log("=== SISTEMA DE CITAS MÉDICAS ===\n");
console.log("1. Reservar cita");
console.log("2. Reprogramar cita");
console.log('(Escribe "cancelar" en cualquier momento para salir)\n');
rl.question("Seleccione opción: ", (opcion) => {
    if (cancelar(opcion))
        return;
    if (opcion === "1") {
        reservarCita();
    }
    else if (opcion === "2") {
        reprogramarCita();
    }
    else {
        console.log("\n Opción inválida");
        rl.close();
    }
});
//============= RESERVAR CITA =============
function reservarCita() {
    console.log("\n---- Reservar cita ----");
    rl.question("\nIngrese DNI del paciente: ", (dni) => {
        if (!/^\d{8}$/.test(dni)) {
            console.log("\n DNI inválido (debe tener 8 dígitos)");
            rl.close();
            return;
        }
        rl.question("Ingrese nombre del paciente: ", (nombre) => {
            if (!nombre.trim()) {
                console.log("\n El nombre no puede estar vacío");
                rl.close();
                return;
            }
            const paciente = new Paciente_1.Paciente(dni, nombre.trim());
            console.log("\n¿Qué tipo de consulta desea?");
            console.log("1. Medicina General");
            console.log("2. Especialidades\n");
            rl.question("Seleccione opción: ", (opcionConsulta) => {
                if (cancelar(opcionConsulta))
                    return;
                if (opcionConsulta.trim() !== "1" && opcionConsulta.trim() !== "2") {
                    console.log("\n Opción inválida");
                    rl.close();
                    return;
                }
                if (opcionConsulta.trim() === "1") {
                    // MEDICINA GENERAL
                    console.log("\nTurnos disponibles:");
                    console.log("1. Mañana");
                    console.log("2. Tarde\n");
                    rl.question("Seleccione turno: ", (opcionTurno) => {
                        if (cancelar(opcionTurno))
                            return;
                        if (opcionTurno.trim() !== "1" && opcionTurno.trim() !== "2") {
                            console.log("\n Turno inválido");
                            rl.close();
                            return;
                        }
                        const turnoSeleccionado = opcionTurno.trim() === "1" ? Turno_1.Turno.MAÑANA : Turno_1.Turno.TARDE;
                        const medicosMG = medicos.filter(med => med.especialidad.nombre === "Medicina General" &&
                            med.turno.nombre === turnoSeleccionado.nombre);
                        if (medicosMG.length === 0) {
                            console.log(`\n No hay médicos disponibles para Medicina General en el turno ${turnoSeleccionado.nombre}`);
                            rl.close();
                            return;
                        }
                        console.log(`\nMédicos disponibles (Medicina General - Turno ${turnoSeleccionado.nombre}):`);
                        medicosMG.forEach((med, i) => console.log(`${i + 1}. ${med.nombre}`));
                        const elegirMedicoMG = () => {
                            rl.question("Seleccione médico: ", (opcionMedico) => {
                                if (cancelar(opcionMedico))
                                    return;
                                const medicoAsignado = medicosMG[Number(opcionMedico) - 1];
                                if (!medicoAsignado) {
                                    console.log("\n Médico inválido, intente de nuevo:");
                                    medicosMG.forEach((med, i) => console.log(`${i + 1}. ${med.nombre}`));
                                    elegirMedicoMG();
                                    return;
                                }
                                console.log("\nDías disponibles:");
                                diasDisponibles.forEach((dia, i) => {
                                    console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`);
                                });
                                const elegirFechaMG = () => {
                                    rl.question("Seleccione día: ", (opcionDia) => {
                                        if (cancelar(opcionDia))
                                            return;
                                        const fecha = diasDisponibles[Number(opcionDia) - 1];
                                        if (!fecha) {
                                            console.log("\n Día inválido, intente de nuevo:");
                                            diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`));
                                            elegirFechaMG();
                                            return;
                                        }
                                        if (GestorCitas_1.GestorCitas.tieneCitaDuplicada(paciente.dni, medicoAsignado.nombre, fecha)) {
                                            console.log(`\n Ya tienes una cita con ${medicoAsignado.nombre} el ${GestorFecha_1.GestorFecha.nombreDia(fecha)}.`);
                                            console.log("Seleccione otro día:\n");
                                            diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`));
                                            elegirFechaMG();
                                            return;
                                        }
                                        const todosHorarios = medicoAsignado.horariosPorTurno(turnoSeleccionado);
                                        const ocupados = GestorCitas_1.GestorCitas.horariosOcupados(medicoAsignado.nombre, fecha);
                                        const disponibles = todosHorarios.filter(h => !ocupados.includes(h));
                                        if (disponibles.length === 0) {
                                            console.log(`\n No hay horarios disponibles para el ${GestorFecha_1.GestorFecha.nombreDia(fecha)}.`);
                                            console.log("Seleccione otro día:\n");
                                            diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`));
                                            elegirFechaMG();
                                            return;
                                        }
                                        const horaAsignada = disponibles[0];
                                        console.log(`\n Horario asignado automáticamente: ${horaAsignada}`);
                                        console.log("\n=== RESUMEN DE LA CITA ===");
                                        console.log(`Paciente:     ${paciente.nombre}`);
                                        console.log(`Doctor:       ${medicoAsignado.nombre}`);
                                        console.log(`Tipo:         Medicina General`);
                                        console.log(`Turno:        ${turnoSeleccionado.nombre}`);
                                        console.log(`Fecha:        ${GestorFecha_1.GestorFecha.nombreDia(fecha)} ${fecha}`);
                                        console.log(`Hora:         ${horaAsignada}`);
                                        rl.question("\n¿Confirma la cita? (si/no): ", (respuesta) => {
                                            if (cancelar(respuesta))
                                                return;
                                            if (normalizar(respuesta.trim()) === "si") {
                                                const cita = new CitaMedica_1.CitaMedica(paciente, medicoAsignado, fecha, horaAsignada, EstadoCita_1.EstadoCita.PROGRAMADA, turnoSeleccionado.nombre);
                                                Notificacion_1.Notificacion.enviar(cita);
                                            }
                                            else {
                                                console.log("\n Cita cancelada.");
                                            }
                                            rl.close();
                                        });
                                    });
                                };
                                elegirFechaMG();
                            });
                        };
                        elegirMedicoMG();
                    });
                }
                else {
                    // ESPECIALIDADES
                    console.log("\nEspecialidades disponibles:");
                    especialidades.forEach((esp) => console.log(`- ${esp.nombre}`));
                    rl.question("Ingrese la especialidad: ", (nombreEsp) => {
                        const especialidad = especialidades.find((esp) => normalizar(esp.nombre) === normalizar(nombreEsp.trim()));
                        if (!especialidad) {
                            console.log("\n Especialidad no encontrada");
                            rl.close();
                            return;
                        }
                        console.log("\nTurnos disponibles:");
                        console.log("1. Mañana");
                        console.log("2. Tarde\n");
                        rl.question("Seleccione turno: ", (opcionTurno) => {
                            if (cancelar(opcionTurno))
                                return;
                            if (opcionTurno.trim() !== "1" && opcionTurno.trim() !== "2") {
                                console.log("\n Turno inválido");
                                rl.close();
                                return;
                            }
                            const turnoSeleccionado = opcionTurno.trim() === "1" ? Turno_1.Turno.MAÑANA : Turno_1.Turno.TARDE;
                            const medicosDisponibles = medicos.filter((med) => normalizar(med.especialidad.nombre) === normalizar(especialidad.nombre) &&
                                med.turno.nombre === turnoSeleccionado.nombre);
                            if (medicosDisponibles.length === 0) {
                                console.log(`\n No hay médicos disponibles para ${especialidad.nombre} en el turno ${turnoSeleccionado.nombre}`);
                                rl.close();
                                return;
                            }
                            console.log(`\nMédicos disponibles (${especialidad.nombre} - Turno ${turnoSeleccionado.nombre}):`);
                            medicosDisponibles.forEach((med, i) => console.log(`${i + 1}. ${med.nombre}`));
                            const elegirMedico = () => {
                                rl.question("Seleccione médico: ", (opcionMedico) => {
                                    if (cancelar(opcionMedico))
                                        return;
                                    const medico = medicosDisponibles[Number(opcionMedico) - 1];
                                    if (!medico) {
                                        console.log("\n Médico inválido, intente de nuevo:");
                                        medicosDisponibles.forEach((med, i) => console.log(`${i + 1}. ${med.nombre}`));
                                        elegirMedico();
                                        return;
                                    }
                                    console.log("\nDías disponibles:");
                                    diasDisponibles.forEach((dia, i) => {
                                        console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`);
                                    });
                                    const elegirFecha = () => {
                                        rl.question("Seleccione día: ", (opcionDia) => {
                                            if (cancelar(opcionDia))
                                                return;
                                            const fecha = diasDisponibles[Number(opcionDia) - 1];
                                            if (!fecha) {
                                                console.log("\n Día inválido, intente de nuevo:");
                                                diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`));
                                                elegirFecha();
                                                return;
                                            }
                                            if (GestorCitas_1.GestorCitas.tieneCitaDuplicada(paciente.dni, medico.nombre, fecha)) {
                                                console.log(`\n Ya tienes una cita con ${medico.nombre} el ${GestorFecha_1.GestorFecha.nombreDia(fecha)}.`);
                                                console.log("Seleccione otro día:\n");
                                                diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`));
                                                elegirFecha();
                                                return;
                                            }
                                            const todosHorarios = medico.horariosPorTurno(turnoSeleccionado);
                                            const ocupados = GestorCitas_1.GestorCitas.horariosOcupados(medico.nombre, fecha);
                                            const horariosFiltrados = todosHorarios.filter(h => !ocupados.includes(h));
                                            if (horariosFiltrados.length === 0) {
                                                console.log(`\n No hay horarios disponibles para el ${GestorFecha_1.GestorFecha.nombreDia(fecha)}.`);
                                                console.log("Seleccione otro día:\n");
                                                diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`));
                                                elegirFecha();
                                                return;
                                            }
                                            const hora = horariosFiltrados[0];
                                            console.log(`\n Horario asignado automáticamente: ${hora}`);
                                            console.log("\n=== RESUMEN DE LA CITA ===");
                                            console.log(`Paciente:     ${paciente.nombre}`);
                                            console.log(`Doctor:       ${medico.nombre}`);
                                            console.log(`Especialidad: ${especialidad.nombre}`);
                                            console.log(`Turno:        ${turnoSeleccionado.nombre}`);
                                            console.log(`Fecha:        ${GestorFecha_1.GestorFecha.nombreDia(fecha)} ${fecha}`);
                                            console.log(`Hora:         ${hora}`);
                                            rl.question("\n¿Confirma la cita? (si/no): ", (respuesta) => {
                                                if (cancelar(respuesta))
                                                    return;
                                                if (normalizar(respuesta.trim()) === "si") {
                                                    const cita = new CitaMedica_1.CitaMedica(paciente, medico, fecha, hora, EstadoCita_1.EstadoCita.PROGRAMADA, turnoSeleccionado.nombre);
                                                    Notificacion_1.Notificacion.enviar(cita);
                                                }
                                                else {
                                                    console.log("\n Cita cancelada.");
                                                }
                                                rl.close();
                                            });
                                        });
                                    };
                                    elegirFecha();
                                });
                            };
                            elegirMedico();
                        });
                    });
                }
            });
        });
    });
}
//============= REPROGRAMAR CITA =============
function reprogramarCita() {
    console.log("\n---- Reprogramar cita ----");
    rl.question("\nIngrese su DNI: ", (dni) => {
        if (cancelar(dni))
            return;
        if (!/^\d{8}$/.test(dni)) {
            console.log("\n DNI inválido (debe tener 8 dígitos)");
            rl.close();
            return;
        }
        const resultado = GestorReprogramacion_1.GestorReprogramacion.buscarCita(dni);
        if (!resultado) {
            console.log("\n No se encontró ninguna cita con ese DNI.");
            rl.close();
            return;
        }
        const linea = resultado.linea;
        const pacienteMatch = linea.match(/Paciente: ([^|]+)\|/);
        const doctorMatch = linea.match(/Doctor: ([^|]+)\|/);
        const especialidadMatch = linea.match(/Especialidad: ([^|]+)\|/);
        const turnoMatch = linea.match(/Turno: ([^|]+)\|/);
        const fechaMatch = linea.match(/Fecha: (\S+)/);
        const horaMatch = linea.match(/Hora: (\d{2}:\d{2})/);
        const estadoMatch = linea.match(/Estado: (\S+)/);
        const fechaCita = fechaMatch ? fechaMatch[1] : "";
        console.log("\n Cita encontrada:");
        console.log(`Paciente:     ${pacienteMatch ? pacienteMatch[1].trim() : "?"}`);
        console.log(`Doctor:       ${doctorMatch ? doctorMatch[1].trim() : "?"}`);
        console.log(`Especialidad: ${especialidadMatch ? especialidadMatch[1].trim() : "?"}`);
        console.log(`Turno:        ${turnoMatch ? turnoMatch[1].trim() : "?"}`);
        console.log(`Fecha:        ${fechaCita ? GestorFecha_1.GestorFecha.nombreDia(fechaCita) + " " + fechaCita : "?"}`);
        console.log(`Hora:         ${horaMatch ? horaMatch[1] : "?"}`);
        console.log(`Estado:       ${estadoMatch ? estadoMatch[1] : "?"}`);
        const datos = GestorCitas_1.GestorCitas.obtenerDatosCita(dni);
        if (!datos) {
            console.log("\n No se pudieron obtener los datos de la cita.");
            rl.close();
            return;
        }
        const turnoSeleccionado = datos.turno === "Mañana" ? Turno_1.Turno.MAÑANA : Turno_1.Turno.TARDE;
        const medicoEncontrado = medicos.find(m => m.nombre === datos.doctor);
        if (!medicoEncontrado) {
            console.log("\n No se encontró el médico de la cita.");
            rl.close();
            return;
        }
        console.log("\nDías disponibles:");
        diasDisponibles.forEach((dia, i) => {
            console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`);
        });
        const elegirNuevaFecha = () => {
            rl.question("\nSeleccione nuevo día: ", (opcionDia) => {
                if (cancelar(opcionDia))
                    return;
                const nuevaFecha = diasDisponibles[Number(opcionDia) - 1];
                if (!nuevaFecha) {
                    console.log("\n Día inválido, intente de nuevo:");
                    diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`));
                    elegirNuevaFecha();
                    return;
                }
                const todosHorarios = medicoEncontrado.horariosPorTurno(turnoSeleccionado);
                const ocupados = GestorCitas_1.GestorCitas.horariosOcupados(medicoEncontrado.nombre, nuevaFecha);
                const disponibles = todosHorarios.filter(h => !ocupados.includes(h));
                const nuevaHora = disponibles[0];
                if (GestorCitas_1.GestorCitas.tieneCitaDuplicada(dni, medicoEncontrado.nombre, nuevaFecha)) {
                    console.log(`\n Ya tienes una cita con ${medicoEncontrado.nombre} el ${GestorFecha_1.GestorFecha.nombreDia(nuevaFecha)}.`);
                    console.log("Seleccione otro día:\n");
                    diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`));
                    elegirNuevaFecha();
                    return;
                }
                if (disponibles.length === 0) {
                    console.log(`\n No hay horarios disponibles para el ${GestorFecha_1.GestorFecha.nombreDia(nuevaFecha)}.`);
                    console.log("Seleccione otro día:\n");
                    diasDisponibles.forEach((dia, i) => console.log(`${i + 1}. ${GestorFecha_1.GestorFecha.nombreDia(dia)} ${dia}`));
                    elegirNuevaFecha();
                    return;
                }
                console.log(`\n Horario asignado automáticamente: ${nuevaHora}`);
                console.log("\n=== RESUMEN DE REPROGRAMACIÓN ===");
                console.log(`Doctor:      ${medicoEncontrado.nombre}`);
                console.log(`Nueva fecha: ${GestorFecha_1.GestorFecha.nombreDia(nuevaFecha)} ${nuevaFecha}`);
                console.log(`Nueva hora:  ${nuevaHora}`);
                rl.question("\n¿Confirma la reprogramación? (si/no): ", (respuesta) => {
                    if (cancelar(respuesta))
                        return;
                    if (respuesta.trim().toLowerCase() === "si") {
                        const exito = GestorReprogramacion_1.GestorReprogramacion.reprogramar(dni, nuevaFecha, nuevaHora);
                        if (exito) {
                            console.log("\n Cita reprogramada correctamente.");
                        }
                        else {
                            console.log("\n No se pudo reprogramar la cita.");
                        }
                    }
                    else {
                        console.log("\n Reprogramación cancelada.");
                    }
                    rl.close();
                });
            });
        };
        elegirNuevaFecha();
    });
}
//# sourceMappingURL=index.js.map