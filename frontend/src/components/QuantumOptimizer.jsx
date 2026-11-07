import React, { useState } from 'react';
import { Atom, Cpu, ArrowRight, Gauge, Check, Info, Layers, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#2dd4bf'];
const DEFAULT_UNIVERSE = ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

export default function QuantumOptimizer({ onRunOptimization, optimizationData, loading, onTriggerBacktest }) {
  const [tickers, setTickers] = useState(['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN']);
  const [riskTolerance, setRiskTolerance] = useState(0.5);
  const [budgetCardinality, setBudgetCardinality] = useState(3);
  const [useQuantum, setUseQuantum] = useState(true);
  const [includeFundamentalAlpha, setIncludeFundamentalAlpha] = useState(true);

  const toggleTicker = (symbol) => {
    if (tickers.includes(symbol)) {
      if (tickers.length <= 2) return; // Keep at least 2 tickers
      setTickers(tickers.filter((t) => t !== symbol));
    } else {
      if (tickers.length >= 8) return; // Cap at 8 for simulator safety
      setTickers([...tickers, symbol]);
    }
  };

  const handleExecute = () => {
    onRunOptimization({
      tickers,
      risk_tolerance: riskTolerance,
      budget_cardinality: Math.min(budgetCardinality, tickers.length),
      use_quantum: useQuantum,
      include_fundamental_alpha: includeFundamentalAlpha,
      period: '1y',
    });
  };

  // Chuẩn bị dữ liệu cho biểu đồ Donut
  const chartData = optimizationData?.allocations
    ? optimizationData.allocations
        .filter((item) => item.weight > 0)
        .map((item) => ({
          name: item.ticker,
          value: item.percentage,
        }))
    : optimizationData?.weights
    ? Object.entries(optimizationData.weights)
        .filter(([_, w]) => w > 0)
        .map(([ticker, w]) => ({
          name: ticker,
          value: Math.round(w * 1000) / 10,
        }))
    : [];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Atom className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Quantum Portfolio Optimizer (QPO)
              <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                QAOA / QUBO
              </span>
            </h2>
            <p className="text-xs text-slate-400">Giải bài toán Markowitz có ràng buộc số lượng vị thế rời rạc (NP-Hard)</p>
          </div>
        </div>

        {/* Solver Selector Button Group */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setUseQuantum(false)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              !useQuantum
                ? 'bg-slate-800 text-sky-400 shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Classical (SciPy)</span>
          </button>
          <button
            type="button"
            onClick={() => setUseQuantum(true)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              useQuantum
                ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Quantum QAOA</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-6 space-y-5">
          {/* Ticker Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Vũ trụ Cổ phiếu Lựa chọn ({tickers.length} mã / {tickers.length} Qubits):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_UNIVERSE.map((sym) => {
                const active = tickers.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleTicker(sym)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                      active
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {sym}
                    {active && <Check className="w-3 h-3 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Mỗi mã tương ứng 1 biến nhị phân QUBO. Trên máy mô phỏng, khuyến nghị chọn từ 3 đến 6 mã.
            </p>
          </div>

          {/* Sliders: Risk Tolerance & Cardinality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-medium">Chấp nhận rủi ro (q):</span>
                <span className="font-mono font-bold text-sky-400">{riskTolerance}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(parseFloat(e.target.value))}
                className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Ưu tiên an toàn</span>
                <span>Tối đa hóa lợi nhuận</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400 font-medium">Giới hạn vị thế (K):</span>
                <span className="font-mono font-bold text-indigo-400">{Math.min(budgetCardinality, tickers.length)} mã</span>
              </div>
              <input
                type="range"
                min="1"
                max={tickers.length}
                step="1"
                value={Math.min(budgetCardinality, tickers.length)}
                onChange={(e) => setBudgetCardinality(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Tập trung</span>
                <span>Phân tán</span>
              </div>
            </div>
          </div>

          {/* Alpha Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="fundamental_alpha"
                checked={includeFundamentalAlpha}
                onChange={(e) => setIncludeFundamentalAlpha(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="fundamental_alpha" className="text-xs text-slate-300 font-medium cursor-pointer">
                Tích hợp Fundamental Alpha từ AI BCTC (35% trọng số)
              </label>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
              Khuyến nghị
            </span>
          </div>

          {/* Run Button */}
          <button
            type="button"
            onClick={handleExecute}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 hover:opacity-90 disabled:opacity-50 text-slate-950 font-black py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-xl shadow-indigo-500/20"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Đang tính toán lượng tử (QAOA Circuits)...</span>
              </>
            ) : (
              <>
                <span>Tối Ưu Hóa Danh Mục {useQuantum ? 'bằng QAOA' : 'bằng SciPy'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Right Column: Visualization & Results */}
        <div className="lg:col-span-6 bg-slate-950/50 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Tỷ Trọng Phân Bổ Danh Mục
            </span>
            {optimizationData && (
              <span className="text-[11px] font-mono text-slate-400">
                Thực thi: <strong className="text-sky-300">{optimizationData.execution_time_seconds}s</strong>
              </span>
            )}
          </div>

          {/* Donut Chart */}
          <div className="h-56 w-full flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs">
                Chưa có dữ liệu danh mục.<br />Nhấn <strong className="text-slate-400">Tối Ưu Hóa</strong> để giải nghiệm.
              </div>
            )}
          </div>

          {/* Performance Summary Metrics */}
          {optimizationData && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Lợi Nhuận Năm</div>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {(optimizationData.expected_return * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Biến Động Rủi Ro</div>
                  <div className="text-base font-bold font-mono text-amber-400">
                    {(optimizationData.volatility * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-[10px] uppercase text-slate-400">Sharpe Ratio</div>
                  <div className="text-base font-bold font-mono text-sky-400">
                    {optimizationData.sharpe_ratio.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Quantum Metadata chip if present */}
              {optimizationData.quantum_metadata && (
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center justify-between font-mono">
                  <span>Qubits: <strong>{optimizationData.quantum_metadata.num_qubits}</strong></span>
                  <span>Năng lượng Hamilton: <strong>{optimizationData.quantum_metadata.optimal_energy}</strong></span>
                  <span>Bộ giải: <strong>Qiskit 1.4 QAOA</strong></span>
                </div>
              )}

              {onTriggerBacktest && (
                <button
                  type="button"
                  onClick={onTriggerBacktest}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  Xem Mô Phỏng Backtest Lịch Sử & Max Drawdown →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
