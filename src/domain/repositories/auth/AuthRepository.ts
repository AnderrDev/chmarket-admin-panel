// src/domain/repositories/auth/AuthRepository.ts
import type { Session } from '@/data/entities/auth';

export interface AuthRepository {
  login(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
  refreshSession(): Promise<Session | null>;
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): () => void;
}
