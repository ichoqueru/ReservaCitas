import { Paciente } from "./Paciente";
import { Especialidad } from "./Especialidad";

const cardiologia = new Especialidad(1, "Cardiología");

const paciente1 = new Paciente(1, "Juan Pérez", 25);

console.log(cardiologia);
console.log(paciente1.mostrarInformacion());
