import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  RotateCw,
  Play,
  CheckCircle2,
  Calendar,
  Award,
} from 'lucide-react';
import { PostTradeReview } from '../types';

interface AuditModalProps {
  onRunPostTradeReview: () => Promise<PostTradeReview>;
  onRunStrategicAudit: () => Promise<any>;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  onRunPostTradeReview,
  onRunStrategicAudit,
}) => {
  const [review, setReview] = useState<PostTradeReview | null>(null);
  const [audit, setAudit] = useState<any | null>(null);
  const [isRunningReview, setIsRunningReview] = useState(false);
  const [isRunningAudit, setIsRunningAudit] = useState(false);

  const handleReview = async () => {
    setIsRunningReview(true);
    try {
      const res = await onRunPostTradeReview();
      setReview(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningReview(false);
    }
  };

  const handleAudit = async () => {
    setIsRunningAudit(true);
    try {
      const res = await onRunStrategicAudit();
      setAudit(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningAudit(false);
    }
  };

  return (
    <div id="audit-center-container" className="space-y-6">
      {/* Overview Card */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
            <h2 className="text-base font-serif italic text-white flex items-center gap-2">
              Post-Trade Review & Strategic Audit
            </h2>
          </div>
          <p className="text-xs text-white/40 mt-1 max-w-2xl leading-relaxed">
            Autonomous synthesis evaluating execution quality against a buy-and-hold benchmark,
            detecting model drift, and validating risk bounds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="run-post-trade-review-btn"
            onClick={handleReview}
            disabled={isRunningReview}
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white font-mono text-xs rounded-lg flex items-center gap-2 border border-white/10 transition-colors disabled:opacity-40"
          >
            {isRunningReview ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Run Post-Trade Review (Sonnet 5)</span>
          </button>

          <button
            id="run-strategic-audit-btn"
            onClick={handleAudit}
            disabled={isRunningAudit}
            className="px-3.5 py-2 bg-white text-black hover:bg-white/90 font-medium rounded-lg text-xs flex items-center gap-2 transition-colors disabled:opacity-40 shadow-sm"
          >
            {isRunningAudit ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Run Strategic Audit (Opus 5)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Post-Trade Review Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              <h3 className="text-base font-serif italic text-white flex items-center gap-2">
                Daily Post-Trade Review Agent
              </h3>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
              Sonnet 5 • Daily
            </span>
          </div>

          {review ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2.5 font-mono">
                <div className="p-3 rounded-lg bg-[#050505] border border-white/10">
                  <span className="text-white/40 text-[10px] block">Trades Analyzed:</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{review.tradesAnalyzed}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#050505] border border-white/10">
                  <span className="text-white/40 text-[10px] block">Win Rate:</span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{review.winRatePct}%</span>
                </div>
                <div className="p-3 rounded-lg bg-[#050505] border border-white/10">
                  <span className="text-white/40 text-[10px] block">Sharpe Est:</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{review.sharpeEstimate}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-1.5">
                <div className="text-[11px] font-medium text-white/80 font-mono uppercase tracking-wider">Synthesis Summary</div>
                <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                  {review.summary}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-1.5">
                <div className="text-[11px] font-medium text-white/80 font-mono uppercase tracking-wider">Key Observations</div>
                <ul className="space-y-1 text-[11px] text-white/60">
                  {review.keyObservations.map((obs, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-mono">✓</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-white/40 pt-1">
                <span>Tokens: {review.tokens.input.toLocaleString()} in / {review.tokens.output.toLocaleString()} out</span>
                <span className="text-emerald-400">Cost: ${review.tokens.costUsd.toFixed(4)}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-white/40 bg-[#050505] rounded-lg border border-white/10">
              Click "Run Post-Trade Review" above to run the review agent over the trade ledger.
            </div>
          )}
        </div>

        {/* Strategic Audit Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              <h3 className="text-base font-serif italic text-white flex items-center gap-2">
                Strategic Audit (Human-Invoked)
              </h3>
            </div>
            <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
              Opus 5 • Periodic
            </span>
          </div>

          {audit ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <div className="p-3 rounded-lg bg-[#050505] border border-white/10">
                  <span className="text-white/40 text-[10px] block">Strategy Drift:</span>
                  <span className="text-xs font-bold text-emerald-400 mt-0.5 block">{audit.strategyDriftIndex}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#050505] border border-white/10">
                  <span className="text-white/40 text-[10px] block">Risk Envelope:</span>
                  <span className="text-xs font-bold text-white mt-0.5 block">{audit.riskEnvelopeIntegrity}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-1.5">
                <div className="text-[11px] font-medium text-white/80 font-mono uppercase tracking-wider">Audit Conclusions</div>
                <ul className="space-y-1.5 text-[11px] text-white/60 font-sans">
                  {audit.conclusions?.map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-white/40 font-mono">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-1.5">
                <div className="text-[11px] font-medium text-white/80 font-mono uppercase tracking-wider">Strategic Recommendations</div>
                <ul className="space-y-1.5 text-[11px] text-white/60 font-sans">
                  {audit.recommendations?.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold font-mono">→</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-white/40 pt-1">
                <span>Tokens: {audit.tokens?.input.toLocaleString()} in / {audit.tokens?.output.toLocaleString()} out</span>
                <span className="text-white/80">Cost: ${audit.tokens?.costUsd.toFixed(4)}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-white/40 bg-[#050505] rounded-lg border border-white/10">
              Click "Run Strategic Audit" above to perform a top-tier Opus 5 architectural and drift assessment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
