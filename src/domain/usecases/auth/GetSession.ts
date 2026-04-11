// src/domain/usecases/auth/GetSession.ts
import type { AuthRepository } from '@/domain/repositories/auth/AuthRepository';
import type { Session } from '@/data/entities/auth';

export class GetSessionUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<Session | null> {
    return this.authRepository.getSession();
  }
}
