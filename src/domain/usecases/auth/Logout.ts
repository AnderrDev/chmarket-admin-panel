// src/domain/usecases/auth/Logout.ts
import type { AuthRepository } from '@/domain/repositories/auth/AuthRepository';

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    return this.authRepository.logout();
  }
}
