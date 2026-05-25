import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '@shared/infrastructure/supabase/client';
import { useAuthStore } from '@features/auth/presentation/store/authStore';
import { SupabaseAuthRepository } from '@features/auth/infrastructure/repositories/SupabaseAuthRepository';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } }
});
const authRepo = new SupabaseAuthRepository();

function AuthGuard() {
  const { user, setUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Siempre empezar en login, sin restaurar sesión
    setUser(null);
    setIsReady(true);

    // Escuchar cambios de sesión (login/logout en tiempo real)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const u = await authRepo.getCurrentUser();
          setUser(u);
        } else {
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/(auth)/login');
    if (user  && inAuth)  router.replace('/(app)');
  }, [user, segments, isReady]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}