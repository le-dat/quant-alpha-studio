import React, { useState, useEffect } from 'react';
import { Atom, Cpu, Activity, ShieldCheck, BookOpen } from 'lucide-react';
import { checkHealth } from '../api/client';

export default function Navbar({ activeTab, setActiveTab }) {
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    let mounted = true;
    const testConnection = async () => {
      try {
        await checkHealth();
        if (mounted) setApiOnline(true);
      } catch (err) {
        if (mounted) setApiOnline(false);
      }
    };
    testConnection();
    const interval = setInterval(testConnection, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Atom className="w-6 h-6 text-sky-400 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
                QuantumAlpha
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">AI Financial Scanner & Quantum Portfolio Optimization</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'all'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tổng quan (All-in-One)
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'scanner'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI BCTC Scanner
          </button>
          <button
            onClick={() => setActiveTab('optimizer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'optimizer'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quantum Solver
          </button>
          <button
            onClick={() => setActiveTab('backtest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'backtest'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Backtest
          </button>
        </nav>

        {/* Status & Links */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                apiOnline === true ? 'bg-emerald-400 animate-pulse' : apiOnline === false ? 'bg-rose-500' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] text-slate-400">
              {apiOnline === true ? 'Backend Online (Qiskit 1.4)' : apiOnline === false ? 'Backend Offline' : 'Connecting...'}
            </span>
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white transition p-2 rounded-lg hover:bg-slate-900 hidden sm:flex items-center gap-1.5 text-xs"
            title="Swagger API Documentation"
          >
            <BookOpen className="w-4 h-4" />
            <span>API Docs</span>
          </a>
        </div>
      </div>
    </header>
  );
}
