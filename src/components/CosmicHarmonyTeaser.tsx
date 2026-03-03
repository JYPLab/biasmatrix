"use client";

import React from "react";

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
    // SVG Setup
    const size = 300;
    const center = size / 2;
    const maxRadius = 100;

    // Calculate coordinates for a given value (0-100) at a specific index (0-4)
    const getCoordinates = (value: number, index: number) => {
        // Start at top (-90 degrees) and go clockwise in 72 degree increments
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 5;
        const radius = (value / 100) * maxRadius;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return { x, y };
    };

    // Generate polygon points for the user's dynamic shape
    const polygonPoints = elementsData
        .map((data, index) => {
            const { x, y } = getCoordinates(data.value, index);
            return `${x},${y}`;
        })
        .join(" ");

    // Generate background grid pentagons (e.g., at 25%, 50%, 75%, 100%)
    const gridLevels = [25, 50, 75, 100];
    const backgroundPolygons = gridLevels.map((level) => {
        return Array.from({ length: 5 })
            .map((_, i) => Object.values(getCoordinates(level, i)).join(","))
            .join(" ");
    });

    // Calculate positions for element labels/icons
    const labelPositions = elementsData.map((data, index) => {
        // Place labels slightly outside the max radius
        const { x, y } = getCoordinates(125, index);
        return { x, y, data };
    });

    return (
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden bg-[#111111]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-serif text-2xl text-white">Your Cosmic Harmony</h3>
                    <p className="text-xs text-slate-400 mt-1">Based on 5 elemental pillars</p>
                </div>
                <div className="text-right flex items-baseline gap-1">
                    <span className="text-4xl font-serif text-[#E5C158] italic drop-shadow-[0_0_8px_rgba(229,193,88,0.4)]">
                        {score}
                    </span>
                    <span className="text-sm text-slate-500">/100</span>
                </div>
            </div>

            <div className="relative w-full flex items-center justify-center mb-8">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
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

                    {/* Dynamic filled radar polygon */}
                    <polygon
                        points={polygonPoints}
                        fill="rgba(229, 193, 88, 0.2)"
                        stroke="#E5C158"
                        strokeWidth="1.5"
                        className="drop-shadow-[0_0_12px_rgba(229,193,88,0.6)] transition-all duration-1000 ease-in-out"
                    />

                    {/* Central Keyword */}
                    <text
                        x={center}
                        y={center + 4} // adjust for vertical centering
                        textAnchor="middle"
                        fill="#E5C158"
                        className="font-bold text-[11px] uppercase tracking-[0.2em] drop-shadow-md"
                    >
                        {keyword}
                    </text>

                    {/* Element Icons */}
                    {labelPositions.map((pos, i) => (
                        <g key={`label-${i}`} transform={`translate(${pos.x - 16}, ${pos.y - 16})`}>
                            <circle cx="16" cy="16" r="18" fill="#18181B" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            <text
                                x="16"
                                y="22"
                                textAnchor="middle"
                                className="material-symbols-outlined text-[#E5C158] drop-shadow-sm text-[18px]"
                            >
                                {pos.data.icon}
                            </text>
                        </g>
                    ))}
                </svg>
            </div>

            <div className="bg-[#18181B]/80 rounded-xl p-5 border border-white/5 relative overflow-hidden">
                {/* Subtle gold glow behind the text */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#E5C158]/5 to-transparent blur-xl"></div>
                <p className="text-[15px] text-slate-300 leading-relaxed text-center font-serif relative z-10 text-pretty">
                    {teaserText}
                </p>
            </div>
        </div>
    );
}
