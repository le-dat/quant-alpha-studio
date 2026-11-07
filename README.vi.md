<div align="center">

# QuantumAlpha Studio 🚀

### Nền tảng Định lượng Tối ưu hóa Danh mục Đầu tư bằng AI & Điện toán Lượng tử (Fullstack Platform)

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

## 📌 Giới thiệu dự án

**QuantumAlpha Studio** là nền tảng quản trị danh mục đầu tư thế hệ mới, kết hợp 4 trụ cột công nghệ tài chính hiện đại:

1. **AI BCTC Scanner**: Tự động bóc tách và phân tích tình hình tài chính doanh nghiệp từ báo cáo tài chính (PDF/API) bằng mô hình NLP (FinBERT / LLM).
2. **Quantitative Alpha Engine**: Xây dựng tín hiệu đầu tư định lượng (Fundamental Alpha + Price Momentum) và ma trận rủi ro (Covariance Matrix).
3. **Quantum Portfolio Optimization (QPO)**: Giải bài toán phân bổ danh mục đầu tư đa ràng buộc (Markowitz có lô rời rạc và chi phí giao dịch - bài toán NP-Hard) bằng thuật toán lượng tử **QAOA (Quantum Approximate Optimization Algorithm)** qua bộ mô phỏng **Qiskit Aer** hoặc đám mây lượng tử IBM Quantum.
4. **Interactive Dashboard**: Giao diện tài chính trực quan, so sánh hiệu suất giữa phương pháp Tối ưu hóa Lượng tử (Quantum) và Tối ưu hóa Cổ điển (Classical - Markowitz / SciPy).

---

## 🏗️ Kiến trúc Tổng thể

```
[ BCTC / Dữ liệu Giá ] 
       │
       ▼
[ FastAPI Backend ] 
  ├── AI Module: Trích xuất BCTC + Sentiment -> Fundamental Alpha
  ├── Quant Module: Tính toán Expected Returns + Covariance Matrix
  └── Quantum Module: Mã hóa QUBO + Solver QAOA (Qiskit) vs Classical (SciPy)
       │
       ▼ REST API
[ React + Tailwind Frontend ]
  ├── Màn hình 1: Quét Báo cáo tài chính & Health Score
  ├── Màn hình 2: Cấu hình Danh mục & Bộ giải Lượng tử
  └── Màn hình 3: Backtest Dashboard & So sánh Lợi nhuận / Rủi ro
```

---

## 📚 Tài liệu Hướng dẫn Chi tiết (Docs)

Bộ tài liệu hướng dẫn từng bước chi tiết được soạn thảo sẵn trong thư mục [`docs/`](./docs/):

* [**01. Kiến trúc Hệ thống & Luồng Dữ liệu (System Architecture)**](./docs/01_ARCHITECTURE.md)
* [**02. Cài đặt Môi trường & Dependencies (Setup & Prerequisites)**](./docs/02_SETUP_AND_ENV.md)
* [**03. Xây dựng Backend FastAPI, AI BCTC & Quantum Solver**](./docs/03_STEP_BY_STEP_BACKEND_AI_QUANTUM.md)
* [**04. Xây dựng Frontend Dashboard React & Tailwind**](./docs/04_STEP_BY_STEP_FRONTEND_REACT.md)
* [**05. Hướng dẫn Triển khai & Đưa vào CV (Deployment & Portfolio)**](./docs/05_DEPLOYMENT_AND_CV_GUIDE.md)

---

## ⚡ Bắt đầu nhanh (Quickstart)

### 1. Khởi chạy Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Trên Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

* API Documentation tự động (Swagger UI): `http://localhost:8000/docs`

### 2. Khởi chạy Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

* Giao diện ứng dụng: `http://localhost:5173`
