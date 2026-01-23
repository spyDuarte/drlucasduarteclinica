import {
  Stethoscope,
  RefreshCw,
  AlertTriangle,
  Activity,
  Scissors,
  UserCheck
} from 'lucide-react';
import type { AppointmentType } from '../types';
import { generateTimeSlots } from '../utils/helpers';

export const TIME_SLOTS = generateTimeSlots('08:00', '18:00', 30);

export const APPOINTMENT_TYPE_CONFIG: Record<AppointmentType, {
  icon: typeof Stethoscope;
  color: string;
  bgColor: string;
  label: string;
}> = {
  primeira_consulta: { icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Primeira Consulta' },
  retorno: { icon: RefreshCw, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Retorno' },
  urgencia: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Urgência' },
  exame: { icon: Activity, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Exame' },
  procedimento: { icon: Scissors, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Procedimento' },
};

export const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h 30min' },
  { value: 120, label: '2 horas' },
];
