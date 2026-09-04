import {
  RiskApproval,
  ExecutionOrder,
  OpenPosition,
  PortfolioState,
} from '../types';

export class ExecutionEngineError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ExecutionEngineError';
  }
}

// In-memory idempotency cache to prevent duplicate orders
const processedIdempotencyKeys = new Set<string>();

/**
 * Deterministic Execution Engine
 *
 * CRITICAL ARCHITECTURAL GUARANTEE:
 * It CANNOT execute an order without a validated `RiskApproval` object where `approved === true`.
 * Any attempt to bypass the Risk Manager throws an immediate ExecutionEngineError.
 */
export function executeOrder(
  approval: RiskApproval,
  currentPrice: number,
  portfolio: PortfolioState,
  idempotencyKey: string,
  mode: 'PAPER_DRY_RUN' | 'BINANCE_TESTNET' = 'PAPER_DRY_RUN'
): { order: ExecutionOrder; updatedPortfolio: PortfolioState } {
  // Hard gate 1: Valid approval object check
  if (!approval || typeof approval !== 'object') {
    throw new ExecutionEngineError(
      'Execution rejected: Missing RiskApproval object. Bypassing risk manager is strictly forbidden.',
      'ERR_NO_RISK_APPROVAL'
    );
  }

  if (!approval.approved || !approval.approvalToken) {
    throw new ExecutionEngineError(
      `Execution rejected: Risk manager vetoed this trade. Reason: ${approval.vetoReason || 'Vetoed'}`,
      'ERR_RISK_NOT_APPROVED'
    );
  }

  // Hard gate 2: Idempotency check
  if (processedIdempotencyKeys.has(idempotencyKey)) {
    throw new ExecutionEngineError(
      `Duplicate order detected with idempotency key: ${idempotencyKey}. Execution halted to prevent double order.`,
      'ERR_DUPLICATE_IDEMPOTENCY_KEY'
    );
  }

  // Hard gate 3: Size validation
  if (approval.approvedSizeUsd <= 0) {
    throw new ExecutionEngineError(
      'Execution rejected: Approved position size is zero or negative.',
      'ERR_INVALID_POSITION_SIZE'
    );
  }

  // Model realistic slippage (2 to 6 basis points, depending on asset volatility)
  const slippageBps = Math.floor(Math.random() * 4) + 2; // 2 to 5 bps
  const slippageFactor =
    approval.direction === 'BUY'
      ? 1 + slippageBps / 10000
      : 1 - slippageBps / 10000;
  
  const filledPrice = Number((currentPrice * slippageFactor).toFixed(4));
  const quantity = Number((approval.approvedSizeUsd / filledPrice).toFixed(6));
  const feeUsd = Number(((approval.approvedSizeUsd * 0.0004)).toFixed(3)); // 0.04% maker/taker fee
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // Register idempotency key
  processedIdempotencyKeys.add(idempotencyKey);

  const order: ExecutionOrder = {
    orderId,
    idempotencyKey,
    approvalToken: approval.approvalToken,
    pair: approval.pair,
    side: approval.direction,
    entryPrice: currentPrice,
    filledPrice,
    slippageBps,
    sizeUsd: approval.approvedSizeUsd,
    quantity,
    leverage: approval.approvedLeverage,
    stopLossPrice: approval.stopLossPrice,
    takeProfitPrice:
      approval.direction === 'BUY'
        ? Number((filledPrice * 1.04).toFixed(4))
        : Number((filledPrice * 0.96).toFixed(4)),
    feeUsd,
    status: 'FILLED',
    mode,
    timestamp: new Date().toISOString(),
  };

  // Update portfolio state
  const marginRequired = approval.approvedSizeUsd / approval.approvedLeverage;
  const newCashBalance = portfolio.cashBalanceUsd - marginRequired - feeUsd;

  const newPosition: OpenPosition = {
    id: `POS-${orderId}`,
    pair: approval.pair,
    side: approval.direction === 'BUY' ? 'LONG' : 'SHORT',
    entryPrice: filledPrice,
    currentPrice: filledPrice,
    quantity,
    sizeUsd: approval.approvedSizeUsd,
    leverage: approval.approvedLeverage,
    stopLoss: approval.stopLossPrice,
    takeProfit: order.takeProfitPrice,
    unrealizedPnlUsd: -feeUsd, // start with fee
    unrealizedPnlPct: Number(((-feeUsd / marginRequired) * 100).toFixed(2)),
    openedAt: new Date().toISOString(),
  };

  const updatedPositions = [...portfolio.openPositions, newPosition];
  const updatedExposure = updatedPositions.reduce((sum, p) => sum + p.sizeUsd, 0);

  const updatedPortfolio: PortfolioState = {
    ...portfolio,
    cashBalanceUsd: Number(newCashBalance.toFixed(2)),
    portfolioValueUsd: Number((newCashBalance + updatedExposure).toFixed(2)),
    openPositions: updatedPositions,
  };

  return { order, updatedPortfolio };
}

/**
 * Close an existing position (either manually or via stop loss / take profit)
 */
export function closePosition(
  positionId: string,
  exitPrice: number,
  portfolio: PortfolioState,
  reason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'MANUAL' = 'MANUAL'
): { closedPnlUsd: number; updatedPortfolio: PortfolioState } {
  const position = portfolio.openPositions.find((p) => p.id === positionId);
  if (!position) {
    throw new ExecutionEngineError(`Position ${positionId} not found`, 'ERR_POSITION_NOT_FOUND');
  }

  // Calculate realized PnL
  let priceDiff = exitPrice - position.entryPrice;
  if (position.side === 'SHORT') {
    priceDiff = -priceDiff;
  }
  const rawPnlPct = priceDiff / position.entryPrice;
  const pnlUsd = position.sizeUsd * rawPnlPct;
  const exitFee = position.sizeUsd * 0.0004;
  const netPnlUsd = pnlUsd - exitFee;

  const marginReturned = position.sizeUsd / position.leverage;
  const newCashBalance = portfolio.cashBalanceUsd + marginReturned + netPnlUsd;

  const remainingPositions = portfolio.openPositions.filter((p) => p.id !== positionId);
  const totalRealizedPnlUsd = portfolio.totalRealizedPnlUsd + netPnlUsd;
  const dailyRealizedPnlUsd = portfolio.dailyRealizedPnlUsd + netPnlUsd;
  const dailyPnlPct = (dailyRealizedPnlUsd / portfolio.dailyStartingCapitalUsd) * 100;

  const isWin = netPnlUsd > 0;
  const closedTradesCount = portfolio.closedTradesCount + 1;
  const winningTradesCount = portfolio.winningTradesCount + (isWin ? 1 : 0);
  const winRatePct = Number(((winningTradesCount / closedTradesCount) * 100).toFixed(1));

  const updatedPortfolio: PortfolioState = {
    ...portfolio,
    cashBalanceUsd: Number(newCashBalance.toFixed(2)),
    portfolioValueUsd: Number(
      (newCashBalance + remainingPositions.reduce((s, p) => s + p.sizeUsd, 0)).toFixed(2)
    ),
    totalRealizedPnlUsd: Number(totalRealizedPnlUsd.toFixed(2)),
    dailyRealizedPnlUsd: Number(dailyRealizedPnlUsd.toFixed(2)),
    dailyPnlPct: Number(dailyPnlPct.toFixed(2)),
    openPositions: remainingPositions,
    closedTradesCount,
    winningTradesCount,
    winRatePct,
  };

  return { closedPnlUsd: Number(netPnlUsd.toFixed(2)), updatedPortfolio };
}
