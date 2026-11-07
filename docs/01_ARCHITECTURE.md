# 01. Kiến trúc Hệ thống & Luồng Dữ liệu (System Architecture)

Tài liệu này mô tả chi tiết kiến trúc kỹ thuật của nền tảng **QuantumAlpha Studio**, giải thích cách thức kết hợp dữ liệu Báo cáo tài chính (BCTC), mô hình ngôn ngữ lớn (LLM/NLP), mô hình định lượng (Quant Finance) và giải thuật lượng tử (Quantum Optimization).

---

## 1. Bài toán Kỹ thuật & Kinh doanh

### 1.1. Giới hạn của Tối ưu hóa Danh mục Cổ điển (Markowitz)
Mô hình Markowitz cổ điển giải bài toán tối ưu lồi (Convex Optimization) trong không gian liên tục:
$$\min_{w} \quad \frac{1}{2} w^T \Sigma w - q \cdot \mu^T w \quad \text{s.t.} \quad \sum w_i = 1, \quad w_i \ge 0$$
Tuy nhiên, trong thực tế đầu tư của các quỹ:
* **Lô giao dịch rời rạc**: Cổ phiếu được mua theo lô chẵn (ví dụ: lô 100 cổ phiếu tại Việt Nam hoặc lô nguyên cổ phiếu tại Mỹ), không thể mua số thực tùy ý ($w_i \in \mathbb{R}$).
* **Ràng buộc số lượng vị thế (Cardinality Constraints)**: Giới hạn chỉ chọn tối đa $K$ cổ phiếu trong vũ trụ $N$ mã.
* **Chi phí giao dịch cố định**: Phí cố định khi mở vị thế tạo ra bề mặt hàm mục tiêu phi lồi.

Các ràng buộc này biến bài toán thành **Tối ưu hóa Tổ hợp Nhị phân Rời rạc (Mixed-Integer Quadratic Programming - MIQP)**, thuộc lớp bài toán **NP-Hard**. Khi số lượng mã cổ phiếu $N$ tăng lên, máy tính cổ điển phải dùng các thuật toán heuristic (di truyền, luyện kim) hoặc mất thời gian lũy thừa để tìm nghiệm tối ưu toàn cục.

### 1.2. Giải pháp Lượng tử: Ánh xạ QUBO & QAOA
Điện toán lượng tử giải quyết bài toán này bằng cách chuyển đổi hàm mục tiêu thành mô hình **QUBO (Quadratic Unconstrained Binary Optimization)**:
$$H = \sum_i h_i z_i + \sum_{i < j} J_{ij} z_i z_j$$
Thuật toán **QAOA (Quantum Approximate Optimization Algorithm)** sử dụng các cổng lượng tử lặp lại (Parameterized Quantum Circuits) để khai thác hiện tượng **chồng chập (superposition)** và **vướng lượng tử (entanglement)** nhằm tìm kiếm nghiệm tối ưu trong không gian $2^N$ trạng thái với độ phức tạp tính toán vượt trội.

---

## 2. Sơ đồ Luồng Dữ liệu (End-to-End Pipeline)

```
[ Nguồn Dữ liệu ]
  ├── 1. File PDF BCTC / 10-K, 10-Q
  └── 2. Dữ liệu Giá & Khối lượng (yfinance / FMP)
       │
       ▼
[ AI & NLP Processing Layer ]
  ├── Bóc tách bảng biểu & chỉ số tài chính (P/E, ROE, FCF, D/E)
  ├── Phân tích Sentiment ban điều hành (FinBERT / Gemini API)
  └── Xuất ra: Fundamental Alpha Score ($A_i \in [0, 100]$)
       │
       ▼
[ Quantitative Modeling Layer ]
  ├── Điều chỉnh Expected Return: $\mu_i = \alpha \cdot \text{Return}_{\text{hist}} + (1-\alpha) \cdot \text{Score}_{\text{fundamental}}$
  ├── Tính Ma trận Hiệp phương sai rủi ro: $\Sigma \in \mathbb{R}^{N \times N}$
  └── Mã hóa bài toán Markowitz rời rạc sang ma trận QUBO
       │
       ▼
[ Optimization Solvers (Dual Mode) ]
  ├── Mode A (Classical): SciPy / SLSQP (Continuous Benchmark)
  └── Mode B (Quantum): Qiskit QAOA / AerSimulator (Discrete Optimization)
       │
       ▼
[ API & Presentation Layer ]
  ├── FastAPI Endpoints (JSON Response: weights, sharpe, risk, drawdown)
  └── React Dashboard: Biểu đồ phân bổ danh mục & Backtest tương tác
```

