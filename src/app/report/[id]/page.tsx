import { supabase } from '@/lib/supabase';
import ReportView from './ReportView';

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
                reportData={{
                    userName: 'Sarah',
                    idolName: 'Jungkook',
                    score: 92,
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

    return (
        <ReportView
            mock={false}
            reportData={{
                userName: report.users?.nickname || 'Seeker',
                idolName: report.idols?.name || 'Your Bias',
                score: report.synergy_score || 85,
                content: content
            }}
        />
    );
}
