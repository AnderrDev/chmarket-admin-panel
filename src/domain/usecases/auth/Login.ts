// src/domain/usecases/auth/Login.ts
import type { AuthRepository } from '@/domain/repositories/auth/AuthRepository';
import type { Session } from '@/data/entities/auth';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<Session> {
    return this.authRepository.login(email, password);
  }
}
