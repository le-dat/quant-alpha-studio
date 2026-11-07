from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class BCTCAnalysisRequest(BaseModel):
    ticker: str = Field(..., example="NVDA")
    company_name: Optional[str] = None
    custom_text: Optional[str] = None

class BCTCAnalysisResponse(BaseModel):
    ticker: str
    fundamental_score: float = Field(..., description="Điểm sức khỏe tài chính từ 0 - 100")
    sentiment_score: float = Field(..., description="Sentiment của ban lãnh đạo từ -1.0 đến +1.0")
    key_metrics: Dict[str, float]
    summary_insights: List[str]

class AssetAllocation(BaseModel):
    ticker: str
    weight: float
    percentage: float
    shares_allocation: Optional[int] = 0

class OptimizeRequest(BaseModel):
    tickers: List[str] = Field(default=["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"])
    period: str = Field(default="1y", description="Khoảng thời gian: 6m, 1y, 2y")
    risk_tolerance: float = Field(default=0.5, description="Hệ số chấp nhận rủi ro q (0.0 đến 1.0)")
    budget_cardinality: int = Field(default=3, description="Số lượng cổ phiếu tối đa trong danh mục")
    include_fundamental_alpha: bool = Field(default=True)
    use_quantum: bool = Field(default=True)

class OptimizeResponse(BaseModel):
    method: str
    weights: Dict[str, float]
    allocations: List[AssetAllocation]
    expected_return: float
    volatility: float
    sharpe_ratio: float
    expected_return_annual: float
    annual_volatility: float
    execution_time_seconds: float
    quantum_metadata: Optional[Dict[str, Any]] = None

class BacktestRequest(BaseModel):
    tickers: List[str] = Field(default=["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"])
    period: str = Field(default="1y")
    quantum_weights: Optional[Dict[str, float]] = None
    classical_weights: Optional[Dict[str, float]] = None

class BacktestResponse(BaseModel):
    dates: List[str]
    quantum_cumulative_returns: List[float]
    classical_cumulative_returns: List[float]
    benchmark_cumulative_returns: List[float]
    quantum_max_drawdown: float
    classical_max_drawdown: float
