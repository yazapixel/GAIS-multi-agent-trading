import React from 'react';
import { CryptoPair, PairTicker } from '../types';
import { TrendingUp, TrendingDown, ArrowRight, Play, Activity } from 'lucide-react';

interface MarketWatchProps {
  tickers: PairTicker[];
  selectedPair: CryptoPair;
  onSelectPair: (pair: CryptoPair) => void;
  onRunPipelineForPair: (pair: CryptoPair) => void;
  isRunningPipeline: boolean;
}

export const MarketWatch: React.FC<MarketWatchProps> = ({
  tickers,
  selectedPair,
  onSelectPair,
  onRunPipelineForPair,
  isRunningPipeline,
}) => {
  return (
    <div id="market-watch-container" className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="font-serif italic text-base font-normal">Market Watch</span>
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/40">Binance Spot / Perp</span>
            </h2>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mt-1">
            Automated Quant Engine monitors tick data and order book depth continuously
          </p>
        </div>
        <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/60">
          10 Pairs Active
        </span>
      </div>

      {/* Grid of pairs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {tickers.map((t) => {
          const isSelected = selectedPair === t.pair;
          const isPositive = t.change24h >= 0;
          const totalDepth = t.orderBook.bidDepth + t.orderBook.askDepth;
          const bidPct = Math.round((t.orderBook.bidDepth / totalDepth) * 100);

          return (
            <div
              key={t.pair}
              id={`ticker-card-${t.pair.replace('/', '-')}`}
              onClick={() => onSelectPair(t.pair)}
              className={`cursor-pointer p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-white/60 bg-white/[0.04] shadow-sm ring-1 ring-white/20'
                  : 'border-white/10 bg-[#050505] hover:border-white/25 hover:bg-white/[0.02]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white tracking-wide font-mono">{t.pair}</span>
                  <span
                    className={`text-[10px] font-mono flex items-center gap-0.5 px-1.5 py-0.5 rounded border ${
                      isPositive
                        ? 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20'
                        : 'text-rose-400 bg-rose-950/40 border-rose-500/20'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {isPositive ? '+' : ''}
                    {t.change24h}%
                  </span>
                </div>

                <div className="text-base font-bold font-mono text-white tracking-tight">
                  ${t.price < 1 ? t.price.toFixed(4) : t.price.toLocaleString()}
                </div>
              </div>

              <div className="mt-3.5 space-y-2 border-t border-white/10 pt-2.5">
                <div className="flex justify-between text-[10px] text-white/40">
                  <span className="uppercase tracking-wider">OB Bid Depth</span>
                  <span className="font-mono text-white/80">{bidPct}%</span>
                </div>

                {/* Depth bar */}
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-400/80" style={{ width: `${bidPct}%` }} />
                  <div className="h-full bg-rose-400/80" style={{ width: `${100 - bidPct}%` }} />
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    id={`analyze-btn-${t.pair.replace('/', '-')}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPair(t.pair);
                      onRunPipelineForPair(t.pair);
                    }}
                    disabled={isRunningPipeline}
                    className="w-full py-1.5 text-[10px] font-mono uppercase tracking-wider text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-2.5 h-2.5 fill-current text-white/60" />
                    <span>Run Agents</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
