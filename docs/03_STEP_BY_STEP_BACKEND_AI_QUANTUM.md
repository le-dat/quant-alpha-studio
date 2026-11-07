# 03. Hướng dẫn Lập trình Backend: AI BCTC, Quant & Quantum Solver

Tài liệu này hướng dẫn chi tiết cách viết code cho từng module trong Backend của **QuantumAlpha Studio**.

---

## 1. Cấu trúc Thư mục Backend

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # Entrypoint FastAPI & CORS
│   ├── api/
│   │   ├── __init__.py
│   │   └── endpoints.py         # Định nghĩa các REST API routes
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py           # Pydantic schemas (Request / Response)
│   ├── ai/
│   │   ├── __init__.py
│   │   └── bctc_analyzer.py     # Bóc tách BCTC + Sentiment NLP -> Alpha Score
│   ├── quant/
│   │   ├── __init__.py
│   │   └── alpha_engine.py      # Dữ liệu giá, Ma trận Hiệp phương sai, Backtest
│   └── quantum/
│       ├── __init__.py
│       └── portfolio_optimizer.py # Bộ giải Qiskit QAOA (QUBO) & SciPy SLSQP
├── requirements.txt
└── .env
```

---

## 2. Pydantic Schemas (`app/models/schemas.py`)

File này quy định chặt chẽ kiểu dữ liệu đầu vào và đầu ra của API:

```python
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class BCTCAnalysisRequest(BaseModel):
    ticker: str = Field(..., example="AAPL")
    company_name: Optional[str] = None
    custom_text: Optional[str] = None

class BCTCAnalysisResponse(BaseModel):
    ticker: str
    fundamental_score: float = Field(..., description="Điểm sức khỏe tài chính từ 0 - 100")
    sentiment_score: float = Field(..., description="Sentiment của ban lãnh đạo từ -1.0 đến +1.0")
    key_metrics: Dict[str, float]
    summary_insights: List[str]

class OptimizeRequest(BaseModel):
    tickers: List[str] = Field(default=["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"])
    period: str = Field(default="1y", description="Khoảng thời gian: 6m, 1y, 2y")
    risk_tolerance: float = Field(default=0.5, description="Hệ số chấp nhận rủi ro q (0.0 đến 1.0)")
    budget_cardinality: int = Field(default=3, description="Số lượng cổ phiếu tối đa trong danh mục")
    include_fundamental_alpha: bool = Field(default=True)
    use_quantum: bool = Field(default=True)

class AssetAllocation(BaseModel):
    ticker: str
    weight: float
    percentage: float
    shares_allocation: Optional[int] = 0

class OptimizeResponse(BaseModel):
    method: str  # "Quantum (QAOA / Qiskit Aer)" hoặc "Classical (Markowitz/SciPy SLSQP)"
    weights: Dict[str, float]
    allocations: List[AssetAllocation]
    expected_return: float
    volatility: float
    sharpe_ratio: float
    expected_return_annual: float
    annual_volatility: float
    execution_time_seconds: float
    quantum_metadata: Optional[Dict] = None
class BacktestResponse(BaseModel):
    dates: List[str]
    quantum_cumulative_returns: List[float]
    classical_cumulative_returns: List[float]
    benchmark_cumulative_returns: List[float]
    quantum_max_drawdown: float
    classical_max_drawdown: float
```

---

## 3. Module AI Phân tích BCTC (`app/ai/bctc_analyzer.py`)

Module chịu trách nhiệm đọc BCTC, chấm điểm các chỉ số tài chính cơ bản và phân tích cảm xúc (Sentiment) từ văn bản:

```python
import pypdf
import io
from typing import Dict, List, Tuple

