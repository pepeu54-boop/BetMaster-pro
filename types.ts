
export enum RiskStrategy {
  CONSERVATIVE = 'CONSERVATIVE', // 1%
  MODERATE = 'MODERATE',         // 2%
  RISKY = 'RISKY'               // 3%
}

export enum BetResult {
  PENDING = 'PENDING',
  WIN = 'WIN',
  LOSS = 'LOSS',
  VOID = 'VOID'
}

export enum ConfidenceLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface RecommendationSource {
  uri: string;
  title: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  bankroll: BankrollData;
  bets: Bet[];
}

export interface Bet {
  id: string;
  event: string;
  player?: string;
  category?: string;
  odd: number;
  stake: number;
  type: string;
  result: BetResult;
  timestamp: number;
  profit?: number;
}

export interface Recommendation {
  id: string;
  event: string;
  category: string;
  player?: string;
  eventDateTime: string;
  odd: number;
  implicitProbability: number;
  estimatedProbability: number;
  type: string;
  confidence: ConfidenceLevel;
  reasoning: string;
}

export interface BankrollData {
  initial: number;
  current: number;
  strategy: RiskStrategy;
}
