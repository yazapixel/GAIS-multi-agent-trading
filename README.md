# Multi-Agent Crypto Trading System

An autonomous, multi-agent cryptocurrency trading architecture built with React, TypeScript, Tailwind CSS, Express, and Google Gen AI SDK.

The system implements a tiered multi-agent reasoning architecture paired with a deterministic quantitative signal engine, hard-coded non-negotiable risk limits (with veto authority), paper execution tracking with realistic slippage, and comprehensive LLM token expenditure monitoring.

---

## Key Features

- **Tiered Multi-Agent Terminal**:
  - **Tier 1 (High-Frequency / Pre-Filter)**: Sentiment Agent and On-Chain / Whale Flow Agent ingest market data, filter noise, and calculate impact and direction metrics.
  - **Tier 2 (Synthesis & Allocation)**: Research / Thesis Agent generates directional hypotheses; Orchestrator / Portfolio Manager produces sized `TradeRecommendation` objects.
- **Deterministic Quant Signal Engine**:
  - Pure algorithmic calculations (EMA 20/50 crossovers, RSI 14 oscillator, MACD momentum, ATR volatility, Order Book Depth Imbalance). Zero LLM halluncination risk.
- **Deterministic Risk Manager (Veto Authority)**:
  - Hard-coded risk parameters: max position size, max portfolio exposure, leverage ceiling, mandatory stop-loss distance, and daily drawdown circuit breaker.
  - Generates cryptographic `RiskApproval` tokens required by the Execution Engine. Can reduce position size/leverage to comply, but never enlarges.
  - Built-in automated unit verification suite testing boundary cases and veto logic.
- **Idempotent Paper Execution Engine**:
  - Real-time order fill simulation with realistic slippage (in basis points) and live P&L tracking across spot and perpetual positions.
- **Token Cost Matrix & Telemetry**:
  - Real-time token accounting (input, cached, output) tracking session spend against an estimated monthly budget target (~$50–$70/mo).
- **Post-Trade Review & Strategic Audit**:
  - Post-trade review agent analyzing win rates, trade history, and execution quality.
  - Periodic strategic audit evaluating model drift and risk envelope integrity.

---

## Prerequisites

- **Node.js**: `v18.0.0` or higher (Node `v20.x` or `v22.x` recommended)
- **npm** (or `bun` / `pnpm` / `yarn`)

---

## Installation & Setup

### 1. Clone or Extract the Project

If you downloaded the ZIP file from AI Studio, unzip the contents into a directory of your choice, then navigate into the project folder:

```bash
cd multi-agent-crypto-trading-system
```

### 2. Install Dependencies

Install all required npm packages:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Open `.env` and set your Google Gemini API key:

```env
GEMINI_API_KEY="your-actual-gemini-api-key"
```

> **Note**: You can obtain a Gemini API key free at [Google AI Studio](https://aistudio.google.com/). If running without an API key, the system seamlessly falls back to robust deterministic simulations and local mock reasoning heuristics.

---

## Running the Application

### Development Mode

Start the integrated Express + Vite development server:

```bash
npm run dev
```

Once started, open your browser and navigate to:
```
http://localhost:3000
```

The server automatically supports hot-reloading on port `3000`.

---

## Building for Production

To create an optimized production build:

```bash
npm run build
```

This compiles the client SPA into static assets inside `dist/` and bundles `server.ts` into `dist/server.cjs`.

To start the production server:

```bash
npm start
```

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server (`tsx server.ts`) on `http://localhost:3000` |
| `npm run build` | Builds both the Vite client bundle and the server CommonJS bundle |
| `npm start` | Launches the compiled production server (`node dist/server.cjs`) |
| `npm run lint` | Runs the TypeScript compiler (`tsc --noEmit`) to verify types |
| `npm run clean` | Cleans up previous build artifacts in `dist/` |

---

## Project Structure

```
├── index.html                  # HTML entry point with typography & meta tags
├── package.json                # Project dependencies and run scripts
├── server.ts                   # Express server with Vite middleware & Gemini API proxy
├── src/
│   ├── main.tsx                # React application entry point
│   ├── App.tsx                 # Root component: state management, tickers, navigation
│   ├── types.ts                # Shared TypeScript interfaces, types, and enums
│   ├── components/
│   │   ├── Navigation.tsx      # Header navbar, active pair switcher, ticker & status chips
│   │   ├── ChartAndSignals.tsx # Interactive price chart, RSI/MACD sub-charts, quant factors
│   │   ├── AgentConsole.tsx    # Multi-agent reasoning cards & pipeline controls
│   │   ├── RiskCenter.tsx      # Risk limits envelope, live veto logs & unit test battery
│   │   ├── PortfolioOrders.tsx # Active open positions & idempotent execution history
│   │   ├── TokenCostTracker.tsx# Session LLM cost ledger & model pricing matrix
│   │   └── AuditModal.tsx      # Post-trade review & strategic audit synthesis
│   └── services/
│       ├── gemini.ts           # Gemini API client & prompt orchestration
│       ├── quantSignals.ts     # Deterministic quantitative indicator engine
│       ├── riskManager.ts      # Hard-coded risk rule enforcer & verification tests
│       └── executionEngine.ts  # Paper execution simulator with slippage calculations
```

---

## Quick Start Walkthrough

1. **Monitor Market & Quant Signals**: View live 15m candle charts, RSI, MACD, and order book depth imbalance on the **Chart & Signals** tab.
2. **Synthesize Agent Consensus**: Click **"Run Multi-Agent Pipeline"** in the navigation header to run Tier 1 data ingestion and Tier 2 portfolio thesis synthesis.
3. **Review Risk Enforcement**: Navigate to the **Risk Manager** tab to view the deterministic risk parameters and run the **"Run Verification Suite"** test battery.
4. **Execute Orders**: Review the generated trade recommendation on the **Agent Console** tab and execute it. Fills will appear in the **Portfolio & Orders** ledger.
5. **Monitor Compute Spend**: Switch to the **Cost Matrix** tab to track token consumption and verify cost efficiency.
6. **Run Audits**: Use the **Audit** tab to generate post-trade performance reviews and strategic drift audits.
