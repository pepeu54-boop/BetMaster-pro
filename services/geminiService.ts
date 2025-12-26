
import { GoogleGenAI, Type } from "@google/genai";
import { Recommendation, ConfidenceLevel, RecommendationSource, Bet, BetResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateRecommendations = async (bankroll: number): Promise<Recommendation[]> => {
  const today = new Date().toLocaleDateString('pt-BR');
  
  const prompt = `Hoje é dia ${today}. Use o Google Search para encontrar 5 oportunidades REAIS de apostas esportivas para HOJE ou AMANHÃ.
  
  VOCÊ DEVE SER EXTREMAMENTE ESPECÍFICO NO MERCADO.
  
  REGRAS POR CATEGORIA:
  1. NBA: Foque em Player Props (Ex: "LeBron James +24.5 Pontos", "Anthony Davis +10.5 Rebotes").
  2. FUTEBOL: É OBRIGATÓRIO informar se o mercado é ESCANTEIOS, CARTÕES, GOLS ou RESULTADO.

  Retorne o JSON conforme o schema definido.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              event: { type: Type.STRING },
              category: { type: Type.STRING },
              player: { type: Type.STRING, nullable: true },
              eventDateTime: { type: Type.STRING },
              odd: { type: Type.NUMBER },
              implicitProbability: { type: Type.NUMBER },
              estimatedProbability: { type: Type.NUMBER },
              type: { type: Type.STRING },
              confidence: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
              reasoning: { type: Type.STRING }
            },
            required: ["id", "event", "category", "eventDateTime", "odd", "implicitProbability", "estimatedProbability", "type", "confidence", "reasoning"]
          }
        }
      }
    });

    const recommendations: Recommendation[] = JSON.parse(response.text || '[]');
    return recommendations;
  } catch (error) {
    console.error("Erro ao buscar recomendações:", error);
    return [];
  }
};

export const resolveBetResults = async (pendingBets: Bet[]): Promise<{id: string, result: BetResult}[]> => {
  if (pendingBets.length === 0) return [];
  
  // Enviamos os IDs e as informações para a IA
  const betsData = pendingBets.map(b => ({
    id: b.id,
    info: `${b.event} - Mercado: ${b.player ? b.player + ' ' : ''}${b.type}`
  }));
  
  const prompt = `Verifique os resultados reais para estas apostas usando Google Search:
  ${JSON.stringify(betsData)}
  
  Retorne um JSON contendo apenas um array de objetos com o "id" original e o "result" (WIN, LOSS, VOID ou PENDING).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              result: { type: Type.STRING, enum: ["WIN", "LOSS", "VOID", "PENDING"] }
            },
            required: ["id", "result"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Erro na auditoria de resultados:", error);
    return [];
  }
};
