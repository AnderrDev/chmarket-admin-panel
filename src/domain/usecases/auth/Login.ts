// src/domain/usecases/auth/Login.ts
import type {
  AuthRepository,
  Session,
} from '@/domain/repositories/auth/AuthRepository';

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<Session> {
    return this.authRepository.login(email, password);
  }
}
