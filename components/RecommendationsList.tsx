
import React, { useState, useMemo } from 'react';
import { Recommendation, ConfidenceLevel, RiskStrategy } from '../types';
import { STRATEGY_PERCENTAGES } from '../constants';

interface RecommendationsListProps {
  recommendations: Recommendation[];
  loading: boolean;
  onPlaceBet: (rec: Recommendation) => void;
  refresh: () => void;
  strategy: RiskStrategy;
  currentBankroll: number;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ 
  recommendations, 
  loading, 
  onPlaceBet, 
  refresh,
  strategy,
  currentBankroll
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [placedBetIds, setPlacedBetIds] = useState<Set<string>>(new Set());

  const handleBetClick = (rec: Recommendation) => {
    if (placedBetIds.has(rec.id)) return;
    onPlaceBet(rec);
    setPlacedBetIds(prev => new Set(prev).add(rec.id));
  };

  const getConfidenceBadge = (level: ConfidenceLevel) => {
    switch (level) {
      case ConfidenceLevel.HIGH: return 'bg-green-100 text-green-700 border-green-200';
      case ConfidenceLevel.MEDIUM: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ConfidenceLevel.LOW: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getMarketIcon = (type: string, category: string) => {
    const t = type.toLowerCase();
    if (category === 'NBA') return '🏀';
    if (t.includes('escanteio')) return '🚩';
    if (t.includes('cartão')) return '🟨';
    if (t.includes('gol') || t.includes('ambos')) return '⚽';
    return '🎯';
  };

  const stakePercentage = STRATEGY_PERCENTAGES[strategy];
  const stake = currentBankroll * stakePercentage;

  const filteredRecommendations = useMemo(() => {
    if (selectedCategory === 'Todas') return recommendations;
    return recommendations.filter(r => r.category === selectedCategory);
  }, [recommendations, selectedCategory]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Análise de Oportunidades</h1>
          <p className="text-slate-500">Mercados de valor detectados pela nossa IA.</p>
        </div>
        <button 
          onClick={refresh}
          disabled={loading}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition disabled:opacity-50"
        >
          {loading ? 'Escaneando...' : 'Buscar Novas Dicas'}
        </button>
      </header>

      <div className="flex gap-2 pb-2 overflow-x-auto">
        {['Todas', 'Futebol', 'NBA'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-96 animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map(rec => (
            <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-4">
                   <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    rec.category === 'NBA' ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white'
                  }`}>
                    {rec.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getConfidenceBadge(rec.confidence)}`}>
                    IA: {rec.confidence}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{rec.event}</h3>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3 mb-4">
                  <span className="text-2xl">{getMarketIcon(rec.type, rec.category)}</span>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Mercado</div>
                    <div className="text-sm font-black text-slate-900">{rec.type}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="text-[9px] font-bold text-blue-500 uppercase">Odd Atual</div>
                    <div className="text-xl font-black text-blue-900">@{rec.odd.toFixed(2)}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[9px] font-bold text-slate-500 uppercase">Stake Sugerida</div>
                    <div className="text-xl font-black text-slate-900">R$ {stake.toFixed(0)}</div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic">"{rec.reasoning}"</p>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => handleBetClick(rec)}
                  disabled={placedBetIds.has(rec.id)}
                  className={`w-full py-3 rounded-xl font-bold transition shadow-sm ${
                    placedBetIds.has(rec.id) 
                      ? 'bg-green-100 text-green-600 cursor-default' 
                      : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]'
                  }`}
                >
                  {placedBetIds.has(rec.id) ? '✓ APOSTA REGISTRADA' : 'REGISTRAR APOSTA'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsList;
