"use client";

import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";

interface ElementData {
    element: string;
    value: number;
    icon: string;
}

interface CosmicHarmonyTeaserProps {
    score: number;
    keyword: string;
    teaserText: string;
    elementsData: ElementData[];
    userName?: string;
    idolName?: string;
}

const elementDetails: Record<
    string,
    { title: string; subtitle: string; quote: string }
> = {
    Fire: {
        title: "🔥 Fire",
        subtitle: "Passion & Drive",
        quote: "The flame that pulls two souls into an inevitable collision",
    },
    Water: {
        title: "💧 Water",
        subtitle: "Intuition & Depth",
        quote: "The current that flows between hearts without words",
    },
    Wood: {
        title: "✨ Wood",
        subtitle: "Growth & Vision",
        quote: "The force that makes two souls reach higher together",
    },
    Metal: {
        title: "💎 Metal",
        subtitle: "Strength & Clarity",
        quote: "The bond that cuts through illusion and reveals true connection",
    },
    Earth: {
        title: "🌍 Earth",
        subtitle: "Stability & Ground",
        quote: "The foundation that holds two destinies in sacred balance",
    },
};

export default function CosmicHarmonyTeaser({
    score,
    keyword,
    teaserText,
    elementsData,
    userName,
    idolName,
}: CosmicHarmonyTeaserProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const captureRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState(300);
    const [activeElement, setActiveElement] = useState<string | null>(null);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupFading, setPopupFading] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    const handleSaveCard = async () => {
        if (!captureRef.current) return;
        setIsCapturing(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 50));
            const canvas = await html2canvas(captureRef.current, {
                backgroundColor: "#111111",
                scale: 2,
                useCORS: true,
            });
            const link = document.createElement("a");
            link.download = `CosmicHarmony_${userName || "Result"}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Failed to capture image", err);
        } finally {
            setIsCapturing(false);
        }
    };

    const handleShare = async () => {
        const text = `${userName || "Someone"}'s ${score}/100 ${keyword.replace(/✨/g, '').trim()} with ${
            idolName || "their Bias"
        } 🔥\nDiscover your Karmic Synergy → biasmatrix.com`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    text: text,
                });
            } catch (err) {
                console.error("Share failed", err);
            }
        } else {
            navigator.clipboard.writeText(text);
            alert("Copied to clipboard!");
        }
    };

    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize(containerRef.current.offsetWidth);
            }
        };
        updateSize();
        const observer = new ResizeObserver(updateSize);
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // SVG coordinate system
    const svgSize = 340;
    const center = svgSize / 2;
    const maxRadius = 100;
    // Icon circles sit just outside the radar at radius 140 in SVG coords
    const iconRadius = 140;

    const getCoordinates = (value: number, index: number) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 5;
        const radius = (value / 100) * maxRadius;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return { x, y };
    };

    // Dynamic polygon
    const polygonPoints = elementsData
        .map((data, index) => {
            const { x, y } = getCoordinates(data.value, index);
            return `${x},${y}`;
        })
        .join(" ");

    // Grid pentagons
    const gridLevels = [25, 50, 75, 100];
    const backgroundPolygons = gridLevels.map((level) =>
        Array.from({ length: 5 })
            .map((_, i) => Object.values(getCoordinates(level, i)).join(","))
            .join(" ")
    );

    // Icon positions in SVG coordinate space → convert to % for HTML overlay
    const labelPositions = elementsData.map((data, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 5;
        const svgX = center + iconRadius * Math.cos(angle);
        const svgY = center + iconRadius * Math.sin(angle);
        // Express as percentage of svg viewBox
        const percentX = (svgX / svgSize) * 100;
        const percentY = (svgY / svgSize) * 100;
        return { percentX, percentY, data };
    });

    const elementColors: Record<string, string> = {
        Fire: "#FF6B6B",
        Earth: "#E5C158",
        Metal: "#E2E8F0",
        Water: "#60A5FA",
        Wood: "#34D399",
    };

    const handleIconClick = (elementName: string, e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        if (activeElement === elementName && popupVisible) {
            // Fade out
            setPopupFading(true);
            setTimeout(() => {
                setPopupVisible(false);
                setPopupFading(false);
                setActiveElement(null);
            }, 300);
        } else {
            setActiveElement(elementName);
            setPopupFading(false);
            setPopupVisible(true);
        }
    };

    const handleOutsideClick = () => {
        if (popupVisible) {
            setPopupFading(true);
            setTimeout(() => {
                setPopupVisible(false);
                setPopupFading(false);
                setActiveElement(null);
            }, 300);
        }
    };

    const activeDetail = activeElement ? elementDetails[activeElement] : null;
    const activeColor = activeElement ? elementColors[activeElement] : "#E5C158";

    return (
        <div ref={captureRef} className="glass-panel w-full max-w-sm mx-auto rounded-2xl p-4 sm:p-6 relative overflow-hidden bg-[#111111]">
            <div className="mb-6 sm:mb-8 text-center">
                <h3 className="font-serif text-xl sm:text-2xl text-white">Your Cosmic Harmony</h3>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Based on 5 elemental pillars</p>
                <div className="flex items-baseline justify-center gap-1 mt-3">
                    <span className="text-3xl sm:text-4xl font-serif text-[#F5D060] italic drop-shadow-[0_0_12px_rgba(245,208,96,0.6)]">
                        {score}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500">/100</span>
                </div>
                <p className="text-sm sm:text-base font-bold tracking-[0.15em] uppercase text-[#F5D060] mt-1 drop-shadow-[0_0_8px_rgba(245,208,96,0.5)]">
                    ✨ {keyword} ✨
                </p>
            </div>

            {/* Chart container */}
            <div
                ref={containerRef}
                className="relative w-full mb-6 sm:mb-8"
                style={{ height: containerSize }}
                onClick={handleOutsideClick}
            >
                {/* SVG radar chart */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ padding: "10%" }}>
                    <svg
                        viewBox={`0 0 ${svgSize} ${svgSize}`}
                        preserveAspectRatio="xMidYMid meet"
                        className="w-full h-full overflow-visible"
                    >
                        {/* Background Grid */}
                        {backgroundPolygons.map((points, i) => (
                            <polygon
                                key={`grid-${i}`}
                                points={points}
                                fill="none"
                                stroke="#ffffff"
                                strokeOpacity={0.12}
                                strokeWidth="1.5"
                            />
                        ))}

                        {/* Radial Axis Lines */}
                        {Array.from({ length: 5 }).map((_, i) => {
                            const edge = getCoordinates(100, i);
                            return (
                                <line
                                    key={`axis-${i}`}
                                    x1={center}
                                    y1={center}
                                    x2={edge.x}
                                    y2={edge.y}
                                    stroke="#ffffff"
                                    strokeOpacity={0.12}
                                    strokeWidth="1.5"
                                />
                            );
                        })}

                        {/* Dynamic radar polygon */}
                        <polygon
                            points={polygonPoints}
                            fill="rgba(245, 208, 96, 0.35)"
                            stroke="#F5D060"
                            strokeWidth="2.5"
                            className="transition-all duration-1000 ease-in-out"
                            style={{ filter: "drop-shadow(0 0 16px rgba(245,208,96,0.8))" }}
                        />

                        {/* Popup placeholder — rendered as HTML overlay below */}


                    </svg>
                </div>

                {/* HTML icon overlays */}
                {labelPositions.map((pos, i) => {
                    const color = elementColors[pos.data.element] || "#F5D060";
                    const isActive = activeElement === pos.data.element;
                    return (
                        <div
                            key={`icon-${i}`}
                            className="absolute flex items-center justify-center cursor-pointer select-none"
                            onClick={(e) => handleIconClick(pos.data.element, e)}
                            style={{
                                left: `calc(${pos.percentX * 0.8 + 10}% - 22px)`,
                                top: `calc(${pos.percentY * 0.8 + 10}% - 22px)`,
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background: isActive ? `${color}22` : "#18181B",
                                border: `${isActive ? 2 : 1.5}px solid ${color}${isActive ? "CC" : "60"}`,
                                boxShadow: isActive
                                    ? `0 0 18px ${color}60, 0 0 6px ${color}40`
                                    : `0 0 10px ${color}30`,
                                transform: isActive ? "scale(1.15)" : "scale(1)",
                                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
                            }}
                        >
                            <span
                                className="material-symbols-outlined select-none"
                                style={{
                                    color,
                                    fontSize: 22,
                                    lineHeight: 1,
                                    filter: `drop-shadow(0 0 5px ${color})`,
                                }}
                            >
                                {pos.data.icon}
                            </span>
                        </div>
                    );
                })}
                {/* HTML popup overlay — centered over the chart */}
                {popupVisible && activeDetail && (
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "58%",
                            maxWidth: 200,
                            minWidth: 140,
                            background: "rgba(15, 15, 15, 0.95)",
                            border: `1.5px solid ${activeColor}80`,
                            borderRadius: 12,
                            padding: "12px 14px",
                            textAlign: "center",
                            zIndex: 20,
                            opacity: popupFading ? 0 : 1,
                            transition: "opacity 0.3s ease",
                            boxShadow: `0 0 24px ${activeColor}30`,
                            pointerEvents: "none",
                        }}
                    >
                        <p style={{ color: activeColor, fontWeight: 700, fontSize: 15, margin: 0 }}>
                            {activeDetail.title}
                        </p>
                        <p style={{ color: "#E2E8F0", fontSize: 10, letterSpacing: "1.5px", margin: "4px 0" }}>
                            {activeDetail.subtitle.toUpperCase()}
                        </p>
                        <div style={{ height: 1, background: `${activeColor}40`, margin: "6px 0" }} />
                        <p style={{ color: "#94A3B8", fontSize: 11, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
                            &ldquo;{activeDetail.quote}&rdquo;
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-[#18181B]/80 rounded-xl px-4 py-4 sm:p-5 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5C158]/5 to-transparent blur-xl"></div>
                <p className="text-[14px] sm:text-[15px] text-slate-300 leading-relaxed text-center font-serif relative z-10 text-pretty">
                    {teaserText}
                </p>
            </div>

            {isCapturing && (
                <div className="mt-8 text-center text-xs text-slate-500 font-serif tracking-widest uppercase">
                    biasmatrix.com
                </div>
            )}

            {!isCapturing && (
                <>
                    <div className="w-full h-px bg-white/10 my-6" />
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSaveCard}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#F5D060] text-[#F5D060] font-bold text-sm bg-transparent hover:bg-[#F5D060]/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                            Save Card
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#F5D060] bg-[#F5D060] text-[#111111] font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-[18px]">ios_share</span>
                            Share
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
