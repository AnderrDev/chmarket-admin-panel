// src/data/repositories/AuthRepositoryImpl.ts
import type { AuthRepository } from '@/domain/repositories/auth/AuthRepository';
import type { Session } from '@/data/entities/auth';
import type { AuthDataSource } from '@/data/datasources/AuthDataSource';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly dataSource: AuthDataSource) {}

  async login(email: string, password: string): Promise<Session> {
    return this.dataSource.login(email, password);
  }

  async logout(): Promise<void> {
    return this.dataSource.logout();
  }

  async getSession(): Promise<Session | null> {
    return this.dataSource.getSession();
  }

  async refreshSession(): Promise<Session | null> {
    return this.dataSource.refreshSession();
  }

  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): () => void {
    return this.dataSource.onAuthStateChange(callback);
  }
}
