<div align="center">

# ⚛️ QuantumAlpha Studio

### Nền tảng Định lượng Tối ưu hóa Danh mục Đầu tư bằng AI & Điện toán Lượng tử (QAOA Fullstack Platform)

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

## 📑 Mục lục

- [Vấn đề Cốt lõi: Vì sao cần Điện toán Lượng tử?](#-vấn-đề-cốt-lõi-vì-sao-cần-điện-toán-lượng-tử)
- [Tính năng Nổi bật](#-tính-năng-nổi-bật)
- [Kiến trúc Hệ thống](#️-kiến-trúc-hệ-thống)
- [Cơ sở Toán học & Thuật toán Lượng tử](#-cơ-sở-toán-học--thuật-toán-lượng-tử)
- [So sánh: Bộ giải Cổ điển vs. Bộ giải Lượng tử](#-so-sánh-bộ-giải-cổ-điển-vs-bộ-giải-lượng-tử)
- [Cấu trúc Thư mục Dự án](#-cấu-trúc-thư-mục-dự-án)
- [Hướng dẫn Bắt đầu Nhanh (Quickstart)](#-hướng-dẫn-bắt-đầu-nhanh-quickstart)
  - [Yêu cầu tiên quyết](#yêu-cầu-tiên-quyết)
  - [1. Khởi chạy Backend (FastAPI + Qiskit)](#1-khởi-chạy-backend-fastapi--qiskit)
  - [2. Khởi chạy Frontend (React + Vite)](#2-khởi-chạy-frontend-react--vite)
  - [3. Chạy qua Docker Compose (Một lệnh duy nhất)](#3-chạy-qua-docker-compose-một-lệnh-duy-nhất)
- [Danh mục API REST (API Reference)](#-danh-mục-api-rest-api-reference)
- [Tài liệu Hướng dẫn Chuyên sâu (Docs)](#-tài-liệu-hướng-dẫn-chuyên-sâu-docs)
- [Lộ trình Phát triển (Roadmap)](#-lộ-trình-phát-triển-roadmap)
- [Bản quyền & Đóng góp](#-bản-quyền--đóng-góp)

---

## 💡 Vấn đề Cốt lõi: Vì sao cần Điện toán Lượng tử?

Trong quản trị danh mục đầu tư định lượng thực tế, các quỹ đầu tư đối mặt với rào cản tính toán lớn:

1. **Thực tế Rời rạc vs. Giả định Liên tục**: Mô hình Markowitz Mean-Variance cổ điển giả định tỷ trọng đầu tư là số thực liên tục ($w_i \in \mathbb{R}$). Tuy nhiên trên thực tế, lệnh giao dịch bị ràng buộc bởi **lô tối thiểu** (ví dụ: lô 100 cổ phiếu), **giới hạn số lượng vị thế** (chọn tối đa $K$ mã trong vũ trụ $N$ mã) và **chi phí giao dịch cố định**.
2. **Bùng nổ Tổ hợp (NP-Hard)**: Khi áp dụng các ràng buộc rời rạc, bài toán chuyển thành **Quy hoạch Toàn phương Nguyên Hỗn hợp (MIQP)** — thuộc lớp bài toán **NP-Hard**. Máy tính cổ điển phải dùng thuật toán heuristic hoặc tốn thời gian lũy thừa để tìm nghiệm tối ưu khi số lượng mã $N$ mở rộng.
3. **Lợi thế Lượng tử**: Bằng cách ánh xạ bài toán sang mô hình **QUBO (Quadratic Unconstrained Binary Optimization)** và toán tử Ising Hamilton, thuật toán **QAOA (Quantum Approximate Optimization Algorithm)** tận dụng hiện tượng **chồng chập (superposition)** và **xuyên hầm lượng tử (tunneling)** để quét đồng thời $2^N$ trạng thái khả dĩ, vượt qua các cực tiểu địa phương.

---

## ✨ Tính năng Nổi bật

* **📑 AI BCTC Scanner (Bóc tách Báo cáo Tài chính)**:
  * Tự động trích xuất bảng cân đối kế toán, kết quả kinh doanh và lưu chuyển tiền tệ từ file PDF / API.
  * Phân tích ngôn ngữ và giọng điệu (Sentiment Analysis) trong phần Thảo luận Ban Điều hành (MD&A) bằng NLP chuyên ngành tài chính (FinBERT / LLM) để chấm điểm **Fundamental Health Score**.
* **📊 Quantitative Alpha & Risk Engine**:
  * Kết hợp tín hiệu đà giá kỹ thuật (Momentum) với điểm cơ bản (Fundamental Score) thành vector kỳ vọng lợi nhuận tổng hợp $\mu$.
  * Ước lượng ma trận hiệp phương sai rủi ro ổn định bằng kỹ thuật **Ledoit-Wolf Shrinkage Covariance** $\Sigma$.
* **⚛️ Bộ giải Tối ưu Lượng tử (QPO Engine)**:
  * Tự động chuyển đổi các ràng buộc lô đầu tư và ngân sách thành ma trận QUBO.
  * Giải bài toán tối ưu bằng thuật toán **QAOA** với bộ tối ưu tham số cổ điển (COBYLA) chạy trên giả lập **Qiskit AerSimulator** hoặc kết nối tới QPU IBM Quantum thật.
* **⚖️ Chế độ So sánh Kép (Dual-Engine Benchmarking)**:
  * So sánh trực quan đối đầu giữa **Lượng tử (QAOA)** và **Cổ điển (SciPy SLSQP)**.
  * Tính toán đồng thời tỷ số Sharpe, Sortino, Mức sụt giảm tối đa (Max Drawdown - MDD) và đường biên hiệu quả (Efficient Frontier).
* **🖥️ Interactive Financial Dashboard**:
  * Giao diện React 18 + TailwindCSS hiện đại, hỗ trợ biểu đồ phân bổ tỷ trọng trực quan, heatmap tương quan rủi ro và backtesting mô phỏng tương tác.

---

## 🏗️ Kiến trúc Hệ thống

```
                    ┌──────────────────────────────────────────────┐
                    │     Nguồn Dữ liệu (PDF BCTC / yfinance)      │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │           Tầng Phân tích AI & NLP            │
                    │   • Trích xuất chỉ số BCTC (ROE, P/E, FCF)   │
                    │   • Phân tích Sentiment MD&A (FinBERT / LLM) │
                    │   • Output: Fundamental Alpha Score (0-100)  │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │            Tầng Mô hình Định lượng           │
                    │   • Expected Returns: μ = α·R_tech + (1-α)·Score
                    │   • Covariance Matrix: Σ (Ledoit-Wolf)       │
                    └──────────────────────┬───────────────────────┘
                                           │
                     ┌─────────────────────┴──────────────────────┐
                     ▼                                            ▼
       ┌───────────────────────────┐                ┌───────────────────────────┐
       │   Chế độ Cổ điển (SciPy)  │                │    Chế độ Lượng tử (Qiskit)│
       │   • Markowitz Liên tục    │                │   • Ma trận QUBO          │
       │   • Thuật toán SLSQP      │                │   • Toán tử Ising Hamilton│
       │   • Tỷ trọng số thực      │                │   • Mạch lượng tử QAOA    │
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
                    │         React 18 + Tailwind Frontend         │
                    │   • Quét BCTC & Trực quan hóa Health Score   │
                    │   • Cấu hình & Chạy Tối ưu Lượng tử          │
                    │   • Bảng điều khiển Backtest So sánh Lợi nhuận│
                    └──────────────────────────────────────────────┘
```

---

## 🔬 Cơ sở Toán học & Thuật toán Lượng tử

### 1. Bài toán Danh mục Rời rạc Đa Ràng buộc

$$\min_{w \in \mathcal{W}} \left[ \lambda \cdot w^T \Sigma w - (1 - \lambda) \cdot \mu^T w + C_{\text{trans}}(w) \right]$$

Thỏa mãn:
$$\sum_{i=1}^{N} w_i = 1, \quad w_i \in \left\{ 0, \frac{1}{K}, \frac{2}{K}, \dots, 1 \right\}, \quad \|w\|_0 \le B$$

Trong đó:
* $\Sigma$: Ma trận hiệp phương sai lợi nhuận.
* $\mu$: Vector kỳ vọng lợi nhuận alpha tổng hợp.
* $\lambda \in [0, 1]$: Hệ số chấp nhận rủi ro.
* $K$: Số lượng lô phân bổ danh mục.
* $B$: Giới hạn số lượng vị thế mở tối đa (Cardinality).

### 2. Ánh xạ Biến Nhị phân QUBO

Mỗi tỷ trọng $w_i$ được biểu diễn bằng $M$ biến nhị phân:
$$w_i = \sum_{k=0}^{M-1} 2^k \cdot \Delta w \cdot x_{i, k}, \quad x_{i, k} \in \{0, 1\}$$

Các ràng buộc ngân sách và số lượng vị thế được đưa vào hàm mục tiêu dưới dạng thành phần phạt toàn phương (Penalty function):
$$\mathcal{H}_{\text{QUBO}}(x) = x^T Q x + c^T x + P \left( \sum_{i, k} 2^k \Delta w x_{i, k} - 1 \right)^2$$

### 3. Xây dựng Mạch Lượng tử QAOA

Vector nhị phân $x \in \{0, 1\}^n$ được ánh xạ sang các toán tử Pauli-$Z$ thông qua $x_j \to \frac{I - Z_j}{2}$, tạo nên **Cost Hamiltonian** $H_C$:
$$H_C = \sum_{i} h_i Z_i + \sum_{i < j} J_{ij} Z_i Z_j$$

Thuật toán QAOA áp dụng xen kẽ $p$ lớp cổng lượng tử của toán tử mục tiêu và toán tử pha trộn:
$$|\psi(\gamma, \beta)\rangle = \prod_{l=1}^{p} e^{-i \beta_l H_M} e^{-i \gamma_l H_C} |+\rangle^{\otimes n}, \quad H_M = \sum_{j=1}^{n} X_j$$

Bộ tối ưu cổ điển cập nhật lặp lại các tham số $(\gamma, \beta)$ để cực tiểu hóa giá trị kỳ vọng năng lượng $\langle \psi | H_C | \psi \rangle$.

---

## 📊 So sánh: Bộ giải Cổ điển vs. Bộ giải Lượng tử

| Tiêu chí | Markowitz Cổ điển (SLSQP) | Giải thuật Di truyền / Luyện kim | Quantum QAOA (Qiskit / Aer) |
| :--- | :--- | :--- | :--- |
| **Lớp độ phức tạp** | P (Lồi, Liên tục) | Heuristic Xấp xỉ | NP-Hard (Tổ hợp QUBO) |
| **Chia lô rời rạc** | ❌ Phải làm tròn sau khi giải | ⚠️ Hội tụ chậm | ✅ Tích hợp tự nhiên trong cơ sở nhị phân |
| **Ràng buộc số vị thế** | ❌ Phá vỡ tính lồi | ⚠️ Không đảm bảo thỏa mãn | ✅ Ánh xạ chính xác qua hàm phạt bậc hai |
| **Khả năng thoát cực tiểu địa phương** | ✅ Cực tiểu toàn cục (liên tục) | ❌ Dễ kẹt ở nghiệm cục bộ | ⚛️ Xuyên hầm lượng tử qua hàng rào năng lượng |
| **Độ mở rộng (Scalability)** | $\mathcal{O}(N^3)$ (không có ràng buộc rời rạc)| Phương sai cao, ngẫu nhiên | Tiềm năng tăng tốc lượng tử trên QPU thực |

---

## 📁 Cấu trúc Thư mục Dự án

```text
quantum-alpha-studio/
├── .agents/                 # Cấu hình agent tự động và công cụ
├── docs/                    # Tài liệu kiến trúc và hướng dẫn từng bước
│   ├── 01_ARCHITECTURE.md
│   ├── 02_SETUP_AND_ENV.md
│   ├── 03_STEP_BY_STEP_BACKEND_AI_QUANTUM.md
│   ├── 04_STEP_BY_STEP_FRONTEND_REACT.md
│   └── 05_DEPLOYMENT_AND_CV_GUIDE.md
├── backend/                 # Backend FastAPI & Bộ giải Lượng tử
│   ├── app/
│   │   ├── ai/              # Bóc tách PDF BCTC & Sentiment NLP
│   │   ├── quant/           # Tính ma trận hiệp phương sai, alpha & Ledoit-Wolf
│   │   ├── quantum/         # Xây dựng QUBO, Ising mapper & QAOA solver
│   │   ├── api/             # FastAPI routers & Schemas
│   │   └── main.py          # Entrypoint ứng dụng ASGI
│   └── requirements.txt     # Thư viện Python
├── frontend/                # Dashboard React 18 + Vite
│   ├── src/
│   │   ├── components/      # Biểu đồ tài chính, ma trận rủi ro & bảng điều khiển
│   │   ├── services/        # Gọi API backend
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
├── README.md                # Bản tiếng Anh mặc định của Repo
├── README.en.md             # Bản tiếng Anh
└── README.vi.md             # Bản tiếng Việt
```

---

## ⚡ Hướng dẫn Bắt đầu Nhanh (Quickstart)

### Yêu cầu tiên quyết

* **Python**: 3.10 trở lên
* **Node.js**: 18.x trở lên (npm / pnpm / yarn)
* **Git**

---

### 1. Khởi chạy Backend (FastAPI + Qiskit)

```bash
# 1. Truy cập vào thư mục backend
cd backend

# 2. Tạo và kích hoạt môi trường ảo
python -m venv venv
source venv/bin/activate       # Trên Windows: venv\Scripts\activate

# 3. Cài đặt các thư viện cần thiết
pip install --upgrade pip
pip install -r requirements.txt

# 4. Khởi chạy server FastAPI
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

* **Swagger UI tự động**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 2. Khởi chạy Frontend (React + Vite)

```bash
# 1. Truy cập vào thư mục frontend
cd frontend

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Chạy môi trường phát triển Vite
npm run dev
```

* **Giao diện Dashboard**: [http://localhost:5173](http://localhost:5173)

---

### 3. Chạy qua Docker Compose (Một lệnh duy nhất)

```bash
docker compose up --build
```

---

## 🔌 Danh mục API REST (API Reference)

| Phương thức | Endpoint | Mô tả | Dữ liệu mẫu (Payload) |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/analyze-report` | Trích xuất chỉ số tài chính và chấm điểm sentiment AI từ BCTC. | `multipart/form-data (file: PDF)` hoặc `{"ticker": "AAPL"}` |
| `POST` | `/api/v1/quant/covariance` | Tính toán ma trận hiệp phương sai và điểm Alpha kỹ thuật. | `{"tickers": ["AAPL", "MSFT", "NVDA"], "days": 252}` |
| `POST` | `/api/v1/optimize` | Thực thi tối ưu danh mục theo bộ giải (QAOA hoặc SLSQP). | `{"tickers": [...], "solver": "qaoa", "risk_aversion": 0.5, "lots": 10}` |
| `POST` | `/api/v1/backtest` | Đánh giá hiệu suất quá khứ so với chỉ số tham chiếu (S&P 500). | `{"weights": {"AAPL": 0.4, "MSFT": 0.6}, "start_date": "2023-01-01"}` |

---

## 📚 Tài liệu Hướng dẫn Chuyên sâu (Docs)

Các bản thiết kế chi tiết từng bước được biên soạn hoàn chỉnh trong thư mục [`docs/`](./docs/):

* 📄 [**01. Kiến trúc Hệ thống & Luồng Dữ liệu**](./docs/01_ARCHITECTURE.md): Chi tiết kiến trúc và công thức toán học.
* 🛠️ [**02. Cài đặt Môi trường & Dependencies**](./docs/02_SETUP_AND_ENV.md): Cấu hình venv, Qiskit C-extension và xử lý xung đột thư viện.
* 🧠 [**03. Xây dựng Backend FastAPI, AI BCTC & Quantum QAOA**](./docs/03_STEP_BY_STEP_BACKEND_AI_QUANTUM.md): Code mẫu PDF parser, ánh xạ QUBO và mạch lượng tử.
* 💻 [**04. Xây dựng Frontend Dashboard React & Tailwind**](./docs/04_STEP_BY_STEP_FRONTEND_REACT.md): Cấu trúc components, quản lý state và biểu đồ Recharts.
* 🚀 [**05. Hướng dẫn Triển khai & Đưa vào CV (Portfolio)**](./docs/05_DEPLOYMENT_AND_CV_GUIDE.md): Đóng gói Docker, triển khai production và cách trình bày dự án ấn tượng trên CV.

---

## 🗺️ Lộ trình Phát triển (Roadmap)

- [x] Thiết kế hoàn chỉnh kiến trúc fullstack và công thức toán học lượng tử.
- [x] Soạn thảo bộ hướng dẫn từng bước chi tiết (backend, frontend, deployment).
- [ ] Tích hợp API SEC EDGAR tự động cào báo cáo 10-K, 10-Q theo mã cổ phiếu.
- [ ] Pipeline FinBERT chuyên biệt chấm điểm đa văn bản MD&A.
- [ ] Bổ sung bộ giải VQE (Variational Quantum Eigensolver) song song với QAOA.
- [ ] Kết nối trực tiếp máy tính lượng tử IBM Quantum thực nghiệm (Eagle / Heron).
- [ ] Engine Backtest thời gian thực với mô phỏng trượt giá và phí giao dịch.

---

## 📄 Bản quyền & Đóng góp

Dự án được phân phối theo giấy phép **MIT License**. Chi tiết xem tại `LICENSE`.

Phát triển bởi **[Lê Đạt](https://github.com/le-dat)**. Mọi đóng góp, báo lỗi và ý tưởng phát triển đều rất được hoan nghênh!
