import React from 'react';
import {
  SentimentAnalysis,
  OnChainMetrics,
  ResearchThesis,
  TradeRecommendation,
  CryptoPair,
} from '../types';
import {
  BrainCircuit,
  Cpu,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Shield,
  FileCode2,
  DollarSign,
  Clock,
} from 'lucide-react';

interface AgentConsoleProps {
  pair: CryptoPair;
  sentiment: SentimentAnalysis | null;
  onChain: OnChainMetrics | null;
  thesis: ResearchThesis | null;
  recommendation: TradeRecommendation | null;
  onRunPipeline: () => void;
  isRunning: boolean;
}

export const AgentConsole: React.FC<AgentConsoleProps> = ({
  pair,
  sentiment,
  onChain,
  thesis,
  recommendation,
  onRunPipeline,
  isRunning,
}) => {
  return (
    <div id="agent-console-container" className="space-y-6">
      {/* Header info */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
            <h2 className="text-base font-serif italic text-white flex items-center gap-2">
              Tiered Multi-Agent Reasoning Terminal <span className="font-mono not-italic text-xs text-white/40 font-bold uppercase tracking-wider">({pair})</span>
            </h2>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Haiku 4.5 for high-frequency filtering • Sonnet 5 for thesis synthesis & capital allocation
          </p>
        </div>

        <button
          id="agent-console-run-btn"
          onClick={onRunPipeline}
          disabled={isRunning}
          className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 font-medium text-xs transition-all shadow-sm disabled:opacity-40"
        >
          {isRunning ? 'Synthesizing...' : 'Refresh Consensus'}
        </button>
      </div>

      {/* Grid of 4 Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agent 1: Sentiment Agent */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Sentiment Agent</h3>
                <span className="text-[10px] text-white/40">News & Social Pre-Filter</span>
              </div>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
              Tier 1 • Haiku 4.5
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#050505] border border-white/10">
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider block">Direction Score:</span>
              <span className="font-mono text-base font-bold text-emerald-400 mt-0.5 block">
                {sentiment?.score ? (sentiment.score >= 0 ? `+${sentiment.score.toFixed(2)}` : sentiment.score.toFixed(2)) : '+0.65'}
              </span>
              <span className="text-[9px] text-white/30 block mt-0.5">(-1.0 bear to +1.0 bull)</span>
            </div>

            <div className="p-3 rounded-lg bg-[#050505] border border-white/10">
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider block">Impact Score:</span>
              <span className="font-mono text-base font-bold text-white mt-0.5 block">
                {sentiment?.impact.toFixed(2) ?? '0.80'}
              </span>
              <span className="text-[9px] text-white/30 block mt-0.5">(0.0 noise to 1.0 catalytic)</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-2.5">
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40">Pre-filtered Relevant News Batch:</div>
            <div className="space-y-2.5 text-xs">
              {sentiment?.items.map((item) => (
                <div key={item.id} className="border-l-2 border-white/30 pl-2.5 py-0.5">
                  <div className="text-white/90 font-medium text-[11px] leading-snug">{item.title}</div>
                  <div className="flex items-center gap-3 text-[10px] text-white/40 mt-1 font-mono">
                    <span>{item.source}</span>
                    <span>Direction: {item.directionScore > 0 ? `+${item.directionScore}` : item.directionScore}</span>
                    <span>Impact: {item.impactScore}</span>
                  </div>
                </div>
              )) || <div className="text-white/40 text-xs">No items currently queued.</div>}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-2 border-t border-white/10">
            <span>Tokens: 1,200 in / 250 out</span>
            <span className="text-white/70">Cost: $0.0025</span>
          </div>
        </div>

        {/* Agent 2: On-chain / Fundamentals Agent */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">On-chain & Flows Agent</h3>
                <span className="text-[10px] text-white/40">Whale & Liquidity Ingestion</span>
              </div>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
              Tier 1 • Haiku 4.5
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#050505] border border-white/10">
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider block">Whale Net Flow:</span>
              <span className="font-mono text-base font-bold text-emerald-400 mt-0.5 block">
                {onChain ? `+$${(onChain.whaleNetFlowUsd / 1e6).toFixed(1)}M` : '+$48.5M'}
              </span>
              <span className="text-[9px] text-white/30 block mt-0.5">Exchange outflow = accumulation</span>
            </div>

            <div className="p-3 rounded-lg bg-[#050505] border border-white/10">
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider block">Perp Funding APR:</span>
              <span className="font-mono text-base font-bold text-white mt-0.5 block">
                {onChain ? `${(onChain.fundingRateApr * 100).toFixed(2)}%` : '+1.20%'}
              </span>
              <span className="text-[9px] text-white/30 block mt-0.5">Balanced leverage</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-1.5 text-xs">
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40">Flow Summary & MVRV Analysis:</div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              {onChain?.summary || 'Whale clusters show steady accumulation without speculative over-leveraging on derivatives exchanges.'}
            </p>
            <div className="text-[10px] font-mono text-white/40 pt-1">
              MVRV Z-Score: <strong className="text-white">{onChain?.mvrvZScore ?? '1.84'}</strong> (Undervalued regime &lt; 2.5)
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-2 border-t border-white/10">
            <span>Tokens: 1,850 in / 240 out</span>
            <span className="text-white/70">Cost: $0.0030</span>
          </div>
        </div>

        {/* Agent 3: Research / Thesis Agent */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Research / Thesis Agent</h3>
                <span className="text-[10px] text-white/40">Multi-Signal Synthesis Engine</span>
              </div>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
              Tier 2 • Sonnet 5
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#050505] border border-white/10">
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider block">Directional Bias:</span>
              <span className="font-mono text-base font-bold text-emerald-400 mt-0.5 block">
                {thesis?.directionalBias ?? 'LONG'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#050505] border border-white/10">
              <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider block">Confidence Level:</span>
              <span className="font-mono text-base font-bold text-white mt-0.5 block">
                {thesis?.confidence ?? 82}%
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-2 text-xs">
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40">Synthesized Thesis:</div>
            <p className="text-[11px] text-white/90 leading-relaxed font-sans italic">
              "{thesis?.thesis || 'Confluence of oversold RSI bounce, strong order-book bid depth imbalance, and institutional net whale accumulation supports upside expansion.'}"
            </p>
            <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-2 border-t border-white/10">
              <span>Target: <strong className="text-white">${thesis?.targetPrice ?? 0}</strong></span>
              <span>Invalidation: <strong className="text-rose-400">${thesis?.invalidationPrice ?? 0}</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-2 border-t border-white/10">
            <span>Tokens: 4,100 in / 650 out</span>
            <span className="text-white/70">Cost: $0.0120</span>
          </div>
        </div>

        {/* Agent 4: Orchestrator / Portfolio Manager */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Orchestrator / Portfolio Manager</h3>
                <span className="text-[10px] text-white/40">Capital Sizing & Candidate Ranker</span>
              </div>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
              Tier 2 • Sonnet 5
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-2.5 text-xs">
            <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40">Output: TradeRecommendation (NON-EXECUTABLE)</div>
            <div className="font-mono text-[11px] space-y-1.5 text-white/80 bg-[#0a0a0a] p-3 rounded border border-white/10">
              <div className="flex justify-between">
                <span className="text-white/40">Asset:</span>
                <span className="font-bold text-white">{recommendation?.pair ?? pair}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Recommended Action:</span>
                <span className="font-bold text-emerald-400">{recommendation?.direction ?? 'BUY'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Target Size:</span>
                <span className="text-white">${recommendation?.targetSizeUsd ?? 450} (4.5% risk)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Suggested Leverage:</span>
                <span className="text-white">{recommendation?.suggestedLeverage ?? 2.0}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Stop-Loss Price:</span>
                <span className="text-rose-400 font-bold">${recommendation?.stopLossPrice ?? 0}</span>
              </div>
            </div>

            <p className="text-[11px] text-white/40 italic">
              Note: This recommendation is strictly non-executable until verified by the deterministic Risk Manager.
            </p>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-2 border-t border-white/10">
            <span>Tokens: 2,400 in / 450 out</span>
            <span className="text-white/70">Cost: $0.0060</span>
          </div>
        </div>
      </div>
    </div>
  );
};
