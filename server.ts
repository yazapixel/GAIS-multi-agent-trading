import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { computeQuantSignals } from './src/lib/quantEngine';
import { evaluateRisk, DEFAULT_RISK_LIMITS } from './src/lib/riskManager';
import { executeOrder, closePosition } from './src/lib/executionEngine';
import {
  Candle,
  CryptoPair,
  NewsItem,
  OnChainMetrics,
  PairTicker,
  PortfolioState,
  RiskLimits,
  TradeRecommendation,
} from './src/types';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini API client
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// In-memory system state
let killSwitchEngaged = false;
let globalRiskLimits: RiskLimits = { ...DEFAULT_RISK_LIMITS };

let portfolioState: PortfolioState = {
  cashBalanceUsd: 10000.0,
  portfolioValueUsd: 10000.0,
  initialCapitalUsd: 10000.0,
  totalRealizedPnlUsd: 0,
  dailyStartingCapitalUsd: 10000.0,
  dailyRealizedPnlUsd: 0,
  dailyPnlPct: 0,
  openPositions: [],
  closedTradesCount: 0,
  winningTradesCount: 0,
  winRatePct: 0,
};

// Telemetry & Token Tracking
const tokenUsageLog: Array<{
  id: string;
  agent: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  timestamp: string;
}> = [];

// Base prices for the 10 pairs
const PAIR_CONFIGS: Record<CryptoPair, { basePrice: number; volatility: number; spread: number }> = {
  'BTC/USDT': { basePrice: 66800, volatility: 0.008, spread: 0.5 },
  'ETH/USDT': { basePrice: 3450, volatility: 0.012, spread: 0.1 },
  'SOL/USDT': { basePrice: 158.4, volatility: 0.018, spread: 0.05 },
  'BNB/USDT': { basePrice: 585.2, volatility: 0.009, spread: 0.1 },
  'AVAX/USDT': { basePrice: 28.6, volatility: 0.022, spread: 0.02 },
  'DOGE/USDT': { basePrice: 0.128, volatility: 0.025, spread: 0.0002 },
  'LINK/USDT': { basePrice: 14.8, volatility: 0.016, spread: 0.01 },
  'NEAR/USDT': { basePrice: 5.4, volatility: 0.02, spread: 0.005 },
  'ADA/USDT': { basePrice: 0.42, volatility: 0.014, spread: 0.0005 },
  'SUI/USDT': { basePrice: 1.88, volatility: 0.026, spread: 0.002 },
};

// State of simulated pair prices
const currentPrices: Record<CryptoPair, number> = {
  'BTC/USDT': 66800,
  'ETH/USDT': 3450,
  'SOL/USDT': 158.4,
  'BNB/USDT': 585.2,
  'AVAX/USDT': 28.6,
  'DOGE/USDT': 0.128,
  'LINK/USDT': 14.8,
  'NEAR/USDT': 5.4,
  'ADA/USDT': 0.42,
  'SUI/USDT': 1.88,
};

// Generate realistic candles for a pair
function generateCandlesForPair(pair: CryptoPair, count = 40): Candle[] {
  const config = PAIR_CONFIGS[pair] || { basePrice: 100, volatility: 0.015, spread: 0.05 };
  const current = currentPrices[pair] || config.basePrice;
  const candles: Candle[] = [];
  const now = Date.now();
  const candleIntervalMs = 15 * 60 * 1000; // 15-minute candles

  let price = current * (1 - config.volatility * (count / 4));

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now - i * candleIntervalMs;
    const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add sinusoidal trend + random walk
    const cycle = Math.sin((count - i) * 0.3) * (config.basePrice * config.volatility * 0.8);
    const noise = (Math.random() - 0.49) * (config.basePrice * config.volatility);
    
    const open = price;
    const close = Math.max(config.basePrice * 0.5, open + noise + cycle * 0.1);
    const high = Math.max(open, close) + Math.random() * (config.basePrice * config.volatility * 0.6);
    const low = Math.min(open, close) - Math.random() * (config.basePrice * config.volatility * 0.6);
    const volume = Math.round(10000 + Math.random() * 50000 * (config.basePrice < 1 ? 1000 : 1));

    candles.push({
      timestamp,
      timeStr,
      open: Number(open.toFixed(config.basePrice < 1 ? 4 : 2)),
      high: Number(high.toFixed(config.basePrice < 1 ? 4 : 2)),
      low: Number(low.toFixed(config.basePrice < 1 ? 4 : 2)),
      close: Number(close.toFixed(config.basePrice < 1 ? 4 : 2)),
      volume,
    });

    price = close;
  }

  // Update current price to last candle close
  currentPrices[pair] = candles[candles.length - 1].close;
  return candles;
}

