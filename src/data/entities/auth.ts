// src/data/entities/auth.ts
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  // Viene de app_metadata.role (solo editable con service_role)
  is_admin: boolean;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}
