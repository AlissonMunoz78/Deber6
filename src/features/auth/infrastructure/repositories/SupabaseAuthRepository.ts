import { supabase } from '../../../../shared/infrastructure/supabase/client';
import { User } from '../../domain/entities/User';
import { IAuthRepository } from '../../domain/repositories/IAuthRepository';

export class SupabaseAuthRepository implements IAuthRepository {

  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw error ?? new Error('Error al iniciar sesión');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, avatar_url, role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('No se pudo obtener el perfil del usuario');
    }

    return {
      id:        data.user.id,
      email:     data.user.email!,
      username:  profile.username,
      role:      profile.role as 'cliente' | 'vendedor',
      avatarUrl: profile.avatar_url ?? undefined,
    };
  }

  async register(
    email: string,
    password: string,
    username: string,
    role: 'vendedor' | 'cliente'
  ): Promise<User> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('No se pudo crear el usuario');

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        username,
        role,
      });

    if (profileError) throw new Error(profileError.message);

    return {
      id:       data.user.id,
      email:    data.user.email!,
      username,
      role,
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, avatar_url, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) return null;

    return {
      id:       user.id,
      email:    user.email!,
      username: profile.username,
      role:     profile.role as 'cliente' | 'vendedor',
      avatarUrl: profile.avatar_url ?? undefined,
    };
  }
}