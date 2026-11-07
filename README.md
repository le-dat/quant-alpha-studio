<div align="center">

# QuantumAlpha Studio 🚀

### Fullstack AI & Quantum-Powered Quantitative Portfolio Optimization Platform

<p align="center">
  <a href="README.md"><b>🇬🇧 English</b></a> &nbsp;|&nbsp;
  <a href="README.vi.md"><b>🇻🇳 Tiếng Việt</b></a>
</p>

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Modern%20API-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB.svg)](https://react.dev/)
[![Qiskit](https://img.shields.io/badge/IBM%20Qiskit-Quantum%20Finance-6929C4.svg)](https://qiskit.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

</div>

---

## 📌 Project Overview

**QuantumAlpha Studio** is a next-generation quantitative portfolio management platform that integrates four modern fintech and deep-tech pillars:

1. **AI Financial Statement (BCTC) Scanner**: Automated extraction and health scoring from financial reports (PDF/API) utilizing NLP models (FinBERT / LLMs).
2. **Quantitative Alpha Engine**: Generates factor-driven quantitative alpha signals (Fundamental Alpha + Price Momentum) and empirical risk models (Covariance Matrix).
3. **Quantum Portfolio Optimization (QPO)**: Solves multi-constrained portfolio allocation (Markowitz mean-variance with discrete lot sizes and transaction costs — an NP-Hard problem) mapped to QUBO and solved via **QAOA (Quantum Approximate Optimization Algorithm)** using **Qiskit Aer** or IBM Quantum Cloud.
4. **Interactive Dashboard**: Modern financial UI comparing performance, Sharpe ratios, and efficient frontiers between Quantum (QAOA) and Classical Solvers (Markowitz / SciPy SLSQP).

---

## 🏗️ System Architecture

```
[ Financial Statements / Market Price Data ] 
                      │
                      ▼
[ FastAPI Backend ] 
  ├── AI Module: Financial Filings Extraction + Sentiment -> Fundamental Alpha
  ├── Quant Module: Expected Returns Calculation + Covariance Matrix
  └── Quantum Module: QUBO Formulation + QAOA (Qiskit) vs Classical (SciPy) Solvers
                      │
                      ▼ REST API
[ React + Tailwind Frontend ]
  ├── Screen 1: Financial Statement Scanner & Health Scoring
  ├── Screen 2: Portfolio Configuration & Quantum Solver Setup
  └── Screen 3: Backtest Dashboard & Risk/Return Comparison
```

---

## 📚 Detailed Documentation

Comprehensive, step-by-step blueprints are available in the [`docs/`](./docs/) directory:

* [**01. System Architecture & Data Flow**](./docs/01_ARCHITECTURE.md)
* [**02. Environment Setup & Prerequisites**](./docs/02_SETUP_AND_ENV.md)
* [**03. Backend Implementation (FastAPI, AI Scanner & Quantum QAOA)**](./docs/03_STEP_BY_STEP_BACKEND_AI_QUANTUM.md)
* [**04. Frontend Dashboard (React 18 + Vite + Tailwind)**](./docs/04_STEP_BY_STEP_FRONTEND_REACT.md)
* [**05. Deployment, Production & CV/Portfolio Guide**](./docs/05_DEPLOYMENT_AND_CV_GUIDE.md)

---

## ⚡ Quickstart

### 1. Launch Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

* Interactive API Documentation (Swagger UI): `http://localhost:8000/docs`

### 2. Launch Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

* Web Dashboard: `http://localhost:5173`
