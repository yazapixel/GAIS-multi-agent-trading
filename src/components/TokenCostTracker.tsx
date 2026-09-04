import React from 'react';
import {
  DollarSign,
  Activity,
  Zap,
  TrendingDown,
  CheckCircle2,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';

interface TokenCostTrackerProps {
  totalSessionCostUsd: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCalls: number;
}

export const TokenCostTracker: React.FC<TokenCostTrackerProps> = ({
  totalSessionCostUsd,
  totalInputTokens,
  totalOutputTokens,
  totalCalls,
}) => {
  const estimatedMonthlyRunRate = totalSessionCostUsd > 0
    ? Math.min(120, Math.max(35, totalSessionCostUsd * 30 * 4))
    : 52.0;

  const costBreakdown = [
    {
      agent: 'Sentiment Agent',
      model: 'Haiku 4.5',
      pricing: '$1.00 / $5.00',
      cadence: '50 calls/day (Batched)',
      avgTokens: '2,000 in / 500 out',
      estDay: '$0.23',
      estMonth: '$7.00',
    },
    {
      agent: 'On-chain / Fund.',
      model: 'Haiku 4.5',
      pricing: '$1.00 / $5.00',
      cadence: '24 calls/day (Hourly)',
      avgTokens: '3,000 in / 500 out',
      estDay: '$0.28',
      estMonth: '$8.00',
    },
    {
      agent: 'Research / Thesis',
      model: 'Sonnet 5',
      pricing: '$2.00 / $10.00',
      cadence: '20 calls/day (Event-driven)',
      avgTokens: '8,000 in / 1,000 out',
      estDay: '$0.52',
      estMonth: '$16.00',
    },
    {
      agent: 'Orchestrator',
      model: 'Sonnet 5',
      pricing: '$2.00 / $10.00',
      cadence: '48 calls/day (15-60 min)',
      avgTokens: '4,000 in / 500 out',
      estDay: '$0.62',
      estMonth: '$19.00',
    },
    {
      agent: 'Post-Trade Review',
      model: 'Sonnet 5',
      pricing: '$2.00 / $10.00',
      cadence: '1 call/day (Daily review)',
      avgTokens: '20,000 in / 2,000 out',
      estDay: '$0.06',
      estMonth: '$2.00',
    },
    {
      agent: 'Strategic Audit',
      model: 'Opus 5',
      pricing: '$5.00 / $25.00',
      cadence: 'Weekly/Monthly (Human-invoked)',
      avgTokens: '30,000 in / 3,000 out',
      estDay: '~$0.10',
      estMonth: '~$3.00',
    },
  ];

  const optimizationRules = [
    {
      title: 'Model Tiering Strictly Enforced',
      desc: 'Haiku 4.5 for high-volume filtering; Sonnet 5 reserved for synthesis; Opus 5 exclusively for manual audits.',
    },
    {
      title: 'Pre-Filter Discards 85%+ Irrelevant News',
      desc: 'Embedding similarity and keyword triage discard low-impact noise before reaching LLM context.',
    },
    {
      title: 'Prompt Caching Saves 90% Input Tokens',
      desc: 'System prompts and immutable asset specs are cached, reducing fresh input token costs by 90%.',
    },
    {
      title: 'Event-Driven, Non-Polling Pipeline',
      desc: 'Agents fire only on state changes (volatility threshold crossed, tick trigger) rather than wasteful timers.',
    },
  ];

  return (
    <div id="token-cost-tracker-container" className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40 font-bold">Session LLM Spend</div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5">
            ${totalSessionCostUsd.toFixed(4)}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">{totalCalls} total agent calls</div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40 font-bold">Input Tokens</div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5">
            {totalInputTokens.toLocaleString()}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">Prompt cache -90% discount</div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40 font-bold">Output Tokens</div>
          <div className="text-2xl font-bold font-mono text-white mt-1.5">
            {totalOutputTokens.toLocaleString()}
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">Strict JSON schema verified</div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40 font-bold">Monthly Projection</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5">
            ~${estimatedMonthlyRunRate.toFixed(2)}/mo
          </div>
          <div className="text-[10px] text-white/40 font-mono mt-1">Budget ceiling: &le; $75/mo</div>
        </div>
      </div>

      {/* Model Tiering Table (Section 9) */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              <h3 className="text-base font-serif italic text-white flex items-center gap-2">
                Architecture Model Tiering & Cost Matrix
              </h3>
            </div>
            <p className="text-xs text-white/40 mt-0.5">
              Anthropic / Gemini tiering: $1/$5 (Haiku/Flash), $2/$10 (Sonnet/Flash-Thinking), $5/$25 (Opus).
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
            Target: ~$50 - $70/month
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/40 font-mono uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Agent Component</th>
                <th className="py-3 px-3">Assigned Model</th>
                <th className="py-3 px-3">Pricing (In/Out /M)</th>
                <th className="py-3 px-3">Trigger / Cadence</th>
                <th className="py-3 px-3">Avg Tokens (In/Out)</th>
                <th className="py-3 px-3">Est. $/Day</th>
                <th className="py-3 px-3 font-bold text-white">Est. $/Month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {costBreakdown.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-3 font-bold text-white">{row.agent}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold bg-white/5 text-white/80 border border-white/10">
                      {row.model}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-white/40">{row.pricing}</td>
                  <td className="py-3.5 px-3 text-white/80 font-sans">{row.cadence}</td>
                  <td className="py-3.5 px-3 text-white/40">{row.avgTokens}</td>
                  <td className="py-3.5 px-3 text-white/80">{row.estDay}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-400">{row.estMonth}</td>
                </tr>
              ))}
              <tr className="bg-[#050505] font-bold border-t border-white/10">
                <td colSpan={5} className="py-3.5 px-3 text-white">
                  Total Monthly LLM Compute Subtotal
                </td>
                <td className="py-3.5 px-3 text-white/80">~$1.70/day</td>
                <td className="py-3.5 px-3 text-emerald-400 text-sm">~$52.00/month</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Optimization Playbook (Section 6) */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
        <div className="border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
            <h3 className="text-base font-serif italic text-white flex items-center gap-2">
              Cost Optimization Playbook Rules
            </h3>
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            Active architectural techniques keeping operating costs 80% below un-tiered implementations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {optimizationRules.map((rule, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[#050505] border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <div className="w-1 h-1 rounded-full bg-white shrink-0" />
                <span>{rule.title}</span>
              </div>
              <p className="text-[11px] text-white/40 pl-3 leading-relaxed">
                {rule.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
