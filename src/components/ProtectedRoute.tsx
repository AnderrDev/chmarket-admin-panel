import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // La autorización real la hacen las Edge Functions; esto solo evita mostrar
  // el panel a cuentas sin rol admin.
  if (!user.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold text-gray-900">
            Acceso restringido
          </p>
          <p className="mt-2 text-gray-600">
            Tu cuenta no tiene permisos de administrador.
          </p>
          <button
            onClick={signOut}
            className="mt-4 px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
