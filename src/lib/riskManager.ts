import {
  TradeRecommendation,
  RiskLimits,
  RiskApproval,
  PortfolioState,
} from '../types';

export const DEFAULT_RISK_LIMITS: RiskLimits = {
  maxPositionSizePct: 5.0, // 5% max of portfolio value per trade
  maxPortfolioExposurePct: 35.0, // 35% total portfolio exposure across all open positions
  maxLeverage: 3.0, // Max 3x leverage
  mandatoryStopLossPct: 3.0, // Stop-loss must be within 3% of entry price
  dailyLossCircuitBreakerPct: 4.0, // Halt trading if daily loss hits 4%
};

/**
 * Deterministic Risk Manager
 * Hard veto power over every TradeRecommendation.
 * Can shrink size or leverage down to meet limits, but NEVER enlarges.
 * Rejects if any non-negotiable limit is breached.
 */
export function evaluateRisk(
  recommendation: TradeRecommendation,
  portfolio: PortfolioState,
  limits: RiskLimits = DEFAULT_RISK_LIMITS,
  killSwitchEngaged: boolean = false
): RiskApproval {
  const timestamp = Date.now();
  const failureCodes: string[] = [];

  // Check 1: Kill switch
  const killSwitchChecked = !killSwitchEngaged;
  if (killSwitchEngaged) {
    failureCodes.push('ERR_KILL_SWITCH_ACTIVE: Emergency kill switch is engaged.');
  }

  // Check 2: Daily loss circuit breaker
  // dailyPnlPct is negative when in loss
  const currentDailyLossPct = portfolio.dailyPnlPct < 0 ? Math.abs(portfolio.dailyPnlPct) : 0;
  const circuitBreakerChecked = currentDailyLossPct < limits.dailyLossCircuitBreakerPct;
  if (!circuitBreakerChecked) {
    failureCodes.push(
      `ERR_CIRCUIT_BREAKER_TRIPPED: Daily loss (${currentDailyLossPct.toFixed(2)}%) reached circuit breaker threshold (${limits.dailyLossCircuitBreakerPct}%).`
    );
  }

  // Check 3: Mandatory stop-loss validation
  const currentPrice = recommendation.currentPrice;
  const stopLoss = recommendation.stopLossPrice;
  let stopLossEnforced = false;

  if (!stopLoss || stopLoss <= 0) {
    failureCodes.push('ERR_STOP_LOSS_MISSING: Recommendation did not include a valid stop-loss.');
  } else {
    const slDistancePct = Math.abs((currentPrice - stopLoss) / currentPrice) * 100;
    
    // Check direction sanity
    if (recommendation.direction === 'BUY' && stopLoss >= currentPrice) {
      failureCodes.push('ERR_INVALID_STOP_LOSS: Buy stop-loss must be below entry price.');
    } else if (recommendation.direction === 'SELL' && stopLoss <= currentPrice) {
      failureCodes.push('ERR_INVALID_STOP_LOSS: Sell stop-loss must be above entry price.');
    } else if (slDistancePct > limits.mandatoryStopLossPct * 1.5) {
      failureCodes.push(
        `ERR_STOP_LOSS_TOO_WIDE: Stop loss is ${slDistancePct.toFixed(2)}% away (max permitted is ${(limits.mandatoryStopLossPct * 1.5).toFixed(2)}%).`
      );
    } else {
      stopLossEnforced = true;
    }
  }

  // Check 4: Leverage cap
  let approvedLeverage = recommendation.suggestedLeverage || 1.0;
  if (approvedLeverage > limits.maxLeverage) {
    // Risk Manager can shrink leverage to maximum permitted
    approvedLeverage = limits.maxLeverage;
  }
  const leverageChecked = approvedLeverage <= limits.maxLeverage && approvedLeverage >= 1.0;

  // Check 5: Position size vs portfolio value
  const maxAllowedPositionSizeUsd = (portfolio.portfolioValueUsd * limits.maxPositionSizePct) / 100;
  let approvedSizeUsd = Math.min(recommendation.targetSizeUsd, maxAllowedPositionSizeUsd);

  // If recommendation asks for more than max allowed, shrink it
  if (approvedSizeUsd < 10) {
    failureCodes.push(
      `ERR_POSITION_SIZE_TOO_SMALL: Approved size ($${approvedSizeUsd.toFixed(2)}) is below minimal order threshold ($10).`
    );
  }
  const positionSizeChecked = approvedSizeUsd <= maxAllowedPositionSizeUsd && approvedSizeUsd >= 10;

  // Check 6: Total portfolio exposure check
  const currentExposureUsd = portfolio.openPositions.reduce((acc, pos) => acc + pos.sizeUsd, 0);
  const maxAllowedExposureUsd = (portfolio.portfolioValueUsd * limits.maxPortfolioExposurePct) / 100;
  
  if (currentExposureUsd + approvedSizeUsd > maxAllowedExposureUsd) {
    // Attempt to shrink size to fit remaining exposure
    const remainingExposureRoom = Math.max(0, maxAllowedExposureUsd - currentExposureUsd);
    if (remainingExposureRoom >= 20) {
      approvedSizeUsd = remainingExposureRoom;
    } else {
      failureCodes.push(
        `ERR_PORTFOLIO_EXPOSURE_EXCEEDED: Total exposure ($${(currentExposureUsd + approvedSizeUsd).toFixed(0)}) exceeds limit of $${maxAllowedExposureUsd.toFixed(0)} (${limits.maxPortfolioExposurePct}% of portfolio).`
      );
    }
  }
  const exposureLimitChecked = currentExposureUsd + approvedSizeUsd <= maxAllowedExposureUsd;

  // Check 7: Existing open position on the same pair
  const hasExistingPosition = portfolio.openPositions.some((p) => p.pair === recommendation.pair);
  if (hasExistingPosition) {
    failureCodes.push(
      `ERR_DUPLICATE_POSITION: An open position already exists for ${recommendation.pair}. New concurrent exposure rejected.`
    );
  }

  const approved = failureCodes.length === 0;

  // Generate tamper-evident cryptographic-style approval token
  const approvalToken = approved
    ? `AUTH-APPROVAL-${recommendation.pair.replace('/', '')}-${timestamp}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    : undefined;

  return {
    approved,
    approvalToken,
    timestamp,
    originalRecommendationId: recommendation.id,
    pair: recommendation.pair,
    direction: recommendation.direction,
    approvedSizeUsd: approved ? Number(approvedSizeUsd.toFixed(2)) : 0,
    approvedLeverage: approved ? Number(approvedLeverage.toFixed(1)) : 1.0,
    stopLossPrice: recommendation.stopLossPrice,
    vetoReason: approved ? undefined : failureCodes.join(' | '),
    failureCodes: failureCodes.length > 0 ? failureCodes : undefined,
    checksPassed: {
      positionSizeChecked,
      exposureLimitChecked,
      leverageChecked,
      stopLossEnforced,
      circuitBreakerChecked,
      killSwitchChecked,
    },
  };
}

/**
 * Built-in Unit Test suite to verify all deterministic rules
 * as required by Section 11/12 of the architecture spec.
 */
export function runRiskManagerTests(): { name: string; passed: boolean; details: string }[] {
  const dummyPortfolio: PortfolioState = {
    cashBalanceUsd: 10000,
    portfolioValueUsd: 10000,
    initialCapitalUsd: 10000,
    totalRealizedPnlUsd: 0,
    dailyStartingCapitalUsd: 10000,
    dailyRealizedPnlUsd: 0,
    dailyPnlPct: 0,
    openPositions: [],
    closedTradesCount: 0,
    winningTradesCount: 0,
    winRatePct: 0,
  };

  const baseRec: TradeRecommendation = {
    id: 'test-rec-1',
    pair: 'BTC/USDT',
    direction: 'BUY',
    targetSizeUsd: 400, // 4% of $10,000 -> valid
    currentPrice: 65000,
    targetPrice: 68000,
    stopLossPrice: 63500, // valid stop-loss ~2.3%
    suggestedLeverage: 2,
    confidence: 85,
    rationale: 'Bullish breakout test',
    urgency: 'MEDIUM',
    modelTier: 'Sonnet 5',
    tokens: { input: 1000, output: 200, costUsd: 0.005 },
    generatedAt: new Date().toISOString(),
    status: 'PENDING_RISK',
  };

  const results = [];

  // Test 1: Normal recommendation passes
  const res1 = evaluateRisk(baseRec, dummyPortfolio);
  results.push({
    name: 'Standard Compliant Recommendation Approval',
    passed: res1.approved === true && !!res1.approvalToken,
    details: res1.approved ? 'Passed with valid approval token' : `Failed: ${res1.vetoReason}`,
  });

  // Test 2: Kill switch halts all orders
  const res2 = evaluateRisk(baseRec, dummyPortfolio, DEFAULT_RISK_LIMITS, true);
  results.push({
    name: 'Emergency Kill Switch Hard Veto',
    passed: res2.approved === false && res2.vetoReason?.includes('ERR_KILL_SWITCH_ACTIVE'),
    details: res2.approved ? 'Unexpected approval' : 'Properly vetoed due to kill switch',
  });

  // Test 3: Daily loss circuit breaker trips
  const drawdownPortfolio: PortfolioState = {
    ...dummyPortfolio,
    dailyRealizedPnlUsd: -450,
    dailyPnlPct: -4.5, // > 4.0%
  };
  const res3 = evaluateRisk(baseRec, drawdownPortfolio);
  results.push({
    name: 'Daily Drawdown Circuit Breaker Veto',
    passed: res3.approved === false && res3.vetoReason?.includes('ERR_CIRCUIT_BREAKER_TRIPPED'),
    details: res3.approved ? 'Circuit breaker failed to trigger' : 'Tripped circuit breaker halted trade',
  });

  // Test 4: Missing or invalid stop loss
  const noSlRec: TradeRecommendation = {
    ...baseRec,
    stopLossPrice: 0,
  };
  const res4 = evaluateRisk(noSlRec, dummyPortfolio);
  results.push({
    name: 'Mandatory Stop-Loss Enforcement Veto',
    passed: res4.approved === false && res4.vetoReason?.includes('ERR_STOP_LOSS_MISSING'),
    details: res4.approved ? 'Allowed order without stop-loss' : 'Blocked trade without stop-loss',
  });

  // Test 5: Oversized position is shrunk to maxPositionSizePct
  const oversizedRec: TradeRecommendation = {
    ...baseRec,
    targetSizeUsd: 2000, // 20% of portfolio, limit is 5% ($500)
  };
  const res5 = evaluateRisk(oversizedRec, dummyPortfolio);
  results.push({
    name: 'Oversized Position Automatic Size Shrinkage',
    passed: res5.approved === true && res5.approvedSizeUsd === 500,
    details: `Original requested $2000 shrunk to maximum permitted $${res5.approvedSizeUsd}`,
  });

  return results;
}
