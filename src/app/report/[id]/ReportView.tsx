'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';

interface SubSection {
    title?: string;
    pullQuote?: string;
    paragraphs?: string[];
    userEnergy?: string[];
    idolEnergy?: string[];
    magneticIntersection?: string[];
    nurturingCycle?: string[];
    dynamicFriction?: string[];
    pastLifeStory?: string[];
    soulPurpose?: string[];
    vibeAnalysis?: string[];
    attractionTriggers?: string[];
    forecastDetails?: string[];
    actionableAdvice?: string[];
    [key: string]: unknown;
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
    [key: string]: unknown;
}

interface ReportData {
    userName: string;
    idolName: string;
    score: number;
    typeName?: string;
    content: MassiveReport;
}

// Card Placeholder Component
const InsightCard = ({ label, title, icon }: { label: string, title: string, icon: string }) => (
    <div className="my-16 flex justify-center w-full print:hidden">
        <div className="w-[280px] h-[360px] rounded-3xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#111111] to-[#0A0A0A] flex flex-col items-center justify-center p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#D4AF37] text-3xl">{icon}</span>
            </div>

            <div className="text-[#D4AF37] text-[10px] tracking-[0.2em] uppercase font-semibold mb-3">
                {label}
            </div>

            <h3 className="text-white font-serif text-lg text-center leading-snug">
                {title}
            </h3>

            <div className="mt-8 text-[#D4AF37]/50 text-xs tracking-widest">
                ...
            </div>
        </div>
    </div>
);

