'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/health`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
              SB
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">
              ServiceBooking<span className="text-indigo-400">.io</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Phase 0: Foundation
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-8">
          <span>⚡ Monorepo Architecture Ready</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white max-w-3xl leading-tight">
          Production-Ready <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Service Booking Platform
          </span>
        </h1>

        <p className="mt-6 text-slate-400 text-lg max-w-2xl leading-relaxed">
          Clean architecture monorepo powered by Next.js, Tailwind CSS, Express.js, MySQL, and Prisma ORM. Designed for high concurrency and zero double-booking.
        </p>

        {/* Backend API Health Card */}
        <div className="mt-10 w-full max-w-xl p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-sm text-left">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 font-mono text-sm text-slate-300">
              <span className="text-indigo-400 font-semibold">GET</span> /api/health
            </div>
            <span className="text-xs text-slate-500 font-mono">Backend Status</span>
          </div>

          <div className="mt-4 font-mono text-xs">
            {loading && (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="h-3 w-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></div>
                Checking backend connection...
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <p className="font-semibold">Backend offline or initializing</p>
                <p className="mt-1 text-slate-400">{error} (Start backend server on port 5000)</p>
              </div>
            )}
            {health && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold">Connected Successfully</span>
                </div>
                <pre className="text-slate-300 mt-2">{JSON.stringify(health, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* System Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full text-left">
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="text-indigo-400 font-semibold mb-1">Frontend</div>
            <div className="text-sm text-slate-400">Next.js App Router, Tailwind CSS, Responsive UI with State Management.</div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="text-purple-400 font-semibold mb-1">Backend</div>
            <div className="text-sm text-slate-400">Express.js Clean Architecture with isolated controllers, services & repos.</div>
          </div>
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="text-pink-400 font-semibold mb-1">Database & Safety</div>
            <div className="text-sm text-slate-400">MySQL & Prisma with transaction isolation and double-booking concurrency locking.</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        Phase 0: Project Initialization & Architectural Blueprint • Production Engineering Standards
      </footer>
    </div>
  );
}
