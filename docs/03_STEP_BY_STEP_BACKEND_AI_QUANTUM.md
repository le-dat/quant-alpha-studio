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

class AssetAllocation(BaseModel):
    ticker: str
    weight: float
    shares_allocation: int

class OptimizeResponse(BaseModel):
    method: str  # "Quantum (QAOA)" hoặc "Classical (Markowitz/SciPy)"
    allocations: List[AssetAllocation]
    expected_return_annual: float
    annual_volatility: float
    sharpe_ratio: float
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
from scipy.optimize import minimize
from qiskit_aer import AerSimulator
from qiskit_algorithms import QAOA
from qiskit_algorithms.optimizers import COBYLA
from qiskit_optimization.problems import QuadraticProgram
from qiskit_optimization.algorithms import MinimumEigenOptimizer

class PortfolioOptimizer:
    def __init__(self, tickers: list, expected_returns: np.ndarray, cov_matrix: np.ndarray, risk_factor: float = 0.5):
        self.tickers = tickers
        self.mu = expected_returns
        self.sigma = cov_matrix
        self.q = risk_factor
        self.n = len(tickers)

    def solve_classical(self) -> dict:
        """Giải bài toán Markowitz cổ điển bằng SciPy (Continuous weights)"""
        start_time = time.time()
        
        def objective(w):
            return 0.5 * self.q * np.dot(w.T, np.dot(self.sigma, w)) - np.dot(self.mu, w)
        
        constraints = ({'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0})
        bounds = tuple((0.0, 1.0) for _ in range(self.n))
        init_guess = np.ones(self.n) / self.n
        
        res = minimize(objective, init_guess, method='SLSQP', bounds=bounds, constraints=constraints)
        weights = res.x
        
        ann_return = np.sum(self.mu * weights) * 252
        ann_vol = np.sqrt(np.dot(weights.T, np.dot(self.sigma * 252, weights)))
        sharpe = ann_return / (ann_vol + 1e-8)
        
        return {
            "method": "Classical (Markowitz/SciPy)",
            "weights": {ticker: float(round(w, 4)) for ticker, w in zip(self.tickers, weights)},
            "expected_return": float(ann_return),
            "volatility": float(ann_vol),
            "sharpe_ratio": float(sharpe),
            "exec_time": time.time() - start_time
        }

    def solve_quantum_qaoa(self, budget_assets: int = 3) -> dict:
        """
        Mã hóa bài toán thành QUBO và giải bằng thuật toán QAOA trên Qiskit AerSimulator.
        Ràng buộc: Chọn đúng `budget_assets` cổ phiếu (Rời rạc nhị phân x_i in {0, 1}).
        """
        start_time = time.time()
        
        qp = QuadraticProgram("QuantumPortfolioOptimization")
        # Khai báo biến nhị phân: x_i = 1 (mua cổ phiếu i), 0 (không mua)
        for ticker in self.tickers:
            qp.binary_var(name=ticker)
            
        # Hàm mục tiêu: min (0.5 * q * x^T * Sigma * x - mu^T * x)
        linear = {ticker: -float(self.mu[i]) for i, ticker in enumerate(self.tickers)}
        quadratic = {}
        for i, t_i in enumerate(self.tickers):
            for j, t_j in enumerate(self.tickers):
                quadratic[(t_i, t_j)] = float(0.5 * self.q * self.sigma[i, j])
                
        qp.minimize(linear=linear, quadratic=quadratic)
        
        # Ràng buộc ngân sách rời rạc: sum(x_i) == budget_assets
        qp.linear_constraint(linear={t: 1 for t in self.tickers}, sense="==", rhs=budget_assets, name="budget")

        # Khởi tạo mô phỏng lượng tử
        backend = AerSimulator()
        optimizer = COBYLA(maxiter=50)
        qaoa = QAOA(optimizer=optimizer, reps=1, quantum_instance=backend)
        min_eigen_solver = MinimumEigenOptimizer(qaoa)
        
        # Chạy thuật toán lượng tử
        result = min_eigen_solver.solve(qp)
        
        # Trích xuất vector nghiệm nhị phân
        selected_binary = [result.variables_dict[t] for t in self.tickers]
        sum_selected = sum(selected_binary)
        weights = [float(b / sum_selected) if sum_selected > 0 else 1.0 / self.n for b in selected_binary]
        
        w_arr = np.array(weights)
        ann_return = np.sum(self.mu * w_arr) * 252
        ann_vol = np.sqrt(np.dot(w_arr.T, np.dot(self.sigma * 252, w_arr)))
        sharpe = ann_return / (ann_vol + 1e-8)
        
        return {
            "method": "Quantum (QAOA / Qiskit)",
            "weights": {ticker: float(round(w, 4)) for ticker, w in zip(self.tickers, weights)},
            "expected_return": float(ann_return),
            "volatility": float(ann_vol),
            "sharpe_ratio": float(sharpe),
            "exec_time": time.time() - start_time,
            "quantum_metadata": {
                "num_qubits": self.n,
                "optimal_energy": float(result.fval),
                "solver": "AerSimulator QAOA"
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

## 6. Khởi tạo FastAPI Application (`app/main.py`)

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
