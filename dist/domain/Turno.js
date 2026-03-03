"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Turno = void 0;
class Turno {
    nombre;
    horaInicio;
    horaFin;
    static MAÑANA = new Turno("Mañana", 7, 12);
    static TARDE = new Turno("Tarde", 12, 19);
    constructor(nombre, horaInicio, horaFin) {
        this.nombre = nombre;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
    }
    contiene(hora) {
        const hh = parseInt(hora.split(":")[0]);
        return hh >= this.horaInicio && hh <= this.horaFin;
    }
    generarHorarios() {
        const horarios = [];
        let horas = this.horaInicio;
        let minutos = 0;
        while (horas < this.horaFin) {
            const h = String(horas).padStart(2, "0");
            const m = String(minutos).padStart(2, "0");
            horarios.push(`${h}:${m}`);
            minutos += 20;
            if (minutos >= 60) {
                minutos -= 60;
                horas++;
            }
        }
        return horarios;
    }
}
exports.Turno = Turno;
//# sourceMappingURL=Turno.js.map