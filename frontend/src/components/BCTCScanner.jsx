import React, { useState, useEffect } from 'react';
import { analyzeBCTC, uploadAndAnalyzePDF } from '../api/client';
import { ShieldCheck, TrendingUp, AlertTriangle, FileText, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const SUGGESTED_TICKERS = ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'FPT', 'HPG', 'VNM'];

export default function BCTCScanner({ onScanComplete, selectedTicker }) {
  const [ticker, setTicker] = useState(selectedTicker || 'NVDA');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  const performScan = async (targetTicker) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (pdfFile) {
        data = await uploadAndAnalyzePDF(targetTicker, pdfFile);
      } else {
        data = await analyzeBCTC(targetTicker);
      }
      setResult(data);
      if (onScanComplete) {
        onScanComplete(data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Lỗi phân tích BCTC.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial scan on mount
    performScan('NVDA');
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!ticker.trim()) return;
    performScan(ticker.trim().toUpperCase());
  };

  const handleSelectQuickTicker = (t) => {
    setTicker(t);
    setPdfFile(null);
    performScan(t);
  };

  const radarData = result ? [
    { subject: 'ROE', value: Math.min(100, Math.round(result.key_metrics.ROE * 100)) },
    { subject: 'Biên LN', value: Math.min(100, Math.round(result.key_metrics['Net Margin'] * 100)) },
    { subject: 'An toàn Nợ', value: Math.max(0, Math.min(100, Math.round(100 - result.key_metrics['Debt/Equity'] * 40))) },
    { subject: 'Định giá P/E', value: Math.min(100, Math.round(result.key_metrics['P/E'])) },
    { subject: 'Sentiment', value: Math.round((result.sentiment_score + 1.0) * 50) },
  ] : [];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              AI BCTC Scanner & Fundamental Alpha
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                NLP / FinBERT
              </span>
            </h2>
            <p className="text-xs text-slate-400">Trích xuất chỉ số tài chính cơ bản và phân tích giọng điệu Ban Điều Hành (MD&A Sentiment)</p>
          </div>
        </div>

        {/* PDF Upload option */}
        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition">
          <Upload className="w-3.5 h-3.5 text-sky-400" />
          <span>{pdfFile ? pdfFile.name.slice(0, 16) + '...' : 'Upload PDF BCTC'}</span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setPdfFile(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>

      {/* Ticker Search & Quick select */}
      <form onSubmit={handleFormSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Nhập mã chứng khoán (ví dụ: NVDA, AAPL, FPT...)"
            className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
          />
          {pdfFile && (
            <span className="absolute right-3 top-2.5 text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded">
              PDF đính kèm
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-sky-500 to-indigo-500 hover:opacity-90 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Đang phân tích...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quét BCTC</span>
            </>
          )}
        </button>
      </form>

      {/* Suggested chips */}
      <div className="flex flex-wrap items-center gap-1.5 mb-6 text-xs text-slate-400">
        <span className="text-[11px] text-slate-500 mr-1">Mã tham chiếu:</span>
        {SUGGESTED_TICKERS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleSelectQuickTicker(t)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition ${
              ticker === t && !pdfFile
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 pt-4 border-t border-slate-800/60">
          {/* Left: Score Card & Insights */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            {/* Health Score Summary Card */}
            <div className="p-5 bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl border border-slate-800 shadow-inner">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Fundamental Health Score
                  </span>
                  <div className="text-2xl font-black text-white flex items-baseline gap-2 mt-0.5">
                    <span className="text-sky-400 text-3xl font-mono">{result.fundamental_score}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>

                {/* Sentiment Badge */}
                <div className="text-right">
                  <span className="text-[10px] uppercase text-slate-500 block mb-1">Sentiment Lãnh đạo</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      result.sentiment_score >= 0.5
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : result.sentiment_score >= 0
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {result.sentiment_score >= 0.5 ? 'Rất Tích Cực' : result.sentiment_score >= 0 ? 'Ổn Định' : 'Thận Trọng'}
                    <span className="font-mono text-[11px]">({result.sentiment_score > 0 ? `+${result.sentiment_score}` : result.sentiment_score})</span>
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{ width: `${result.fundamental_score}%` }}
                />
              </div>

              {/* Mini metric pills */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 block">ROE</span>
                  <span className="text-xs font-mono font-bold text-white">{(result.key_metrics.ROE * 100).toFixed(1)}%</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 block">Biên Ròng</span>
                  <span className="text-xs font-mono font-bold text-white">{(result.key_metrics['Net Margin'] * 100).toFixed(1)}%</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 block">Nợ/Vốn CSH</span>
                  <span className="text-xs font-mono font-bold text-white">{result.key_metrics['Debt/Equity'].toFixed(2)}</span>
                </div>
                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 block">P/E</span>
                  <span className="text-xs font-mono font-bold text-white">{result.key_metrics['P/E'].toFixed(1)}x</span>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Nhận định Trí Tuệ Nhân Tạo:
              </h4>
              <div className="space-y-1.5">
                {result.summary_insights.map((insight, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Radar Chart */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
            <span className="text-xs font-semibold text-slate-400 mb-2">Đa Chiều Sức Khỏe Tài Chính</span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                  <PolarRadiusAxis stroke="#334155" angle={30} domain={[0, 100]} />
                  <Radar
                    name="Chỉ số"
                    dataKey="value"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fill="#38bdf8"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2">
              Chỉ số được chuẩn hóa sang thang đo 100 điểm để tích hợp vào vector lợi nhuận kỳ vọng Markowitz.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
