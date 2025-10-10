// src/domain/usecases/auth/GetSession.ts
import type {
  AuthRepository,
  Session,
} from '@/domain/repositories/auth/AuthRepository';

export class GetSessionUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<Session | null> {
    return this.authRepository.getSession();
  }
}
