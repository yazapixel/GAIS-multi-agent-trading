import { Candle, QuantSignals } from '../types';

export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length === 0) return [];
  const k = 2 / (period + 1);
  const emaValues: number[] = new Array(prices.length);
  
  // Start with SMA for the first period
  let initialSma = 0;
  const initCount = Math.min(period, prices.length);
  for (let i = 0; i < initCount; i++) {
    initialSma += prices[i];
  }
  initialSma /= initCount;
  emaValues[initCount - 1] = initialSma;

  for (let i = 0; i < initCount - 1; i++) {
    emaValues[i] = prices[i];
  }

  for (let i = initCount; i < prices.length; i++) {
    emaValues[i] = prices[i] * k + emaValues[i - 1] * (1 - k);
  }
  return emaValues;
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  if (closes.length <= period) return closes.map(() => 50);

  const rsi: number[] = new Array(closes.length).fill(50);
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi[period] = 100 - 100 / (1 + rs);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi[i] = Math.round((100 - 100 / (1 + rs)) * 10) / 10;
  }

  return rsi;
}

export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEma = calculateEMA(closes, fastPeriod);
  const slowEma = calculateEMA(closes, slowPeriod);

  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdLine.push(fastEma[i] - slowEma[i]);
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    histogram.push(macdLine[i] - signalLine[i]);
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateATR(candles: Candle[], period = 14): number[] {
  if (candles.length < 2) return candles.map(() => 0);
  const tr: number[] = [candles[0].high - candles[0].low];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const trueRange = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    tr.push(trueRange);
  }

  return calculateEMA(tr, period);
}

export function computeQuantSignals(
  candles: Candle[],
  bidDepth: number,
  askDepth: number
): QuantSignals {
  const closes = candles.map((c) => c.close);
  const lastIndex = closes.length - 1;
  const currentPrice = closes[lastIndex] || 1;

  const rsiValues = calculateRSI(closes, 14);
  const currentRsi = rsiValues[lastIndex] ?? 50;

  const ema20 = calculateEMA(closes, 20)[lastIndex] ?? currentPrice;
  const ema50 = calculateEMA(closes, 50)[lastIndex] ?? currentPrice;
  const ema200 = calculateEMA(closes, 200)[lastIndex] ?? currentPrice;

  const macdResult = calculateMACD(closes);
  const currentMacd = macdResult.macd[lastIndex] ?? 0;
  const currentSignal = macdResult.signal[lastIndex] ?? 0;
  const currentHist = macdResult.histogram[lastIndex] ?? 0;

  const atrValues = calculateATR(candles, 14);
  const currentAtr = atrValues[lastIndex] ?? (candles[lastIndex]?.high - candles[lastIndex]?.low || 1);
  const atrPct = (currentAtr / currentPrice) * 100;

  let volatilityRegime: QuantSignals['volatilityRegime'] = 'NORMAL';
  if (atrPct < 1.2) volatilityRegime = 'LOW';
  else if (atrPct > 4.5) volatilityRegime = 'EXTREME';
  else if (atrPct > 2.5) volatilityRegime = 'HIGH';

  // Order book imbalance: -1 (all asks) to +1 (all bids)
  const totalDepth = bidDepth + askDepth;
  const orderBookImbalance = totalDepth > 0 ? (bidDepth - askDepth) / totalDepth : 0;

  // Compute composite quant score (-100 to +100)
  let score = 0;
  const factors: string[] = [];

  // RSI rules
  if (currentRsi < 30) {
    score += 25;
    factors.push(`RSI (${currentRsi.toFixed(1)}) is oversold (< 30)`);
  } else if (currentRsi > 70) {
    score -= 25;
    factors.push(`RSI (${currentRsi.toFixed(1)}) is overbought (> 70)`);
  } else if (currentRsi > 50) {
    score += 8;
  } else {
    score -= 8;
  }

  // Trend EMA alignment
  if (currentPrice > ema20 && ema20 > ema50) {
    score += 25;
    factors.push(`Bullish EMA alignment: Price > EMA20 > EMA50`);
  } else if (currentPrice < ema20 && ema20 < ema50) {
    score -= 25;
    factors.push(`Bearish EMA alignment: Price < EMA20 < EMA50`);
  }

  // 200 EMA macro filter
  if (currentPrice > ema200) {
    score += 15;
    factors.push(`Trading above Macro 200 EMA ($${ema200.toFixed(2)})`);
  } else {
    score -= 15;
    factors.push(`Trading below Macro 200 EMA ($${ema200.toFixed(2)})`);
  }

  // MACD crossover
  if (currentHist > 0 && currentMacd > currentSignal) {
    score += 15;
    factors.push(`MACD histogram positive & expanding (${currentHist.toFixed(2)})`);
  } else if (currentHist < 0 && currentMacd < currentSignal) {
    score -= 15;
    factors.push(`MACD histogram negative & declining (${currentHist.toFixed(2)})`);
  }

  // Order Book Imbalance
  if (orderBookImbalance > 0.15) {
    score += 15;
    factors.push(`Order book bid-heavy: +${(orderBookImbalance * 100).toFixed(0)}% imbalance`);
  } else if (orderBookImbalance < -0.15) {
    score -= 15;
    factors.push(`Order book ask-heavy: ${(orderBookImbalance * 100).toFixed(0)}% imbalance`);
  }

  let signalDirection: QuantSignals['signalDirection'] = 'NEUTRAL';
  if (score >= 25) signalDirection = 'BUY';
  else if (score <= -25) signalDirection = 'SELL';

  return {
    rsi: Number(currentRsi.toFixed(1)),
    macd: {
      macd: Number(currentMacd.toFixed(2)),
      signal: Number(currentSignal.toFixed(2)),
      histogram: Number(currentHist.toFixed(2)),
    },
    ema: {
      ema20: Number(ema20.toFixed(2)),
      ema50: Number(ema50.toFixed(2)),
      ema200: Number(ema200.toFixed(2)),
    },
    orderBookImbalance: Number(orderBookImbalance.toFixed(3)),
    volatilityRegime,
    atr: Number(currentAtr.toFixed(2)),
    signalDirection,
    signalScore: Math.min(100, Math.max(-100, score)),
    keyFactors: factors,
  };
}
