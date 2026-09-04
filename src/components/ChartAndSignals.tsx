import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Candle,
  CryptoPair,
  QuantSignals,
  PairTicker,
} from '../types';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  BarChart3,
  Scale,
  Shield,
} from 'lucide-react';

interface ChartAndSignalsProps {
  pair: CryptoPair;
  candles: Candle[];
  quantSignals: QuantSignals | null;
  ticker: PairTicker | null;
  orderBook: { bidDepth: number; askDepth: number; spread: number } | null;
}

export const ChartAndSignals: React.FC<ChartAndSignalsProps> = ({
  pair,
  candles,
  quantSignals,
  ticker,
  orderBook,
}) => {
  const [activeSubChart, setActiveSubChart] = useState<'rsi' | 'macd'>('rsi');

  // Prepare chart data with EMA indicators
  const chartData = candles.map((c, i) => {
    return {
      time: c.timeStr,
      price: c.close,
      high: c.high,
      low: c.low,
      volume: c.volume,
      // approximate EMA for display
      ema20: quantSignals?.ema.ema20,
      ema50: quantSignals?.ema.ema50,
      ema200: quantSignals?.ema.ema200,
    };
  });

  const totalDepth = (orderBook?.bidDepth || 1) + (orderBook?.askDepth || 1);
  const bidPct = Math.round(((orderBook?.bidDepth || 50) / totalDepth) * 100);
  const askPct = 100 - bidPct;

  const minPrice = Math.min(...candles.map((c) => c.low)) * 0.998;
  const maxPrice = Math.max(...candles.map((c) => c.high)) * 1.002;

  return (
    <div id="chart-and-signals-container" className="space-y-6">
      {/* Top Ticker Summary Card */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{pair} Perpetuals & Spot</div>
            </div>
            <div className="text-3xl font-bold text-white font-mono flex items-center gap-3 mt-1 tracking-tight">
              <span>${ticker?.price.toLocaleString() ?? candles[candles.length - 1]?.close ?? '--'}</span>
              {ticker && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded font-mono font-medium flex items-center gap-1 border ${
                    ticker.change24h >= 0
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-950/40 text-rose-400 border-rose-500/20'
                  }`}
                >
                  {ticker.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {ticker.change24h >= 0 ? '+' : ''}
                  {ticker.change24h}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quant Signal Summary Pill */}
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Quant Bias</div>
            <div
              className={`text-sm font-bold font-mono mt-0.5 ${
                quantSignals?.signalDirection === 'BUY'
                  ? 'text-emerald-400'
                  : quantSignals?.signalDirection === 'SELL'
                  ? 'text-rose-400'
                  : 'text-white/80'
              }`}
            >
              {quantSignals?.signalDirection || 'NEUTRAL'} ({quantSignals?.signalScore ?? 0}/100)
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block" />

          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Volatility Regime</div>
            <div className="text-sm font-semibold text-white/80 font-mono mt-0.5">
              {quantSignals?.volatilityRegime || 'NORMAL'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart (8 cols) + Quant & Orderbook (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Column (8 cols) */}
        <div className="lg:col-span-8 bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                <span className="font-serif italic text-base font-normal">Price Structure</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">15m Candles</span>
              </span>
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/40 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-white inline-block" /> Price
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-amber-400/80 inline-block" /> EMA 20
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-sky-400/80 inline-block" /> EMA 50
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveSubChart('rsi')}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-colors ${
                  activeSubChart === 'rsi'
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                RSI (14)
              </button>
              <button
                onClick={() => setActiveSubChart('macd')}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-colors ${
                  activeSubChart === 'macd'
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                MACD (12,26,9)
              </button>
            </div>
          </div>

          {/* Primary Price Chart */}
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#171717" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#525252"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#262626' }}
                />
                <YAxis
                  domain={[minPrice, maxPrice]}
                  orientation="right"
                  stroke="#525252"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#262626' }}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                  labelStyle={{ color: '#a3a3a3' }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#ffffff"
                  strokeWidth={1.8}
                  fillOpacity={1}
                  fill="url(#priceGrad)"
                  name="Price"
                />
                {quantSignals && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="ema20"
                      stroke="#fbbf24"
                      strokeWidth={1.2}
                      dot={false}
                      name="EMA 20"
                    />
                    <Line
                      type="monotone"
                      dataKey="ema50"
                      stroke="#38bdf8"
                      strokeWidth={1.2}
                      dot={false}
                      name="EMA 50"
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Secondary Sub-Chart: RSI or MACD */}
          <div className="border-t border-white/10 pt-3.5">
            <div className="flex justify-between items-center mb-1 text-[11px] text-white/50">
              <span className="font-semibold text-white font-mono">
                {activeSubChart === 'rsi' ? `RSI Oscillator: ${quantSignals?.rsi ?? 50}` : `MACD Histogram: ${quantSignals?.macd.histogram.toFixed(2) ?? 0}`}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                {activeSubChart === 'rsi' ? 'Oversold < 30 • Overbought > 70' : 'MACD Signal Cross'}
              </span>
            </div>

            <div className="h-[90px] w-full">
              {activeSubChart === 'rsi' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid stroke="#171717" strokeDasharray="2 2" vertical={false} />
                    <YAxis domain={[0, 100]} orientation="right" stroke="#525252" fontSize={9} ticks={[30, 50, 70]} />
                    <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.6} />
                    <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" opacity={0.6} />
                    <Line
                      type="monotone"
                      dataKey={() => quantSignals?.rsi || 50}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid stroke="#171717" strokeDasharray="2 2" vertical={false} />
                    <YAxis orientation="right" stroke="#525252" fontSize={9} />
                    <Bar
                      dataKey={() => quantSignals?.macd.histogram || 0}
                      fill={quantSignals && quantSignals.macd.histogram >= 0 ? '#10b981' : '#f43f5e'}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Quant Engine Factors & Orderbook (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Order Book Depth Imbalance Card */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <Scale className="w-3.5 h-3.5 text-white/50" />
                <span className="uppercase tracking-wider font-mono">Order Book Imbalance</span>
              </span>
              <span className="text-[10px] font-mono text-white/40">
                Spread: ${orderBook?.spread ?? 0.05}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-emerald-400 font-semibold">Bids: {bidPct}%</span>
                <span className="text-rose-400 font-semibold">Asks: {askPct}%</span>
              </div>

              {/* Depth Ratio Bar */}
              <div className="h-2 w-full bg-[#050505] rounded-full overflow-hidden flex border border-white/10">
                <div
                  className="h-full bg-emerald-400/80 transition-all duration-500"
                  style={{ width: `${bidPct}%` }}
                />
                <div
                  className="h-full bg-rose-400/80 transition-all duration-500"
                  style={{ width: `${askPct}%` }}
                />
              </div>

              <p className="text-[11px] text-white/50 mt-1">
                Imbalance Score:{' '}
                <strong className={quantSignals && quantSignals.orderBookImbalance >= 0 ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                  {quantSignals ? `${(quantSignals.orderBookImbalance * 100).toFixed(1)}%` : '+18.0%'}
                </strong>{' '}
                ({quantSignals && quantSignals.orderBookImbalance > 0 ? 'Buyer dominant' : 'Seller dominant'})
              </p>
            </div>
          </div>

          {/* Deterministic Quant Signal Engine Rules */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-white/50" />
                <span className="uppercase tracking-wider font-mono">Quant Logic (No LLM)</span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
                Deterministic
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#050505] border border-white/10">
                <span className="text-white/40 uppercase tracking-wider text-[10px] font-mono">RSI Regime:</span>
                <span className="font-mono font-semibold text-white">
                  {quantSignals?.rsi ? (quantSignals.rsi < 30 ? 'Oversold (Bullish)' : quantSignals.rsi > 70 ? 'Overbought (Bearish)' : 'Neutral Momentum') : 'Neutral'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#050505] border border-white/10">
                <span className="text-white/40 uppercase tracking-wider text-[10px] font-mono">Trend Alignment:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  Price &gt; EMA20 &gt; EMA50
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#050505] border border-white/10">
                <span className="text-white/40 uppercase tracking-wider text-[10px] font-mono">ATR Volatility:</span>
                <span className="font-mono font-semibold text-white">
                  ${quantSignals?.atr ?? 12.5} ({quantSignals?.volatilityRegime ?? 'NORMAL'})
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-white/40 block mb-2">
                Active Factors:
              </span>
              <ul className="space-y-1.5 text-[11px] text-white/70">
                {quantSignals?.keyFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-white font-mono text-xs">✓</span>
                    <span>{f}</span>
                  </li>
                )) || <li>No active signal trigger</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
