// src/presentation/viewmodels/AuthViewModel.ts
import { useState, useCallback, useEffect } from 'react';
import type { Session, User } from '@/data/entities/auth';
import type { NotificationService } from '@/application/services/NotificationService';
import { LoginUseCase } from '@/domain/usecases/auth/Login';
import { LogoutUseCase } from '@/domain/usecases/auth/Logout';
import { GetSessionUseCase } from '@/domain/usecases/auth/GetSession';
import type { AuthRepository } from '@/domain/repositories/auth/AuthRepository';

export class AuthViewModel {
  private user: User | null = null;
  private session: Session | null = null;
  private loading = true; // Iniciar como true para verificar sesión
  private error: string | null = null;
  private listeners: (() => void)[] = [];

  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getSessionUseCase: GetSessionUseCase,
    private readonly authRepository: AuthRepository,
    private readonly notificationService: NotificationService
  ) {}

  // Getters
  getUser(): User | null {
    return this.user;
  }

  getSession(): Session | null {
    return this.session;
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }

  isLoading(): boolean {
    return this.loading;
  }

  getError(): string | null {
    return this.error;
  }

  // Métodos para manejar listeners
  addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Actions
  async login(
    email: string,
    password: string
  ): Promise<{ error: string | null }> {
    try {
      this.loading = true;
      this.error = null;

      this.session = await this.loginUseCase.execute(email, password);
      this.user = this.session?.user || null;
      this.notificationService.success('Inicio de sesión exitoso');
      this.notifyListeners();
      return { error: null };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al iniciar sesión';
      this.error = message;
      this.notificationService.error(message);
      this.notifyListeners();
      return { error: message };
    } finally {
      this.loading = false;
    }
  }

  async logout(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      await this.logoutUseCase.execute();
      this.session = null;
      this.user = null;
      this.notificationService.success('Sesión cerrada exitosamente');
      this.notifyListeners();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cerrar sesión';
      this.error = message;
      this.notificationService.error(message);
      throw err;
    } finally {
      this.loading = false;
    }
  }

  async checkSession(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      this.session = await this.getSessionUseCase.execute();
      this.user = this.session?.user || null;
      this.notifyListeners();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al verificar sesión';
      this.error = message;
      // No mostrar error de notificación en la verificación inicial
      console.log('Session check failed:', message);
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  // Inicializar listener de Supabase Auth
  initializeAuth(): () => void {
    // Verificar sesión existente al inicializar
    this.checkSession()
      .then(() => {
        console.log('Initial session check completed');
      })
      .catch(error => {
        console.log('Initial session check failed:', error);
        // Si falla la verificación inicial, no es un error crítico
        this.loading = false;
        this.notifyListeners();
      });

    return this.authRepository.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        this.session = session;
        this.user = session?.user || null;
        this.loading = false;
        this.notifyListeners();
      } else if (event === 'SIGNED_OUT') {
        this.session = null;
        this.user = null;
        this.loading = false;
        this.notifyListeners();
      }
    });
  }
}

// Hook factory for React integration
export function useAuthViewModel(viewModel: AuthViewModel) {
  const [user, setUser] = useState<User | null>(viewModel.getUser());
  const [session, setSession] = useState<Session | null>(
    viewModel.getSession()
  );
  const [loading, setLoading] = useState<boolean>(viewModel.isLoading());
  const [error, setError] = useState<string | null>(viewModel.getError());

  // Inicializar listener de Supabase Auth
  useEffect(() => {
    const unsubscribe = viewModel.initializeAuth();
    return unsubscribe;
  }, [viewModel]);

  // Listener para cambios en el ViewModel
  useEffect(() => {
    const listener = () => {
      setUser(viewModel.getUser());
      setSession(viewModel.getSession());
      setLoading(viewModel.isLoading());
      setError(viewModel.getError());
    };

    viewModel.addListener(listener);
    return () => viewModel.removeListener(listener);
  }, [viewModel]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await viewModel.login(email, password);
      setUser(viewModel.getUser());
      setSession(viewModel.getSession());
      setLoading(viewModel.isLoading());
      setError(viewModel.getError());
      return result;
    },
    [viewModel]
  );

  const logout = useCallback(async () => {
    await viewModel.logout();
    setUser(viewModel.getUser());
    setSession(viewModel.getSession());
    setLoading(viewModel.isLoading());
    setError(viewModel.getError());
  }, [viewModel]);

  const checkSession = useCallback(async () => {
    await viewModel.checkSession();
    setUser(viewModel.getUser());
    setSession(viewModel.getSession());
    setLoading(viewModel.isLoading());
    setError(viewModel.getError());
  }, [viewModel]);

  return {
    user,
    session,
    loading,
    error,
    login,
    logout,
    checkSession,
  };
}
