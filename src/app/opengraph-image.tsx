import { ImageResponse } from 'next/og';

export const alt = 'BiasMatrix - K-Pop Twin Flame Analysis';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#000000',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    fontFamily: 'serif',
                }}
            >
                {/* Top gold line */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)',
                    }}
                />

                {/* BiasMatrix branding */}
                <div
                    style={{
                        position: 'absolute',
                        top: '44px',
                        left: '60px',
                        color: '#C9A96E',
                        fontSize: '28px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        display: 'flex',
                    }}
                >
                    BiasMatrix
                </div>

                <div
                    style={{
                        position: 'absolute',
                        top: '50px',
                        right: '60px',
                        color: '#C9A96E',
                        fontSize: '22px',
                        opacity: 0.6,
                        display: 'flex',
                    }}
                >
                    ✦ ✦ ✦
                </div>

                {/* Center content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '64px',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            lineHeight: 1.1,
                            textAlign: 'center',
                            display: 'flex',
                        }}
                    >
                        K-Pop Twin Flame Analysis
                    </div>
                    <div
                        style={{
                            fontSize: '28px',
                            color: '#C9A96E',
                            letterSpacing: '0.15em',
                            display: 'flex',
                        }}
                    >
                        ✦ POWERED BY KOREAN SAJU ✦
                    </div>
                    <div
                        style={{
                            fontSize: '22px',
                            color: '#999999',
                            textAlign: 'center',
                            display: 'flex',
                        }}
                    >
                        Discover your karmic synergy with your bias
                    </div>
                </div>

                {/* Bottom domain */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '44px',
                        color: '#666666',
                        fontSize: '20px',
                        letterSpacing: '0.05em',
                        display: 'flex',
                    }}
                >
                    biasmatrix.com
                </div>

                {/* Bottom gold line */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)',
                    }}
                />
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
