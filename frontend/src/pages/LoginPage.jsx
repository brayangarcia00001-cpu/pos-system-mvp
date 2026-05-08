import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore.js';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@pos.com');
  const [password, setPassword] = useState('admin123');
  const [showPwd, setShowPwd] = useState(false);
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-600/30">
            <Store size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">POS Pro</h1>
          <p className="text-slate-500 text-sm mt-1">Sistema de Punto de Venta</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="admin@pos.com" required />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
          <div className="mt-4 pt-4 border-t border-[#334155] text-xs text-slate-500 space-y-1">
            <p>Admin: admin@pos.com / admin123</p>
            <p>Cajero: cajero@pos.com / cashier123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
