export type CryptoPair =
  | 'BTC/USDT'
  | 'ETH/USDT'
  | 'SOL/USDT'
  | 'BNB/USDT'
  | 'AVAX/USDT'
  | 'DOGE/USDT'
  | 'LINK/USDT'
  | 'NEAR/USDT'
  | 'ADA/USDT'
  | 'SUI/USDT';

export interface Candle {
  timestamp: number;
  timeStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface QuantSignals {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  ema: {
    ema20: number;
    ema50: number;
    ema200: number;
  };
  orderBookImbalance: number; // -1.0 (heavy asks) to +1.0 (heavy bids)
  volatilityRegime: 'LOW' | 'NORMAL' | 'HIGH' | 'EXTREME';
  atr: number;
  signalDirection: 'BUY' | 'SELL' | 'NEUTRAL';
  signalScore: number; // -100 to +100
  keyFactors: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url?: string;
  directionScore: number; // -1.0 to 1.0
  impactScore: number; // 0.0 to 1.0
  relevance: number; // 0.0 to 1.0
}

export interface SentimentAnalysis {
  score: number; // -1.0 to 1.0
  impact: number; // 0.0 to 1.0
  summary: string;
  headlinesCount: number;
  items: NewsItem[];
  modelTier: 'Haiku 4.5' | 'gemini-3.8-flash';
  tokens: { input: number; output: number; costUsd: number };
  timestamp: string;
}

export interface OnChainMetrics {
  whaleNetFlowUsd: number;
  exchangeInflowUsd: number;
  exchangeOutflowUsd: number;
  netExchangeFlowUsd: number;
  fundingRateApr: number;
  openInterestUsd: number;
  mvrvZScore: number;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  summary: string;
  modelTier: 'Haiku 4.5' | 'gemini-3.8-flash';
  tokens: { input: number; output: number; costUsd: number };
  timestamp: string;
}

export interface ResearchThesis {
  thesis: string;
  directionalBias: 'LONG' | 'SHORT' | 'FLAT';
  confidence: number; // 0-100%
  expectedHorizon: string; // e.g., "4-12 hours"
  invalidationPrice: number;
  targetPrice: number;
  keyDrivers: string[];
  riskFactors: string[];
  modelTier: 'Sonnet 5' | 'gemini-3.8-flash';
  tokens: { input: number; output: number; costUsd: number };
  timestamp: string;
}

export interface TradeRecommendation {
  id: string;
  pair: CryptoPair;
  direction: 'BUY' | 'SELL';
  targetSizeUsd: number;
  currentPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  suggestedLeverage: number;
  confidence: number;
  rationale: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  modelTier: 'Sonnet 5' | 'gemini-3.8-flash';
  tokens: { input: number; output: number; costUsd: number };
  generatedAt: string;
  status: 'PENDING_RISK' | 'APPROVED' | 'VETOED';
}

export interface RiskLimits {
  maxPositionSizePct: number; // e.g. 5%
  maxPortfolioExposurePct: number; // e.g. 30%
  maxLeverage: number; // e.g. 3x
  mandatoryStopLossPct: number; // e.g. 2.5% max distance
  dailyLossCircuitBreakerPct: number; // e.g. 4.0%
}

export interface RiskApproval {
  approved: boolean;
  approvalToken?: string;
  timestamp: number;
  originalRecommendationId: string;
  pair: CryptoPair;
  direction: 'BUY' | 'SELL';
  approvedSizeUsd: number;
  approvedLeverage: number;
  stopLossPrice: number;
  vetoReason?: string;
  failureCodes?: string[];
  checksPassed: {
    positionSizeChecked: boolean;
    exposureLimitChecked: boolean;
    leverageChecked: boolean;
    stopLossEnforced: boolean;
    circuitBreakerChecked: boolean;
    killSwitchChecked: boolean;
  };
}

export interface ExecutionOrder {
  orderId: string;
  idempotencyKey: string;
  approvalToken: string;
  pair: CryptoPair;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  filledPrice: number;
  slippageBps: number;
  sizeUsd: number;
  quantity: number;
  leverage: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  feeUsd: number;
  status: 'FILLED' | 'REJECTED' | 'HALTED';
  mode: 'PAPER_DRY_RUN' | 'BINANCE_TESTNET';
  timestamp: string;
}

export interface OpenPosition {
  id: string;
  pair: CryptoPair;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  sizeUsd: number;
  leverage: number;
  stopLoss: number;
  takeProfit: number;
  unrealizedPnlUsd: number;
  unrealizedPnlPct: number;
  openedAt: string;
}

export interface PortfolioState {
  cashBalanceUsd: number;
  portfolioValueUsd: number;
  initialCapitalUsd: number;
  totalRealizedPnlUsd: number;
  dailyStartingCapitalUsd: number;
  dailyRealizedPnlUsd: number;
  dailyPnlPct: number;
  openPositions: OpenPosition[];
  closedTradesCount: number;
  winningTradesCount: number;
  winRatePct: number;
}

export interface AgentCallLog {
  id: string;
  agentName: string;
  model: string;
  pair: CryptoPair;
  timestamp: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs: number;
  outcomeSummary: string;
}

export interface PostTradeReview {
  reviewDate: string;
  tradesAnalyzed: number;
  totalPnlUsd: number;
  winRatePct: number;
  sharpeEstimate: number;
  benchmarkBuyHoldPnlPct: number;
  agentPerformanceScore: number; // 0 - 100
  keyObservations: string[];
  recommendedModelTierAdjustments: string[];
  summary: string;
  modelTier: 'Sonnet 5' | 'gemini-3.8-flash';
  tokens: { input: number; output: number; costUsd: number };
}

export interface PairTicker {
  pair: CryptoPair;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  orderBook: {
    bidDepth: number;
    askDepth: number;
    spread: number;
  };
}
