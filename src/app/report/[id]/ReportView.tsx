'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface SubSection {
    title?: string;
    paragraphs?: string[];
    [key: string]: any;
}

interface MassiveReport {
    reportTitle?: string;
    introduction?: SubSection;
    chapter1_CoreSouls?: SubSection;
    chapter2_ElementalMatrix?: SubSection;
    chapter3_TwinFlame?: SubSection;
    chapter4_Intimacy?: SubSection;
    chapter5_DestinyTimeline?: SubSection;
    conclusion?: SubSection;
    [key: string]: any;
}

interface ReportData {
    userName: string;
    idolName: string;
    score: number;
    content: MassiveReport;
}

export default function ReportView({ reportData, mock }: { reportData: ReportData, mock: boolean }) {
    useEffect(() => {
        document.body.classList.add('print-report-ready');
        return () => document.body.classList.remove('print-report-ready');
    }, []);

    const content = reportData.content || {};

    // Helper to render multiple paragraphs safely
    const renderParagraphs = (paras: any) => {
        if (!paras || !Array.isArray(paras)) return null;
        return paras.map((p, i) => (
            <p key={i} className="text-slate-300 leading-relaxed text-lg mb-4 print:text-slate-700">{p}</p>
        ));
    };

    // Helper to render an entire chapter
    const renderChapter = (chapterKey: string, chapterData: any, icon: string) => {
        if (!chapterData) return null;
        return (
            <section className="mb-16 glass-panel p-8 rounded-3xl border border-white/10 print:border-slate-800 print:bg-white print:text-black print:break-inside-avoid shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary print:bg-slate-200 print:text-slate-800">
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <h2 className="text-2xl font-serif text-white print:text-black">
                        {chapterData.title || chapterKey}
                    </h2>
                </div>

                {chapterData.pullQuote && (
                    <div className="mb-8 mt-2 pl-6 border-l-2 border-primary/50 text-primary italic text-xl font-serif tracking-wide leading-relaxed print:text-slate-600 print:border-slate-300">
                        "{chapterData.pullQuote}"
                    </div>
                )}

                {/* Dynamically render all array-based paragraphs within the chapter object */}
                {Object.keys(chapterData).map(key => {
                    if (key === 'title') return null;
                    const val = chapterData[key];
                    if (Array.isArray(val)) {
                        return (
                            <div key={key} className="mt-6">
                                <h3 className="text-sm text-primary uppercase tracking-widest mb-3 font-semibold print:text-slate-500">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </h3>
                                {renderParagraphs(val)}
                            </div>
                        );
                    }
                    return null;
                })}
            </section>
        );
    };

    return (
        <div className="min-h-screen bg-onyx text-white relative font-sans">
            <div className="fixed inset-0 print:hidden opacity-30 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>
            </div>

            <nav className="fixed top-0 w-full p-4 z-50 flex justify-between items-center bg-onyx/80 backdrop-blur-md border-b border-white/5 print:hidden">
                <Link href="/" className="font-serif text-xl tracking-wider text-primary flex items-center gap-2">
                    BIAS<span className="text-white">MATRIX</span>
                </Link>
            </nav>

            {mock && (
                <div className="pt-24 print:hidden px-6">
                    <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 text-xs px-4 py-2 rounded-lg text-center font-mono">
                        Preview Mode: Showing sample/fallback report.
                    </div>
                </div>
            )}

            <main className="relative z-10 max-w-4xl mx-auto pt-24 pb-20 px-6 print:pt-0 print:px-0 print:mx-0">
                <header className="text-center mb-16 print:mb-8 pt-8">
                    <p className="text-primary tracking-[0.3em] text-sm font-semibold uppercase mb-4">VVIP DESTINY RECORD</p>
                    <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight">
                        {content.reportTitle || `The Destiny Tie: ${reportData.userName} & ${reportData.idolName}`}
                    </h1>

                    <div className="inline-flex flex-col items-center justify-center p-8 bg-surface/50 border border-white/10 rounded-full w-48 h-48 mt-8 shadow-[0_0_50px_rgba(212,175,55,0.1)] print:border-slate-800 print:shadow-none mx-auto relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent mix-blend-overlay"></div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest relative z-10 mb-1">Synergy</p>
                        <p className="text-6xl font-serif text-primary italic relative z-10 leading-none">{reportData.score}</p>
                        <p className="text-sm text-slate-500 relative z-10 mt-1">/100</p>
                    </div>
                </header>

                {content.introduction && (
                    <section className="mb-16 text-center max-w-2xl mx-auto">
                        <span className="material-symbols-outlined text-4xl text-primary/50 mb-4 block">star_rate</span>
                        <h2 className="text-2xl font-serif text-white mb-6">{content.introduction.title}</h2>
                        {renderParagraphs(content.introduction.paragraphs)}
                    </section>
                )}

                {renderChapter("chapter1_CoreSouls", content.chapter1_CoreSouls, "psychology")}
                {renderChapter("chapter2_ElementalMatrix", content.chapter2_ElementalMatrix, "cyclone")}
                {renderChapter("chapter3_TwinFlame", content.chapter3_TwinFlame, "local_fire_department")}
                {renderChapter("chapter4_Intimacy", content.chapter4_Intimacy, "favorite")}
                {renderChapter("chapter5_DestinyTimeline", content.chapter5_DestinyTimeline, "hourglass_top")}

                {content.conclusion && (
                    <section className="mt-24 mb-16 text-center max-w-2xl mx-auto border-t border-white/10 pt-16">
                        <h2 className="text-3xl font-serif text-primary mb-6">{content.conclusion.title}</h2>
                        {renderParagraphs(content.conclusion.paragraphs)}
                    </section>
                )}
            </main>
        </div>
    );
}
