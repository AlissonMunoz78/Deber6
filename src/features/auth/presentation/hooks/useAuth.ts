import { useMutation } from "@tanstack/react-query";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase";
import { RegisterUseCase } from "../../application/use-cases/RegisterUseCase";
import { ResetPasswordUseCase } from "../../application/use-cases/ResetPasswordUseCase";
import { SupabaseAuthRepository } from "../../infrastructure/repositories/SupabaseAuthRepository";
import { useAuthStore } from "../store/authStore";

const authRepo = new SupabaseAuthRepository();
const loginUseCase = new LoginUseCase(authRepo);
const resetPasswordUseCase = new ResetPasswordUseCase(authRepo);
const registerUseCase = new RegisterUseCase(authRepo);

export function useAuth() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginUseCase.execute(email, password),
    onSuccess: (u) => {
      setUser(u);
      router.replace("/(app)");
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({
      email,
      password,
      username,
      role,
    }: {
      email: string;
      password: string;
      username: string;
      role: "vendedor" | "cliente";
    }) => registerUseCase.execute(email, password, username, role),
    onSuccess: (u) => {
      setUser(u);
      router.replace("/(app)");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => {
      const redirectTo = makeRedirectUri({
        scheme: "michatapp",
        path: "auth/callback",
      });
      return resetPasswordUseCase.execute(email, redirectTo);
    },
  });

  const logout = async () => {
    try {
      await authRepo.logout();
    } finally {
      setUser(null);
      router.replace("/(auth)/login");
    }
  };

  return {
    user,
    login: loginMutation.mutate,
    resetPassword: resetPasswordMutation.mutateAsync,
    register: registerMutation.mutate,
    logout,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    error:
      loginMutation.error?.message ?? registerMutation.error?.message ?? null,
    resetPasswordError: resetPasswordMutation.error?.message ?? null,
  };
}