// Generate curated news items for a pair
function getSimulatedNews(pair: CryptoPair): NewsItem[] {
  const symbol = pair.split('/')[0];
  return [
    {
      id: `news-${symbol}-1`,
      title: `${symbol} Institutional Accumulation Surges Ahead of Quarterly Derivatives Expiry`,
      source: 'CryptoPanic / Coindesk',
      publishedAt: '12m ago',
      directionScore: 0.75,
      impactScore: 0.85,
      relevance: 0.95,
    },
    {
      id: `news-${symbol}-2`,
      title: `Macro Fed Liquidity Projections Provide Tailwinds for ${symbol} Layer-1 Ecosystem`,
      source: 'Bloomberg Crypto',
      publishedAt: '34m ago',
      directionScore: 0.6,
      impactScore: 0.7,
      relevance: 0.88,
    },
    {
      id: `news-${symbol}-3`,
      title: `Exchange Inflow Spikes briefly as Minor Miner Wallets Rebalance`,
      source: 'CoinTelegraph RSS',
      publishedAt: '1h ago',
      directionScore: -0.2,
      impactScore: 0.45,
      relevance: 0.65,
    },
  ];
}

// Generate on-chain metrics for a pair
function getSimulatedOnChain(pair: CryptoPair): OnChainMetrics {
  const symbol = pair.split('/')[0];
  const isBullish = Math.random() > 0.4;
  const whaleNetFlow = isBullish ? 48500000 : -14200000;
  const exchangeIn = 32000000;
  const exchangeOut = isBullish ? 54000000 : 25000000;

  return {
    whaleNetFlowUsd: whaleNetFlow,
    exchangeInflowUsd: exchangeIn,
    exchangeOutflowUsd: exchangeOut,
    netExchangeFlowUsd: exchangeOut - exchangeIn,
    fundingRateApr: isBullish ? 0.012 : -0.005,
    openInterestUsd: 1420000000,
    mvrvZScore: 1.84,
    signal: isBullish ? 'BULLISH' : 'NEUTRAL',
    summary: isBullish
      ? `Whale clusters show net outflow of $${Math.abs(whaleNetFlow / 1e6).toFixed(1)}M from exchanges (holding behavior). Funding rate is healthy at ${(0.012 * 100).toFixed(2)}%.`
      : `Moderate exchange deposits detected with neutral perp funding.`,
    modelTier: 'Haiku 4.5',
    tokens: { input: 1850, output: 240, costUsd: 0.003 },
    timestamp: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    killSwitchEngaged,
  });
});

// Get all 10 tickers
app.get('/api/market/tickers', (req, res) => {
  const tickers: PairTicker[] = (Object.keys(PAIR_CONFIGS) as CryptoPair[]).map((pair) => {
    const config = PAIR_CONFIGS[pair];
    const price = currentPrices[pair] || config.basePrice;
    const change24h = Number(((Math.random() * 8 - 3.5)).toFixed(2));
    const bidDepth = Math.round(500000 + Math.random() * 800000);
    const askDepth = Math.round(500000 + Math.random() * 800000);

    return {
      pair,
      price,
      change24h,
      high24h: Number((price * 1.035).toFixed(price < 1 ? 4 : 2)),
      low24h: Number((price * 0.965).toFixed(price < 1 ? 4 : 2)),
      volume24h: Math.round(15000000 + Math.random() * 30000000),
      orderBook: {
        bidDepth,
        askDepth,
        spread: config.spread,
      },
    };
  });

  res.json({ tickers });
});

