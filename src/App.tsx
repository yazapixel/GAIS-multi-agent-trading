import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PipelineFlow } from './components/PipelineFlow';
import { MarketWatch } from './components/MarketWatch';
import { ChartAndSignals } from './components/ChartAndSignals';
import { AgentConsole } from './components/AgentConsole';
import { RiskCenter } from './components/RiskCenter';
import { PortfolioOrders } from './components/PortfolioOrders';
import { TokenCostTracker } from './components/TokenCostTracker';
import { AuditModal } from './components/AuditModal';
import {
  CryptoPair,
  Candle,
  QuantSignals,
  PairTicker,
  SentimentAnalysis,
  OnChainMetrics,
  ResearchThesis,
  TradeRecommendation,
  RiskApproval,
  RiskLimits,
  PortfolioState,
  ExecutionOrder,
  PostTradeReview,
} from './types';
import { DEFAULT_RISK_LIMITS } from './lib/riskManager';

const ALL_PAIRS: CryptoPair[] = [
  'BTC/USDT',
  'ETH/USDT',
  'SOL/USDT',
  'BNB/USDT',
  'AVAX/USDT',
  'DOGE/USDT',
  'LINK/USDT',
  'NEAR/USDT',
  'ADA/USDT',
  'SUI/USDT',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [selectedPair, setSelectedPair] = useState<CryptoPair>('BTC/USDT');

  const [tickers, setTickers] = useState<PairTicker[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [quantSignals, setQuantSignals] = useState<QuantSignals | null>(null);
  const [orderBook, setOrderBook] = useState<{ bidDepth: number; askDepth: number; spread: number } | null>(null);

  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [onChain, setOnChain] = useState<OnChainMetrics | null>(null);
  const [thesis, setThesis] = useState<ResearchThesis | null>(null);
  const [recommendation, setRecommendation] = useState<TradeRecommendation | null>(null);
  const [riskApproval, setRiskApproval] = useState<RiskApproval | null>(null);

  const [portfolio, setPortfolio] = useState<PortfolioState>({
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
  });

  const [limits, setLimits] = useState<RiskLimits>(DEFAULT_RISK_LIMITS);
  const [killSwitchEngaged, setKillSwitchEngaged] = useState<boolean>(false);
  const [executionHistory, setExecutionHistory] = useState<ExecutionOrder[]>([]);
  const [lastExecutionOrder, setLastExecutionOrder] = useState<ExecutionOrder | null>(null);

  const [totalTokenSpendUsd, setTotalTokenSpendUsd] = useState<number>(0.024);
  const [totalInputTokens, setTotalInputTokens] = useState<number>(14500);
  const [totalOutputTokens, setTotalOutputTokens] = useState<number>(2300);
  const [totalCalls, setTotalCalls] = useState<number>(5);

  const [isRunningPipeline, setIsRunningPipeline] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 5000);
  };

  // Fetch initial tickers
  const fetchTickers = useCallback(async () => {
    try {
      const res = await fetch('/api/market/tickers');
      if (res.ok) {
        const data = await res.json();
        setTickers(data.tickers || []);
      }
    } catch (e) {
      console.warn('Failed to fetch tickers:', e);
    }
  }, []);

  // Fetch candles & quant data for selected pair
  const fetchPairData = useCallback(async (pair: CryptoPair) => {
    try {
      const res = await fetch(`/api/market/candles/${encodeURIComponent(pair)}`);
      if (res.ok) {
        const data = await res.json();
        setCandles(data.candles || []);
        setQuantSignals(data.quantSignals || null);
        setOrderBook(data.orderBook || null);
      }
    } catch (e) {
      console.warn(`Failed to fetch candles for ${pair}:`, e);
    }
  }, []);

  // Fetch portfolio state
  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const data = await res.json();
        if (data.portfolio) setPortfolio(data.portfolio);
        if (typeof data.killSwitchEngaged === 'boolean') setKillSwitchEngaged(data.killSwitchEngaged);
        if (data.limits) setLimits(data.limits);
      }
    } catch (e) {
      console.warn('Failed to fetch portfolio:', e);
    }
  }, []);

  // Fetch token telemetry
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry/tokens');
      if (res.ok) {
        const data = await res.json();
        if (data.totalCostUsd) setTotalTokenSpendUsd(data.totalCostUsd);
        if (data.totalInputTokens) setTotalInputTokens(data.totalInputTokens);
        if (data.totalOutputTokens) setTotalOutputTokens(data.totalOutputTokens);
        if (data.callsCount) setTotalCalls(data.callsCount);
      }
    } catch (e) {
      console.warn('Failed to fetch telemetry:', e);
    }
  }, []);

  useEffect(() => {
    fetchTickers();
    fetchPairData(selectedPair);
    fetchPortfolio();
    fetchTelemetry();
  }, [fetchTickers, fetchPairData, selectedPair, fetchPortfolio, fetchTelemetry]);

  // Run the full Multi-Agent pipeline
  const handleRunPipeline = async (pairToRun?: CryptoPair) => {
    const pair = pairToRun || selectedPair;
    setIsRunningPipeline(true);
    showNotification('info', `Running autonomous agent pipeline for ${pair}...`);

    try {
      const res = await fetch('/api/agents/run-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair, overrideLimits: limits }),
      });

      if (!res.ok) {
        throw new Error('Pipeline invocation failed');
      }

      const data = await res.json();
      setQuantSignals(data.quantSignals);
      setSentiment(data.sentiment);
      setOnChain(data.onChain);
      setThesis(data.researchThesis);
      setRecommendation(data.recommendation);
      setRiskApproval(data.riskApproval);

      fetchTelemetry();
      fetchPortfolio();

      if (data.riskApproval?.approved) {
        showNotification(
          'success',
          `Pipeline complete: Recommendation for ${pair} APPROVED by Risk Manager with token ${data.riskApproval.approvalToken.substring(0, 18)}...`
        );
      } else {
        showNotification(
          'error',
          `Risk Manager HARD VETO on ${pair}: ${data.riskApproval?.vetoReason || 'Violated risk envelope'}`
        );
      }
    } catch (err: any) {
      console.error(err);
      showNotification('error', `Pipeline execution error: ${err.message}`);
    } finally {
      setIsRunningPipeline(false);
    }
  };

  // Execute an approved trade
  const handleExecuteApprovedTrade = async () => {
    if (!riskApproval || !riskApproval.approved || !riskApproval.approvalToken) {
      showNotification('error', 'Execution Error: Cannot execute without a validated RiskApproval token.');
      return;
    }

    const currentPrice = candles[candles.length - 1]?.close || 65000;
    const idempotencyKey = `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const res = await fetch('/api/execution/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approval: riskApproval,
          currentPrice,
          idempotencyKey,
          mode: 'PAPER_DRY_RUN',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Execution failed');
      }

      setPortfolio(data.portfolio);
      setLastExecutionOrder(data.order);
      setExecutionHistory((prev) => [data.order, ...prev]);

      // Reset approval to prevent re-execution
      setRiskApproval(null);

      showNotification(
        'success',
        `Order ${data.order.orderId} filled at $${data.order.filledPrice} (Slippage: +${data.order.slippageBps} bps). Position active in portfolio.`
      );
    } catch (err: any) {
      showNotification('error', `Execution Engine Error: ${err.message}`);
    }
  };

  // Close an open position
  const handleClosePosition = async (
    positionId: string,
    exitPrice: number,
    reason: 'MANUAL' | 'STOP_LOSS' | 'TAKE_PROFIT'
  ) => {
    try {
      const res = await fetch('/api/execution/close-position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId, exitPrice, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to close position');
      }

      setPortfolio(data.portfolio);
      const sign = data.closedPnlUsd >= 0 ? '+' : '';
      showNotification(
        data.closedPnlUsd >= 0 ? 'success' : 'info',
        `Position closed (${reason}): Net Realized P&L ${sign}$${data.closedPnlUsd.toFixed(2)}.`
      );
    } catch (err: any) {
      showNotification('error', `Close position error: ${err.message}`);
    }
  };

  // Toggle emergency kill switch
  const handleToggleKillSwitch = async () => {
    try {
      const res = await fetch('/api/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engaged: !killSwitchEngaged }),
      });
      const data = await res.json();
      setKillSwitchEngaged(data.killSwitchEngaged);

      if (data.killSwitchEngaged) {
        showNotification('error', 'KILL SWITCH ENGAGED: All automated orders halted. Risk veto active.');
      } else {
        showNotification('success', 'Kill switch disengaged. Normal trading flow restored.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update risk limits
  const handleUpdateLimits = async (newLimits: RiskLimits) => {
    try {
      const res = await fetch('/api/risk/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limits: newLimits }),
      });
      const data = await res.json();
      setLimits(data.limits);
      showNotification('success', 'Risk envelope limits updated successfully.');
    } catch (e) {
      console.error(e);
    }
  };

  // Run Post-Trade Review
  const handleRunPostTradeReview = async (): Promise<PostTradeReview> => {
    const res = await fetch('/api/agents/post-trade-review', { method: 'POST' });
    const data = await res.json();
    fetchTelemetry();
    return data.review;
  };

  // Run Strategic Audit
  const handleRunStrategicAudit = async (): Promise<any> => {
    const res = await fetch('/api/agents/strategic-audit', { method: 'POST' });
    const data = await res.json();
    fetchTelemetry();
    return data.audit;
  };

  // Map of current pair prices
  const currentPriceMap = tickers.reduce((acc, t) => {
    acc[t.pair] = t.price;
    return acc;
  }, {} as Record<CryptoPair, number>);

  return (
    <div id="crypto-trading-app" className="min-h-screen bg-[#050505] text-gray-300 flex flex-col font-sans selection:bg-white/20 selection:text-white">
      {/* Header with Navigation & Live Metrics */}
      <Header
        portfolio={portfolio}
        killSwitchEngaged={killSwitchEngaged}
        totalTokenSpendUsd={totalTokenSpendUsd}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleKillSwitch={handleToggleKillSwitch}
        isRunningPipeline={isRunningPipeline}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div
          id="toast-notification"
          className={`fixed bottom-5 right-5 z-50 max-w-md p-4 rounded-xl border backdrop-blur-md shadow-2xl shadow-black text-xs font-medium flex items-center justify-between gap-4 transition-all ${
            notification.type === 'success'
              ? 'bg-[#0a0a0a] border-white/30 text-white'
              : notification.type === 'error'
              ? 'bg-[#0a0a0a] border-rose-500/50 text-rose-200'
              : 'bg-[#0a0a0a] border-white/20 text-gray-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                notification.type === 'success'
                  ? 'bg-white'
                  : notification.type === 'error'
                  ? 'bg-rose-400'
                  : 'bg-white/50'
              }`}
            />
            <span className="leading-snug">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-white/40 hover:text-white font-mono text-sm ml-2 px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Tab 1: Architecture Pipeline (matching Section 1 spec) */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <PipelineFlow
              selectedPair={selectedPair}
              onSelectPair={(p) => {
                setSelectedPair(p);
                fetchPairData(p);
              }}
              allPairs={ALL_PAIRS}
              isRunning={isRunningPipeline}
              onRunPipeline={() => handleRunPipeline(selectedPair)}
              quantSignals={quantSignals}
              sentiment={sentiment}
              onChain={onChain}
              thesis={thesis}
              recommendation={recommendation}
              riskApproval={riskApproval}
              lastExecutionOrder={lastExecutionOrder}
              onExecuteApprovedTrade={handleExecuteApprovedTrade}
            />

            {/* Quick Market Universe Ribbon */}
            <MarketWatch
              tickers={tickers}
              selectedPair={selectedPair}
              onSelectPair={(p) => {
                setSelectedPair(p);
                fetchPairData(p);
              }}
              onRunPipelineForPair={(p) => {
                setSelectedPair(p);
                fetchPairData(p);
                handleRunPipeline(p);
              }}
              isRunningPipeline={isRunningPipeline}
            />
          </div>
        )}

        {/* Tab 2: Live Terminal & Quant Signals */}
        {activeTab === 'terminal' && (
          <div className="space-y-6">
            <ChartAndSignals
              pair={selectedPair}
              candles={candles}
              quantSignals={quantSignals}
              ticker={tickers.find((t) => t.pair === selectedPair) || null}
              orderBook={orderBook}
            />

            <MarketWatch
              tickers={tickers}
              selectedPair={selectedPair}
              onSelectPair={(p) => {
                setSelectedPair(p);
                fetchPairData(p);
              }}
              onRunPipelineForPair={(p) => {
                setSelectedPair(p);
                fetchPairData(p);
                handleRunPipeline(p);
              }}
              isRunningPipeline={isRunningPipeline}
            />
          </div>
        )}

        {/* Tab 3: Multi-Agent Reasoning Panel */}
        {activeTab === 'agents' && (
          <AgentConsole
            pair={selectedPair}
            sentiment={sentiment}
            onChain={onChain}
            thesis={thesis}
            recommendation={recommendation}
            onRunPipeline={() => handleRunPipeline(selectedPair)}
            isRunning={isRunningPipeline}
          />
        )}

        {/* Tab 4: Deterministic Risk Center & Vetoes */}
        {activeTab === 'risk' && (
          <RiskCenter
            limits={limits}
            onUpdateLimits={handleUpdateLimits}
            killSwitchEngaged={killSwitchEngaged}
            onToggleKillSwitch={handleToggleKillSwitch}
            portfolio={portfolio}
            lastApproval={riskApproval}
          />
        )}

        {/* Tab 5: Portfolio Positions & Order History */}
        {activeTab === 'portfolio' && (
          <PortfolioOrders
            portfolio={portfolio}
            executionHistory={executionHistory}
            onClosePosition={handleClosePosition}
            currentPrices={currentPriceMap}
          />
        )}

        {/* Tab 6: Token Telemetry & Cost Optimization Playbook */}
        {activeTab === 'telemetry' && (
          <TokenCostTracker
            totalSessionCostUsd={totalTokenSpendUsd}
            totalInputTokens={totalInputTokens}
            totalOutputTokens={totalOutputTokens}
            totalCalls={totalCalls}
          />
        )}

        {/* Tab 7: Post-Trade Review & Strategic Audit */}
        {activeTab === 'audit' && (
          <AuditModal
            onRunPostTradeReview={handleRunPostTradeReview}
            onRunStrategicAudit={handleRunStrategicAudit}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-6 px-4 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-white/40 rounded-full" />
            <span className="tracking-wide text-white/60">Multi-Agent AI Crypto Trading System</span>
            <span className="text-white/20">|</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Autonomous Architecture</span>
          </div>
          <span className="font-mono text-white/40 text-[11px]">
            Rule 1: LLMs judge • Rule 2: Code executes • Rule 3: Deterministic risk veto
          </span>
        </div>
      </footer>
    </div>
  );
}
