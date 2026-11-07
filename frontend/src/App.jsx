import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BCTCScanner from './components/BCTCScanner';
import QuantumOptimizer from './components/QuantumOptimizer';
import BacktestChart from './components/BacktestChart';
import { runOptimization, fetchBacktest } from './api/client';
import { Shield, Sparkles, Cpu, Atom, ArrowUpRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTicker, setSelectedTicker] = useState('NVDA');
  const [bctcResult, setBctcResult] = useState(null);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [backtestResult, setBacktestResult] = useState(null);
  const [optLoading, setOptLoading] = useState(false);
  const [backtestLoading, setBacktestLoading] = useState(false);

  // Khởi động tối ưu hóa và backtest mặc định lúc mới tải trang
  useEffect(() => {
    handleRunOptimization({
      tickers: ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN'],
      risk_tolerance: 0.5,
      budget_cardinality: 3,
      use_quantum: true,
      include_fundamental_alpha: true,
      period: '1y',
    });
  }, []);

  const handleRunOptimization = async (params) => {
    setOptLoading(true);
    try {
      const optData = await runOptimization(params);
      setOptimizationResult(optData);

      // Kích hoạt luôn backtest cho danh mục vừa tối ưu
      triggerBacktest(params.tickers, optData.weights, params.use_quantum);
    } catch (err) {
      alert('Lỗi tối ưu hóa danh mục: ' + (err.response?.data?.detail || err.message));
    } finally {
      setOptLoading(false);
    }
  };

  const triggerBacktest = async (tickers, currentWeights, isQuantum) => {
    setBacktestLoading(true);
    try {
      const payload = {
        tickers: tickers || ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN'],
        period: '1y',
      };
      if (isQuantum) {
        payload.quantum_weights = currentWeights;
      } else {
        payload.classical_weights = currentWeights;
      }
      const btData = await fetchBacktest(payload);
      setBacktestResult(btData);
    } catch (err) {
      console.error('Lỗi backtest:', err);
    } finally {
      setBacktestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner (Only shown on 'all' or executive view) */}
        {activeTab === 'all' && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-sky-950/70 border border-slate-800 p-8 shadow-2xl">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Next-Gen FinTech Portfolio Intelligence</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Tối Ưu Hóa Danh Mục Bằng{' '}
                <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                  AI & Điện Toán Lượng Tử
                </span>
              </h1>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-2xl">
                Kết hợp sức mạnh phân tích ngôn ngữ tự nhiên từ Báo cáo tài chính (Fundamental Alpha) với thuật toán
                lượng tử <strong>QAOA (Quantum Approximate Optimization Algorithm)</strong> để giải bài toán phân bổ tài
                sản đa ràng buộc rời rạc (NP-Hard).
              </p>
            </div>

            {/* Decorative background gradients */}
            <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-32 -bottom-20 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        )}

        {/* Tab Content View */}
        {(activeTab === 'all' || activeTab === 'scanner') && (
          <section id="scanner-section">
            <BCTCScanner
              selectedTicker={selectedTicker}
              onScanComplete={(data) => {
                setBctcResult(data);
                setSelectedTicker(data.ticker);
              }}
            />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'optimizer') && (
          <section id="optimizer-section">
            <QuantumOptimizer
              onRunOptimization={handleRunOptimization}
              optimizationData={optimizationResult}
              loading={optLoading}
              onTriggerBacktest={() => {
                if (optimizationResult) {
                  triggerBacktest(
                    Object.keys(optimizationResult.weights),
                    optimizationResult.weights,
                    optimizationResult.method.includes('Quantum')
                  );
                }
              }}
            />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'backtest') && (
          <section id="backtest-section">
            <BacktestChart
              backtestData={backtestResult}
              loading={backtestLoading}
              onRefresh={() => {
                if (optimizationResult) {
                  triggerBacktest(
                    Object.keys(optimizationResult.weights),
                    optimizationResult.weights,
                    optimizationResult.method.includes('Quantum')
                  );
                } else {
                  triggerBacktest();
                }
              }}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-slate-300">QuantumAlpha Studio</span>
            <span>— Fullstack Quantitative & Quantum Portfolio Platform</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              Qiskit 1.4+
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              FastAPI
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              React 18 + Vite
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              Tailwind CSS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
