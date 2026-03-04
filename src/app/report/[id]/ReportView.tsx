'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ReportData {
    userName: string;
    idolName: string;
    score: number;
    content: {
        twinFlame?: string;
        energyFlow?: string;
        destiny2026?: string;
        hiddenChallenges?: string;
        karmicLesson?: string;
        [key: string]: unknown;
    };
}

export default function ReportView({ reportData, mock }: { reportData: ReportData, mock: boolean }) {
    useEffect(() => {
        // Add print styles to body on mount
        document.body.classList.add('print-report-ready');
        return () => {
            document.body.classList.remove('print-report-ready');
        };
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-onyx text-white relative font-sans">
            {/* Background styling tailored for print visibility */}
            <div className="fixed inset-0 print:hidden opacity-30 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
            </div>

            {/* Navigation & Controls - Hidden when printing */}
            <nav className="fixed top-0 w-full p-4 z-50 flex justify-between items-center bg-onyx/80 backdrop-blur-md border-b border-white/5 print:hidden">
                <Link href="/" className="font-serif text-xl tracking-wider text-primary flex items-center gap-2">
                    BIAS<span className="text-white">MATRIX</span>
                </Link>
            </nav>

            {mock && (
                <div className="pt-24 print:hidden px-6">
                    <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 text-xs px-4 py-2 rounded-lg text-center font-mono">
                        Preview Mode: Showing sample destiny report.
                    </div>
                </div>
            )}

            {/* Main Report Container automatically scaled for print (A4 approx) */}
            <main className="relative z-10 max-w-4xl mx-auto pt-24 pb-20 px-6 print:pt-0 print:px-0 print:mx-0">

                {/* Report Header */}
                <header className="text-center mb-16 print:mb-8 pt-8">
                    <p className="text-primary tracking-[0.3em] text-sm font-semibold uppercase mb-4">CONFIDENTIAL SOUL RECORD</p>
                    <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
                        The Destiny Tie:<br />{reportData.userName} &amp; {reportData.idolName}
                    </h1>

                    <div className="inline-flex flex-col items-center justify-center p-8 bg-surface/50 border border-white/10 rounded-full w-48 h-48 mt-8 shadow-[0_0_50px_rgba(212,175,55,0.1)] print:border-slate-800 print:shadow-none mx-auto relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent mix-blend-overlay"></div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest relative z-10 mb-1">Synergy Score</p>
                        <p className="text-6xl font-serif text-primary italic relative z-10 leading-none">{reportData.score}</p>
                        <p className="text-sm text-slate-500 relative z-10 mt-1">/100</p>
                    </div>
                </header>

                {/* Section: Twin Flame Analysis */}
                <section className="mb-16 glass-panel p-8 rounded-3xl border border-white/10 print:border-slate-800 print:bg-white print:text-black print:break-inside-avoid shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary print:bg-slate-200 print:text-slate-800">
                            <span className="material-symbols-outlined">favorite</span>
                        </div>
                        <h2 className="text-2xl font-serif text-white print:text-black">The Twin Flame Connection</h2>
                    </div>
                    <p className="text-slate-300 print:text-slate-700 leading-relaxed text-lg">
                        {reportData.content.twinFlame || "Destiny intertwined your stars. This analysis reveals the karmic bonds tying your souls together in this lifetime."}
                    </p>
                </section>

                {/* Section: Energy Flow */}
                <section className="mb-16 glass-panel p-8 rounded-3xl border border-white/10 print:border-slate-800 print:bg-white print:text-black print:break-inside-avoid shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 print:bg-slate-200 print:text-slate-800">
                            <span className="material-symbols-outlined">water</span>
                        </div>
                        <h2 className="text-2xl font-serif text-white print:text-black">Elemental Energy Flow</h2>
                    </div>
                    <p className="text-slate-300 print:text-slate-700 leading-relaxed text-lg">
                        {reportData.content.energyFlow || "A unique balance of giving and receiving. Your elemental composition creates a specific dynamic of energy exchange."}
                    </p>
                </section>

                {/* Grid for smaller sections */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <section className="glass-panel p-8 rounded-3xl border border-white/10 print:border-slate-800 print:bg-white print:text-black print:break-inside-avoid shadow-xl h-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 print:bg-slate-200 print:text-slate-800">
                                <span className="material-symbols-outlined text-sm">warning</span>
                            </div>
                            <h2 className="text-xl font-serif text-white print:text-black">Hidden Challenges</h2>
                        </div>
                        <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                            {reportData.content.hiddenChallenges || "No relationship is without friction. Understanding your elemental clashes is key."}
                        </p>
                    </section>

                    <section className="glass-panel p-8 rounded-3xl border border-white/10 print:border-slate-800 print:bg-white print:text-black print:break-inside-avoid shadow-xl h-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 print:bg-slate-200 print:text-slate-800">
                                <span className="material-symbols-outlined text-sm">psychology</span>
                            </div>
                            <h2 className="text-xl font-serif text-white print:text-black">Karmic Lesson</h2>
                        </div>
                        <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                            {reportData.content.karmicLesson || "What you are meant to teach each other in this grand cycle of reincarnation."}
                        </p>
                    </section>
                </div>

                {/* Section: 2026 Destiny */}
                <section className="mb-16 glass-panel p-8 rounded-3xl border border-white/10 print:border-slate-800 print:bg-white print:text-black print:break-inside-avoid shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 print:bg-slate-200 print:text-slate-800">
                            <span className="material-symbols-outlined">auto_awesome</span>
                        </div>
                        <h2 className="text-2xl font-serif text-white print:text-black">2026 Destiny Timeline</h2>
                    </div>
                    <p className="text-slate-300 print:text-slate-700 leading-relaxed text-lg">
                        {reportData.content.destiny2026 || "Major transits this year will activate specific aspects of your synergy chart."}
                    </p>
                </section>

                {/* Footer */}
                <footer className="text-center pt-12 border-t border-white/10 print:border-slate-800">
                    <p className="font-serif text-primary text-xl mb-2">BiasMatrix</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Premium Saju &amp; Soul Analysis</p>
                    <p className="text-[10px] text-slate-600 mt-8 print:block hidden">Generated automatically based on true solar time calculations.</p>
                </footer>
            </main>

            <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .glass-panel {
            background: none !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
          @page {
            margin: 2cm;
          }
        }
      `}</style>
        </div>
    );
}