class FinancialStatementAnalyzer:
    def __init__(self):
        # Có thể mở rộng tích hợp transformers pipeline("sentiment-analysis", model="ProsusAI/finbert")
        pass

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages[:10]: # Đọc 10 trang đầu
            text += (page.extract_text() or "") + "\n"
        return text

    def analyze_ticker_financials(self, ticker: str, text: str = "") -> Tuple[float, float, Dict[str, float], List[str]]:
        """
        Trích xuất chỉ số tài chính cơ bản và chấm điểm Fundamental Alpha Score (0 - 100).
        """
        # Giả lập hoặc bóc tách các chỉ số tài chính kinh điển
        # (Trong thực tế có thể gọi Financial Modeling Prep API / yfinance info)
        mock_data = {
            "AAPL": {"roe": 0.35, "net_margin": 0.25, "debt_to_equity": 1.2, "pe_ratio": 28.5, "sentiment": 0.65},
            "MSFT": {"roe": 0.38, "net_margin": 0.34, "debt_to_equity": 0.8, "pe_ratio": 32.0, "sentiment": 0.72},
            "GOOGL": {"roe": 0.28, "net_margin": 0.24, "debt_to_equity": 0.3, "pe_ratio": 24.0, "sentiment": 0.58},
            "AMZN": {"roe": 0.18, "net_margin": 0.08, "debt_to_equity": 0.9, "pe_ratio": 42.0, "sentiment": 0.45},
            "NVDA": {"roe": 0.55, "net_margin": 0.52, "debt_to_equity": 0.4, "pe_ratio": 45.0, "sentiment": 0.85},
        }

        data = mock_data.get(ticker.upper(), {"roe": 0.15, "net_margin": 0.12, "debt_to_equity": 1.0, "pe_ratio": 20.0, "sentiment": 0.5})
        
        # Công thức tính điểm Fundamental Health Score (0 - 100)
        # Kết hợp khả năng sinh lời (ROE, Margin), đòn bẩy tài chính và định giá
        profitability_score = min(data["roe"] * 100, 40) + min(data["net_margin"] * 100, 30)
        safety_score = max(0, 20 - data["debt_to_equity"] * 10)
        sentiment_score = data["sentiment"]
        
        total_score = round(profitability_score * 0.6 + safety_score * 0.2 + (sentiment_score * 50 + 50) * 0.2, 2)
        
        insights = [
            f"ROE đạt {data['roe']*100:.1f}%, cho thấy hiệu quả sử dụng vốn cổ phần vượt trội.",
            f"Biên lợi nhuận ròng {data['net_margin']*100:.1f}%.",
            f"Tỷ lệ nợ/Vốn CSH: {data['debt_to_equity']} (Mức rủi ro tài chính nằm trong vùng kiểm soát).",
            f"Đánh giá giọng điệu ban giám đốc (Sentiment): Tích cực ({sentiment_score:+.2f})."
        ]
        
        metrics = {
            "ROE": data["roe"],
            "Net Margin": data["net_margin"],
            "Debt/Equity": data["debt_to_equity"],
            "P/E": data["pe_ratio"]
        }
        
        return total_score, sentiment_score, metrics, insights
```

---

## 4. Module Tối ưu hóa Lượng tử Qiskit (`app/quantum/portfolio_optimizer.py`)

Chuyển đổi bài toán phân bổ danh mục sang dạng toán tử Ising/QUBO và giải bằng **QAOA** (hoặc SciPy SLSQP cho chế độ cổ điển):

```python
import numpy as np
import time
from typing import List, Dict, Any
from scipy.optimize import minimize
from qiskit.primitives import StatevectorSampler
from qiskit_algorithms import QAOA
from qiskit_algorithms.optimizers import COBYLA
from qiskit_optimization.problems import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer

