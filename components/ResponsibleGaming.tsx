
import React from 'react';

interface ResponsibleGamingProps {
  onClose: () => void;
}

const ResponsibleGaming: React.FC<ResponsibleGamingProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl"
        >
          &times;
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">18+</div>
          <h2 className="text-2xl font-bold text-slate-900">Jogo Responsável</h2>
        </div>

        <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
          <p>
            Apostar deve ser encarado como entretenimento, não como uma forma de gerar renda garantida. 
            A BetMaster Pro é uma ferramenta de **gestão matemática**, mas o risco de perda é real.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-xl space-y-2">
            <h4 className="font-bold text-slate-800">Diretrizes:</h4>
            <ul className="list-disc ml-4 space-y-1">
              <li>Nunca aposte dinheiro destinado a contas essenciais (aluguel, comida).</li>
              <li>Mantenha-se na sua estratégia de gestão de banca (máx 3% por evento).</li>
              <li>Não tente "recuperar o prejuízo" com apostas maiores e impulsivas.</li>
              <li>Defina limites de tempo e perdas diárias.</li>
            </ul>
          </div>

          <p className="font-medium text-slate-800">Precisa de ajuda?</p>
          <p>
            Se você sente que perdeu o controle, procure ajuda profissional. Sites como <strong>jogadoresanonimos.com.br</strong> oferecem suporte gratuito.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
        >
          Entendi e concordo
        </button>
      </div>
    </div>
  );
};

export default ResponsibleGaming;
