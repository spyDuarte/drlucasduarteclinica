import { type LucideIcon, TrendingUp } from 'lucide-react';
import { memo } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend: string;
  trendUp: boolean;
  colorClass: string;
}

// Memoized to avoid re-rendering cards whose values haven't changed when other stats update
export const StatCard = memo(function StatCard({ label, value, icon: Icon, trend, trendUp, colorClass }: StatCardProps) {
  return (
    <div className="card bg-white/95 backdrop-blur p-5 flex flex-col justify-between h-full hover:border-primary-200 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass} transition-colors`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${trendUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
           <TrendingUp className={`w-3 h-3 ${!trendUp && 'rotate-180'}`} />
           {trend}
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
});
