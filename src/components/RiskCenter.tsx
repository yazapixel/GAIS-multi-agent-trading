import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Sliders,
  Lock,
} from 'lucide-react';
import { RiskLimits, RiskApproval, PortfolioState } from '../types';
import { runRiskManagerTests } from '../lib/riskManager';

interface RiskCenterProps {
  limits: RiskLimits;
  onUpdateLimits: (limits: RiskLimits) => void;
  killSwitchEngaged: boolean;
  onToggleKillSwitch: () => void;
  portfolio: PortfolioState;
  lastApproval: RiskApproval | null;
}

export const RiskCenter: React.FC<RiskCenterProps> = ({
  limits,
  onUpdateLimits,
  killSwitchEngaged,
  onToggleKillSwitch,
  portfolio,
  lastApproval,
}) => {
  const [testResults, setTestResults] = useState<
    { name: string; passed: boolean; details: string }[] | null
  >(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Local state for limits tuning
  const [posSize, setPosSize] = useState(limits.maxPositionSizePct);
  const [maxExposure, setMaxExposure] = useState(limits.maxPortfolioExposurePct);
  const [leverage, setLeverage] = useState(limits.maxLeverage);
  const [stopLoss, setStopLoss] = useState(limits.mandatoryStopLossPct);
  const [circuitBreaker, setCircuitBreaker] = useState(limits.dailyLossCircuitBreakerPct);

  const handleSaveLimits = () => {
    onUpdateLimits({
      maxPositionSizePct: posSize,
      maxPortfolioExposurePct: maxExposure,
      maxLeverage: leverage,
      mandatoryStopLossPct: stopLoss,
      dailyLossCircuitBreakerPct: circuitBreaker,
    });
  };

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const results = runRiskManagerTests();
      setTestResults(results);
      setIsRunningTests(false);
    }, 400);
  };

  return (
    <div id="risk-center-container" className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <h2 className="text-base font-serif italic text-white flex items-center gap-2">
              Deterministic Risk Manager <span className="font-mono not-italic text-xs text-rose-400 font-bold uppercase tracking-wider">(VETO AUTHORITY)</span>
            </h2>
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
              Zero LLM Code
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1.5 max-w-2xl leading-relaxed">
            Section 5 Non-Negotiable: The Risk Manager possesses absolute hard veto power.
            It can shrink position sizes and leverage to ensure compliance, but will NEVER enlarge.
            The Execution Engine strictly requires a valid <code className="text-white/80 bg-white/5 px-1 py-0.5 rounded font-mono">RiskApproval</code> token to execute.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="run-risk-tests-btn"
            onClick={handleRunTests}
            disabled={isRunningTests}
            className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs flex items-center gap-2 border border-white/10 transition-colors disabled:opacity-40"
          >
            {isRunningTests ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Validating Hard Rules...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Verification Suite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Configurable Limits vs Real-time Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configurable Limits (6 cols) */}
        <div className="lg:col-span-6 bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-semibold text-white flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-white/50" />
              <span className="font-mono uppercase tracking-wider">Hard-Coded Risk Envelope</span>
            </span>
            <span className="text-[10px] text-white/40 font-mono">Enforced in TypeScript</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Limit 1: Max Position Size */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white/70">Max Position Size (% of Portfolio):</span>
                <span className="font-mono font-bold text-white">{posSize}% (${((portfolio.portfolioValueUsd * posSize) / 100).toFixed(0)})</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={posSize}
                onChange={(e) => setPosSize(parseFloat(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <span className="text-[10px] text-white/40 block">Orders requesting more than this are automatically shrunk.</span>
            </div>

            {/* Limit 2: Max Portfolio Exposure */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white/70">Max Portfolio Exposure (% across all pairs):</span>
                <span className="font-mono font-bold text-white">{maxExposure}% (${((portfolio.portfolioValueUsd * maxExposure) / 100).toFixed(0)})</span>
              </div>
              <input
                type="range"
                min="10"
                max="75"
                step="5"
                value={maxExposure}
                onChange={(e) => setMaxExposure(parseFloat(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            {/* Limit 3: Max Leverage */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white/70">Max Leverage Limit:</span>
                <span className="font-mono font-bold text-white">{leverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={leverage}
                onChange={(e) => setLeverage(parseFloat(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <span className="text-[10px] text-white/40 block">Any higher leverage recommendation is capped at {leverage}x.</span>
            </div>

            {/* Limit 4: Mandatory Stop Loss */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white/70">Mandatory Stop-Loss Maximum Distance:</span>
                <span className="font-mono font-bold text-white">{stopLoss}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <span className="text-[10px] text-white/40 block">Zero stop-loss or stop-loss wider than {stopLoss * 1.5}% triggers hard veto.</span>
            </div>

            {/* Limit 5: Daily Loss Circuit Breaker */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white/70">Daily Drawdown Circuit Breaker:</span>
                <span className="font-mono font-bold text-rose-400">{circuitBreaker}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="0.5"
                value={circuitBreaker}
                onChange={(e) => setCircuitBreaker(parseFloat(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[10px] text-white/40 block">If intraday loss hits {circuitBreaker}%, all trading is halted for the day.</span>
            </div>

            <button
              id="save-limits-btn"
              onClick={handleSaveLimits}
              className="w-full py-2.5 bg-white text-black hover:bg-white/90 font-medium rounded-lg text-xs transition-colors shadow-sm mt-2"
            >
              Apply Risk Limits
            </button>
          </div>
        </div>

        {/* Live Veto Log & Status (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Status Card */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-white/50" />
                <span className="font-mono uppercase tracking-wider">Live Enforcer Status</span>
              </span>
              <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                killSwitchEngaged
                  ? 'bg-rose-950/40 text-rose-400 border-rose-500/20'
                  : 'bg-white/5 text-white/80 border-white/10'
              }`}>
                {killSwitchEngaged ? 'KILL SWITCH ENGAGED' : 'MONITORING ACTIVE'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-3 rounded-lg bg-[#050505] border border-white/10">
                <span className="text-white/40 font-mono text-[11px]">Current Daily Drawdown:</span>
                <span className={`font-mono font-bold ${portfolio.dailyPnlPct < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {portfolio.dailyPnlPct < 0 ? Math.abs(portfolio.dailyPnlPct).toFixed(2) : '0.00'}% / {limits.dailyLossCircuitBreakerPct}% max
                </span>
              </div>

              <div className="flex justify-between p-3 rounded-lg bg-[#050505] border border-white/10">
                <span className="text-white/40 font-mono text-[11px]">Current Portfolio Exposure:</span>
                <span className="font-mono font-bold text-white">
                  ${portfolio.openPositions.reduce((s, p) => s + p.sizeUsd, 0).toFixed(0)} ({((portfolio.openPositions.reduce((s, p) => s + p.sizeUsd, 0) / portfolio.portfolioValueUsd) * 100).toFixed(1)}% / {limits.maxPortfolioExposurePct}%)
                </span>
              </div>

              <div className="flex justify-between p-3 rounded-lg bg-[#050505] border border-white/10">
                <span className="text-white/40 font-mono text-[11px]">Latest Recommendation Approval:</span>
                <span className={`font-mono font-bold ${lastApproval?.approved ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {lastApproval ? (lastApproval.approved ? 'PASSED' : 'VETOED') : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Unit Test Verification Results */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-white/50" />
                <span className="font-mono uppercase tracking-wider">Deterministic Rule Suite</span>
              </span>
              <span className="text-[10px] text-white/40 font-mono">Section 11/12 Spec</span>
            </div>

            {testResults ? (
              <div className="space-y-2 text-xs">
                {testResults.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                      t.passed
                        ? 'bg-[#050505] border-white/10 text-white'
                        : 'bg-rose-950/20 border-rose-500/20 text-rose-200'
                    }`}
                  >
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-white">{t.name}</div>
                      <div className="text-[11px] text-white/40 mt-0.5">{t.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#050505] border border-white/10 text-center text-xs text-white/40">
                Click "Run Verification Suite" above to execute the automated test battery verifying that the Risk Manager strictly vetoes unhedged or oversized recommendations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
