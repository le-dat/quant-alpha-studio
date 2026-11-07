# 02. Cài đặt Môi trường & Dependencies (Setup & Prerequisites)

Tài liệu này hướng dẫn chuẩn bị môi trường phát triển đầy đủ cho cả Backend (FastAPI, Qiskit, AI) và Frontend (React, Vite, Tailwind CSS).

---

## 1. Yêu cầu Hệ thống (Prerequisites)

* **Hệ điều hành**: Linux / macOS / Windows (WSL2 khuyến nghị cho Windows).
* **Python**: Phiên bản `>= 3.10` và `<= 3.12` (Qiskit 1.4+ hoạt động ổn định nhất trên Python 3.11 hoặc 3.12).
* **Node.js**: Phiên bản `>= 18.x`, `20.x` hoặc `22.x` kèm theo `npm` hoặc `pnpm`.
* **Git**: Đã cài đặt để quản lý phiên bản mã nguồn.

---

## 2. Thiết lập Môi trường Backend (FastAPI + Quantum + AI)

### 2.1. Tạo cấu trúc thư mục Backend
```bash
cd /home/verno/projects/personal/learn/quantum-alpha-studio
mkdir -p backend/app/{api,ai,quant,quantum,models,services}
```

### 2.2. Tạo và kích hoạt Môi trường Ảo (Virtual Environment)
```bash
cd backend
python3 -m venv venv

# Kích hoạt trên Linux / macOS:
source venv/bin/activate

# Kích hoạt trên Windows:
# venv\Scripts\activate
```

### 2.3. Cài đặt Thư viện Backend (`requirements.txt`)
Tạo file `backend/requirements.txt` với các thư viện sau:

```text
# Web Framework & Server
fastapi>=0.110.0
uvicorn[standard]>=0.28.0
pydantic>=2.6.0
python-multipart>=0.0.9

# Data & Finance
numpy>=1.24.0,<2.0.0
pandas>=2.0.0
yfinance>=0.2.36
scipy>=1.11.0

# Quantum Computing (IBM Qiskit 1.4+)
qiskit>=1.0.0,<2.0.0
qiskit-aer>=0.14.0
qiskit-algorithms>=0.3.0
qiskit-optimization>=0.6.0

# AI & Document Processing
pypdf>=4.0.0
google-generativeai>=0.4.0

# Utilities & HTTP Test
python-dotenv>=1.0.1
requests>=2.31.0
httpx>=0.27.0
```

Cài đặt bằng lệnh:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 2.4. Cấu hình Biến môi trường (`backend/.env`)
Tạo file `backend/.env`:
```env
# Server Config
PORT=8000
DEBUG=True

# AI API Keys (Tùy chọn: dùng Gemini API hoặc local fallback FinBERT)
GEMINI_API_KEY="your-gemini-api-key-here"

# Quantum Backend Mode: "simulator" (mặc định) hoặc "ibm_cloud"
QUANTUM_BACKEND=simulator
IBM_QUANTUM_TOKEN=""
```

---

## 3. Thiết lập Môi trường Frontend (React + Vite + Tailwind)

### 3.1. Khởi tạo dự án Vite React
```bash
cd /home/verno/projects/personal/learn/quantum-alpha-studio
npm create vite@latest frontend -- --template react
```

### 3.2. Cài đặt các thư viện UI & Charts
```bash
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react recharts axios clsx tailwind-merge
```

### 3.3. Cấu hình Tailwind CSS (`frontend/tailwind.config.js`)
Cập nhật nội dung `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#38bdf8',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
```

### 3.4. Cấu hình CSS chính (`frontend/src/index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #0b0f19;
  color: #f1f5f9;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

---

## 4. Kiểm tra Môi trường (Sanity Check)

Chạy thử script kiểm tra kết nối Qiskit và Python:
```bash
python -c "import qiskit; import qiskit_aer; print('Qiskit version:', qiskit.__version__, '| Aer ready!')"
```
Nếu output hiển thị phiên bản Qiskit mà không báo lỗi, môi trường đã sẵn sàng cho bước lập trình Backend!
