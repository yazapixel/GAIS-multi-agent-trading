import React, { useState } from 'react';
import {
  Database,
  Cpu,
  BrainCircuit,
  Binary,
  ShieldCheck,
  ShieldAlert,
  Send,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  CryptoPair,
  QuantSignals,
  SentimentAnalysis,
  OnChainMetrics,
  ResearchThesis,
  TradeRecommendation,
  RiskApproval,
  ExecutionOrder,
} from '../types';

interface PipelineFlowProps {
  selectedPair: CryptoPair;
  onSelectPair: (pair: CryptoPair) => void;
  allPairs: CryptoPair[];
  isRunning: boolean;
  onRunPipeline: () => void;
  quantSignals: QuantSignals | null;
  sentiment: SentimentAnalysis | null;
  onChain: OnChainMetrics | null;
  thesis: ResearchThesis | null;
  recommendation: TradeRecommendation | null;
  riskApproval: RiskApproval | null;
  lastExecutionOrder: ExecutionOrder | null;
  onExecuteApprovedTrade?: () => void;
}

export const PipelineFlow: React.FC<PipelineFlowProps> = ({
  selectedPair,
  onSelectPair,
  allPairs,
  isRunning,
  onRunPipeline,
  quantSignals,
  sentiment,
  onChain,
  thesis,
  recommendation,
  riskApproval,
  lastExecutionOrder,
  onExecuteApprovedTrade,
}) => {
  const [selectedNode, setSelectedNode] = useState<string>('risk');

  return (
    <div id="pipeline-flow-container" className="space-y-6">
      {/* Top Action Ribbon */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Asset Pair:</span>
            <select
              id="pipeline-pair-select"
              value={selectedPair}
              onChange={(e) => onSelectPair(e.target.value as CryptoPair)}
              className="bg-[#050505] border border-white/15 text-white font-mono text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/40"
            >
              {allPairs.map((p) => (
                <option key={p} value={p} className="bg-[#050505] text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-white/40">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
            <span className="font-mono text-[11px] text-white/60">Binance Spot & Futures Testnet</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="run-pipeline-btn"
            onClick={onRunPipeline}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              isRunning
                ? 'bg-white/15 text-white/40 cursor-not-allowed border border-white/10'
                : 'bg-white hover:bg-gray-200 text-black shadow-sm font-semibold'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Agents Synthesizing Signals...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Multi-Agent Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Visual Architecture Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Diagram View (7 cols) */}
        <div className="lg:col-span-7 bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                  <span className="font-serif italic text-base font-normal">Autonomous Pipeline</span>
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/40">Tiered Execution</span>
                </h2>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mt-1">
                Click any node to inspect live data, model tiering, and reasoning outputs
              </p>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
              Spec v1.0
            </span>
          </div>

          {/* Node 1: Ingestion */}
          <div
            id="node-ingestion"
            onClick={() => setSelectedNode('ingestion')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
              selectedNode === 'ingestion'
                ? 'border-white/60 bg-white/[0.04] ring-1 ring-white/20'
                : 'border-white/10 bg-[#050505] hover:border-white/25 hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-white/70" />
                <span className="text-xs font-semibold text-white">1. Data Ingestion Layer</span>
              </div>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
                Async Streams • No LLM
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-1.5">
              Real-time OHLCV candles, CCXT order book depth, CryptoPanic news RSS, and whale on-chain flows.
            </p>
          </div>

          <div className="flex justify-center -my-1 text-white/20">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>

          {/* Node 2: Quant Signal Engine */}
          <div
            id="node-quant"
            onClick={() => setSelectedNode('quant')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
              selectedNode === 'quant'
                ? 'border-white/60 bg-white/[0.04] ring-1 ring-white/20'
                : 'border-white/10 bg-[#050505] hover:border-white/25 hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Binary className="w-4 h-4 text-white/70" />
                <span className="text-xs font-semibold text-white">2. Deterministic Quant Signal Engine</span>
              </div>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
                Deterministic Code • No LLM
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-3 mt-2 text-[11px] text-white/60">
              <span>RSI(14): <strong className="text-white font-mono">{quantSignals?.rsi ?? '--'}</strong></span>
              <span>MACD: <strong className="text-white font-mono">{quantSignals?.macd.histogram.toFixed(2) ?? '--'}</strong></span>
              <span>Regime: <strong className="text-white font-mono">{quantSignals?.volatilityRegime ?? 'NORMAL'}</strong></span>
              <span>Signal: <strong className={quantSignals?.signalDirection === 'BUY' ? 'text-emerald-400 font-mono' : quantSignals?.signalDirection === 'SELL' ? 'text-rose-400 font-mono' : 'text-white/60 font-mono'}>{quantSignals?.signalDirection ?? 'NEUTRAL'}</strong></span>
            </div>
          </div>

          <div className="flex justify-center -my-1 text-white/20">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>

          {/* Node 3 & 4: Dual Pre-filtering Agents (Sentiment & On-chain) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sentiment */}
            <div
              id="node-sentiment"
              onClick={() => setSelectedNode('sentiment')}
              className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                selectedNode === 'sentiment'
                  ? 'border-white/60 bg-white/[0.04] ring-1 ring-white/20'
                  : 'border-white/10 bg-[#050505] hover:border-white/25 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold text-white">3. Sentiment Agent</span>
                </div>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
                  Haiku 4.5 • Batched
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-1.5">
                Direction: <strong className="text-white font-mono">{sentiment?.score.toFixed(2) ?? '+0.65'}</strong> • Impact: <strong className="text-white font-mono">{sentiment?.impact.toFixed(2) ?? '0.80'}</strong>
              </p>
            </div>

            {/* On-Chain */}
            <div
              id="node-onchain"
              onClick={() => setSelectedNode('onchain')}
              className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                selectedNode === 'onchain'
                  ? 'border-white/60 bg-white/[0.04] ring-1 ring-white/20'
                  : 'border-white/10 bg-[#050505] hover:border-white/25 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-semibold text-white">4. On-chain / Fund.</span>
                </div>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
                  Haiku 4.5 • Hourly
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-1.5">
                Net Flow: <strong className="text-white font-mono">{onChain ? `$${(onChain.netExchangeFlowUsd / 1e6).toFixed(1)}M` : '+$22.0M'}</strong> • Signal: <strong className="text-emerald-400 font-mono">{onChain?.signal ?? 'BULLISH'}</strong>
              </p>
            </div>
          </div>

          <div className="flex justify-center -my-1 text-white/20">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>

          {/* Node 5: Research / Thesis Agent */}
          <div
            id="node-thesis"
            onClick={() => setSelectedNode('thesis')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
              selectedNode === 'thesis'
                ? 'border-white/60 bg-white/[0.04] ring-1 ring-white/20'
                : 'border-white/10 bg-[#050505] hover:border-white/25 hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-4 h-4 text-white/70" />
                <span className="text-xs font-semibold text-white">5. Research / Thesis Agent</span>
              </div>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
                Sonnet 5 • Event-Triggered
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-1.5 line-clamp-1 font-serif italic">
              {thesis?.thesis || 'Synthesizes quant indicators, news sentiment, and on-chain whale activity into a cohesive directional thesis.'}
            </p>
          </div>

          <div className="flex justify-center -my-1 text-white/20">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>

          {/* Node 6: Orchestrator / Portfolio Manager */}
          <div
            id="node-orchestrator"
            onClick={() => setSelectedNode('orchestrator')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
              selectedNode === 'orchestrator'
                ? 'border-white/60 bg-white/[0.04] ring-1 ring-white/20'
                : 'border-white/10 bg-[#050505] hover:border-white/25 hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-white/70" />
                <span className="text-xs font-semibold text-white">6. Orchestrator / Portfolio Manager</span>
              </div>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
                Sonnet 5 • Allocator
              </span>
            </div>
            <p className="text-[11px] text-white/60 mt-1.5">
              Produces a <strong>TradeRecommendation object</strong> (Action: {recommendation?.direction ?? 'BUY'}, Size: ${recommendation?.targetSizeUsd ?? '450'}) — <span className="text-white/40 uppercase font-mono text-[10px] tracking-wider">NOT AN ORDER</span>
            </p>
          </div>

          <div className="flex justify-center -my-1 text-white/40">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Node 7: Risk Manager (HARD VETO) */}
          <div
            id="node-risk"
            onClick={() => setSelectedNode('risk')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              selectedNode === 'risk'
                ? 'border-rose-500/70 bg-rose-950/20 ring-1 ring-rose-500/30'
                : 'border-rose-900/40 bg-rose-950/10 hover:border-rose-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-200">7. Risk Manager (DETERMINISTIC HARD VETO)</span>
              </div>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800">
                Plain Code • Veto Authority
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-white/60">
                Enforces position caps, 3x leverage max, mandatory stop-loss, and daily drawdown circuit breaker.
              </span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${riskApproval?.approved ? 'bg-white/10 text-white border border-white/20' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                {riskApproval?.approved ? 'APPROVED' : 'VETOED / PENDING'}
              </span>
            </div>
          </div>

          <div className="flex justify-center -my-1 text-white/20">
            <ArrowDown className="w-3.5 h-3.5" />
          </div>

          {/* Node 8: Execution Engine */}
          <div
            id="node-execution"
            onClick={() => setSelectedNode('execution')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
              selectedNode === 'execution'
                ? 'border-white/60 bg-white/[0.04] ring-1 ring-white/20'
                : 'border-white/10 bg-[#050505] hover:border-white/25 hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-white/70" />
                <span className="text-xs font-semibold text-white">8. Execution Engine (CCXT / Paper Engine)</span>
              </div>
              <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
                Idempotent • Validated Approval Only
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-1.5">
              Fills order with slippage control only when a cryptographically validated RiskApproval token is provided.
            </p>
          </div>
        </div>

        {/* Right: Inspector Details (5 cols) */}
        <div className="lg:col-span-5 bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em]">
              Node Inspector: <span className="text-white/40">{selectedNode.toUpperCase()}</span>
            </h3>
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/40">Live Payload</span>
          </div>

          {/* Detailed payload based on selected node */}
          {selectedNode === 'ingestion' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10">
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-mono">Exchange Streams</div>
                <div className="font-mono text-white font-semibold">{selectedPair} Spot & Perp WebSocket</div>
                <div className="text-white/50 text-[11px] mt-1">Order book depth: 50 bids / 50 asks aggregated via CCXT</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10">
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-mono">News Feeds Filter</div>
                <div className="text-white/80">CryptoPanic API + CoinDesk RSS (Cosine similarity pre-filter applied)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10">
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1 font-mono">On-Chain Collector</div>
                <div className="text-white/80">Etherscan & Binance Hot Wallet net transfers tracker (hourly polling)</div>
              </div>
            </div>
          )}

          {selectedNode === 'quant' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">RSI (14-period):</span>
                  <span className="font-mono font-bold text-white">{quantSignals?.rsi ?? 52.4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">MACD Histogram:</span>
                  <span className="font-mono font-bold text-white">{quantSignals?.macd.histogram.toFixed(2) ?? '0.45'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">EMA 20 / 50 / 200:</span>
                  <span className="font-mono text-white">${quantSignals?.ema.ema20} / ${quantSignals?.ema.ema50}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Order Book Imbalance:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {quantSignals ? `${(quantSignals.orderBookImbalance * 100).toFixed(1)}%` : '+18.2%'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-1.5">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Quant Composite Score:</span>
                  <span className="font-mono font-bold text-white">
                    {quantSignals?.signalScore ?? 45} / 100
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10">
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-2 font-mono">Deterministic Rule Factors:</div>
                <ul className="space-y-1.5 text-[11px] text-white/70">
                  {quantSignals?.keyFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-white/40">•</span>
                      <span>{f}</span>
                    </li>
                  )) || (
                    <li>• Bullish EMA alignment (Price &gt; EMA20 &gt; EMA50)</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {selectedNode === 'sentiment' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Model Tier:</span>
                  <span className="font-mono text-white font-bold">Haiku 4.5 ($1 / $5 per M tok)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Directional Score:</span>
                  <span className="font-mono font-bold text-emerald-400">{sentiment?.score.toFixed(2) ?? '+0.65'} (-1.0 to +1.0)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Impact Score:</span>
                  <span className="font-mono font-bold text-white">{sentiment?.impact.toFixed(2) ?? '0.80'} (0.0 to 1.0)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10">
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-2 font-mono">Pre-filtered Headlines:</div>
                <div className="space-y-2.5 text-[11px]">
                  {sentiment?.items.map((item) => (
                    <div key={item.id} className="border-l border-white/20 pl-2.5">
                      <div className="text-white/90 font-medium">{item.title}</div>
                      <div className="text-white/40 text-[10px] font-mono mt-0.5">{item.source} • Score: {item.directionScore}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedNode === 'onchain' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Whale Net Flow:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {onChain ? `+$${(onChain.whaleNetFlowUsd / 1e6).toFixed(1)}M` : '+$48.5M'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Perp Funding Rate (APR):</span>
                  <span className="font-mono font-bold text-white">
                    {onChain ? `${(onChain.fundingRateApr * 100).toFixed(2)}%` : '+1.20%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">MVRV Z-Score:</span>
                  <span className="font-mono text-white">{onChain?.mvrvZScore ?? '1.84'}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 text-[11px] text-white/70">
                {onChain?.summary || 'Whale accumulation patterns demonstrate net withdrawal from major exchange liquidity pools.'}
              </div>
            </div>
          )}

          {selectedNode === 'thesis' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Model Tier:</span>
                  <span className="font-mono text-white font-bold">Sonnet 5 ($2 / $10 per M tok)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Directional Bias:</span>
                  <span className="font-mono font-bold text-emerald-400">{thesis?.directionalBias ?? 'LONG'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Synthesized Confidence:</span>
                  <span className="font-mono font-bold text-white">{thesis?.confidence ?? 82}%</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10">
                <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1.5 font-mono">Synthesized Thesis:</div>
                <p className="text-[11px] text-white/80 font-serif italic leading-relaxed">
                  "{thesis?.thesis || 'Confluence of positive quant signals, strong bid order-book depth, and institutional news accumulation supports upside expansion.'}"
                </p>
              </div>
            </div>
          )}

          {selectedNode === 'orchestrator' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Object Type:</span>
                  <span className="font-mono text-white font-bold">TradeRecommendation (NOT ORDER)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Proposed Action:</span>
                  <span className="font-mono font-bold text-emerald-400">{recommendation?.direction ?? 'BUY'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Requested Size:</span>
                  <span className="font-mono text-white">${recommendation?.targetSizeUsd ?? 450}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Stop-Loss Target:</span>
                  <span className="font-mono text-rose-400">${recommendation?.stopLossPrice ?? 0}</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 text-[11px] text-white/70">
                <strong>Rationale:</strong> {recommendation?.rationale || 'Ranked top candidate in universe based on risk-reward profile.'}
              </div>
            </div>
          )}

          {selectedNode === 'risk' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-white/40 uppercase tracking-wider text-[10px]">Risk Manager Verdict:</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${riskApproval?.approved ? 'bg-white/10 text-white border border-white/20' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                    {riskApproval?.approved ? 'APPROVED' : 'VETOED / REJECTED'}
                  </span>
                </div>

                {riskApproval?.approvalToken && (
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">Approval Token:</span>
                    <div className="font-mono text-[10px] text-white/80 bg-white/5 border border-white/10 px-2 py-1 rounded break-all mt-1">
                      {riskApproval.approvalToken}
                    </div>
                  </div>
                )}

                {riskApproval?.vetoReason && (
                  <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px]">
                    <strong>Veto Reason:</strong> {riskApproval.vetoReason}
                  </div>
                )}
              </div>

              {/* Checks Passed Checklist */}
              <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 space-y-2 text-[11px]">
                <div className="text-white/40 uppercase tracking-wider text-[10px] font-mono mb-1">Deterministic Hard Limit Checks:</div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${riskApproval?.checksPassed.positionSizeChecked ? 'text-white' : 'text-white/20'}`} />
                  <span className="text-white/80">Max position size cap (&le; 5% of portfolio)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${riskApproval?.checksPassed.exposureLimitChecked ? 'text-white' : 'text-white/20'}`} />
                  <span className="text-white/80">Max total portfolio exposure cap (&le; 35%)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${riskApproval?.checksPassed.leverageChecked ? 'text-white' : 'text-white/20'}`} />
                  <span className="text-white/80">Max leverage limit cap (&le; 3x)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${riskApproval?.checksPassed.stopLossEnforced ? 'text-white' : 'text-white/20'}`} />
                  <span className="text-white/80">Mandatory stop-loss rule enforced</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${riskApproval?.checksPassed.circuitBreakerChecked ? 'text-white' : 'text-white/20'}`} />
                  <span className="text-white/80">Daily drawdown circuit breaker (&lt; 4%)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${riskApproval?.checksPassed.killSwitchChecked ? 'text-white' : 'text-rose-400'}`} />
                  <span className="text-white/80">Emergency kill switch disengaged</span>
                </div>
              </div>

              {/* Trigger Execution Button if approved */}
              {riskApproval?.approved && onExecuteApprovedTrade && (
                <button
                  id="execute-approved-trade-btn"
                  onClick={onExecuteApprovedTrade}
                  className="w-full py-2.5 rounded-lg bg-white hover:bg-gray-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Approved Order on Paper Engine</span>
                </button>
              )}
            </div>
          )}

          {selectedNode === 'execution' && (
            <div className="space-y-3 text-xs">
              {lastExecutionOrder ? (
                <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-white/40">Order ID:</span>
                    <span className="text-white">{lastExecutionOrder.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Filled Price:</span>
                    <span className="text-white">${lastExecutionOrder.filledPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Slippage:</span>
                    <span className="text-white">{lastExecutionOrder.slippageBps} bps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Position Size:</span>
                    <span className="text-white">${lastExecutionOrder.sizeUsd} ({lastExecutionOrder.leverage}x)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Idempotency Key:</span>
                    <span className="text-white/50 text-[10px] truncate max-w-[180px]">{lastExecutionOrder.idempotencyKey}</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl bg-[#050505] border border-white/10 text-white/40 text-center text-xs">
                  No trade executed in this session yet. Run the pipeline and click "Execute Approved Order".
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