class PortfolioOptimizer:
    def __init__(self, tickers: list, expected_returns: np.ndarray, cov_matrix: np.ndarray, risk_factor: float = 0.5):
        self.tickers = tickers
        self.mu = np.array(expected_returns, dtype=float)
        self.sigma = np.array(cov_matrix, dtype=float)
        self.q = float(risk_factor)
        self.n = len(tickers)

    def solve_classical(self) -> dict:
        """Giải bài toán Markowitz cổ điển bằng SciPy SLSQP (Continuous weights)"""
        start_time = time.time()
        
        def objective(w):
            return 0.5 * self.q * np.dot(w.T, np.dot(self.sigma, w)) - np.dot(self.mu, w)
        
        constraints = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})
        bounds = tuple((0.0, 1.0) for _ in range(self.n))
        init_guess = np.ones(self.n) / float(self.n)
        
        res = minimize(objective, init_guess, method='SLSQP', bounds=bounds, constraints=constraints)
        weights = res.x if res.success else init_guess
        weights = np.where(weights < 0.001, 0.0, weights)
        if weights.sum() > 0:
            weights = weights / weights.sum()
        
        ann_return = float(np.sum(self.mu * weights) * 252)
        ann_vol = float(np.sqrt(np.dot(weights.T, np.dot(self.sigma * 252, weights))))
        sharpe = ann_return / (ann_vol + 1e-8)
        exec_time = time.time() - start_time
        
        weights_dict = {ticker: round(float(w), 4) for ticker, w in zip(self.tickers, weights)}
        allocations = [
            {"ticker": t, "weight": round(float(w), 4), "percentage": round(float(w) * 100, 2), "shares_allocation": int(round(float(w) * 100))}
            for t, w in zip(self.tickers, weights)
        ]
        
        return {
            "method": "Classical (Markowitz/SciPy SLSQP)",
            "weights": weights_dict,
            "allocations": allocations,
            "expected_return": round(ann_return, 4),
            "volatility": round(ann_vol, 4),
            "sharpe_ratio": round(sharpe, 2),
            "expected_return_annual": round(ann_return, 4),
            "annual_volatility": round(ann_vol, 4),
            "execution_time_seconds": round(exec_time, 4),
            "quantum_metadata": None
        }

    def solve_quantum_qaoa(self, budget_assets: int = 3) -> dict:
        """
        Mã hóa bài toán thành QUBO và giải bằng thuật toán QAOA trên Qiskit 1.4+ (StatevectorSampler).
        Ràng buộc: Chọn đúng `budget_assets` cổ phiếu (Rời rạc nhị phân x_i in {0, 1}).
        """
        start_time = time.time()
        k = max(1, min(budget_assets, self.n))
        
        qp = QuadraticProgram("QuantumPortfolioOptimization")
        for ticker in self.tickers:
            qp.binary_var(name=ticker)
            
        linear = {ticker: -float(self.mu[i]) for i, ticker in enumerate(self.tickers)}
        quadratic = {}
        for i, t_i in enumerate(self.tickers):
            for j, t_j in enumerate(self.tickers):
                quadratic[(t_i, t_j)] = float(0.5 * self.q * self.sigma[i, j])
                
        qp.minimize(linear=linear, quadratic=quadratic)
        qp.linear_constraint(linear={t: 1 for t in self.tickers}, sense="==", rhs=k, name="budget")

        # Khởi tạo mô phỏng lượng tử bằng Qiskit 1.4+ V2 Primitive
        sampler = StatevectorSampler()
        optimizer = COBYLA(maxiter=40)
        qaoa = QAOA(sampler=sampler, optimizer=optimizer, reps=1)
        min_eigen_solver = MinimumEigenOptimizer(qaoa)
        
        result = min_eigen_solver.solve(qp)
        
        selected_binary = [float(result.variables_dict[t]) for t in self.tickers]
        sum_selected = sum(selected_binary)
        weights = [float(b / sum_selected) if sum_selected > 0 else 1.0 / self.n for b in selected_binary]
        
        w_arr = np.array(weights, dtype=float)
        ann_return = float(np.sum(self.mu * w_arr) * 252)
        ann_vol = float(np.sqrt(np.dot(w_arr.T, np.dot(self.sigma * 252, w_arr))))
        sharpe = ann_return / (ann_vol + 1e-8)
        exec_time = time.time() - start_time
        
        weights_dict = {ticker: round(float(w), 4) for ticker, w in zip(self.tickers, weights)}
        allocations = [
            {"ticker": t, "weight": round(float(w), 4), "percentage": round(float(w) * 100, 2), "shares_allocation": int(round(float(w) * 100))}
            for t, w in zip(self.tickers, weights)
        ]
        
        return {
            "method": "Quantum (QAOA / Qiskit Aer)",
            "weights": weights_dict,
            "allocations": allocations,
            "expected_return": round(ann_return, 4),
            "volatility": round(ann_vol, 4),
            "sharpe_ratio": round(sharpe, 2),
            "expected_return_annual": round(ann_return, 4),
            "annual_volatility": round(ann_vol, 4),
            "execution_time_seconds": round(exec_time, 4),
            "quantum_metadata": {
                "num_qubits": self.n,
                "optimal_energy": round(float(result.fval), 6),
                "solver": "Qiskit 1.4 StatevectorSampler QAOA",
                "budget_cardinality": k
            }
        }
