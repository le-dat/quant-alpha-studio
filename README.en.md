<div align="center">

# ⚛️ QuantumAlpha Studio

### Enterprise-Grade Fullstack Quantitative Investment Platform Powered by Financial NLP & Quantum Approximate Optimization (QAOA)

<p align="center">
  <a href="README.md"><b>🇬🇧 English</b></a> &nbsp;|&nbsp;
  <a href="README.vi.md"><b>🇻🇳 Tiếng Việt</b></a>
</p>

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3%2B-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0%2B-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Qiskit](https://img.shields.io/badge/IBM%20Qiskit-1.0%2B-6929C4?style=flat&logo=ibm&logoColor=white)](https://qiskit.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4%2B-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/le-dat/quant-alpha-studio/pulls)

</div>

---

## 📑 Table of Contents

- [The Core Problem: Why Quantum?](#-the-core-problem-why-quantum)
- [Key Features](#-key-features)
- [System Architecture](#️-system-architecture)
- [Mathematical & Quantum Formulation](#-mathematical--quantum-formulation)
- [Comparison: Classical vs. Quantum Solvers](#-comparison-classical-vs-quantum-solvers)
- [Repository Structure](#-repository-structure)
- [Quickstart Guide](#-quickstart-guide)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup (FastAPI + Qiskit)](#1-backend-setup-fastapi--qiskit)
  - [2. Frontend Setup (React + Vite)](#2-frontend-setup-react--vite)
  - [3. Docker Compose (One-Click)](#3-docker-compose-one-click)
- [API Reference](#-api-reference)
- [In-Depth Documentation](#-in-depth-documentation)
- [Roadmap](#-roadmap)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 💡 The Core Problem: Why Quantum?

Modern portfolio allocation in production asset management faces fundamental computational bottlenecks:

1. **Continuous vs. Discrete Reality**: Standard Markowitz Mean-Variance solves a convex quadratic problem assuming continuous real weights ($w_i \in \mathbb{R}$). In reality, funds trade in **discrete lot sizes** (e.g., standard round lots of 100 shares), enforce **strict asset cardinality limits** (pick at most $K$ assets out of $N$), and incur **non-linear transaction fees**.
2. **Combinatorial Explosion (NP-Hard)**: Once cardinality and discrete integer constraints are introduced, the optimization morphs from a polynomial convex problem into a **Mixed-Integer Quadratic Programming (MIQP)** problem—belonging to the **NP-Hard** complexity class. Classical solvers degrade exponentially as universe size $N$ expands.
3. **The Quantum Advantage**: By casting the constrained optimization into a **Quadratic Unconstrained Binary Optimization (QUBO)** formulation and mapping it to an Ising spin Hamiltonian, **QAOA (Quantum Approximate Optimization Algorithm)** harnesses quantum superposition and tunneling across $2^N$ combinatorial states to explore complex non-convex energy landscapes efficiently.

---

## ✨ Key Features

* **📑 AI Financial Statement (BCTC) Scanner**:
  * Extracts structural balance sheet, income, and cash flow indicators from SEC filings (10-K, 10-Q) and financial reports (PDF/APIs).
  * Performs sentiment and tone analysis on Management Discussion & Analysis (MD&A) sections using financial NLP models (FinBERT / LLMs) to generate an unbiased **Fundamental Health Score**.
* **📊 Quantitative Alpha & Risk Engine**:
  * Blends technical momentum factors with fundamental health scores into composite expected alpha signals $\mu$.
  * Estimates robust risk structures via Ledoit-Wolf shrinkage covariance matrices $\Sigma$ to mitigate sample noise.
* **⚛️ Quantum Optimization Solver (QPO)**:
  * Automatically maps discrete investment lots and penalty constraints into a QUBO matrix.
  * Solves combinatorial allocation using **QAOA** with classical parameter optimizers (COBYLA/SPSA) executed on **Qiskit AerSimulator** or scalable IBM Quantum backends.
* **⚖️ Dual-Engine Benchmarking**:
  * Direct head-to-head backtesting between **Quantum QAOA** and **Classical SLSQP (Sequential Least Squares Programming)**.
  * Side-by-side computation of Sharpe Ratio, Sortino Ratio, Maximum Drawdown (MDD), and Efficient Frontier trajectories.
* **🖥️ Interactive Financial Dashboard**:
  * High-performance React 18 + TailwindCSS terminal featuring real-time risk charts, dynamic weight distributions, and backtesting scenario simulations.

---

## 🏗️ System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │  Data Ingestion (PDF BCTC / yfinance / FMP)  │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │         AI & NLP Financial Analysis          │
                    │   • PDF Tables & Financial Ratios Extraction │
                    │   • MD&A Sentiment Scoring (FinBERT / LLM)   │
                    │   • Output: Fundamental Alpha Score (0-100)  │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │          Quantitative Risk Engine            │
                    │   • Expected Returns: μ = α·R_tech + (1-α)·Score
                    │   • Covariance Matrix: Σ (Ledoit-Wolf Shrink)│
                    └──────────────────────┬───────────────────────┘
                                           │
                     ┌─────────────────────┴──────────────────────┐
                     ▼                                            ▼
       ┌───────────────────────────┐                ┌───────────────────────────┐
       │   Classical Mode (SciPy)  │                │    Quantum Mode (Qiskit)  │
       │   • Continuous Markowitz  │                │   • QUBO Matrix Builder   │
       │   • SLSQP Convex Solver   │                │   • Ising Hamiltonian     │
       │   • Fractional Weights    │                │   • QAOA Quantum Circuit  │
       └─────────────┬─────────────┘                └─────────────┬─────────────┘
                     │                                            │
                     └─────────────────────┬──────────────────────┘
                                           │
                                           ▼ REST API
                    ┌──────────────────────────────────────────────┐
                    │               FastAPI Backend                │
                    │   • JSON Endpoints: /extract, /optimize      │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼ HTTP / WebSocket
                    ┌──────────────────────────────────────────────┐
                    │      React 18 + Tailwind Web Dashboard       │
                    │   • Filing Parser & Health Matrix Visualizer │
                    │   • Interactive Quantum Portfolio Allocator  │
                    │   • Backtest Analytics & Risk Comparison     │
                    └──────────────────────────────────────────────┘
```

---

## 🔬 Mathematical & Quantum Formulation

### 1. Discrete Constrained Portfolio Problem

$$\min_{w \in \mathcal{W}} \left[ \lambda \cdot w^T \Sigma w - (1 - \lambda) \cdot \mu^T w + C_{\text{trans}}(w) \right]$$

Subject to:
$$\sum_{i=1}^{N} w_i = 1, \quad w_i \in \left\{ 0, \frac{1}{K}, \frac{2}{K}, \dots, 1 \right\}, \quad \|w\|_0 \le B$$

Where:
* $\Sigma$: Asset covariance matrix.
* $\mu$: Composite expected alpha vector.
* $\lambda \in [0, 1]$: Risk-aversion penalty parameter.
* $K$: Number of discrete allotment units per portfolio.
* $B$: Budget cardinality limit (maximum active positions).

### 2. QUBO Binary Mapping

Each asset weight $w_i$ is discretized using $M$ binary variables:
$$w_i = \sum_{k=0}^{M-1} 2^k \cdot \Delta w \cdot x_{i, k}, \quad x_{i, k} \in \{0, 1\}$$

The constrained objective is transformed into an unconstrained quadratic binary form by incorporating budget and cardinality constraints as quadratic penalty terms:
$$\mathcal{H}_{\text{QUBO}}(x) = x^T Q x + c^T x + P \left( \sum_{i, k} 2^k \Delta w x_{i, k} - 1 \right)^2$$

### 3. QAOA Circuit Formulation

The binary vector $x \in \{0, 1\}^n$ is mapped to Pauli-$Z$ operators via $x_j \to \frac{I - Z_j}{2}$, producing the **Cost Hamiltonian** $H_C$:
$$H_C = \sum_{i} h_i Z_i + \sum_{i < j} J_{ij} Z_i Z_j$$

QAOA applies alternating layers of problem and mixer unitaries with $p$ steps:
$$|\psi(\gamma, \beta)\rangle = \prod_{l=1}^{p} e^{-i \beta_l H_M} e^{-i \gamma_l H_C} |+\rangle^{\otimes n}, \quad H_M = \sum_{j=1}^{n} X_j$$

A classical optimizer iteratively updates parameters $(\gamma, \beta)$ to minimize the energy expectation value $\langle \psi | H_C | \psi \rangle$.

---

## 📊 Comparison: Classical vs. Quantum Solvers

| Metric / Dimension | Classical Markowitz (SLSQP) | Genetic / Simulated Annealing | Quantum QAOA (Qiskit / Aer) |
| :--- | :--- | :--- | :--- |
| **Complexity Class** | P (Continuous Convex) | Heuristic Approximation | NP-Hard (Combinatorial QUBO) |
| **Discrete Lot Sizing** | ❌ Requires rounding post-hoc | ⚠️ Slow convergence | ✅ Natively encoded in binary basis |
| **Cardinality Enforcement**| ❌ Breaks convexity | ⚠️ Inconsistent constraint satisfaction | ✅ Exact quadratic penalty formulation |
| **Global Optimum Guarantee**| ✅ Global (Continuous only) | ❌ Easily trapped in local minima | ⚛️ Explores $2^N$ space via tunneling |
| **Runtime Scaling** | $\mathcal{O}(N^3)$ (without discrete constraints) | High variance, stochastic | Quadratic speedup potential on QPU |

---

## 📁 Repository Structure

```text
quantum-alpha-studio/
├── .agents/                 # Automated agent configurations and tools
├── docs/                    # In-depth architectural & deployment blueprints
│   ├── 01_ARCHITECTURE.md
│   ├── 02_SETUP_AND_ENV.md
│   ├── 03_STEP_BY_STEP_BACKEND_AI_QUANTUM.md
│   ├── 04_STEP_BY_STEP_FRONTEND_REACT.md
│   └── 05_DEPLOYMENT_AND_CV_GUIDE.md
├── backend/                 # FastAPI REST Engine & Solvers
│   ├── app/
│   │   ├── ai/              # Financial statement PDF parsers & sentiment NLP
│   │   ├── quant/           # Covariance matrix, alpha factor models & Ledoit-Wolf
│   │   ├── quantum/         # QUBO builder, Ising mapper, Qiskit QAOA solver
│   │   ├── api/             # FastAPI routers & schema definitions
│   │   └── main.py          # ASGI application entrypoint
│   └── requirements.txt     # Python dependencies
├── frontend/                # React 18 + Vite Web Dashboard
│   ├── src/
│   │   ├── components/      # Financial charts, matrix heatmaps & control panels
│   │   ├── services/        # API client bindings
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
├── README.md                # English documentation (Default)
├── README.en.md             # English documentation
└── README.vi.md             # Vietnamese documentation
```

---

## ⚡ Quickstart Guide

### Prerequisites

* **Python**: 3.10 or higher
* **Node.js**: 18.x or higher (npm / pnpm / yarn)
* **Git**

---

### 1. Backend Setup (FastAPI + Qiskit)

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# 3. Install core dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Start the FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

* **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2. Frontend Setup (React + Vite)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install NPM packages
npm install

# 3. Launch Vite development server
npm run dev
```

* **Web Application Interface**: [http://localhost:5173](http://localhost:5173)

---

### 3. Docker Compose (One-Click)

Run the fullstack platform with a single command:

```bash
docker compose up --build
```

---

## 🔌 API Reference

| Method | Endpoint | Description | Payload Sample |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/analyze-report` | Extracts financial metrics and calculates AI sentiment score. | `multipart/form-data (file: PDF)` or `{"ticker": "AAPL"}` |
| `POST` | `/api/v1/quant/covariance` | Computes historical/shrinkage covariance matrix & technical alpha. | `{"tickers": ["AAPL", "MSFT", "NVDA"], "days": 252}` |
| `POST` | `/api/v1/optimize` | Executes portfolio optimization via selected solver (QAOA / SLSQP). | `{"tickers": [...], "solver": "qaoa", "risk_aversion": 0.5, "lots": 10}` |
| `POST` | `/api/v1/backtest` | Evaluates allocation historical performance vs. S&P 500 benchmark. | `{"weights": {"AAPL": 0.4, "MSFT": 0.6}, "start_date": "2023-01-01"}` |

---

## 📚 In-Depth Documentation

For step-by-step implementation recipes, mathematical derivations, and deployment guidelines, explore the [`docs/`](./docs/) directory:

* 📄 [**01. System Architecture & Data Flow**](./docs/01_ARCHITECTURE.md): Full architectural specification and mathematical problem formulation.
* 🛠️ [**02. Setup & Environment Configuration**](./docs/02_SETUP_AND_ENV.md): Virtual environments, Qiskit C-extension tuning, and dependency matrices.
* 🧠 [**03. Backend, AI NLP & Quantum QAOA Engine**](./docs/03_STEP_BY_STEP_BACKEND_AI_QUANTUM.md): Code recipes for PDF extraction, QUBO mapping, and QAOA circuits.
* 💻 [**04. Frontend Dashboard (React + Tailwind + Charts)**](./docs/04_STEP_BY_STEP_FRONTEND_REACT.md): Frontend structure, state stores, and reactive charts.
* 🚀 [**05. Production Deployment & CV Portfolio Guide**](./docs/05_DEPLOYMENT_AND_CV_GUIDE.md): Dockerizing, cloud deployment, and how to highlight this project on your resume.

---

## 🗺️ Roadmap

- [x] Fullstack architecture & mathematical formulation.
- [x] Step-by-step backend, frontend, and deployment guides.
- [ ] Automated Financial Statement ingestion via EDGAR SEC API.
- [ ] Pre-trained FinBERT pipeline for multi-document sentiment scoring.
- [ ] VQE (Variational Quantum Eigensolver) support alongside QAOA.
- [ ] Integration with real IBM Quantum hardware (Eagle / Heron QPU backends).
- [ ] Real-time backtesting engine with slippage and transaction cost simulation.

---

## 📄 License & Acknowledgments

This project is distributed under the **MIT License**. See `LICENSE` for further details.

Developed by **[Le Dat](https://github.com/le-dat)**. Contributions, issues, and feature requests are welcome!
