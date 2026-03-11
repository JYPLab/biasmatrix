import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';

export const alt = 'BiasMatrix SoulMatch Report';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getKeyword(score: number): string {
    if (score >= 95) return 'TWIN FLAME DESTINY';
    if (score >= 90) return 'CELESTIAL TWINFIRE';
    if (score >= 85) return 'SOULFIRE BOND';
    if (score >= 80) return 'CELESTIAL VELOCITY';
    if (score >= 75) return 'CELESTIAL PULSE';
    if (score >= 70) return 'KARMIC ECHO';
    if (score >= 65) return 'KARMIC SPARK';
    if (score >= 60) return 'COSMIC SPARK';
    return 'KARMIC DESTINY';
}

export default async function Image(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params?.id;

    const { data: report } = await supabase
        .from('reports')
        .select('synergy_score, energy_score, users (nickname), idols (name, member_name)')
        .eq('id', id)
        .single();

    const score = (report as { synergy_score?: number; energy_score?: number } | null)?.synergy_score
        || (report as { synergy_score?: number; energy_score?: number } | null)?.energy_score
        || 85;
    const typeName = getKeyword(score);
    const userName = (report as { users?: { nickname?: string } } | null)?.users?.nickname || 'Seeker';
    const idolName =
        (report as { idols?: { name?: string; member_name?: string } } | null)?.idols?.name ||
        (report as { idols?: { name?: string; member_name?: string } } | null)?.idols?.member_name ||
        'Your Bias';

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
                {/* Gold gradient overlay at top */}
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

                {/* Top: BiasMatrix branding */}
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

                {/* Stars decoration */}
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

                {/* Center: Score */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '120px',
                            fontWeight: 700,
                            color: '#FFFFFF',
                            lineHeight: 1,
                            display: 'flex',
                        }}
                    >
                        {score}/100
                    </div>
                    <div
                        style={{
                            fontSize: '34px',
                            color: '#C9A96E',
                            fontWeight: 700,
                            letterSpacing: '0.25em',
                            display: 'flex',
                        }}
                    >
                        {typeName}
                    </div>
                </div>

                {/* Bottom: Names + domain */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '50px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <div
                        style={{
                            fontSize: '30px',
                            color: '#E8E8E8',
                            fontWeight: 500,
                            display: 'flex',
                        }}
                    >
                        {userName} &amp; {idolName}
                    </div>
                    <div
                        style={{
                            fontSize: '18px',
                            color: '#666666',
                            letterSpacing: '0.05em',
                            display: 'flex',
                        }}
                    >
                        biasmatrix.com
                    </div>
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
