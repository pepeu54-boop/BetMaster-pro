
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BankrollData, Bet, BetResult } from '../types';
import { ICONS } from '../constants';

interface DashboardProps {
  bankroll: BankrollData;
  bets: Bet[];
}

const Dashboard: React.FC<DashboardProps> = ({ bankroll, bets }) => {
  const stats = useMemo(() => {
    const closedBets = bets.filter(b => b.result !== BetResult.PENDING);
    const wins = closedBets.filter(b => b.result === BetResult.WIN);
    const winRate = closedBets.length > 0 ? (wins.length / closedBets.length) * 100 : 0;
    
    // Lucro calculado pela soma algébrica dos resultados das apostas
    const totalProfit = bets.reduce((acc, b) => acc + (b.profit || 0), 0);
    
    const totalStaked = closedBets.reduce((acc, b) => acc + b.stake, 0);
    const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

    return { winRate, totalProfit, roi, closedCount: closedBets.length };
  }, [bets]);

  const chartData = useMemo(() => {
    // O gráfico agora mostra a progressão a partir de 0 (lucro acumulado)
    let accumulatedProfit = 0;
    const history = [{ date: 'Início', profit: 0 }];
    
    const sortedBets = [...bets]
      .filter(b => b.result !== BetResult.PENDING)
      .sort((a, b) => a.timestamp - b.timestamp);

    sortedBets.forEach((bet) => {
      accumulatedProfit += (bet.profit || 0);
      history.push({
        date: new Date(bet.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        profit: accumulatedProfit
      });
    });

    return history;
  }, [bets]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Painel Geral</h1>
          <p className="text-slate-500">Análise de performance baseada em suas apostas.</p>
        </div>
        <div className="px-5 py-3 bg-white rounded-xl shadow-sm border border-slate-200">
          <span className="text-[10px] text-slate-400 block uppercase font-black mb-1">Saldo em Conta</span>
          <span className="text-2xl font-black text-slate-900">R$ {Number(bankroll.current).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Lucro Acumulado</span>
            <span className={`p-1.5 rounded-lg ${stats.totalProfit >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
              {stats.totalProfit >= 0 ? ICONS.TREND_UP : ICONS.TREND_DOWN}
            </span>
          </div>
          <div className={`text-2xl font-black ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {stats.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">ROI (Retorno)</div>
          <div className="text-2xl font-black text-slate-900">{stats.roi.toFixed(2)}%</div>
          <div className="text-[10px] text-slate-400 mt-1">Soma de ganhos / Soma de stakes</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Taxa de Acerto</div>
          <div className="text-2xl font-black text-slate-900">{stats.winRate.toFixed(1)}%</div>
          <div className="text-[10px] text-slate-400 mt-1">{stats.closedCount} encerradas</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Banca Inicial</div>
          <div className="text-2xl font-black text-slate-900">R$ {Number(bankroll.initial).toLocaleString('pt-BR')}</div>
          <div className="text-[10px] text-slate-400 mt-1">Valor de referência do ROI</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[300px]">
        <h3 className="text-xs font-bold text-slate-900 mb-4 uppercase tracking-widest">Curva de Lucro (R$)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" hide />
            <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `R$${v}`} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Lucro Líquido']}
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#2563eb" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorProfit)" 
            />
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
