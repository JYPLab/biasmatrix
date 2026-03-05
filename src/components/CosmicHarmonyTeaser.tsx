"use client";

import React, { useRef, useState, useEffect } from "react";

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
}: CosmicHarmonyTeaserProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState(300);
    const [activeElement, setActiveElement] = useState<string | null>(null);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupFading, setPopupFading] = useState(false);

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
        <div className="glass-panel w-full max-w-sm mx-auto rounded-2xl p-4 sm:p-6 relative overflow-hidden bg-[#111111]">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                    <h3 className="font-serif text-xl sm:text-2xl text-white">Your Cosmic Harmony</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Based on 5 elemental pillars</p>
                </div>
                <div className="text-right flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-serif text-[#F5D060] italic drop-shadow-[0_0_12px_rgba(245,208,96,0.6)]">
                        {score}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500">/100</span>
                </div>
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

                        {/* Popup in chart center */}
                        {popupVisible && activeDetail && (
                            <g style={{
                                opacity: popupFading ? 0 : 1,
                                transition: "opacity 0.3s ease",
                            }}>
                                {/* Background rect */}
                                <rect
                                    x={center - 70}
                                    y={center - 48}
                                    width={140}
                                    height={96}
                                    rx={10}
                                    ry={10}
                                    fill="#0F0F0F"
                                    fillOpacity={0.92}
                                    stroke={activeColor}
                                    strokeOpacity={0.5}
                                    strokeWidth={1.2}
                                />
                                {/* Title */}
                                <text
                                    x={center}
                                    y={center - 22}
                                    textAnchor="middle"
                                    fill={activeColor}
                                    fontSize="13"
                                    fontWeight="bold"
                                >
                                    {activeDetail.title}
                                </text>
                                {/* Subtitle */}
                                <text
                                    x={center}
                                    y={center - 7}
                                    textAnchor="middle"
                                    fill="#E2E8F0"
                                    fontSize="9"
                                    letterSpacing="1.5"
                                >
                                    {activeDetail.subtitle.toUpperCase()}
                                </text>
                                {/* Separator */}
                                <line
                                    x1={center - 40}
                                    y1={center + 2}
                                    x2={center + 40}
                                    y2={center + 2}
                                    stroke={activeColor}
                                    strokeOpacity={0.3}
                                    strokeWidth={0.8}
                                />
                                {/* Quote line 1 */}
                                <text
                                    x={center}
                                    y={center + 17}
                                    textAnchor="middle"
                                    fill="#94A3B8"
                                    fontSize="7.5"
                                    fontStyle="italic"
                                >
                                    {`"${activeDetail.quote.split(" ").slice(0, Math.ceil(activeDetail.quote.split(" ").length / 2)).join(" ")}`}
                                </text>
                                <text
                                    x={center}
                                    y={center + 29}
                                    textAnchor="middle"
                                    fill="#94A3B8"
                                    fontSize="7.5"
                                    fontStyle="italic"
                                >
                                    {`${activeDetail.quote.split(" ").slice(Math.ceil(activeDetail.quote.split(" ").length / 2)).join(" ")}"`}
                                </text>
                            </g>
                        )}

                        {/* Central Keyword — hide when popup is open */}
                        {!popupVisible && (
                            <text
                                x={center}
                                y={center + 4}
                                textAnchor="middle"
                                fill="#F5D060"
                                fontSize="11"
                                fontWeight="bold"
                                letterSpacing="3"
                            >
                                {keyword}
                            </text>
                        )}
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
            </div>

            <div className="bg-[#18181B]/80 rounded-xl px-4 py-4 sm:p-5 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5C158]/5 to-transparent blur-xl"></div>
                <p className="text-[14px] sm:text-[15px] text-slate-300 leading-relaxed text-center font-serif relative z-10 text-pretty">
                    {teaserText}
                </p>
            </div>
        </div>
    );
}
