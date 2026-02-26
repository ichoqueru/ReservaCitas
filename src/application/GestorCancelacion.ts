export class GestorCancelacion {
    static cancelar(): void {
        console.log("\n Proceso cancelado por el usuario");
    }

    static esCancelacion(input: string): boolean {
        return input.trim().toLowerCase() === "cancelar";
    }
}