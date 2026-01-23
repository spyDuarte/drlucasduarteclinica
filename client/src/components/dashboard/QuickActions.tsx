import { Link } from 'react-router-dom';
import { UserPlus, CalendarPlus, FileText } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ações rápidas</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/pacientes?action=new"
          className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary-200 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <UserPlus className="w-7 h-7 text-primary-600 group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-700 transition-colors">Novo Paciente</h3>
              <p className="text-sm text-slate-500">Cadastrar ficha</p>
            </div>
          </div>
        </Link>

        <Link
          to="/agenda?action=new"
           className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary-200 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <CalendarPlus className="w-7 h-7 text-primary-600 group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-700 transition-colors">Agendar</h3>
              <p className="text-sm text-slate-500">Nova consulta</p>
            </div>
          </div>
        </Link>

        <Link
          to="/pacientes"
           className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary-200 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-inner">
              <FileText className="w-7 h-7 text-primary-600 group-hover:text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary-700 transition-colors">Prontuários</h3>
              <p className="text-sm text-slate-500">Acessar registros</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
