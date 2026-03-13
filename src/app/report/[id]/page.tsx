import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ReportView from './ReportView';

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

export async function generateMetadata(
    props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const params = await props.params;
    const id = params?.id;

    const { data: report } = await supabase
        .from('reports')
        .select('*, users (*), idols (*)')
        .eq('id', id)
        .single();

    if (!report) {
        return {
            title: 'SoulMatch Report',
            description: 'Discover your karmic synergy with your K-pop bias.',
        };
    }

    const finalScore = report.synergy_score || report.energy_score || 85;
    const typeName = getKeyword(finalScore);
    const userName = report.users?.nickname || 'Seeker';
    const idolName = report.idols?.name || report.idols?.member_name || 'Your Bias';

    return {
        title: `${userName} & ${idolName}'s SoulMatch Report`,
        description: `${userName}'s ${finalScore}/100 ${typeName} with ${idolName}. Discover your past life echoes, karmic flow, and 2026 destiny timeline.`,
        openGraph: {
            title: `${userName} got ${finalScore}/100 ${typeName} with ${idolName} ✨`,
            description: `${idolName}'s energy resonates across lifetimes. Discover your own karmic synergy.`,
            url: `https://biasmatrix.com/report/${id}`,
            images: [
                {
                    url: `/report/${id}/opengraph-image`,
                    width: 1200,
                    height: 630,
                    alt: `${userName} & ${idolName} SoulMatch Report`,
                    type: 'image/png',
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${userName} got ${finalScore}/100 ${typeName} with ${idolName} ✨`,
            description: `${idolName}'s energy resonates across lifetimes. Discover your own karmic synergy.`,
            images: [`/report/${id}/opengraph-image`],
        },
        alternates: {
            canonical: `https://biasmatrix.com/report/${id}`,
        },
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
    // Await the params to avoid Sync Next.js warnings
    const params = await props.params;
    const id = params?.id;

    // We should fetch the report and related user/idol data from Supabase
    const { data: report, error } = await supabase
        .from('reports')
        .select(`
      *,
      users (*),
      idols (*)
    `)
        .eq('id', id)
        .single();

    if (error || !report) {
        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching report:', error);
        }

        // For local development or missing report fallback, we'll pass a mock object
        // Or we can just 404. Let's provide a graceful mock if not found.
        return (
            <ReportView
                mock={true}
                reportId={id}
                reportData={{
                    userName: 'Sarah',
                    idolName: 'Jungkook',
                    score: 92,
                    typeName: 'CELESTIAL TWINFIRE',
                    content: {
                        twinFlame: "Your souls are bound by a rare 7-year cycle. You provide the foundation his turbulent creative energy desperately seeks.",
                        energyFlow: "Your Water energy perfectly extinguishes his excess Fire, bringing him peace. However, during Summer months, you may feel drained.",
                        destiny2026: "November 2026 brings a significant cosmic alignment. Keep your eyes open for unexpected connections related to music or art.",
                        hiddenChallenges: "There is a slight clash in communication styles, represented by the Metal element. Patience is your strongest asset.",
                        karmicLesson: "You are here to teach him vulnerability, while he teaches you how to stand boldly in your own power."
                    }
                }}
            />
        );
    }

    // Parse the detailed content from the AI output (stored as JSON)
    let content: Record<string, unknown> = {};
    const rawContent = report.full_report_json || report.detailed_content;

    if (rawContent) {
        try {
            content = typeof rawContent === 'string'
                ? JSON.parse(rawContent)
                : rawContent;
        } catch (e) {
            console.error('Failed to parse report content', e);
        }
    }


    const finalScore = report.synergy_score || report.energy_score || 85;
    const finalTypeName = getKeyword(finalScore);

    return (
        <ReportView
            mock={false}
            reportId={id}
            reportData={{
                userName: report.users?.nickname || 'Seeker',
                idolName: report.idols?.name || report.idols?.member_name || 'Your Bias',
                score: finalScore,
                typeName: finalTypeName,
                content: content
            }}
        />
    );
}
