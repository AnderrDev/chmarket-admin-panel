// src/data/datasources/AuthDataSource.ts
import { supabase } from '@/lib/supabase';
import type { Session } from '@/data/entities/auth';

export interface AuthDataSource {
  login(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
  refreshSession(): Promise<Session | null>;
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): () => void;
}

export class SupabaseAuthDataSource implements AuthDataSource {
  async login(email: string, password: string): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session || !data.user) {
      throw new Error('No se pudo iniciar sesión');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: {
        id: data.user.id,
        email: data.user.email || '',
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at,
      },
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session || !data.session.user) {
      return null;
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: {
        id: data.session.user.id,
        email: data.session.user.email || '',
        created_at: data.session.user.created_at,
        updated_at:
          data.session.user.updated_at || data.session.user.created_at,
      },
    };
  }

  async refreshSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session || !data.session.user) {
      return null;
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: {
        id: data.session.user.id,
        email: data.session.user.email || '',
        created_at: data.session.user.created_at,
        updated_at:
          data.session.user.updated_at || data.session.user.created_at,
      },
    };
  }

  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authSession = session
        ? {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_in: session.expires_in,
            token_type: session.token_type,
            user: {
              id: session.user.id,
              email: session.user.email || '',
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            },
          }
        : null;

      callback(event, authSession);
    });

    return () => subscription.unsubscribe();
  }
}