export default function ReportView({ reportData, mock, reportId }: { reportData: ReportData, mock: boolean, reportId: string }) {
    useEffect(() => {
        document.body.classList.add('bg-[#0A0A0A]', 'text-white');
        return () => document.body.classList.remove('bg-[#0A0A0A]', 'text-white');
    }, []);

    const content = reportData.content || {};

    const handleShareTopRight = async () => {
        const text = `Just unlocked my full BiasMatrix report \nwith ${reportData.idolName} ✨\nbiasmatrix.com/report/${reportId}`;
        shareContent(text);
    };

    const handleShareBottom = async () => {
        const text = `${reportData.userName}'s ${reportData.score}/100 ${reportData.typeName || 'SOULMATCH'} with \n${reportData.idolName} ✨\nMy full SoulMatch Report →\nbiasmatrix.com/report/${reportId}`;
        shareContent(text);
    };

    const shareContent = async (text: string) => {
        if (navigator.share) {
            try {
                await navigator.share({ text });
            } catch (err) {
                console.log('Share canceled or failed', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(text);
                alert('Copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy', err);
            }
        }
    };

    const handleSaveImage = async () => {
        const element = document.getElementById('capture-mantra-area');
        if (!element) return;
        
        try {
            const canvas = await html2canvas(element, {
                backgroundColor: '#0A0A0A',
                scale: window.devicePixelRatio || 2,
                logging: false,
                useCORS: true,
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `BiasMatrix-${reportData.idolName.replace(/\s+/g, '')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('Failed to save image', err);
            alert('Failed to save image. Please try again.');
        }
    };

    // Helper to extract all text paragraphs from a chapter's array properties
    const extractAllParagraphs = (chapterData: SubSection): string[] => {
        if (!chapterData) return [];
        let allParas: string[] = [];

        // If there's a direct paragraphs array (like Introduction/Conclusion)
        if (chapterData.paragraphs && Array.isArray(chapterData.paragraphs)) {
            allParas = [...allParas, ...chapterData.paragraphs];
        }

        // Extract from specific known keys in order
        const keysToExtract = [
            'userEnergy', 'idolEnergy', 'magneticIntersection',
            'nurturingCycle', 'dynamicFriction',
            'pastLifeStory', 'soulPurpose',
            'vibeAnalysis', 'attractionTriggers',
            'forecastDetails', 'actionableAdvice'
        ];

        keysToExtract.forEach(key => {
            if (chapterData[key] && Array.isArray(chapterData[key])) {
                allParas = [...allParas, ...(chapterData[key] as string[])];
            }
        });

        return allParas;
    };

    const renderChapter = (chapterNum: string, chapterData: SubSection | undefined | null) => {
        if (!chapterData) return null;

        const paras = extractAllParagraphs(chapterData);
        // We will insert the pull quote after the 1st or 2nd paragraph if it exists
        const splitIndex = paras.length > 2 ? 2 : 1;

        const firstHalf = paras.slice(0, splitIndex);
        const secondHalf = paras.slice(splitIndex);

        return (
            <div className="mb-24 relative max-w-xl mx-auto px-6">
                <div className="mb-8 border-b border-white/10 pb-6">
                    <p className="text-[#D4AF37] text-[10px] tracking-[0.2em] uppercase font-bold mb-3">
                        CHAPTER {chapterNum}
                    </p>
                    <h2 className="text-3xl font-serif text-white tracking-wide">
                        {chapterData.title ? chapterData.title.replace(/^Chapter \d+: /, '') : ''}
                    </h2>
                </div>

                <div className="space-y-6 text-[#E0E0E0] text-[15px] leading-[1.9] tracking-wide font-light font-lora">
                    {firstHalf.map((p, i) => (
                        <p key={`p1-${i}`}>{p}</p>
                    ))}
                </div>

                {chapterData.pullQuote && (
                    <div className="my-14 border-l-0 text-center px-4">
                        <p className="text-[#D4AF37] italic text-2xl md:text-3xl font-serif tracking-wide leading-relaxed">
                            &quot;{chapterData.pullQuote as string}&quot;
                        </p>
                    </div>
                )}

                <div className="space-y-6 text-[#E0E0E0] text-[15px] leading-[1.9] tracking-wide font-light font-lora">
                    {secondHalf.map((p, i) => (
                        <p key={`p2-${i}`}>{p}</p>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#D4AF37]/30 pb-24">
            {/* Top Navigation Bar */}
            <nav className="fixed top-0 w-full h-16 z-50 flex justify-between items-center px-6 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/5 print:hidden">
                <Link href="/" className="text-[#D4AF37] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
                </Link>
                <div className="font-serif text-sm tracking-[0.3em] text-[#D4AF37] uppercase">
                    BiasMatrix
                </div>
                <button onClick={handleShareTopRight} className="text-[#D4AF37] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl">ios_share</span>
                </button>
            </nav>

            {mock && (
                <div className="pt-24 print:hidden px-6 max-w-xl mx-auto">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-xs px-4 py-3 rounded-lg text-center font-mono">
                        Preview Mode: Showing sample/fallback report.
                    </div>
                </div>
            )}

            <main className="relative z-10 w-full pt-32 print:pt-0">
                {/* Main Header Area */}
                <header className="text-center mb-16 max-w-xl mx-auto px-6">
                    <div className="inline-block border border-[#D4AF37]/30 rounded-full px-4 py-1.5 mb-8">
                        <p className="text-[#D4AF37] tracking-[0.2em] text-[9px] font-bold uppercase">
                            DEEP ANALYSIS REPORT
                        </p>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-tight tracking-wide">
                        {content.reportTitle ? content.reportTitle.replace('The Cosmic Destiny Matrix: ', '') : `The Origin of Core Destiny`}
                    </h1>

                    <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto opacity-50 mb-12"></div>

                    {/* Hero Image Placeholder matching the UI reference */}
                    <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop"
                            alt="Cosmic Nebula"
                            className="w-full h-full object-cover opacity-80 mix-blend-screen"
                            crossOrigin="anonymous"
                        />
                    </div>
                </header>

                {/* Introduction */}
                {content.introduction && (
                    <div className="mb-24 max-w-xl mx-auto px-6">
                        <div className="space-y-6 text-[#E0E0E0] text-[15px] leading-[1.9] tracking-wide font-light font-lora">
                            {content.introduction.paragraphs?.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chapters with Interleaved Cards */}
                {renderChapter("01", content.chapter1_CoreSouls)}

                <InsightCard
                    label="TAROT INSIGHT"
                    title="Energy Card Unlocking..."
                    icon="auto_awesome"
                />

                {renderChapter("02", content.chapter2_ElementalMatrix)}

                <InsightCard
                    label="KARMIC ECHO"
                    title="Past Life Fragments..."
                    icon="hourglass_empty"
                />

                {renderChapter("03", content.chapter3_TwinFlame)}
                {renderChapter("04", content.chapter4_Intimacy)}

                <InsightCard
                    label="FINAL ORACLE"
                    title="Mapping Your Path..."
                    icon="explore"
                />

                {renderChapter("05", content.chapter5_DestinyTimeline)}

                {/* Conclusion */}
                {content.conclusion && (
                    <section className="mt-32 mb-32 max-w-xl mx-auto px-6 text-center border-t border-[#D4AF37]/20 pt-16">
                        <span className="material-symbols-outlined text-[#D4AF37] text-4xl mb-6">wb_incandescent</span>
                        <h2 className="text-3xl font-serif text-white mb-8 tracking-wide">{content.conclusion.title || 'The Final Oracle'}</h2>
                        <div className="space-y-6 text-[#E0E0E0] text-[15px] leading-[1.9] tracking-wide font-light font-lora">
                            {content.conclusion.paragraphs?.map((p, i) => {
                                if (i === content.conclusion!.paragraphs!.length - 1) {
                                    return (
                                        <div key={i} id="capture-mantra-area" className="relative mt-12 bg-[#0A0A0A] p-8 rounded-2xl border border-[#D4AF37]/20 shadow-[0_4px_30px_rgba(212,175,55,0.1)]">
                                            <p className="text-[#D4AF37] italic text-xl md:text-2xl font-serif mb-8 leading-relaxed">
                                                "{p}"
                                            </p>
                                            <div className="flex flex-col items-center justify-center pt-6 border-t border-[#D4AF37]/20">
                                                <div className="text-4xl font-serif text-white mb-2 tracking-wide">{reportData.score}<span className="text-xl text-white/50">/100</span></div>
                                                <div className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-bold">{reportData.typeName || 'SOULMATCH'}</div>
                                            </div>
                                            <div className="mt-8 text-center opacity-50 text-[10px] tracking-widest text-[#D4AF37] uppercase">
                                                biasmatrix.com
                                            </div>
                                        </div>
                                    );
                                }
                                return (
                                    <p key={i}>
                                        {p}
                                    </p>
                                );
                            })}
                        </div>
                        
                        <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center items-center print:hidden">
                            <button onClick={handleSaveImage} className="w-full md:w-auto border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 px-8 py-3.5 rounded-full font-serif text-[13px] tracking-widest transition-colors flex items-center justify-center gap-2">
                                📸 Save this moment
                            </button>
                            <button onClick={handleShareBottom} className="w-full md:w-auto bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0A0A0A] hover:opacity-90 px-8 py-3.5 rounded-full font-serif text-[13px] tracking-widest font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                                📤 Share my report
                            </button>
                        </div>
                    </section>
                )}
            </main>

            {/* Bottom Floating Action Bar */}
            <div className="fixed bottom-0 w-full bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent pt-12 pb-6 px-8 z-50 print:hidden">
                <div className="max-w-md mx-auto flex justify-between items-center text-[#D4AF37]">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-2xl">home</span>
                    </Link>
                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors relative">
                        <span className="material-symbols-outlined text-2xl">menu_book</span>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-2xl">auto_fix_high</span>
                    </button>
                    <button onClick={() => window.print()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-2xl">download</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
