import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, Mail, Lock, AlertCircle, Loader2, ShieldCheck, Heart } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-sky-500/30 brand-icon-animated">
              <Stethoscope className="w-11 h-11 text-white drop-shadow-sm" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center border-4 border-white shadow-sm">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Dr. Lucas Duarte</h1>
          <p className="text-gray-500 font-medium">Sistema de Gestão Médica</p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-gray-900/10 p-8 border border-white/50">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Acesso Seguro</h2>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-shake">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative input-icon-wrapper group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-sky-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white outline-none transition-all duration-200 text-sm font-medium"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative input-icon-wrapper group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-200 group-focus-within:text-sky-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:bg-white outline-none transition-all duration-200 text-sm font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 text-base font-semibold shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-200 flex items-center justify-center gap-2 rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-amber-100 rounded flex items-center justify-center">
                <span className="text-amber-600 text-xs">💡</span>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Credenciais Demo</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <span className="text-gray-500 font-medium">Médico</span>
                <code className="text-sky-600 text-xs bg-sky-50 px-2 py-1 rounded">medico@clinica.com</code>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                <span className="text-gray-500 font-medium">Secretária</span>
                <code className="text-sky-600 text-xs bg-sky-50 px-2 py-1 rounded">secretaria@clinica.com</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
