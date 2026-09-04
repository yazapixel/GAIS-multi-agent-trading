import React from 'react';
import {
  PortfolioState,
  ExecutionOrder,
  CryptoPair,
} from '../types';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertOctagon,
  Percent,
  X,
  Target,
} from 'lucide-react';

interface PortfolioOrdersProps {
  portfolio: PortfolioState;
  executionHistory: ExecutionOrder[];
  onClosePosition: (positionId: string, exitPrice: number, reason: 'MANUAL' | 'STOP_LOSS' | 'TAKE_PROFIT') => void;
  currentPrices: Record<CryptoPair, number>;
}

export const PortfolioOrders: React.FC<PortfolioOrdersProps> = ({
  portfolio,
  executionHistory,
  onClosePosition,
  currentPrices,
}) => {
  return (
    <div id="portfolio-orders-container" className="space-y-6">
      {/* Portfolio Balance Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40 font-bold">Total Capital</div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5">
            ${portfolio.portfolioValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">Cash: ${portfolio.cashBalanceUsd.toFixed(2)}</div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40 font-bold">Realized P&L</div>
          <div className={`text-2xl font-bold font-mono mt-1.5 ${portfolio.totalRealizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {portfolio.totalRealizedPnlUsd >= 0 ? '+' : ''}${portfolio.totalRealizedPnlUsd.toFixed(2)}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">Today: {portfolio.dailyPnlPct >= 0 ? '+' : ''}{portfolio.dailyPnlPct.toFixed(2)}%</div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40 font-bold">Win Rate</div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5">
            {portfolio.winRatePct}%
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">{portfolio.winningTradesCount} wins / {portfolio.closedTradesCount} trades</div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40 font-bold">Active Exposure</div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5">
            ${portfolio.openPositions.reduce((sum, p) => sum + p.sizeUsd, 0).toFixed(0)}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">{portfolio.openPositions.length} active positions</div>
        </div>
      </div>

      {/* Active Open Positions Section */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              <h3 className="text-base font-serif italic text-white flex items-center gap-2">
                Active Positions <span className="font-mono not-italic text-xs text-white/40 font-bold uppercase tracking-wider">({portfolio.openPositions.length})</span>
              </h3>
            </div>
            <p className="text-xs text-white/40 mt-0.5">
              Mandatory stop-losses and take-profits monitored on every tick.
            </p>
          </div>
        </div>

        {portfolio.openPositions.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40 bg-[#050505] rounded-lg border border-white/10">
            No positions currently open. Run the Multi-Agent Pipeline and execute an approved recommendation.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-white/40 font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3">Side / Lev</th>
                  <th className="py-3 px-3">Entry Price</th>
                  <th className="py-3 px-3">Size (USD)</th>
                  <th className="py-3 px-3">Stop-Loss</th>
                  <th className="py-3 px-3">Take-Profit</th>
                  <th className="py-3 px-3">Unrealized P&L</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {portfolio.openPositions.map((pos) => {
                  const currentPrice = currentPrices[pos.pair] || pos.entryPrice;
                  let pnlPct = ((currentPrice - pos.entryPrice) / pos.entryPrice) * 100 * pos.leverage;
                  if (pos.side === 'SHORT') pnlPct = -pnlPct;
                  const pnlUsd = (pos.sizeUsd * pnlPct) / 100;
                  const isProfitable = pnlUsd >= 0;

                  return (
                    <tr key={pos.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-3 font-bold text-white">{pos.pair}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold border ${pos.side === 'LONG' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20' : 'bg-rose-950/40 text-rose-400 border-rose-500/20'}`}>
                          {pos.side} {pos.leverage}x
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-white/80">${pos.entryPrice < 1 ? pos.entryPrice.toFixed(4) : pos.entryPrice.toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-white/80">${pos.sizeUsd.toFixed(2)}</td>
                      <td className="py-3.5 px-3 text-rose-400">${pos.stopLoss < 1 ? pos.stopLoss.toFixed(4) : pos.stopLoss.toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-emerald-400">${pos.takeProfit < 1 ? pos.takeProfit.toFixed(4) : pos.takeProfit.toLocaleString()}</td>
                      <td className={`py-3.5 px-3 font-bold ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isProfitable ? '+' : ''}${pnlUsd.toFixed(2)} ({isProfitable ? '+' : ''}{pnlPct.toFixed(2)}%)
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-2 font-mono">
                        {/* Simulate stop-loss hit */}
                        <button
                          onClick={() => onClosePosition(pos.id, pos.stopLoss, 'STOP_LOSS')}
                          className="px-2.5 py-1 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/20 text-rose-400 rounded text-[10px] transition-colors"
                          title="Simulate candle hitting the mandatory stop-loss"
                        >
                          Trigger SL
                        </button>
                        {/* Manual Market Close */}
                        <button
                          onClick={() => onClosePosition(pos.id, currentPrice, 'MANUAL')}
                          className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded text-[10px] transition-colors"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Executed Orders History Log */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              <h3 className="text-base font-serif italic text-white flex items-center gap-2">
                Execution Order Log
              </h3>
            </div>
            <p className="text-xs text-white/40 mt-0.5">
              Each fill records realistic slippage basis points and cryptographic RiskApproval token.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
            {executionHistory.length} Total Orders
          </span>
        </div>

        {executionHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40 bg-[#050505] rounded-lg border border-white/10">
            No executed orders recorded yet. Run the pipeline to submit an order.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-white/40 font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3">Side</th>
                  <th className="py-3 px-3">Filled Price</th>
                  <th className="py-3 px-3">Slippage</th>
                  <th className="py-3 px-3">Size (USD)</th>
                  <th className="py-3 px-3">Approval Token</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {executionHistory.slice(0, 10).map((ord) => (
                  <tr key={ord.orderId} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-white/40 font-semibold">{ord.orderId}</td>
                    <td className="py-3 px-3 text-white font-bold">{ord.pair}</td>
                    <td className="py-3 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold border ${ord.side === 'BUY' ? 'text-emerald-400 bg-emerald-950/30 border-emerald-500/20' : 'text-rose-400 bg-rose-950/30 border-rose-500/20'}`}>
                        {ord.side}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white/80">${ord.filledPrice < 1 ? ord.filledPrice.toFixed(4) : ord.filledPrice.toLocaleString()}</td>
                    <td className="py-3 px-3 text-white/40">+{ord.slippageBps} bps</td>
                    <td className="py-3 px-3 text-white/80">${ord.sizeUsd.toFixed(2)}</td>
                    <td className="py-3 px-3 text-white/40 truncate max-w-[140px]" title={ord.approvalToken}>
                      {ord.approvalToken}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10 text-[9px] font-mono uppercase tracking-wider font-bold">
                        FILLED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
