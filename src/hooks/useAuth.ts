import { useAuthViewModel } from '@/presentation/viewmodels/AuthViewModel';
import { authViewModel } from '@/application/container';

export function useAuth() {
  const hook = useAuthViewModel(authViewModel);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await hook.login(email, password);
      return result;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Error inesperado',
      };
    }
  };

  const signOut = async () => {
    try {
      await hook.logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user: hook.user,
    session: hook.session,
    loading: hook.loading,
    error: hook.error,
    signIn,
    signOut,
  };
}
