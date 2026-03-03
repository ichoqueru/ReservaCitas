export declare class GestorCitas {
    static inicializar(): void;
    static guardarCita(especialidad: string, contenido: string): void;
    static horariosOcupados(nombreDoctor: string, fecha: string): string[];
    static buscarCitaPorDNI(dni: string): {
        linea: string;
        archivo: string;
    } | null;
    static obtenerDatosCita(dni: string): {
        doctor: string;
        turno: string;
    } | null;
    static reprogramarCita(dni: string, nuevaFecha: string, nuevaHora: string): boolean;
    static cancelarCita(dni: string): boolean;
    static tieneCitaDuplicada(dni: string, nombreDoctor: string, fecha: string): boolean;
    static verCitasDelDia(fecha: string): void;
    static reiniciar(): void;
}
//# sourceMappingURL=GestorCitas.d.ts.map