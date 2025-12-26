
import React, { useState } from 'react';
import { User, RiskStrategy } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  usersKey: string;
}

const AuthContainer: React.FC<AuthProps> = ({ onLogin, usersKey }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    initialBankroll: '1000'
  });
  const [error, setError] = useState('');

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(formData.email)) return setError('E-mail inválido.');
    if (formData.password.length < 6) return setError('Senha muito curta (min 6 carac.).');

    const users: User[] = JSON.parse(localStorage.getItem(usersKey) || '[]');

    if (isLogin) {
      const user = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.passwordHash === formData.password);
      if (user) onLogin(user);
      else setError('E-mail ou senha incorretos.');
    } else {
      if (formData.password !== formData.confirmPassword) return setError('Senhas não coincidem.');
      if (users.find(u => u.email.toLowerCase() === formData.email.toLowerCase())) return setError('E-mail já cadastrado.');

      const bankroll = Math.max(1, Number(formData.initialBankroll));
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: formData.username || 'Investidor',
        email: formData.email,
        passwordHash: formData.password,
        createdAt: Date.now(),
        bankroll: { initial: bankroll, current: bankroll, strategy: RiskStrategy.CONSERVATIVE },
        bets: []
      };

      localStorage.setItem(usersKey, JSON.stringify([...users, newUser]));
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-2xl mx-auto mb-4">B</div>
          <h1 className="text-3xl font-black text-white tracking-tight">BetMaster Pro</h1>
          <p className="text-slate-400 text-sm">Controle Financeiro Profissional</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex gap-2 mb-8 bg-slate-950 p-1.5 rounded-2xl">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${isLogin ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Acessar</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${!isLogin ? 'bg-slate-800 text-white' : 'text-slate-500'}`}>Criar Conta</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Nome Completo</label>
                <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all" />
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">E-mail</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all" />
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block">Senha</label>
              <input required type={showPass ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all pr-12" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-[38px] text-slate-500 hover:text-slate-300">
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            {!isLogin && (
              <>
                <input required type="password" placeholder="Repita a senha" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-white focus:border-blue-500 outline-none transition-all" />
                <div className="p-5 bg-blue-600/5 border border-blue-600/20 rounded-2xl">
                  <label className="text-[10px] font-black text-blue-400 uppercase mb-1 block">Banca Inicial (Capital)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold">R$</span>
                    <input required type="number" min="1" value={formData.initialBankroll} onChange={e => setFormData({...formData, initialBankroll: e.target.value})} className="w-full bg-transparent border-none p-0 text-2xl font-black text-white outline-none" />
                  </div>
                </div>
              </>
            )}

            {error && <div className="text-red-500 text-xs font-bold text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs">
              {isLogin ? 'Entrar Agora' : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