```

---

## 5. Module Dữ liệu Định lượng & Backtest (`app/quant/alpha_engine.py`)

Tải dữ liệu giá lịch sử qua `yfinance`, tính toán ma trận tương quan và mô phỏng Backtest:

```python
import yfinance as yf
import numpy as np
import pandas as pd
from typing import List, Tuple

class QuantAlphaEngine:
    @staticmethod
    def get_market_data(tickers: List[str], period: str = "1y") -> Tuple[np.ndarray, np.ndarray, pd.DataFrame]:
        """Lấy giá đóng cửa lịch sử, tính lợi nhuận trung bình ngày và ma trận hiệp phương sai"""
        data = yf.download(tickers, period=period, progress=False)["Close"]
        if isinstance(data, pd.Series):
            data = data.to_frame()
            
        returns = data.pct_change().dropna()
        mu = returns.mean().values
        sigma = returns.cov().values
        return mu, sigma, returns

    @staticmethod
    def combine_with_fundamental_alpha(mu: np.ndarray, fundamental_scores: List[float], weight_alpha: float = 0.3) -> np.ndarray:
        """
        Kết hợp lợi nhuận kỹ thuật với điểm sức khỏe tài chính BCTC:
        mu_adjusted = (1 - w) * mu + w * (fundamental_score / 100 * scale_factor)
        """
        scaled_scores = (np.array(fundamental_scores) - 50.0) / 100.0 * 0.001
        return (1.0 - weight_alpha) * mu + weight_alpha * scaled_scores

    @staticmethod
    def run_backtest(returns_df: pd.DataFrame, quantum_weights: dict, classical_weights: dict) -> dict:
        """Mô phỏng đường cong tăng trưởng vốn theo lịch sử (Equity Curve)"""
        dates = [d.strftime("%Y-%m-%d") for d in returns_df.index]
        
        q_w = np.array([quantum_weights.get(col, 0) for col in returns_df.columns])
        c_w = np.array([classical_weights.get(col, 0) for col in returns_df.columns])
        bench_w = np.ones(len(returns_df.columns)) / len(returns_df.columns)
        
        q_daily = returns_df.dot(q_w)
        c_daily = returns_df.dot(c_w)
        b_daily = returns_df.dot(bench_w)
        
        q_cum = (1 + q_daily).cumprod() - 1
        c_cum = (1 + c_daily).cumprod() - 1
        b_cum = (1 + b_daily).cumprod() - 1
        
        def max_dd(cum_series):
            peak = (1 + cum_series).cummax()
            dd = ((1 + cum_series) - peak) / peak
            return float(abs(dd.min()))

        return {
            "dates": dates[::5], # Lấy mẫu 5 ngày/điểm để giảm tải JSON
            "quantum_cumulative_returns": [round(float(v) * 100, 2) for v in q_cum.values[::5]],
            "classical_cumulative_returns": [round(float(v) * 100, 2) for v in c_cum.values[::5]],
            "benchmark_cumulative_returns": [round(float(v) * 100, 2) for v in b_cum.values[::5]],
            "quantum_max_drawdown": round(max_dd(q_cum) * 100, 2),
            "classical_max_drawdown": round(max_dd(c_cum) * 100, 2)
        }