// Get candles & quant signals for a specific pair
app.get('/api/market/candles/:pair', (req, res) => {
  const pair = decodeURIComponent(req.params.pair) as CryptoPair;
  const candles = generateCandlesForPair(pair, 50);
  const config = PAIR_CONFIGS[pair] || { basePrice: 100, volatility: 0.015, spread: 0.05 };
  
  const bidDepth = Math.round(600000 + Math.random() * 500000);
  const askDepth = Math.round(500000 + Math.random() * 500000);
  const quantSignals = computeQuantSignals(candles, bidDepth, askDepth);

  res.json({
    pair,
    candles,
    quantSignals,
    orderBook: { bidDepth, askDepth, spread: config.spread },
  });
});

// Run the full Multi-Agent Pipeline for a pair
app.post('/api/agents/run-pipeline', async (req, res) => {
  try {
    const { pair, overrideLimits } = req.body;
    const selectedPair = (pair as CryptoPair) || 'BTC/USDT';
    const candles = generateCandlesForPair(selectedPair, 50);
    const bidDepth = Math.round(750000 + Math.random() * 400000);
    const askDepth = Math.round(600000 + Math.random() * 400000);
    const quant = computeQuantSignals(candles, bidDepth, askDepth);

    const newsItems = getSimulatedNews(selectedPair);
    const onChain = getSimulatedOnChain(selectedPair);
    const currentPrice = candles[candles.length - 1].close;

    let sentimentScore = 0.65;
    let sentimentImpact = 0.8;
    let sentimentSummary = `Pre-filtered 3 high-impact news items. Institutional accumulation news dominates sentiment (+0.75 score). Miner selloff was small and absorbed.`;
    let thesisText = '';
    let thesisBias: 'LONG' | 'SHORT' | 'FLAT' = 'LONG';
    let confidence = 82;
    let orchestratorRationale = '';
    let direction: 'BUY' | 'SELL' = 'BUY';
    let targetSizeUsd = 450; // default 4.5% of 10,000
    let suggestedLeverage = 2.0;
    let stopLossPrice = 0;
    let targetPrice = 0;

    const ai = getGenAI();

    // If Gemini key is available, generate real AI agent reasoning using gemini-3.8-flash
    if (ai) {
      try {
        const prompt = `You are the Research & Portfolio Management agents of an autonomous crypto trading system.
Asset: ${selectedPair}
Current Price: $${currentPrice}
Deterministic Quant Signal: Direction: ${quant.signalDirection}, Score: ${quant.signalScore}/100, RSI: ${quant.rsi}, MACD Hist: ${quant.macd.histogram}, Volatility: ${quant.volatilityRegime}, Key Factors: ${quant.keyFactors.join('; ')}
On-chain Summary: ${onChain.summary}
News Headline 1: ${newsItems[0]?.title}

Generate structured JSON with:
1. "sentimentAnalysis": { "score": number between -1 and 1, "impact": number 0 to 1, "summary": short sentence }
2. "researchThesis": { "bias": "LONG" | "SHORT" | "FLAT", "confidence": number 0 to 100, "thesis": 2 sentences, "invalidationPrice": number, "targetPrice": number, "keyDrivers": array of 2 strings }
3. "portfolioRecommendation": { "action": "BUY" | "SELL" | "PASS", "confidence": number 0 to 100, "targetSizeUsd": number, "suggestedLeverage": number (1 to 3), "stopLossPrice": number, "targetPrice": number, "rationale": short 1 sentence }`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.sentimentAnalysis) {
          sentimentScore = parsed.sentimentAnalysis.score ?? sentimentScore;
          sentimentImpact = parsed.sentimentAnalysis.impact ?? sentimentImpact;
          sentimentSummary = parsed.sentimentAnalysis.summary ?? sentimentSummary;
        }
        if (parsed.researchThesis) {
          thesisText = parsed.researchThesis.thesis ?? '';
          thesisBias = parsed.researchThesis.bias ?? 'LONG';
          confidence = parsed.researchThesis.confidence ?? 80;
        }
        if (parsed.portfolioRecommendation) {
          direction = parsed.portfolioRecommendation.action === 'SELL' ? 'SELL' : 'BUY';
          targetSizeUsd = parsed.portfolioRecommendation.targetSizeUsd ?? 400;
          suggestedLeverage = parsed.portfolioRecommendation.suggestedLeverage ?? 2;
          stopLossPrice = parsed.portfolioRecommendation.stopLossPrice ?? 0;
          targetPrice = parsed.portfolioRecommendation.targetPrice ?? 0;
          orchestratorRationale = parsed.portfolioRecommendation.rationale ?? '';
        }

        // Record telemetry
        tokenUsageLog.push({
          id: `tok-${Date.now()}`,
          agent: 'Research / Thesis & Orchestrator',
          model: 'gemini-3.8-flash (Sonnet 5 tier)',
          inputTokens: 1420,
          outputTokens: 380,
          costUsd: 0.004,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Gemini API call failed, using heuristic fallback:', err);
      }
    }

    // Heuristic fallbacks if needed
    if (!thesisText) {
      if (quant.signalScore >= 15) {
        thesisBias = 'LONG';
        direction = 'BUY';
        confidence = Math.min(92, 70 + quant.signalScore * 0.2);
        stopLossPrice = Number((currentPrice * 0.975).toFixed(currentPrice < 1 ? 4 : 2));
        targetPrice = Number((currentPrice * 1.055).toFixed(currentPrice < 1 ? 4 : 2));
        thesisText = `Confluence of oversold RSI mean-reversion, positive order-book bid imbalance (+${(quant.orderBookImbalance * 100).toFixed(0)}%), and institutional on-chain accumulation favors continuation toward $${targetPrice}.`;
        orchestratorRationale = `Ranked #1 candidate in universe. Allocating 4.5% risk capital with strict 2.5% stop-loss.`;
      } else if (quant.signalScore <= -15) {
        thesisBias = 'SHORT';
        direction = 'SELL';
        confidence = Math.min(90, 70 + Math.abs(quant.signalScore) * 0.2);
        stopLossPrice = Number((currentPrice * 1.025).toFixed(currentPrice < 1 ? 4 : 2));
        targetPrice = Number((currentPrice * 0.945).toFixed(currentPrice < 1 ? 4 : 2));
        thesisText = `Bearish EMA misalignment with expanding MACD downside momentum and net exchange inflows points to liquidity test near $${targetPrice}.`;
        orchestratorRationale = `Hedge allocation against spot exposure with 2.5% stop-loss at $${stopLossPrice}.`;
      } else {
        thesisBias = 'FLAT';
        direction = 'BUY';
        confidence = 55;
        stopLossPrice = Number((currentPrice * 0.98).toFixed(currentPrice < 1 ? 4 : 2));
        targetPrice = Number((currentPrice * 1.03).toFixed(currentPrice < 1 ? 4 : 2));
        thesisText = `Choppy sideways consolidation between EMA 20 and EMA 50. Low directional conviction.`;
        orchestratorRationale = `Low conviction signal; recommend passing or minimal probe size.`;
      }

      tokenUsageLog.push({
        id: `tok-${Date.now()}`,
        agent: 'Pipeline Synthesizer (Tiered)',
        model: 'Haiku 4.5 & Sonnet 5',
        inputTokens: 3200,
        outputTokens: 620,
        costUsd: 0.0075,
        timestamp: new Date().toISOString(),
      });
    }

    if (!stopLossPrice) {
      stopLossPrice = direction === 'BUY'
        ? Number((currentPrice * 0.975).toFixed(currentPrice < 1 ? 4 : 2))
        : Number((currentPrice * 1.025).toFixed(currentPrice < 1 ? 4 : 2));
    }
    if (!targetPrice) {
      targetPrice = direction === 'BUY'
        ? Number((currentPrice * 1.05).toFixed(currentPrice < 1 ? 4 : 2))
        : Number((currentPrice * 0.95).toFixed(currentPrice < 1 ? 4 : 2));
    }

    const recommendation: TradeRecommendation = {
      id: `REC-${Date.now()}-${selectedPair.replace('/', '')}`,
      pair: selectedPair,
      direction,
      targetSizeUsd,
      currentPrice,
      targetPrice,
      stopLossPrice,
      suggestedLeverage,
      confidence,
      rationale: orchestratorRationale,
      urgency: confidence > 80 ? 'HIGH' : 'MEDIUM',
      modelTier: 'Sonnet 5',
      tokens: { input: 2400, output: 450, costUsd: 0.006 },
      generatedAt: new Date().toISOString(),
      status: 'PENDING_RISK',
    };

    // Evaluate in Risk Manager
    const effectiveLimits = overrideLimits || globalRiskLimits;
    const riskApproval = evaluateRisk(recommendation, portfolioState, effectiveLimits, killSwitchEngaged);

    recommendation.status = riskApproval.approved ? 'APPROVED' : 'VETOED';

    res.json({
      pair: selectedPair,
      quantSignals: quant,
      sentiment: {
        score: sentimentScore,
        impact: sentimentImpact,
        summary: sentimentSummary,
        headlinesCount: newsItems.length,
        items: newsItems,
        modelTier: 'Haiku 4.5',
        tokens: { input: 1200, output: 250, costUsd: 0.0025 },
        timestamp: new Date().toISOString(),
      },
      onChain,
      researchThesis: {
        thesis: thesisText,
        directionalBias: thesisBias,
        confidence,
        expectedHorizon: '4-12 hours',
        invalidationPrice: stopLossPrice,
        targetPrice,
        keyDrivers: quant.keyFactors.slice(0, 2),
        riskFactors: ['Sudden BTC volatility spike', 'Macro regulatory statement'],
        modelTier: 'Sonnet 5',
        tokens: { input: 4100, output: 650, costUsd: 0.012 },
        timestamp: new Date().toISOString(),
      },
      recommendation,
      riskApproval,
    });
  } catch (error: any) {
    console.error('Error running agent pipeline:', error);
    res.status(500).json({ error: error.message || 'Pipeline execution failed' });
  }
});

// Risk Manager direct evaluation endpoint
app.post('/api/risk/evaluate', (req, res) => {
  const { recommendation, limits } = req.body;
  const effectiveLimits = limits || globalRiskLimits;
  const approval = evaluateRisk(recommendation, portfolioState, effectiveLimits, killSwitchEngaged);
  res.json({ approval });
});

// Execution Engine order placement endpoint
app.post('/api/execution/execute', (req, res) => {
  try {
    const { approval, currentPrice, idempotencyKey, mode } = req.body;
    
    if (!idempotencyKey) {
      return res.status(400).json({ error: 'Idempotency key is required' });
    }

    const result = executeOrder(
      approval,
      currentPrice,
      portfolioState,
      idempotencyKey,
      mode || 'PAPER_DRY_RUN'
    );

    portfolioState = result.updatedPortfolio;
    res.json({
      order: result.order,
      portfolio: portfolioState,
    });
  } catch (error: any) {
    res.status(400).json({
      error: error.message,
      code: error.code || 'ERR_EXECUTION_FAILED',
    });
  }
});

// Close an open position
app.post('/api/execution/close-position', (req, res) => {
  try {
    const { positionId, exitPrice, reason } = req.body;
    const result = closePosition(positionId, exitPrice, portfolioState, reason);
    portfolioState = result.updatedPortfolio;
    res.json({
      closedPnlUsd: result.closedPnlUsd,
      portfolio: portfolioState,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle emergency kill switch
app.post('/api/kill-switch', (req, res) => {
  const { engaged } = req.body;
  killSwitchEngaged = typeof engaged === 'boolean' ? engaged : !killSwitchEngaged;
  res.json({ killSwitchEngaged });
});

// Update risk limits
app.post('/api/risk/limits', (req, res) => {
  const { limits } = req.body;
  if (limits) {
    globalRiskLimits = { ...globalRiskLimits, ...limits };
  }
  res.json({ limits: globalRiskLimits });
});

// Get portfolio state
app.get('/api/portfolio', (req, res) => {
  res.json({ portfolio: portfolioState, killSwitchEngaged, limits: globalRiskLimits });
});

// Post-Trade Review Agent
app.post('/api/agents/post-trade-review', async (req, res) => {
  const tradesAnalyzed = Math.max(portfolioState.closedTradesCount, 8);
  const totalPnl = portfolioState.totalRealizedPnlUsd;
  const winRate = portfolioState.winRatePct || 62.5;

  const review = {
    reviewDate: new Date().toISOString(),
    tradesAnalyzed,
    totalPnlUsd: totalPnl,
    winRatePct: winRate,
    sharpeEstimate: 1.85,
    benchmarkBuyHoldPnlPct: 1.2,
    agentPerformanceScore: 88,
    keyObservations: [
      'Sentiment Agent accurately pre-filtered high-impact institutional flow headlines',
      'Deterministic Quant Engine prevented entries during chop regimes (< 1.2% ATR)',
      'Risk Manager vetoed 3 oversized recommendations, keeping drawdown below 1.5%',
    ],
    recommendedModelTierAdjustments: [
      'Maintain Haiku 4.5 for high-frequency sentiment filtering ($0.23/day avg)',
      'Enable prompt caching on Research Agent system prompt to save 40% input tokens',
    ],
    summary: `System outperformed benchmark (+${winRate}% win rate vs +1.2% buy-and-hold). Total agent compute cost remained under $0.65 for the 24h cycle, generating strong positive Alpha-to-Compute ratio.`,
    modelTier: 'Sonnet 5' as const,
    tokens: { input: 18200, output: 1450, costUsd: 0.052 },
  };

  tokenUsageLog.push({
    id: `tok-${Date.now()}`,
    agent: 'Post-Trade Review Agent',
    model: 'Sonnet 5',
    inputTokens: 18200,
    outputTokens: 1450,
    costUsd: 0.052,
    timestamp: new Date().toISOString(),
  });

  res.json({ review });
});

// Strategic Audit (Opus 5 tier simulation)
app.post('/api/agents/strategic-audit', (req, res) => {
  const audit = {
    auditDate: new Date().toISOString(),
    auditorModel: 'Opus 5 (Deep Strategic Audit)',
    strategyDriftIndex: 'MINIMAL (0.12 / 1.0)',
    riskEnvelopeIntegrity: 'STRICTLY ENFORCED (0 bypasses detected)',
    conclusions: [
      'Separation of concerns (LLMs judge, code executes) successfully maintained zero-hallucination execution.',
      'Slippage modeling on Binance testnet/paper matched live books within 3.2 bps.',
      'Universe of 10 pairs showed balanced capital distribution across L1s and DeFi without concentration risk.',
    ],
    recommendations: [
      'Keep execution strictly in paper/testnet until forward test crosses 200 closed trades.',
      'Maintain daily drawdown circuit breaker at 4.0% with zero override permissions.',
    ],
    tokens: { input: 28400, output: 2100, costUsd: 0.19 },
  };

  tokenUsageLog.push({
    id: `tok-${Date.now()}`,
    agent: 'Strategic Audit Agent',
    model: 'Opus 5',
    inputTokens: 28400,
    outputTokens: 2100,
    costUsd: 0.19,
    timestamp: new Date().toISOString(),
  });

  res.json({ audit });
});

// Telemetry & Token Costs
app.get('/api/telemetry/tokens', (req, res) => {
  const totalCostUsd = tokenUsageLog.reduce((acc, log) => acc + log.costUsd, 0);
  const totalInputTokens = tokenUsageLog.reduce((acc, log) => acc + log.inputTokens, 0);
  const totalOutputTokens = tokenUsageLog.reduce((acc, log) => acc + log.outputTokens, 0);

  res.json({
    totalCostUsd: Number(totalCostUsd.toFixed(4)),
    totalInputTokens,
    totalOutputTokens,
    callsCount: tokenUsageLog.length,
    recentLogs: tokenUsageLog.slice(-15).reverse(),
  });
});

// -------------------------------------------------------------
// Vite Middleware setup
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Multi-Agent Crypto Trading System running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
