from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional, List
import json

from app.models.schemas import (
    BCTCAnalysisRequest,
    BCTCAnalysisResponse,
    OptimizeRequest,
    OptimizeResponse,
    BacktestRequest,
    BacktestResponse,
    AssetAllocation
)
from app.ai.bctc_analyzer import FinancialStatementAnalyzer
from app.quant.alpha_engine import QuantAlphaEngine
from app.quantum.portfolio_optimizer import PortfolioOptimizer

router = APIRouter()
analyzer = FinancialStatementAnalyzer()

@router.post("/analyze-report", response_model=BCTCAnalysisResponse)
async def analyze_report(
    payload: Optional[BCTCAnalysisRequest] = None
):
    """
    Phân tích Báo cáo tài chính & chấm điểm Fundamental Health Score + Sentiment ban điều hành.
    """
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

@router.post("/analyze-pdf", response_model=BCTCAnalysisResponse)
async def analyze_pdf(
    ticker: str = Form("NVDA"),
    file: UploadFile = File(...)
):
    """
    Tải lên file PDF báo cáo tài chính thật và bóc tách tự động.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ file định dạng PDF.")
    
    pdf_bytes = await file.read()
    extracted_text = analyzer.extract_text_from_pdf(pdf_bytes)
    
    score, sentiment, metrics, insights = analyzer.analyze_ticker_financials(ticker, extracted_text)
    
    return BCTCAnalysisResponse(
        ticker=ticker.upper(),
        fundamental_score=score,
        sentiment_score=sentiment,
        key_metrics=metrics,
        summary_insights=insights
    )

@router.post("/optimize", response_model=OptimizeResponse)
async def optimize_portfolio(request: OptimizeRequest):
    """
    Tối ưu hóa danh mục đầu tư bằng Classical (Markowitz/SciPy) hoặc Quantum (QAOA/Qiskit).
    """
    clean_tickers = [t.strip().upper() for t in request.tickers if t.strip()]
    if not clean_tickers:
        clean_tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"]

    # Giới hạn số qubit để đảm bảo hiệu năng giả lập CPU
    if len(clean_tickers) > 12:
        raise HTTPException(
            status_code=400,
            detail="Số lượng mã cổ phiếu vượt quá giới hạn mô phỏng lượng tử (Tối đa 12 mã để tránh tràn RAM)."
        )

    # 1. Lấy dữ liệu giá thị trường và ma trận hiệp phương sai
    mu, sigma, returns_df = QuantAlphaEngine.get_market_data(clean_tickers, period=request.period)

    # 2. Điều chỉnh Alpha Score nếu có yêu cầu
    if request.include_fundamental_alpha:
        scores = []
        for t in clean_tickers:
            score, _, _, _ = analyzer.analyze_ticker_financials(t)
            scores.append(score)
        mu = QuantAlphaEngine.combine_with_fundamental_alpha(mu, scores, weight_alpha=0.35)

    # 3. Khởi tạo bộ giải
    optimizer = PortfolioOptimizer(
        tickers=clean_tickers,
        expected_returns=mu,
        cov_matrix=sigma,
        risk_factor=request.risk_tolerance
    )

    # 4. Chọn chế độ giải
    if request.use_quantum:
        result = optimizer.solve_quantum_qaoa(budget_assets=request.budget_cardinality)
    else:
        result = optimizer.solve_classical()

    return OptimizeResponse(**result)

@router.post("/backtest", response_model=BacktestResponse)
async def backtest_portfolio(request: BacktestRequest):
    """
    Mô phỏng Backtest chuỗi thời gian so sánh Quantum vs Classical vs Benchmark.
    """
    clean_tickers = [t.strip().upper() for t in request.tickers if t.strip()]
    if not clean_tickers:
        clean_tickers = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"]

    mu, sigma, returns_df = QuantAlphaEngine.get_market_data(clean_tickers, period=request.period)

    # Nếu chưa truyền trọng số, giải nhanh cả 2 mô hình để có dữ liệu đối chiếu
    q_weights = request.quantum_weights
    c_weights = request.classical_weights

    if not q_weights or not c_weights:
        opt = PortfolioOptimizer(clean_tickers, mu, sigma, risk_factor=0.5)
        if not c_weights:
            c_res = opt.solve_classical()
            c_weights = c_res["weights"]
        if not q_weights:
            q_res = opt.solve_quantum_qaoa(budget_assets=min(3, len(clean_tickers)))
            q_weights = q_res["weights"]

    backtest_data = QuantAlphaEngine.run_backtest(returns_df, q_weights, c_weights)
    return BacktestResponse(**backtest_data)

@router.get("/supported-tickers")
async def get_supported_tickers():
    """
    Danh sách các mã cổ phiếu phổ biến có dữ liệu BCTC chuẩn bị sẵn.
    """
    return {
        "tickers": [
            {"symbol": "NVDA", "name": "NVIDIA Corporation", "sector": "Technology / AI Chips"},
            {"symbol": "AAPL", "name": "Apple Inc.", "sector": "Consumer Electronics"},
            {"symbol": "MSFT", "name": "Microsoft Corporation", "sector": "Cloud / Software"},
            {"symbol": "GOOGL", "name": "Alphabet Inc.", "sector": "Internet / Advertising"},
            {"symbol": "AMZN", "name": "Amazon.com Inc.", "sector": "E-Commerce / Cloud"},
            {"symbol": "TSLA", "name": "Tesla Inc.", "sector": "Automotive / Clean Energy"},
            {"symbol": "META", "name": "Meta Platforms Inc.", "sector": "Social Media / VR"},
            {"symbol": "FPT", "name": "FPT Corporation", "sector": "Information Technology (VN)"},
            {"symbol": "HPG", "name": "Hoa Phat Group", "sector": "Materials / Steel (VN)"},
            {"symbol": "VNM", "name": "Vinamilk", "sector": "Consumer Goods (VN)"}
        ]
    }
