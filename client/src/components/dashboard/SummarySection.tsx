import { Activity, Clock, UserPlus, AlertCircle } from 'lucide-react';
import type { DashboardStats } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface SummarySectionProps {
  stats: DashboardStats;
}

export function SummarySection({ stats }: SummarySectionProps) {
  return (
    <div className="card p-0 overflow-hidden flex flex-col h-full border border-slate-200 shadow-sm">
       <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-500" />
          <h2 className="font-bold text-slate-800">Resumo</h2>
       </div>
       <div className="p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0">
             <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                   <Clock className="w-5 h-5" />
                </div>
                <div>
                   <span className="block text-sm font-medium text-slate-500">Esta semana</span>
                   <span className="block font-bold text-slate-900 text-lg">{stats.consultasSemana}</span>
                </div>
             </div>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-slate-50 last:border-0 last:pb-0">
             <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                   <UserPlus className="w-5 h-5" />
                </div>
                <div>
                   <span className="block text-sm font-medium text-slate-500">Novos pacientes</span>
                   <span className="block font-bold text-slate-900 text-lg">{stats.pacientesNovos}</span>
                </div>
             </div>
          </div>

          <div className="flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                   <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                   <span className="block text-sm font-medium text-slate-500">Pagamentos</span>
                   <span className="block font-bold text-slate-900 text-lg">{formatCurrency(stats.receitaPendente)}</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
