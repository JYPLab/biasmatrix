'use client';

import { useState } from 'react';
import axios from 'axios';

export default function ReviewSection({ reportId }: { reportId: string }) {
    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number>(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const res = await axios.post('/api/reviews', {
                report_id: reportId,
                rating,
                comment
            });

            if (res.data.success) {
                setSubmitted(true);
            } else {
                setError(res.data.error || 'Failed to submit review.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'An error occurred while submitting your review.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="max-w-xl mx-auto px-6 print:hidden mb-24">
                <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-2xl p-8 text-center mt-12 shadow-[0_4px_30px_rgba(212,175,55,0.05)]">
                    <span className="material-symbols-outlined text-[#D4AF37] text-4xl mb-4">favorite</span>
                    <h3 className="text-[#D4AF37] font-serif text-2xl mb-2 tracking-wide">Thank You</h3>
                    <p className="text-[#E0E0E0] text-sm font-light">Your cosmic feedback has been received.</p>
                </div>
            </div>
        );
    }

    return (
        <section className="max-w-xl mx-auto px-6 print:hidden mb-24">
            <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-2xl p-8 mt-12 shadow-[0_4px_30px_rgba(212,175,55,0.05)]">
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-serif text-white tracking-wide">Share Your Experience</h3>
                    <p className="text-[#D4AF37]/60 text-xs tracking-widest uppercase mt-2">Did this report resonate with you? ⭐</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center flex-col items-center gap-2">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(rating)}
                                    className="transition-colors w-10 h-10 flex text-3xl items-center justify-center"
                                >
                                    <span
                                        className={`material-symbols-outlined ${(hover || rating) >= star ? 'text-[#D4AF37]' : 'text-white/20'}`}
                                        style={{ fontVariationSettings: (hover || rating) >= star ? "'FILL' 1" : "'FILL' 0" }}
                                    >
                                        star
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you thought... (optional)"
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37]/50 outline-none resize-none min-h-[100px] placeholder:text-white/30"
                        />
                    </div>

                    {error && (
                        <div className="text-red-400 text-xs text-center">{error}</div>
                    )}

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[13px] font-bold py-3 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
