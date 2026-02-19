"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Paciente_1 = require("./Paciente");
const Especialidad_1 = require("./Especialidad");
const cardiologia = new Especialidad_1.Especialidad(1, "Cardiología");
const paciente1 = new Paciente_1.Paciente(1, "Juan Pérez", 25);
console.log(cardiologia);
console.log(paciente1.mostrarInformacion());
