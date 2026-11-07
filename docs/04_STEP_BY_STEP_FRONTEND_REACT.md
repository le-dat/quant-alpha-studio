# 04. Hướng dẫn Lập trình Frontend React & Tailwind CSS

Tài liệu này hướng dẫn xây dựng giao diện người dùng chuyên nghiệp phong cách Fintech (Dark Mode) cho nền tảng **QuantumAlpha Studio**.

---

## 1. Cấu trúc Thư mục Frontend

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── client.js             # Cấu hình Axios gọi FastAPI Backend
│   ├── components/
│   │   ├── Navbar.jsx            # Thanh điều hướng trên cùng kèm trạng thái kết nối
│   │   ├── BCTCScanner.jsx       # Quét BCTC & Radar Chart chỉ số tài chính
│   │   ├── QuantumOptimizer.jsx  # Bộ chọn Solver (Classical vs Quantum) & Phân bổ tỷ trọng
│   │   └── BacktestChart.jsx     # Biểu đồ đường so sánh hiệu suất lợi nhuận & Rủi ro
│   ├── App.jsx                   # Layout chính tích hợp các tabs
│   ├── index.css                 # Tailwind CSS directives
│   └── main.jsx                  # React Entrypoint
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 2. Cấu hình Axios Client (`src/api/client.js`)

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Timeout 60s cho các tác vụ giải lượng tử
});

export const analyzeBCTC = async (ticker) => {
  const response = await apiClient.post('/analyze-report', { ticker });
  return response.data;
};

export const runOptimization = async (params) => {
  const response = await apiClient.post('/optimize', params);
  return response.data;
};

export const fetchBacktest = async (params) => {
  const response = await apiClient.post('/backtest', params);
  return response.data;
};

