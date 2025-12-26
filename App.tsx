
import React, { useState, useEffect, useCallback } from 'react';
import { User, BankrollData, Bet, BetResult, RiskStrategy, Recommendation } from './types';
import { STRATEGY_PERCENTAGES } from './constants';
import { generateRecommendations, resolveBetResults } from './services/geminiService';
import Dashboard from './components/Dashboard';
import RecommendationsList from './components/RecommendationsList';
import BetHistory from './components/BetHistory';
import Settings from './components/Settings';
import AuthContainer from './components/AuthContainer';
import ResponsibleGaming from './components/ResponsibleGaming';

const STORAGE_USERS_KEY = 'BETMASTER_USERS_DB_V2';
const SESSION_KEY = 'BETMASTER_SESSION_V2';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) return null;
    try {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]');
      return users.find(u => u.id === sessionId) || null;
    } catch (e) { return null; }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'recommendations' | 'history' | 'settings'>('dashboard');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);

  // Persistência Atômica
  useEffect(() => {
    if (!currentUser) return;
    const users: User[] = JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]');
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
      users[index] = currentUser;
    } else {
      users.push(currentUser);
    }
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }, [currentUser]);

  const handleLogin = (user: User) => {
    localStorage.setItem(SESSION_KEY, user.id);
    setCurrentUser(user);
    // Mostrar aviso legal no primeiro login da sessão
    if (!sessionStorage.getItem('RG_SHOWN')) {
      setShowResponsibleModal(true);
      sessionStorage.setItem('RG_SHOWN', 'true');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
  };

  const handleUpdateBankroll = (type: 'initial' | 'current', value: number) => {
    const safeValue = Math.max(0, Number(value));
    setCurrentUser(prev => prev ? {
      ...prev,
      bankroll: { ...prev.bankroll, [type]: safeValue }
    } : null);
  };

  const handleUpdateStrategy = (strategy: RiskStrategy) => {
    setCurrentUser(prev => prev ? {
      ...prev,
      bankroll: { ...prev.bankroll, strategy }
    } : null);
  };

  const handlePlaceBet = (rec: Recommendation) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const stake = prev.bankroll.current * STRATEGY_PERCENTAGES[prev.bankroll.strategy];
      
      if (prev.bankroll.current < stake) {
        alert("❌ Saldo insuficiente para esta unidade!");
        return prev;
      }

      const newBet: Bet = {
        id: Math.random().toString(36).substr(2, 9),
        event: rec.event,
        player: rec.player,
        category: rec.category,
        odd: rec.odd,
        stake: stake,
        type: rec.type,
        result: BetResult.PENDING,
        timestamp: Date.now()
      };

      return {
        ...prev,
        bets: [newBet, ...prev.bets],
        bankroll: { ...prev.bankroll, current: prev.bankroll.current - stake }
      };
    });
  };

  const handleResolveBet = (betId: string, result: BetResult) => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const betIndex = prev.bets.findIndex(b => b.id === betId);
      if (betIndex === -1) return prev;

      const bet = prev.bets[betIndex];
      if (bet.result !== BetResult.PENDING) return prev;

      let payout = 0;
      if (result === BetResult.WIN) payout = bet.stake * bet.odd;
      else if (result === BetResult.VOID) payout = bet.stake;

      const updatedBets = [...prev.bets];
      updatedBets[betIndex] = { ...bet, result, profit: payout - bet.stake };

      return {
        ...prev,
        bets: updatedBets,
        bankroll: { ...prev.bankroll, current: prev.bankroll.current + payout }
      };
    });
  };

  const handleDeleteBet = (betId: string) => {
    if (!confirm("Excluir esta aposta? O valor da stake será devolvido ao saldo se ela estiver pendente.")) return;
    
    setCurrentUser(prev => {
      if (!prev) return null;
      const bet = prev.bets.find(b => b.id === betId);
      if (!bet) return prev;

      let refund = 0;
      if (bet.result === BetResult.PENDING) refund = bet.stake;

      return {
        ...prev,
        bets: prev.bets.filter(b => b.id !== betId),
        bankroll: { ...prev.bankroll, current: prev.bankroll.current + refund }
      };
    });
  };

  const handleSyncResults = async () => {
    if (!currentUser) return;
    const pendingBets = currentUser.bets.filter(b => b.result === BetResult.PENDING);
    if (pendingBets.length === 0) return alert("Nenhuma aposta pendente.");

    setSyncing(true);
    try {
      const results = await resolveBetResults(pendingBets);
      results.forEach(res => {
        if (res.result !== BetResult.PENDING) handleResolveBet(res.id, res.result);
      });
    } catch (e) {
      alert("Erro na auditoria.");
    } finally {
      setSyncing(false);
    }
  };

  const fetchRecs = useCallback(async () => {
    if (!currentUser) return;
    setLoadingRecs(true);
    try {
      const recs = await generateRecommendations(currentUser.bankroll.current);
      setRecommendations(recs);
    } catch (e) { console.error(e); }
    finally { setLoadingRecs(false); }
  }, [currentUser?.bankroll.current]);

  useEffect(() => {
    if (currentUser && recommendations.length === 0) fetchRecs();
  }, [currentUser, fetchRecs, recommendations.length]);

  if (!currentUser) return <AuthContainer onLogin={handleLogin} usersKey={STORAGE_USERS_KEY} />;

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-slate-50 font-sans flex">
      {showResponsibleModal && <ResponsibleGaming onClose={() => setShowResponsibleModal(false)} />}
      
      <nav className="hidden md:flex flex-col w-64 bg-slate-900 h-screen fixed text-white p-6 gap-8 z-20 shadow-2xl">
        <div className="flex items-center gap-3 text-2xl font-bold text-blue-400">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">B</div>
          BetMaster
        </div>
        
        <div className="flex flex-col gap-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'recommendations', label: 'Dicas IA', icon: '🤖' },
            { id: 'history', label: 'Histórico', icon: '📜' },
            { id: 'settings', label: 'Ajustes', icon: '⚙️' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-auto space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <div className="text-[10px] text-slate-500 uppercase font-black mb-1">Usuário</div>
            <div className="text-sm font-bold text-slate-200 truncate">{currentUser.username}</div>
            <button onClick={handleLogout} className="text-[10px] text-red-400 font-bold uppercase mt-2 hover:text-red-300">Sair com segurança</button>
          </div>
          <div className="bg-blue-600 p-4 rounded-xl shadow-lg border border-blue-500">
            <div className="text-[10px] text-blue-200 uppercase font-black mb-1">Saldo Atual</div>
            <div className="text-xl font-black text-white">R$ {currentUser.bankroll.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-900 text-white flex justify-around p-3 z-50 border-t border-slate-800">
        <button onClick={() => setActiveTab('dashboard')} className={`p-2 transition-colors ${activeTab === 'dashboard' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}>📊</button>
        <button onClick={() => setActiveTab('recommendations')} className={`p-2 transition-colors ${activeTab === 'recommendations' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}>🤖</button>
        <button onClick={() => setActiveTab('history')} className={`p-2 transition-colors ${activeTab === 'history' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}>📜</button>
        <button onClick={() => setActiveTab('settings')} className={`p-2 transition-colors ${activeTab === 'settings' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}>⚙️</button>
      </nav>

      <main className="flex-grow md:ml-64 p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
        {activeTab === 'dashboard' && <Dashboard bankroll={currentUser.bankroll} bets={currentUser.bets} />}
        {activeTab === 'recommendations' && (
          <RecommendationsList 
            recommendations={recommendations} 
            loading={loadingRecs} 
            onPlaceBet={handlePlaceBet}
            refresh={fetchRecs}
            strategy={currentUser.bankroll.strategy}
            currentBankroll={currentUser.bankroll.current}
          />
        )}
        {activeTab === 'history' && (
          <BetHistory 
            bets={currentUser.bets} 
            onResolveBet={handleResolveBet}
            onDeleteBet={handleDeleteBet}
            onSyncResults={handleSyncResults}
            syncing={syncing}
          />
        )}
        {activeTab === 'settings' && (
          <Settings 
            bankroll={currentUser.bankroll} 
            onUpdateBankroll={handleUpdateBankroll}
            onUpdateStrategy={handleUpdateStrategy}
            clearHistory={() => {
              if (confirm("Limpar todo o histórico?")) setCurrentUser(prev => prev ? {...prev, bets: []} : null);
            }}
            onShowRG={() => setShowResponsibleModal(true)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
