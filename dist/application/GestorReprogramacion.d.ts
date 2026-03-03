export declare class GestorReprogramacion {
    static reprogramar(dni: string, nuevaFecha: string, nuevaHora: string): boolean;
    static buscarCita(dni: string): {
        linea: string;
        archivo: string;
    } | null;
}
//# sourceMappingURL=GestorReprogramacion.d.ts.map