export default apiClient;
```

---

## 3. Component Quét BCTC & Sức Khỏe Tài Chính (`src/components/BCTCScanner.jsx`)

Hiển thị điểm sức khỏe tài chính, phân tích cảm xúc ban giám đốc và biểu đồ radar các chỉ số cơ bản:

```jsx
import React, { useState } from 'react';
import { analyzeBCTC } from '../api/client';
import { ShieldCheck, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function BCTCScanner({ onSelectTicker }) {
  const [ticker, setTicker] = useState('NVDA');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await analyzeBCTC(ticker);
      setResult(data);
      if (onSelectTicker) onSelectTicker(ticker);
    } catch (err) {
      alert('Lỗi phân tích BCTC: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const radarData = result ? [
    { subject: 'ROE', value: result.key_metrics.ROE * 100 },
    { subject: 'Biên LN', value: result.key_metrics['Net Margin'] * 100 },
    { subject: 'An toàn Nợ', value: Math.max(0, 100 - result.key_metrics['Debt/Equity'] * 50) },
    { subject: 'Định giá P/E', value: Math.min(100, result.key_metrics['P/E']) },
    { subject: 'Sentiment', value: (result.sentiment_score + 1) * 50 },
  ] : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="text-sky-400 w-6 h-6" />
        <h2 className="text-xl font-bold text-white">AI BCTC Scanner & Fundamental Alpha</h2>
      </div>

      <form onSubmit={handleScan} className="flex gap-3 mb-6">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Nhập mã CP (ví dụ: AAPL, NVDA, FPT)"
          className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-white font-mono focus:outline-none focus:border-sky-500 flex-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-slate-950 font-semibold px-6 py-2 rounded-lg transition"
        >
          {loading ? 'AI đang bóc tách...' : 'Quét BCTC'}
        </button>
      </form>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col justify-between">
            <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Fundamental Health Score</span>
                <span className="text-2xl font-bold text-sky-400">{result.fundamental_score} / 100</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full"
                  style={{ width: `${result.fundamental_score}%` }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold text-slate-300">Nhận định AI:</h4>
              {result.summary_insights.map((insight, idx) => (
                <div key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} />
                <Radar name="Chỉ số" dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 4. Component Bộ Tối Ưu Lượng Tử (`src/components/QuantumOptimizer.jsx`)

Cung cấp thanh trượt điều chỉnh mức độ chấp nhận rủi ro, chuyển đổi giữa phương pháp cổ điển và lượng tử QAOA:

```jsx
import React, { useState } from 'react';
import { Atom, Cpu, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#34d399', '#f472b6'];

export default function QuantumOptimizer({ onRunOptimization, optimizationData, loading }) {
  const [tickers, setTickers] = useState(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA']);
  const [riskTolerance, setRiskTolerance] = useState(0.5);
  const [useQuantum, setUseQuantum] = useState(true);

  const handleSubmit = () => {
    onRunOptimization({
      tickers,
      risk_tolerance: riskTolerance,
      use_quantum: useQuantum,
    });
  };

  const chartData = optimizationData ? Object.entries(optimizationData.weights)
    .filter(([_, w]) => w > 0)
    .map(([ticker, weight]) => ({ name: ticker, value: Math.round(weight * 100) })) : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Atom className="text-indigo-400 w-6 h-6 animate-pulse" />
          <h2 className="text-xl font-bold text-white">Quantum Portfolio Optimizer (QPO)</h2>
        </div>
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setUseQuantum(false)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${!useQuantum ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          >
            <Cpu className="w-3.5 h-3.5 inline mr-1" /> Classical SciPy
          </button>
          <button
            onClick={() => setUseQuantum(true)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${useQuantum ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
          >
            <Atom className="w-3.5 h-3.5 inline mr-1" /> Quantum QAOA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            HỆ SỐ CHẤP NHẬN RỦI RO (q = {riskTolerance}):
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(parseFloat(e.target.value))}
            className="w-full accent-indigo-500 mb-4"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:opacity-90 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? 'Đang chạy mô phỏng lượng tử...' : 'Tối Ưu Hóa Danh Mục'}
            <ArrowRight className="w-4 h-4" />
          </button>

          {optimizationData && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-slate-800 rounded-lg">
                <div className="text-[10px] text-slate-400">Exp. Return</div>
                <div className="text-sm font-bold text-emerald-400">{(optimizationData.expected_return * 100).toFixed(1)}%</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg">
                <div className="text-[10px] text-slate-400">Volatility</div>
                <div className="text-sm font-bold text-amber-400">{(optimizationData.volatility * 100).toFixed(1)}%</div>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg">
                <div className="text-[10px] text-slate-400">Sharpe Ratio</div>
                <div className="text-sm font-bold text-sky-400">{optimizationData.sharpe_ratio.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="h-64 flex items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-slate-500 text-xs text-center">
              Chưa có dữ liệu danh mục.<br />Nhấn "Tối Ưu Hóa Danh Mục" để chạy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Component So Sánh Backtest (`src/components/BacktestChart.jsx`)

Vẽ đồ thị tăng trưởng vốn tích lũy (Cumulative Returns) so sánh giữa Quantum, Classical và S&P500 Benchmark:

```jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function BacktestChart({ backtestData }) {
  if (!backtestData) return null;

  const formattedChartData = backtestData.dates.map((date, idx) => ({
    date,
    Quantum: backtestData.quantum_cumulative_returns[idx],
    Classical: backtestData.classical_cumulative_returns[idx],
    Benchmark: backtestData.benchmark_cumulative_returns[idx],
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="text-emerald-400 w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Backtest Hiệu Suất Lịch Sử (1 Năm)</h2>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="text-slate-400">Quantum Max DD: <strong className="text-rose-400">{backtestData.quantum_max_drawdown}%</strong></span>
          <span className="text-slate-400">Classical Max DD: <strong className="text-amber-400">{backtestData.classical_max_drawdown}%</strong></span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
            <YAxis stroke="#64748b" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
            <Legend />
            <Line type="monotone" dataKey="Quantum" stroke="#818cf8" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="Classical" stroke="#38bdf8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="Benchmark" stroke="#94a3b8" strokeWidth={1} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```
---

## 6. Component Thanh Điều Hướng & Trạng Thái (`src/components/Navbar.jsx`)

```jsx
import React, { useState, useEffect } from 'react';
import { Atom, Cpu, Activity, ShieldCheck, BookOpen } from 'lucide-react';
import { checkHealth } from '../api/client';

export default function Navbar({ activeTab, setActiveTab }) {
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        await checkHealth();
        setApiOnline(true);
      } catch {
        setApiOnline(false);
      }
    };
    testConnection();
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Atom className="w-6 h-6 text-sky-400 animate-spin" style={{ animationDuration: '12s' }} />
          <span className="font-bold text-lg text-white">QuantumAlpha <span className="text-xs text-indigo-400">Studio</span></span>
        </div>
        <nav className="flex bg-slate-900 p-1 rounded-xl text-xs">
          <button onClick={() => setActiveTab('all')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'all' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'}`}>Tổng quan</button>
          <button onClick={() => setActiveTab('scanner')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'scanner' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'}`}>BCTC Scanner</button>
          <button onClick={() => setActiveTab('optimizer')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'optimizer' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'}`}>Quantum Solver</button>
          <button onClick={() => setActiveTab('backtest')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'backtest' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'}`}>Backtest</button>
        </nav>
        <span className={`text-xs px-2.5 py-1 rounded-full ${apiOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {apiOnline ? '● Backend Ready' : '○ Offline'}
        </span>
      </div>
    </header>
  );
}
```

---

## 7. Component Trung Tâm Điều Phối Trạng Thái (`src/App.jsx`)

```jsx
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BCTCScanner from './components/BCTCScanner';
import QuantumOptimizer from './components/QuantumOptimizer';
import BacktestChart from './components/BacktestChart';
import { runOptimization, fetchBacktest } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [backtestResult, setBacktestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async (params) => {
    setLoading(true);
    try {
      const data = await runOptimization(params);
      setOptimizationResult(data);
      const bt = await fetchBacktest({
        tickers: params.tickers,
        [params.use_quantum ? 'quantum_weights' : 'classical_weights']: data.weights
      });
      setBacktestResult(bt);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {(activeTab === 'all' || activeTab === 'scanner') && <BCTCScanner />}
        {(activeTab === 'all' || activeTab === 'optimizer') && (
          <QuantumOptimizer onRunOptimization={handleOptimize} optimizationData={optimizationResult} loading={loading} />
        )}
        {(activeTab === 'all' || activeTab === 'backtest') && <BacktestChart backtestData={backtestResult} />}
      </main>
    </div>
  );
}
```