---

## 3. Phân rã Các Thành phần (Components)

### Component 1: AI Financial Statement Analyzer (`backend/app/ai/`)
* **Chức năng**:
  * Nhận file PDF BCTC do người dùng tải lên hoặc crawl tự động qua mã cổ phiếu.
  * Trích xuất các chỉ số cốt lõi: Tăng trưởng doanh thu, Biên lợi nhuận ròng, Chỉ số nợ, Dòng tiền tự do.
  * Phân tích ngôn ngữ trong phần Thảo luận Ban Điều hành (MD&A) để phát hiện các yếu tố rủi ro và giọng điệu tự tin/bi quan.
* **Output**: Bộ chỉ số tài chính chuẩn hóa và điểm số **Fundamental Health Score**.

### Component 2: Quantitative Engine (`backend/app/quant/`)
* **Chức năng**:
  * Tải dữ liệu lịch sử giá $T$ ngày của danh mục $N$ cổ phiếu.
  * Tính toán lợi nhuận kỳ vọng $\mu$ có trọng số kết hợp giữa biến động giá kỹ thuật và điểm số Fundamental Alpha từ AI.
  * Tính ma trận hiệp phương sai mẫu hoặc Shrinkage Covariance $\Sigma$.
  * Thiết lập ngân sách đầu tư và kích thước lô rời rạc (ví dụ: mỗi mã chiếm bội số của 10% danh mục).

### Component 3: Quantum Portfolio Solver (`backend/app/quantum/`)
* **Chức năng**:
  * Khởi tạo bài toán tối ưu thông qua `qiskit_optimization.problems.QuadraticProgram`.
  * Chuyển bài toán thành toán tử Ising Hamilton: $H = \sum C_{ij} Z_i Z_j + \sum D_i Z_i$.
  * Chạy thuật toán **QAOA** với bộ tối ưu cổ điển **COBYLA** trên **Qiskit 1.4+ Primitives (StatevectorSampler / AerSimulator)**.
  * Giải mã trạng thái xác suất cao nhất (Bitstring) thành tỷ trọng danh mục cụ thể ($w_1, w_2, ..., w_N$).

### Component 4: FastAPI REST API (`backend/app/api/`)
* Cung cấp các endpoints:
  * `POST /api/v1/analyze-report`: Xử lý phân tích BCTC (File upload / Ticker).
  * `POST /api/v1/optimize`: Chạy bài toán tối ưu danh mục (chọn Solver Classical hoặc Quantum).
  * `POST /api/v1/backtest`: Mô phỏng hiệu suất lịch sử của danh mục vừa tạo so với Benchmark.

### Component 5: React Dashboard (`frontend/src/`)
* Giao diện phong cách Fintech tối giản (Dark Mode / Sleek UI):
  * **Radar Chart**: Thể hiện các chiều sức khỏe tài chính của doanh nghiệp.
  * **Donut Chart**: Tỷ lệ phân bổ vốn từng mã cổ phiếu theo kết quả bộ giải lượng tử.
  * **Line Chart**: So sánh tăng trưởng danh mục Quantum vs Classical vs Benchmark.
