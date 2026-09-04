import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  DollarSign,
  TrendingUp,
  Cpu,
  PowerOff,
  AlertTriangle,
} from 'lucide-react';
import { PortfolioState } from '../types';

interface HeaderProps {
  portfolio: PortfolioState;
  killSwitchEngaged: boolean;
  totalTokenSpendUsd: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleKillSwitch: () => void;
  isRunningPipeline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  portfolio,
  killSwitchEngaged,
  totalTokenSpendUsd,
  activeTab,
  setActiveTab,
  onToggleKillSwitch,
  isRunningPipeline,
}) => {
  const tabs = [
    { id: 'pipeline', label: 'Architecture Pipeline' },
    { id: 'terminal', label: 'Live Terminal & Quant' },
    { id: 'agents', label: 'Multi-Agent Reasoning' },
    { id: 'risk', label: 'Risk Manager & Vetoes' },
    { id: 'portfolio', label: 'Positions & Execution' },
    { id: 'telemetry', label: 'Token & Cost Telemetry' },
    { id: 'audit', label: 'Post-Trade Audit' },
  ];

  const pnlColor =
    portfolio.dailyPnlPct > 0
      ? 'text-emerald-400'
      : portfolio.dailyPnlPct < 0
      ? 'text-rose-400'
      : 'text-white/80';

  return (
    <header id="main-header" className="border-b border-white/10 bg-[#050505]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center border border-white/20 text-white">
            <div className="w-3.5 h-3.5 bg-white rounded-xs" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                <span className="font-serif italic text-lg font-normal text-white">Quantum</span>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-white/50">Multi-Agent System</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded border border-white/20 bg-white/10 text-white/90">
                Paper Run
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mt-0.5">
              LLMs Judge • Code Executes • Deterministic Risk Veto
            </p>
          </div>
        </div>

        {/* Real-time Telemetry Metrics */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Portfolio Value */}
          <div className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] flex items-center gap-2.5">
            <DollarSign className="w-3.5 h-3.5 text-white/40" />
            <div>
              <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">Portfolio</div>
              <div className="text-xs font-semibold text-white font-mono">
                ${portfolio.portfolioValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Daily PnL */}
          <div className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] flex items-center gap-2.5">
            <TrendingUp className={`w-3.5 h-3.5 ${pnlColor}`} />
            <div>
              <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">Daily P&L</div>
              <div className={`text-xs font-semibold font-mono ${pnlColor}`}>
                {portfolio.dailyPnlPct >= 0 ? '+' : ''}
                {portfolio.dailyPnlPct.toFixed(2)}% (${portfolio.dailyRealizedPnlUsd.toFixed(2)})
              </div>
            </div>
          </div>

          {/* Token Cost */}
          <div className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] flex items-center gap-2.5">
            <Activity className="w-3.5 h-3.5 text-white/40" />
            <div>
              <div className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">LLM Spend</div>
              <div className="text-xs font-semibold text-white font-mono">
                ${totalTokenSpendUsd.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Kill Switch Button */}
          <button
            id="kill-switch-btn"
            onClick={onToggleKillSwitch}
            className={`px-3.5 py-1.5 rounded-lg border font-semibold text-xs flex items-center gap-2 transition-all ${
              killSwitchEngaged
                ? 'bg-rose-950/80 border-rose-500/70 text-rose-200 animate-pulse'
                : 'bg-white/[0.04] border-white/15 text-white/70 hover:text-white hover:border-white/30'
            }`}
            title="Halts all automated order placement immediately"
          >
            {killSwitchEngaged ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-mono text-[11px] uppercase tracking-wider">HALTED (KILL SWITCH)</span>
              </>
            ) : (
              <>
                <PowerOff className="w-3.5 h-3.5 text-white/40" />
                <span className="font-mono text-[11px] uppercase tracking-wider">Kill Switch</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Kill Switch Alert Banner if engaged */}
      {killSwitchEngaged && (
        <div className="bg-rose-950/80 border-y border-rose-800/80 px-4 py-2 text-center text-xs text-rose-200 flex items-center justify-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>EMERGENCY KILL SWITCH ENGAGED — Execution Engine rejects 100% of order submissions. Risk Manager veto active.</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto border-t border-white/10 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'border-white text-white bg-white/[0.03]'
                  : 'border-transparent text-white/50 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
              <span>{tab.label}</span>
              {tab.id === 'pipeline' && isRunningPipeline && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
