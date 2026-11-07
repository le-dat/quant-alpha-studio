import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("PASS: /health ->", res.json())

def test_analyze():
    res = client.post("/api/v1/analyze-report", json={"ticker": "NVDA"})
    assert res.status_code == 200, f"Analyze failed: {res.text}"
    data = res.json()
    assert data["ticker"] == "NVDA"
    assert "fundamental_score" in data
    assert "sentiment_score" in data
    print(f"PASS: /analyze-report -> Score: {data['fundamental_score']}, Sentiment: {data['sentiment_score']}")

def test_optimize_classical():
    payload = {
        "tickers": ["AAPL", "MSFT", "GOOGL"],
        "period": "1y",
        "risk_tolerance": 0.5,
        "budget_cardinality": 2,
        "use_quantum": False
    }
    res = client.post("/api/v1/optimize", json=payload)
    assert res.status_code == 200, f"Optimize classical failed: {res.text}"
    data = res.json()
    assert "Classical" in data["method"]
    assert "weights" in data
    assert "allocations" in data
    print(f"PASS: /optimize (Classical) -> Sharpe: {data['sharpe_ratio']}, Weights: {data['weights']}")

def test_optimize_quantum():
    payload = {
        "tickers": ["AAPL", "MSFT", "GOOGL"],
        "period": "1y",
        "risk_tolerance": 0.5,
        "budget_cardinality": 2,
        "use_quantum": True
    }
    res = client.post("/api/v1/optimize", json=payload)
    assert res.status_code == 200, f"Optimize quantum failed: {res.text}"
    data = res.json()
    assert "Quantum" in data["method"]
    assert "weights" in data
    assert "quantum_metadata" in data
    print(f"PASS: /optimize (Quantum QAOA) -> Sharpe: {data['sharpe_ratio']}, Metadata: {data['quantum_metadata']}")

def test_backtest():
    payload = {
        "tickers": ["AAPL", "MSFT", "GOOGL"],
        "period": "1y"
    }
    res = client.post("/api/v1/backtest", json=payload)
    assert res.status_code == 200, f"Backtest failed: {res.text}"
    data = res.json()
    assert len(data["dates"]) > 0
    assert len(data["quantum_cumulative_returns"]) > 0
    assert "quantum_max_drawdown" in data
    print(f"PASS: /backtest -> Data points: {len(data['dates'])}, Quantum Max DD: {data['quantum_max_drawdown']}%")

if __name__ == "__main__":
    print("=== STARTING BACKEND SMOKE TESTS ===")
    test_health()
    test_analyze()
    test_optimize_classical()
    test_optimize_quantum()
    test_backtest()
    print("=== ALL BACKEND TESTS PASSED SUCCESSFULLY! ===")
