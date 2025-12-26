
import React, { useState, useEffect } from 'react';
import { BankrollData, RiskStrategy } from '../types';

interface SettingsProps {
  bankroll: BankrollData;
  onUpdateBankroll: (type: 'initial' | 'current', val: number) => void;
  onUpdateStrategy: (strat: RiskStrategy) => void;
  clearHistory: () => void;
  onShowRG: () => void;
}

const Settings: React.FC<SettingsProps> = ({ bankroll, onUpdateBankroll, onUpdateStrategy, clearHistory, onShowRG }) => {
  const [initialInput, setInitialInput] = useState<string>(bankroll.initial.toString());
  const [currentInput, setCurrentInput] = useState<string>(bankroll.current.toString());

  useEffect(() => {
    setInitialInput(bankroll.initial.toString());
    setCurrentInput(bankroll.current.toString());
  }, [bankroll.initial, bankroll.current]);

  const handleSaveInitial = () => {
    const val = Math.max(1, Number(initialInput));
    if (confirm(`Alterar Banca Inicial para R$ ${val.toLocaleString('pt-BR')}?`)) {
      onUpdateBankroll('initial', val);
    }
  };

  const handleSaveCurrent = () => {
    const val = Math.max(0, Number(currentInput));
    onUpdateBankroll('current', val);
  };

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Conta</h1>
          <p className="text-slate-500">Configure seus limites e estratégias.</p>
        </div>
        <button onClick={onShowRG} className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition">Jogo Responsável 18+</button>
      </header>

      <section className="bg-white rounded-3xl border-2 border-blue-600 shadow-xl p-8">
        <h3 className="font-black text-slate-900 uppercase text-xs mb-4">Capital Inicial de Referência</h3>
        <div className="flex gap-4">
          <input type="number" min="1" value={initialInput} onChange={e => setInitialInput(e.target.value)} className="flex-grow px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-2xl outline-none focus:border-blue-500" />
          <button onClick={handleSaveInitial} className="px-8 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition uppercase text-xs">Salvar</button>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 p-8">
        <h3 className="font-bold text-slate-900 uppercase text-xs mb-4">Saldo Atual (Ajuste Manual)</h3>
        <div className="flex gap-4">
          <input type="number" min="0" value={currentInput} onChange={e => setCurrentInput(e.target.value)} className="flex-grow px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-2xl outline-none focus:border-green-500" />
          <button onClick={handleSaveCurrent} className="px-8 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition uppercase text-xs">Atualizar</button>
        </div>
      </section>

      <section className="bg-white p-8 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-xs text-slate-400 uppercase mb-6">Estratégia de Risco (Unit Stake)</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: RiskStrategy.CONSERVATIVE, label: '1%', desc: 'Safe' },
            { id: RiskStrategy.MODERATE, label: '2%', desc: 'Balanced' },
            { id: RiskStrategy.RISKY, label: '3%', desc: 'Aggressive' }
          ].map(strat => (
            <button key={strat.id} onClick={() => onUpdateStrategy(strat.id)} className={`p-6 rounded-2xl border-2 transition-all text-center ${bankroll.strategy === strat.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className="text-2xl font-black">{strat.label}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">{strat.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <button onClick={clearHistory} className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-red-50 hover:text-red-600 transition uppercase text-xs tracking-widest">Apagar Todo o Histórico</button>
    </div>
  );
};

export default Settings;
