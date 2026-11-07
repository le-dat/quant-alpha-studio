import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

app = FastAPI(
    title="QuantumAlpha Studio API",
    description="Backend API cho nền tảng Phân tích BCTC & Tối ưu hóa Danh mục Đầu tư bằng AI & Điện toán Lượng tử (Qiskit 1.4+)",
    version="1.0.0"
)

# Cấu hình CORS để Frontend React gọi mượt mà từ bất kỳ host nào
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "service": "QuantumAlpha Studio API",
        "status": "online",
        "docs_url": "/docs",
        "api_v1": "/api/v1"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "QuantumAlpha Studio API",
        "quantum_backend": "Qiskit 1.4 StatevectorSampler / Aer"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
