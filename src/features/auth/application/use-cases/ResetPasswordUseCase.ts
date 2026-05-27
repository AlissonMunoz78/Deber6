import { AuthError } from "../../../../shared/domain/errors/AppError";
import { IAuthRepository } from "../../domain/repositories/IAuthRepository";

export class ResetPasswordUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, redirectTo: string): Promise<void> {
    if (!email) {
      throw new AuthError("El email es requerido");
    }

    if (!email.includes("@")) {
      throw new AuthError("Ingresa un email valido");
    }

    if (!redirectTo) {
      throw new AuthError("La URL de redireccion es requerida");
    }

    try {
      await this.authRepo.resetPassword(email, redirectTo);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo enviar el correo de recuperacion";
      throw new AuthError(message, error);
    }
  }
}
