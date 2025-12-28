import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, Mail, Lock, AlertCircle, Loader2, ShieldCheck, Heart, Sparkles, Eye, EyeOff, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-medical-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/20">
              <Stethoscope className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Dr. Lucas<br />Duarte
            </h1>
            <p className="text-xl text-primary-200 font-medium">
              Sistema de Gestão Médica
            </p>
          </div>

          <div className="space-y-6 max-w-md">
            <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl ring-1 ring-white/10">
              <div className="w-10 h-10 bg-medical-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Dados Protegidos</h3>
                <p className="text-primary-200 text-sm">Seus dados estão seguros com criptografia de ponta</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl ring-1 ring-white/10">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Interface Moderna</h3>
                <p className="text-primary-200 text-sm">Design intuitivo para facilitar o seu dia a dia</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-medical-100/40 rounded-full blur-3xl" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/30">
                <Stethoscope className="w-11 h-11 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-medical-400 to-medical-500 rounded-lg flex items-center justify-center border-4 border-white shadow-lg">
                <Heart className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">Dr. Lucas Duarte</h1>
            <p className="text-slate-500 font-medium">Sistema de Gestão Médica</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Bem-vindo</h2>
                <p className="text-slate-500 text-sm">Faça login para continuar</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-rose-100/50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 animate-shake">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">
                  Email
                </label>
                <div className="relative input-icon-wrapper group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-focus-within:bg-primary-100 transition-colors">
                    <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-16 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all duration-200 text-base font-medium"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5">
                  Senha
                </label>
                <div className="relative input-icon-wrapper group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-focus-within:bg-primary-100 transition-colors">
                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-16 pr-14 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all duration-200 text-base font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 text-base font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-200 flex items-center justify-center gap-2 rounded-xl group mt-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar no Sistema
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-bold text-amber-700">Credenciais Demo</p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                  <span className="text-slate-600 font-semibold">Médico</span>
                  <code className="text-primary-600 text-sm bg-primary-50 px-3 py-1.5 rounded-lg font-medium">medico@clinica.com</code>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                  <span className="text-slate-600 font-semibold">Secretária</span>
                  <code className="text-primary-600 text-sm bg-primary-50 px-3 py-1.5 rounded-lg font-medium">secretaria@clinica.com</code>
                </div>
                <p className="text-xs text-amber-600 text-center mt-3 font-medium">Senha: 123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
