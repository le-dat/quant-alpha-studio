# 05. Hướng dẫn Triển khai & Trình bày CV / Portfolio (Deployment & CV Guide)

Tài liệu này hướng dẫn cách đóng gói ứng dụng bằng Docker, triển khai lên đám mây (Cloud) và cách đưa dự án vào CV/LinkedIn để tạo ấn tượng mạnh nhất với nhà tuyển dụng các vị trí **AI Engineer, Data Analyst, Quantitative Developer, FinTech Engineer**.

---

## 1. Đóng gói Ứng dụng bằng Docker

### 1.1. Dockerfile cho Backend (`backend/Dockerfile`)
```dockerfile
FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 1.2. Dockerfile cho Frontend (`frontend/Dockerfile`)
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 1.3. `docker-compose.yml` (Chạy toàn bộ hệ thống bằng 1 lệnh)
Đặt tại thư mục gốc của dự án:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - QUANTUM_BACKEND=simulator
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: always
```
Chạy ứng dụng:
```bash
docker compose up --build
```

---

## 2. Triển khai Lên Cloud (Miễn phí / Chi phí thấp)

* **Backend (FastAPI + Qiskit)**:
  * Đẩy code lên GitHub.
  * Kết nối repo với **Render.com** (Web Service, chọn Python Environment) hoặc **Railway.app**.
* **Frontend (React)**:
  * Triển khai cực nhanh trên **Vercel** hoặc **Netlify**.
  * Cấu hình biến môi trường: `VITE_API_URL=https://your-backend.onrender.com/api/v1`.

---

## 3. Cách Đưa Dự án vào CV (Resume Bullet Points)

Dưới đây là các gạch đầu dòng mẫu chuẩn ATS (Applicant Tracking System), tập trung vào hành động, công nghệ và kết quả định lượng:

### Mẫu 1: Dành cho vị trí **AI / Data Analyst (Fintech / Investment)**
> **QuantumAlpha Studio | AI & Quantum Quantitative Portfolio Platform** *(Python, FastAPI, Qiskit, React, FinBERT, yfinance)*
> * Thiết kế và triển khai pipeline trích xuất tự động báo cáo tài chính (BCTC) sử dụng mô hình NLP **FinBERT**, tạo điểm số **Fundamental Health Score** kết hợp 5 chỉ số tài chính cốt lõi (ROE, P/E, D/E, FCF, Margin).
> * Xây dựng mô hình định lượng kết hợp tín hiệu cơ bản (Fundamental Alpha) với biến động giá lịch sử để dự báo ma trận rủi ro và lợi nhuận kỳ vọng cho danh mục đa tài sản.
> * Xây dựng dashboard phân tích trực quan bằng **React** và **Tailwind CSS**, tích hợp biểu đồ Radar sức khỏe tài chính và mô phỏng Backtest chuỗi thời gian so sánh hiệu suất với chỉ số S&P 500.

### Mẫu 2: Dành cho vị trí **Quant Developer / Financial Engineer**
> **Quantum Portfolio Optimization & Fundamental Alpha Engine** *(Qiskit QAOA, SciPy SLSQP, QUBO, Docker)*
> * Mô hình hóa bài toán phân bổ danh mục đầu tư Markowitz có ràng buộc số lượng vị thế rời rạc (Cardinality & Discrete Lots - bài toán NP-Hard) thành dạng toán tử **QUBO**.
> * Ứng dụng giải thuật lượng tử **QAOA (Quantum Approximate Optimization Algorithm)** chạy trên bộ mô phỏng **Qiskit AerSimulator**, so sánh trực tiếp kết quả với phương pháp tối ưu hóa cổ điển SciPy (SLSQP).
> * Triển khai hệ thống dịch vụ Full-Stack với kiến trúc Microservices tách biệt (FastAPI backend + React frontend), đóng gói Docker Compose và deploy lên môi trường đám mây.

---

## 4. Các Câu Hỏi Phỏng Vấn Nhà Tuyển Dụng Thường Hỏi & Cách Trả Lời

#### Câu 1: *"Tại sao lại cần thuật toán lượng tử QAOA cho bài toán tối ưu danh mục khi đã có Markowitz?"*
* **Trả lời**: *"Markowitz truyền thống chỉ áp dụng cho không gian trọng số liên tục. Tuy nhiên trong thực tế quỹ đầu tư, chúng ta gặp các ràng buộc thực tiễn như: quy mô lô giao dịch chẵn (discrete lots), giới hạn chỉ nắm giữ tối đa K mã cổ phiếu (cardinality constraints) và chi phí cố định khi mở vị thế. Các ràng buộc này biến bài toán thành Tối ưu hóa Tổ hợp Nhị phân Rời rạc (NP-Hard). Thuật toán lượng tử QAOA tận dụng hiện tượng chồng chập và vướng lượng tử để khám phá không gian trạng thái $2^N$ hiệu quả hơn các thuật toán cổ điển khi quy mô tài sản tăng cao."*

#### Câu 2: *"Mô hình AI bóc tách BCTC tạo ra Fundamental Alpha như thế nào?"*
* **Trả lời**: *"Hệ thống không chỉ đọc các con số cứng (ROE, Biên LN, Nợ/Vốn CSH), mà còn sử dụng mô hình NLP (như FinBERT) để phân tích sắc thái cảm xúc (Sentiment) trong phần Thảo luận Ban Điều hành (MD&A). Một doanh nghiệp có chỉ số tài chính tốt nhưng giọng điệu ban giám đốc bi quan hoặc cảnh báo rủi ro cao sẽ bị hạ điểm Fundamental Alpha. Điểm này sau đó được chuẩn hóa và hiệu chỉnh vào vector lợi nhuận kỳ vọng $\mu$ của danh mục."*
