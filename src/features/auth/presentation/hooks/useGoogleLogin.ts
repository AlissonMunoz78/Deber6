import { SESSION_QUERY_KEY } from "@features/session/model/useSession";
import { supabase } from "@shared/infrastructure/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { SupabaseAuthRepository } from "../../infrastructure/repositories/SupabaseAuthRepository";
import { useAuthStore } from "../store/authStore";

WebBrowser.maybeCompleteAuthSession();

const authRepo = new SupabaseAuthRepository();

export const useGoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser } = useAuthStore();

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const redirectTo = makeRedirectUri({
        scheme: "michatapp",
        path: "auth/callback",
      });

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          flowType: "pkce",
        } as any,
      });

      if (signInError) throw signInError;
      if (!data.url) throw new Error("No se pudo iniciar el flujo de Google");

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );

      if (result.type !== "success") {
        throw new Error("Inicio de sesión con Google cancelado");
      }

      console.log("Google OAuth result.url:", result.url);
      const url = new URL(result.url);
      const code = url.searchParams.get("code");
      console.log("Google OAuth code:", code);

      if (!code) {
        throw new Error("No se recibió code");
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(code);

      console.log("Google OAuth sessionData:", sessionData);

      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        throw new Error("No se pudo crear la sesión");
      }

      queryClient.setQueryData(SESSION_QUERY_KEY, sessionData.session);

      const currentUser = await authRepo.getCurrentUser();
      const fallbackUser = sessionData.session.user;
      const user = currentUser ?? {
        id: fallbackUser.id,
        email: fallbackUser.email ?? "",
        username:
          fallbackUser.email?.split("@")[0] ??
          fallbackUser.user_metadata?.full_name ??
          "usuario",
        role: "cliente" as const,
        avatarUrl: fallbackUser.user_metadata?.avatar_url ?? undefined,
      };

      if (!currentUser && fallbackUser.email) {
        await supabase.from("profiles").upsert({
          id: fallbackUser.id,
          username: user.username,
          role: user.role,
          avatar_url: user.avatarUrl,
        });
      }

      setUser(user);
      router.replace("/home" as never);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Error inesperado con Google";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { loginWithGoogle, loading, error };
};
