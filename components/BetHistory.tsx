
import React from 'react';
import { Bet, BetResult } from '../types';

interface BetHistoryProps {
  bets: Bet[];
  onResolveBet: (id: string, result: BetResult) => void;
  onDeleteBet: (id: string) => void;
  onSyncResults: () => void;
  syncing: boolean;
}

const BetHistory: React.FC<BetHistoryProps> = ({ bets, onResolveBet, onDeleteBet, onSyncResults, syncing }) => {
  const getResultBadge = (result: BetResult) => {
    switch (result) {
      case BetResult.WIN: return 'bg-green-600 text-white shadow-sm';
      case BetResult.LOSS: return 'bg-red-600 text-white shadow-sm';
      case BetResult.VOID: return 'bg-slate-400 text-white';
      case BetResult.PENDING: return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  };

  const getResultLabel = (result: BetResult) => {
    switch (result) {
      case BetResult.WIN: return 'GREEN';
      case BetResult.LOSS: return 'RED';
      case BetResult.VOID: return 'ANULADA';
      case BetResult.PENDING: return 'PENDENTE';
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Histórico de Apostas</h1>
          <p className="text-slate-500">Gestão detalhada e auditoria de resultados.</p>
        </div>
        <button
          onClick={onSyncResults}
          disabled={syncing}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-lg"
        >
          {syncing ? 'Auditando...' : 'Sincronizar IA'}
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Data/Evento</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Odd</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Stake</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">Nenhuma aposta registrada.</td>
                </tr>
              ) : (
                bets.map(bet => (
                  <tr key={bet.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-[10px] text-slate-400 mb-1">{new Date(bet.timestamp).toLocaleString('pt-BR')}</div>
                      <div className="font-bold text-slate-900 text-sm leading-tight">{bet.event}</div>
                      <div className="text-[11px] text-blue-600 font-bold uppercase">{bet.type}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-black text-slate-900">@{bet.odd.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-bold text-slate-700">R$ {bet.stake.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-black inline-block ${getResultBadge(bet.result)}`}>
                        {getResultLabel(bet.result)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {bet.result === BetResult.PENDING && (
                          <>
                            <button onClick={() => onResolveBet(bet.id, BetResult.WIN)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition">W</button>
                            <button onClick={() => onResolveBet(bet.id, BetResult.LOSS)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition">L</button>
                          </>
                        )}
                        <button 
                          onClick={() => onDeleteBet(bet.id)} 
                          className="p-2 text-slate-300 hover:text-red-500 transition"
                          title="Excluir Registro"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BetHistory;
