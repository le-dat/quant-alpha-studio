import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, TrendingUp, AlertOctagon, RotateCw } from 'lucide-react';

export default function BacktestChart({ backtestData, loading, onRefresh }) {
  if (loading) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm flex items-center justify-center h-80">
        <div className="flex flex-col items-center gap-3 text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span>Đang mô phỏng Backtest chuỗi thời gian lịch sử...</span>
        </div>
      </div>
    );
  }

  if (!backtestData || !backtestData.dates || backtestData.dates.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm text-center py-12">
        <BarChart3 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-slate-300">Chưa có dữ liệu Backtest</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Hãy tối ưu hóa danh mục ở phần trên hoặc nhấn nút bên dưới để chạy mô phỏng đối chiếu.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition inline-flex items-center gap-2"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Chạy Mô Phỏng Ngay</span>
          </button>
        )}
      </div>
    );
  }

  const chartData = backtestData.dates.map((date, idx) => ({
    date,
    'Lượng tử QAOA': backtestData.quantum_cumulative_returns[idx],
    'Cổ điển SciPy': backtestData.classical_cumulative_returns[idx],
    'Benchmark Đều': backtestData.benchmark_cumulative_returns[idx],
  }));

  const lastQuantumRet = backtestData.quantum_cumulative_returns[backtestData.quantum_cumulative_returns.length - 1] || 0;
  const lastClassicalRet = backtestData.classical_cumulative_returns[backtestData.classical_cumulative_returns.length - 1] || 0;
  const lastBenchRet = backtestData.benchmark_cumulative_returns[backtestData.benchmark_cumulative_returns.length - 1] || 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Backtest Hiệu Suất Tăng Trưởng Vốn (1 Năm)
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Lịch sử Thực tế
              </span>
            </h2>
            <p className="text-xs text-slate-400">So sánh đường cong tích lũy vốn giữa Danh mục Lượng tử, Markowitz Cổ điển và Benchmark</p>
          </div>
        </div>

        {/* Max Drawdown Pill Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 mr-2">Quantum Max DD:</span>
            <strong className="text-indigo-400 font-mono font-bold">-{backtestData.quantum_max_drawdown}%</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 mr-2">Classical Max DD:</span>
            <strong className="text-sky-400 font-mono font-bold">-{backtestData.classical_max_drawdown}%</strong>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Cập nhật lại Backtest"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cumulative Return Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
          <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
            Quantum QAOA (Tập trung K mã)
          </span>
          <div className="text-xl font-bold font-mono text-indigo-300 mt-1">
            {lastQuantumRet > 0 ? `+${lastQuantumRet}%` : `${lastQuantumRet}%`}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Tối ưu hóa tổ hợp nhị phân</span>
        </div>

        <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/30">
          <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider block">
            Classical SciPy (Markowitz liên tục)
          </span>
          <div className="text-xl font-bold font-mono text-sky-300 mt-1">
            {lastClassicalRet > 0 ? `+${lastClassicalRet}%` : `${lastClassicalRet}%`}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Phân bổ tỷ trọng số thực</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Benchmark (Chia đều 1/N)
          </span>
          <div className="text-xl font-bold font-mono text-slate-300 mt-1">
            {lastBenchRet > 0 ? `+${lastBenchRet}%` : `${lastBenchRet}%`}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Chiến lược ngây thơ (Naive)</span>
        </div>
      </div>

      {/* Main Line Chart */}
      <div className="h-80 w-full bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293d" />
            <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} minTickGap={30} />
            <YAxis stroke="#64748b" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
              formatter={(value) => [`${value}%`]}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="Lượng tử QAOA"
              stroke="#818cf8"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Cổ điển SciPy"
              stroke="#38bdf8"
              strokeWidth={1.8}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Benchmark Đều"
              stroke="#94a3b8"
              strokeWidth={1.2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-[11px] text-slate-500 flex items-center justify-between">
        <span>* Dữ liệu điều chỉnh cổ tức và chia tách (Adjusted Close). Tần suất lấy mẫu 3 ngày.</span>
        <span className="font-mono text-slate-400">Số điểm dữ liệu: {backtestData.dates.length}</span>
      </div>
    </div>
  );
}
