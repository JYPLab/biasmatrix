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

export default function CosmicHarmonyTeaser({
    score,
    keyword,
    teaserText,
    elementsData,
}: CosmicHarmonyTeaserProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState(300);

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

    return (
        <div className="glass-panel w-full max-w-sm mx-auto rounded-2xl p-4 sm:p-6 relative overflow-hidden bg-[#111111]">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
                <div>
                    <h3 className="font-serif text-xl sm:text-2xl text-white">Your Cosmic Harmony</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Based on 5 elemental pillars</p>
                </div>
                <div className="text-right flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-serif text-[#E5C158] italic drop-shadow-[0_0_8px_rgba(229,193,88,0.4)]">
                        {score}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500">/100</span>
                </div>
            </div>

            {/* Chart container: uses the measured width as square */}
            <div
                ref={containerRef}
                className="relative w-full mb-6 sm:mb-8"
                style={{ height: containerSize }}
            >
                {/* SVG radar chart — inset so icons at edges are visible */}
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
                                strokeOpacity={0.05}
                                strokeWidth="1"
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
                                    strokeOpacity={0.05}
                                    strokeWidth="1"
                                />
                            );
                        })}

                        {/* Dynamic radar polygon */}
                        <polygon
                            points={polygonPoints}
                            fill="rgba(229, 193, 88, 0.2)"
                            stroke="#E5C158"
                            strokeWidth="1.5"
                            className="transition-all duration-1000 ease-in-out"
                            style={{ filter: "drop-shadow(0 0 12px rgba(229,193,88,0.6))" }}
                        />

                        {/* Central Keyword */}
                        <text
                            x={center}
                            y={center + 4}
                            textAnchor="middle"
                            fill="#E5C158"
                            fontSize="11"
                            fontWeight="bold"
                            letterSpacing="3"
                        >
                            {keyword}
                        </text>
                    </svg>
                </div>

                {/* HTML icon overlays — positioned relative to the outer container */}
                {labelPositions.map((pos, i) => {
                    const color = elementColors[pos.data.element] || "#E5C158";
                    return (
                        <div
                            key={`icon-${i}`}
                            className="absolute flex items-center justify-center"
                            style={{
                                // The SVG is padded by 10% on each side, so map percent into [10%, 90%] range
                                left: `calc(${pos.percentX * 0.8 + 10}% - 18px)`,
                                top: `calc(${pos.percentY * 0.8 + 10}% - 18px)`,
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "#18181B",
                                border: `1px solid ${color}40`,
                                boxShadow: `0 0 8px ${color}30`,
                            }}
                        >
                            <span
                                className="material-symbols-outlined select-none"
                                style={{
                                    color,
                                    fontSize: 18,
                                    lineHeight: 1,
                                    filter: `drop-shadow(0 0 4px ${color})`,
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
