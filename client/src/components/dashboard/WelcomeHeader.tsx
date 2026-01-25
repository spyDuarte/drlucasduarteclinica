import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { memo } from 'react';

// Memoized to prevent re-renders when Dashboard updates (uses stable AuthContext)
export const WelcomeHeader = memo(function WelcomeHeader() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const displayName = user?.nome?.startsWith('Dr.')
    ? user.nome
    : `Dr. ${user?.nome?.split(' ')[0]}`;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 sm:p-10 shadow-lg shadow-slate-200/50">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-primary-50/50 via-primary-50/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-blue-50/50 via-slate-50/30 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Bem-vindo ao seu painel de controle. Aqui está o resumo das atividades da clínica hoje.
          </p>
        </div>
        <div className="flex gap-3">
           <Link
            to="/agenda"
            className="btn-primary py-3 px-6 text-base shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5"
          >
            <Calendar className="w-5 h-5" />
            <span>Ver Agenda</span>
          </Link>
        </div>
      </div>
    </div>
  );
});