```

---

## 6. Định nghĩa REST API Endpoints (`app/api/endpoints.py`)

Router FastAPI kết nối AI BCTC Analyzer, Quant Alpha Engine và Quantum Solver:

```python
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List
from app.models.schemas import (
    BCTCAnalysisRequest,
    BCTCAnalysisResponse,
    OptimizeRequest,
    OptimizeResponse,
    BacktestRequest,
    BacktestResponse,
)
from app.ai.bctc_analyzer import FinancialStatementAnalyzer
from app.quant.alpha_engine import QuantAlphaEngine
from app.quantum.portfolio_optimizer import PortfolioOptimizer

router = APIRouter()
analyzer = FinancialStatementAnalyzer()

@router.post("/analyze-report", response_model=BCTCAnalysisResponse)
async def analyze_report(payload: Optional[BCTCAnalysisRequest] = None):
    ticker = payload.ticker if payload else "NVDA"
    custom_text = payload.custom_text if payload and payload.custom_text else ""
    score, sentiment, metrics, insights = analyzer.analyze_ticker_financials(ticker, custom_text)
    return BCTCAnalysisResponse(
        ticker=ticker.upper(),
        fundamental_score=score,
        sentiment_score=sentiment,
        key_metrics=metrics,
        summary_insights=insights
    )

@router.post("/optimize", response_model=OptimizeResponse)
async def optimize_portfolio(request: OptimizeRequest):
    clean_tickers = [t.strip().upper() for t in request.tickers if t.strip()]
    if not clean_tickers:
        clean_tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"]

    mu, sigma, returns_df = QuantAlphaEngine.get_market_data(clean_tickers, period=request.period)

    if request.include_fundamental_alpha:
        scores = [analyzer.analyze_ticker_financials(t)[0] for t in clean_tickers]
        mu = QuantAlphaEngine.combine_with_fundamental_alpha(mu, scores, weight_alpha=0.35)

    optimizer = PortfolioOptimizer(clean_tickers, mu, sigma, request.risk_tolerance)
    if request.use_quantum:
        result = optimizer.solve_quantum_qaoa(budget_assets=request.budget_cardinality)
    else:
        result = optimizer.solve_classical()

    return OptimizeResponse(**result)

@router.post("/backtest", response_model=BacktestResponse)
async def backtest_portfolio(request: BacktestRequest):
    clean_tickers = [t.strip().upper() for t in request.tickers if t.strip()]
    mu, sigma, returns_df = QuantAlphaEngine.get_market_data(clean_tickers, period=request.period)

    opt = PortfolioOptimizer(clean_tickers, mu, sigma, risk_factor=0.5)
    c_weights = request.classical_weights or opt.solve_classical()["weights"]
    q_weights = request.quantum_weights or opt.solve_quantum_qaoa(budget_assets=min(3, len(clean_tickers)))["weights"]

    backtest_data = QuantAlphaEngine.run_backtest(returns_df, q_weights, c_weights)
    return BacktestResponse(**backtest_data)
```

---

## 7. Khởi tạo FastAPI Application (`app/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

app = FastAPI(
    title="QuantumAlpha Studio API",
    description="Backend API cho nền tảng Phân tích BCTC & Tối ưu hóa Danh mục Đầu tư bằng AI & Điện toán Lượng tử",
    version="1.0.0"
)

# Cấu hình CORS để Frontend React gọi được
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "QuantumAlpha Studio API"}
```
