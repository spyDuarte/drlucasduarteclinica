import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IS_DEMO_AUTH_ENABLED } from '../constants/clinic';
import { Stethoscope, Mail, Lock, AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao fazer login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left side - Branding (Simplified) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
        }}></div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 text-center px-12 animate-fade-in">
           <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 ring-1 ring-white/20 shadow-2xl shadow-black/20">
              <Stethoscope className="w-12 h-12 text-white drop-shadow-md" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Dr. Lucas Duarte
            </h1>
            <p className="text-primary-100 text-lg max-w-md mx-auto leading-relaxed font-light">
              Excelência em gestão médica e atendimento humanizado.
            </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 animate-fade-in-up">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">

          <div className="lg:hidden text-center mb-10">
             <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Dr. Lucas Duarte</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Bem-vindo de volta</h2>
            <p className="text-slate-500">Acesse sua conta para gerenciar a clínica.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-2.5 text-sm shadow-md shadow-primary-500/10 hover:shadow-lg hover:shadow-primary-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Acessar Sistema
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials - Simplified */}
          {IS_DEMO_AUTH_ENABLED && (
            <div className="mt-10 pt-6 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">
                Ambiente de Demonstração
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEmail(import.meta.env.VITE_DEMO_DOCTOR_EMAIL || 'medico@clinica.com');
                    setPassword(import.meta.env.VITE_DEMO_DOCTOR_PASSWORD || '123456');
                  }}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all group text-left"
                >
                  <p className="text-xs font-medium text-slate-500 group-hover:text-primary-600 mb-1">Médico</p>
                  <p className="text-xs text-slate-900 font-mono">{import.meta.env.VITE_DEMO_DOCTOR_EMAIL || 'medico@clinica.com'}</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(import.meta.env.VITE_DEMO_SECRETARY_EMAIL || 'secretaria@clinica.com');
                    setPassword(import.meta.env.VITE_DEMO_SECRETARY_PASSWORD || '123456');
                  }}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all group text-left"
                >
                  <p className="text-xs font-medium text-slate-500 group-hover:text-primary-600 mb-1">Secretária</p>
                  <p className="text-xs text-slate-900 font-mono">{import.meta.env.VITE_DEMO_SECRETARY_EMAIL || 'secretaria@clinica.com'}</p>
                </button>
              </div>
              <p className="text-center text-xs text-slate-400 mt-3">
                Senha padrão: <span className="font-mono">{import.meta.env.VITE_DEMO_DOCTOR_PASSWORD || '123456'}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
