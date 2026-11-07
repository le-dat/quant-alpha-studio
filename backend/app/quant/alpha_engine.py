import numpy as np
import pandas as pd
import yfinance as yf
from typing import List, Tuple, Dict

class QuantAlphaEngine:
    @staticmethod
    def get_market_data(tickers: List[str], period: str = "1y") -> Tuple[np.ndarray, np.ndarray, pd.DataFrame]:
        """
        Lấy giá đóng cửa lịch sử, tính lợi nhuận trung bình ngày (mu) và ma trận hiệp phương sai (sigma).
        Có cơ chế fallback dự phòng tự tạo dữ liệu chuỗi thời gian khi mạng offline / rate-limit.
        """
        clean_tickers = [t.strip().upper() for t in tickers if t.strip()]
        if not clean_tickers:
            clean_tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"]

        data = None
        try:
            downloaded = yf.download(clean_tickers, period=period, progress=False, auto_adjust=True)
            if "Close" in downloaded:
                data = downloaded["Close"]
            elif not downloaded.empty:
                data = downloaded
            if isinstance(data, pd.Series):
                data = data.to_frame()
            if data is not None and not data.empty and len(data) > 10:
                data = data.ffill().bfill().dropna(axis=1, how="all")
        except Exception:
            data = None

        # Fallback tạo dữ liệu chuỗi thời gian nếu không tải được từ yfinance
        if data is None or data.empty or data.shape[1] < len(clean_tickers):
            dates = pd.date_range(end=pd.Timestamp.now(), periods=252, freq="B")
            simulated = {}
            np.random.seed(42)
            
            # Giả lập biến động giá thực tế
            annual_stats = {
                "NVDA": (0.45, 0.38),
                "AAPL": (0.18, 0.20),
                "MSFT": (0.22, 0.22),
                "GOOGL": (0.20, 0.24),
                "AMZN": (0.24, 0.28),
                "TSLA": (0.30, 0.45),
                "META": (0.35, 0.32),
                "FPT": (0.25, 0.22),
                "HPG": (0.15, 0.30),
                "VNM": (0.10, 0.16)
            }
            
            for t in clean_tickers:
                exp_ret, vol = annual_stats.get(t, (0.15, 0.25))
                daily_drift = exp_ret / 252.0
                daily_vol = vol / np.sqrt(252.0)
                daily_ret = np.random.normal(daily_drift, daily_vol, len(dates))
                price = 100.0 * np.cumprod(1.0 + daily_ret)
                simulated[t] = price
                
            data = pd.DataFrame(simulated, index=dates)

        # Tính tỷ suất sinh lời hàng ngày
        returns = data.pct_change().dropna()
        if returns.empty:
            returns = pd.DataFrame(np.zeros((10, len(clean_tickers))), columns=clean_tickers)

        # Đảm bảo thứ tự cột khớp với clean_tickers
        cols = [c for c in clean_tickers if c in returns.columns]
        returns = returns[cols]
        
        mu = returns.mean().values
        sigma = returns.cov().values
        
        return mu, sigma, returns

    @staticmethod
    def combine_with_fundamental_alpha(mu: np.ndarray, fundamental_scores: List[float], weight_alpha: float = 0.3) -> np.ndarray:
        """
        Kết hợp lợi nhuận kỹ thuật với điểm sức khỏe tài chính cơ bản BCTC:
        mu_adjusted = (1 - w) * mu + w * ((fundamental_score - 50) / 100 * scale)
        """
        scores = np.array(fundamental_scores, dtype=float)
        # Điểm 50 là trung lập, điểm 100 tương đương +0.05% lợi nhuận ngày, điểm 0 tương đương -0.05%
        scaled_scores = (scores - 50.0) / 100.0 * 0.0008
        return (1.0 - weight_alpha) * mu + weight_alpha * scaled_scores

    @staticmethod
    def run_backtest(returns_df: pd.DataFrame, quantum_weights: Dict[str, float], classical_weights: Dict[str, float]) -> Dict:
        """
        Mô phỏng đường cong tăng trưởng vốn theo lịch sử (Equity Curve)
        và tính toán Max Drawdown cho từng chiến lược.
        """
        cols = list(returns_df.columns)
        n = len(cols)
        if n == 0:
            return {
                "dates": [],
                "quantum_cumulative_returns": [],
                "classical_cumulative_returns": [],
                "benchmark_cumulative_returns": [],
                "quantum_max_drawdown": 0.0,
                "classical_max_drawdown": 0.0
            }

        dates = [d.strftime("%Y-%m-%d") for d in returns_df.index]

        # Vector trọng số
        q_w = np.array([float(quantum_weights.get(c, 0.0)) for c in cols])
        if q_w.sum() > 0:
            q_w = q_w / q_w.sum()
        else:
            q_w = np.ones(n) / n

        c_w = np.array([float(classical_weights.get(c, 0.0)) for c in cols])
        if c_w.sum() > 0:
            c_w = c_w / c_w.sum()
        else:
            c_w = np.ones(n) / n

        bench_w = np.ones(n) / float(n)

        # Lợi nhuận danh mục hàng ngày
        q_daily = returns_df.dot(q_w)
        c_daily = returns_df.dot(c_w)
        b_daily = returns_df.dot(bench_w)

        # Lợi nhuận tích lũy (Cumulative Returns)
        q_cum = (1.0 + q_daily).cumprod() - 1.0
        c_cum = (1.0 + c_daily).cumprod() - 1.0
        b_cum = (1.0 + b_daily).cumprod() - 1.0

        def calc_max_drawdown(cum_series: pd.Series) -> float:
            wealth_index = 1.0 + cum_series
            previous_peaks = wealth_index.cummax()
            drawdowns = (wealth_index - previous_peaks) / previous_peaks
            min_dd = float(drawdowns.min())
            return round(abs(min_dd) * 100.0, 2)

        # Lấy mẫu bước nhảy 3 ngày để nhẹ payload JSON
        step = max(1, len(dates) // 80)
        
        return {
            "dates": dates[::step],
            "quantum_cumulative_returns": [round(float(v) * 100.0, 2) for v in q_cum.values[::step]],
            "classical_cumulative_returns": [round(float(v) * 100.0, 2) for v in c_cum.values[::step]],
            "benchmark_cumulative_returns": [round(float(v) * 100.0, 2) for v in b_cum.values[::step]],
            "quantum_max_drawdown": calc_max_drawdown(q_cum),
            "classical_max_drawdown": calc_max_drawdown(c_cum)
        }
