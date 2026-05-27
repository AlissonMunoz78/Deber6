import { User } from "../entities/User";

export interface IAuthRepository {
  login(email: string, password: string): Promise<User>;
  register(
    email: string,
    password: string,
    username: string,
    role: "vendedor" | "cliente",
  ): Promise<User>;
  resetPassword(email: string, redirectTo: string): Promise<void>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
