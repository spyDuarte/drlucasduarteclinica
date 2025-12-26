import type { ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { Layout, LoadingSpinner, ErrorBoundary } from './components';
import { ToastProvider } from './components/Toast';
import {
  Login,
  Dashboard,
  Patients,
  Agenda,
  MedicalRecords,
  Financial,
  Reports
} from './pages';

// Componente de rota protegida
function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Componente de rota pública (redireciona se já estiver logado)
function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pacientes" element={<Patients />} />
        <Route path="pacientes/:patientId" element={<MedicalRecords />} />
        <Route path="agenda" element={<Agenda />} />
        <Route
          path="prontuarios"
          element={
            <ProtectedRoute allowedRoles={['medico']}>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route path="financeiro" element={<Financial />} />
        <Route
          path="relatorios"
          element={
            <ProtectedRoute allowedRoles={['medico']}>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AuthProvider>
          <DataProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </DataProvider>
        </AuthProvider>
      </HashRouter>
    </ErrorBoundary>
  );
}
