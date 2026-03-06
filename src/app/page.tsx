"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import CosmicHarmonyTeaser from "@/components/CosmicHarmonyTeaser";

interface Idol {
  id: string;
  group_name: string;
  member_name: string;
}

interface TeaserData {
  score: number;
  keyword: string;
  teaserText: string;
  elementsData: {
    element: string;
    value: number;
    icon: string;
  }[];
}

export default function Home() {
  const [name, setName] = useState('');
  const [stickyEmail, setStickyEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');


  // City search state
  const [citySearch, setCitySearch] = useState('');
  const [debouncedCitySearch] = useDebounce(citySearch, 500);
  const [cityOptions, setCityOptions] = useState<Record<string, unknown>[]>([]);
  const [selectedCity, setSelectedCity] = useState<Record<string, unknown> | null>(null);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Group & Member state
  const [idols, setIdols] = useState<Idol[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('BTS');
  const [selectedMember, setSelectedMember] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'group' | 'member' | null>(null);

  // Fetch idols
  useEffect(() => {
    async function fetchIdols() {
      const { data } = await supabase.from('idols').select('*');
      if (data) {
        setIdols(data);
        const btsMembers = data.filter(i => i.group_name === 'BTS').sort((a, b) => a.member_name.localeCompare(b.member_name));
        if (btsMembers.length > 0) {
          const jk = btsMembers.find(m => m.member_name === 'Jungkook');
          setSelectedMember(jk ? jk.id : btsMembers[0].id);
        }
      }
    }
    fetchIdols();
  }, []);

  const availableGroups = useMemo(() => {
    const groups = new Set(idols.map(i => i.group_name));
    return Array.from(groups).sort();
  }, [idols]);

  const availableMembers = useMemo(() => {
    return idols.filter(i => i.group_name === selectedGroup).sort((a, b) => a.member_name.localeCompare(b.member_name));
  }, [idols, selectedGroup]);

  useEffect(() => {
    if (availableMembers.length > 0 && !availableMembers.find(m => m.id === selectedMember)) {
      setSelectedMember(availableMembers[0].id);
    }
  }, [selectedGroup, availableMembers, selectedMember]);

  // API State
  const [isLoading, setIsLoading] = useState(false);
  const [teaserData, setTeaserData] = useState<TeaserData | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCities() {
      if (!debouncedCitySearch || debouncedCitySearch.length < 2) {
        setCityOptions([]);
        setShowDropdown(false);
        return;
      }
      setIsSearchingCity(true);
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            q: debouncedCitySearch,
            format: 'json',
            addressdetails: 1,
            limit: 5,
            featuretype: 'city'
          }
        });
        setCityOptions(response.data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setIsSearchingCity(false);
      }
    }
    fetchCities();
  }, [debouncedCitySearch]);

  const handleCitySelect = (city: Record<string, unknown>) => {
    setSelectedCity(city);
    setCitySearch(String(city.display_name || ''));
    setShowDropdown(false);
  };

  const handleSendReport = async () => {
    if (!stickyEmail) {
      alert("Please enter your email address.");
      return;
    }
    if (!reportId) {
      alert("Please submit your Celestial Profile first by clicking 'Discover My Synergy'.");
      return;
    }
    setIsSending(true);
    try {
      const res = await axios.post('/api/webhook/payment', {
        meta: {
          event_name: 'order_created',
          custom_data: { report_id: reportId, email: stickyEmail }
        }
      }, {
        headers: { 'x-mock-bypass': 'true' }
      });
      if (res.data.success) {
        alert("✨ Your cosmic report is on its way! Please check your email inbox for the private link.");
      } else {
        alert("Something went wrong: " + res.data.error);
      }
    } catch (err) {
      console.error("Send report error:", err);
      alert("Error sending report. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleAnalyze = async () => {
    if (!name || !month || !day || !year || !selectedCity) {
      alert("Please fill all required fields and select a valid city from the dropdown");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        email: stickyEmail || `pending_${Date.now()}@biasmatrix.com`,
        nickname: name,
        birth_date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
        birth_city: String(selectedCity.display_name || ''),
        longitude: parseFloat(String(selectedCity.lon || '0')),
        is_time_known: false,
        birth_time: null,
        idol_id: selectedMember,
      };

      const res = await axios.post('/api/analyze-energy', payload);
      if (res.data.success) {
        setTeaserData(res.data.teaser);
        setReportId(res.data.reportId);
      } else {
        alert("Failed to analyze: " + res.data.error);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 border-white/5 h-14">
        <div className="max-w-md mx-auto px-4 h-full flex items-center justify-between">
          <button className="text-slate-300 p-1 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          </button>
          <h1 className="font-sans text-sm font-semibold tracking-widest text-primary uppercase">⭐ BIASMATRIX</h1>
          <button className="text-slate-300 p-1 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-xl">help</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto pt-20 flex flex-col gap-8 pb-32 relative z-10">

        {/* HERO SECTION */}
        <section className="px-6 flex flex-col gap-6 text-center items-center">
          <h1 className="text-3xl md:text-4xl font-serif text-white leading-[1.2]">
            Discover the <br />
            <span className="italic text-primary-light font-bold">Karmic Synergy</span> <br />
            with your Bias
          </h1>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            Powered by the ancient algorithm of Korean Saju. Unveil your Twin Flame.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg shadow-primary/5 mt-2">
            <span className="text-[10px] font-medium text-primary-light uppercase tracking-wide">✨ Over 10,000 soul matches decoded</span>
          </div>
        </section>

        {/* SELECTORS */}
        <section className="px-6 space-y-3">
          <div className="relative z-20">
            <div
              onClick={() => setOpenDropdown(prev => prev === 'group' ? null : 'group')}
              className="glass-panel p-4 rounded-xl flex items-center justify-between hover:border-primary/50 cursor-pointer transition-colors"
            >
              <span className="text-slate-400 text-sm font-medium">K-POP GROUP</span>
              <div className="flex items-center gap-2 text-white">
                <span className="font-serif">{selectedGroup}</span>
                <span className={`material-symbols-outlined text-slate-500 transition-transform ${openDropdown === 'group' ? 'rotate-180' : ''}`}>expand_more</span>
              </div>
            </div>
            {openDropdown === 'group' && (
              <div className="absolute top-full mt-2 w-full bg-onyx/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 flex flex-col max-h-48 overflow-y-auto shadow-2xl animate-in slide-in-from-top-2">
                {availableGroups.map(g => (
                  <button
                    key={g}
                    onClick={() => { setSelectedGroup(g); setOpenDropdown(null); }}
                    className="text-left px-4 py-3 hover:bg-white/10 text-white transition-colors border-b border-white/10 last:border-none"
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative z-10">
            <div
              onClick={() => { if (availableMembers.length > 0) setOpenDropdown(prev => prev === 'member' ? null : 'member') }}
              className={`glass-panel p-4 rounded-xl flex items-center justify-between transition-colors ${availableMembers.length > 0 ? 'hover:border-primary/50 cursor-pointer' : 'opacity-50'}`}
            >
              <span className="text-slate-400 text-sm font-medium">SELECT MEMBER</span>
              <div className="flex items-center gap-2 text-white">
                <span className="font-serif">{availableMembers.find(m => m.id === selectedMember)?.member_name || 'Loading...'}</span>
                <span className={`material-symbols-outlined text-slate-500 transition-transform ${openDropdown === 'member' ? 'rotate-180' : ''}`}>expand_more</span>
              </div>
            </div>
            {openDropdown === 'member' && (
              <div className="absolute top-full mt-2 w-full bg-onyx/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 flex flex-col max-h-48 overflow-y-auto shadow-2xl animate-in slide-in-from-top-2">
                {availableMembers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMember(m.id); setOpenDropdown(null); }}
                    className="text-left px-4 py-3 hover:bg-white/10 text-white transition-colors border-b border-white/10 last:border-none"
                  >
                    {m.member_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FORM */}
        <section className="px-4">
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">YOUR CELESTIAL PROFILE</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-600 outline-none"
                  placeholder="What should we call you?" type="text"
                />
              </div>

              <div className="flex gap-2">
                <select value={month} onChange={(e) => setMonth(e.target.value)} className="flex-1 bg-surface/50 border border-white/10 rounded-xl px-2 py-3.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none appearance-none text-center">
                  <option value="" disabled selected>MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <select value={day} onChange={(e) => setDay(e.target.value)} className="flex-1 bg-surface/50 border border-white/10 rounded-xl px-2 py-3.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none appearance-none text-center">
                  <option value="" disabled selected>DD</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d.toString().padStart(2, '0')}</option>
                  ))}
                </select>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="flex-2 bg-surface/50 border border-white/10 rounded-xl px-2 py-3.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none appearance-none text-center">
                  <option value="" disabled selected>YYYY</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 14 - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <span className="absolute right-4 top-3.5 text-primary/70 material-symbols-outlined text-[20px]">location_on</span>
                <input
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    if (selectedCity && e.target.value !== String(selectedCity.display_name || '')) {
                      setSelectedCity(null);
                    }
                  }}
                  onFocus={() => cityOptions.length > 0 && setShowDropdown(true)}
                  className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-600 outline-none"
                  placeholder="City of Birth" type="text"
                />

                {/* Autocomplete Dropdown */}
                {showDropdown && cityOptions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-surface border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    {cityOptions.map((city, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleCitySelect(city)}
                        className="px-4 py-3 text-sm text-slate-300 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 truncate"
                      >
                        {String(city.display_name || '')}
                      </div>
                    ))}
                  </div>
                )}
                {isSearchingCity && (
                  <div className="absolute right-12 top-3.5 text-primary/50 text-xs">Loading...</div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-primary-light to-primary text-onyx font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Analyzing Stars...' : 'Discover My Synergy'}
              </button>
            </form>
          </div>
        </section>

        {/* FREEMIUM RESULT (Hidden by default, shown for UI demonstration) */}
        {teaserData && (
          <div className="px-4">
            <CosmicHarmonyTeaser
              score={teaserData.score || 88}
              keyword={teaserData.keyword || 'KARMIC SPARK'}
              teaserText={teaserData.teaserText || 'Your spirits whisper across galaxies, a cosmic melody woven from stardust.'}
              elementsData={teaserData.elementsData || [
                { element: 'Fire', value: 90, icon: 'local_fire_department' },
                { element: 'Earth', value: 70, icon: 'diamond' },
                { element: 'Metal', value: 50, icon: 'token' },
                { element: 'Water', value: 40, icon: 'water_drop' },
                { element: 'Wood', value: 85, icon: 'auto_awesome' }
              ]}
            />
          </div>
        )}

        {/* PAYWALL CONTENT */}
        <section className="px-4 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-sm">lock</span> 🔒 Unlock the Full BiasMatrix
          </h2>

          <div className="relative rounded-2xl overflow-hidden bg-surface border border-white/5 h-24 group">
            <div className="absolute inset-0 p-5 flex justify-between items-center z-0 opacity-40 blur-[2px]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">📜 The Twin Flame Analysis</h3>
                <p className="text-xs text-slate-400">Why your souls met in this lifetime.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary/50 text-sm">favorite</span>
              </div>
            </div>
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 backdrop-blur-[1px]"></div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-surface border border-white/5 h-24 group">
            <div className="absolute inset-0 p-5 flex justify-between items-center z-0 opacity-40 blur-[2px]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">🌊 Energy Flow &amp; Conflicts</h3>
                <p className="text-xs text-slate-400">Detailed compatibility matrix.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-500/50 text-sm">water</span>
              </div>
            </div>
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 backdrop-blur-[1px]"></div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-surface border border-white/5 h-24 group">
            <div className="absolute inset-0 p-5 flex justify-between items-center z-0 opacity-40 blur-[2px]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">⏳ 2026 Destiny Timeline</h3>
                <p className="text-xs text-slate-400">Detailed monthly forecast &amp; advice.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-rose-500/50 text-sm">calendar_month</span>
              </div>
            </div>
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 backdrop-blur-[1px]"></div>
          </div>
        </section>

        {/* REVIEWS */}
        {(() => {
          const reviews = [
            { initial: 'S', border: 'border-primary/30', quote: 'border-primary/20', quoteColor: 'text-primary/20', name: 'Sarah / Los Angeles', text: '"I got 91 with Jungkook and literally cried. The Twin Flame analysis described my personality so accurately I had to put my phone down."' },
            { initial: 'M', border: 'border-white/20', quote: 'border-white/10', quoteColor: 'text-white/10', name: 'Min-ji / Seoul', text: '"I didn\'t believe in this stuff until my friend sent me her result. Got 78 with Taehyung and the Cosmic Flow section was uncomfortably accurate."' },
            { initial: 'P', border: 'border-white/20', quote: 'border-white/10', quoteColor: 'text-white/10', name: 'Priya / London', text: '"Showed this to my whole stan group. We all did it and spent 2 hours comparing results. The 2026 forecast part gave me chills."' },
            { initial: 'C', border: 'border-white/20', quote: 'border-white/10', quoteColor: 'text-white/10', name: 'Camille / Paris', text: '"Got 67 with my bias and I was devastated 😭 But the report explained exactly WHY and it made so much sense. Worth every penny."' },
            { initial: 'Y', border: 'border-white/20', quote: 'border-white/10', quoteColor: 'text-white/10', name: 'Yuki / Tokyo', text: '"The karmic past life section hit different. How does it know these things from just a birthday?"' },
            { initial: 'I', border: 'border-white/20', quote: 'border-white/10', quoteColor: 'text-white/10', name: 'Isabella / São Paulo', text: '"My bias is Felix and I got CELESTIAL TWINFIRE 🔥 I\'ve been telling everyone. This is not like other compatibility tests at all."' },
            { initial: 'H', border: 'border-white/20', quote: 'border-white/10', quoteColor: 'text-white/10', name: 'Hannah / Sydney', text: '"Skeptic turned believer. The energy analysis described a tension I couldn\'t even explain myself. Scary good."' },
            { initial: 'N', border: 'border-white/20', quote: 'border-white/10', quoteColor: 'text-white/10', name: 'Nadia / Toronto', text: '"Did this at 2am and ended up reading the whole report. The 2026 destiny timeline has me actually planning my year differently lol"' },
          ];
          return <ReviewCarousel reviews={reviews} />;
        })()}

        <footer className="mt-4 text-center pb-8 px-6">
          <p className="text-[10px] text-slate-600">BiasMatrix © 2026. All rights reserved.</p>
        </footer>
      </main>

      {/* STICKY CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-10 bg-gradient-to-t from-onyx via-onyx/95 to-transparent">
        <div className="max-w-md mx-auto">
          <div className="w-full bg-gradient-to-r from-primary-light via-primary to-yellow-600 rounded-2xl p-[1.5px] shadow-[0_0_40px_rgba(212,175,55,0.3)]">
            <div className="w-full bg-[#141414] rounded-[14px] px-4 py-3 flex items-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent"></div>
              <input
                type="email"
                value={stickyEmail}
                onChange={(e) => setStickyEmail(e.target.value)}
                placeholder="Your email address"
                className="relative z-10 flex-1 min-w-0 bg-transparent text-white text-base placeholder:text-slate-400 outline-none border-none focus:ring-0"
              />
              <div className="relative z-10 w-px h-6 bg-white/20 flex-shrink-0" />
              <button
                onClick={handleSendReport}
                disabled={isSending}
                className="relative z-10 bg-gradient-to-r from-primary-light to-primary text-onyx font-extrabold text-sm px-5 py-2.5 rounded-xl whitespace-nowrap hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex-shrink-0 shadow-md"
              >
                {isSending ? 'Sending…' : 'Send ✨'}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="bg-primary/20 border border-primary/40 text-primary-light text-xs font-bold px-3 py-0.5 rounded-full tracking-wide uppercase">🎁 100% Free</span>
            <span className="text-slate-300 text-xs">— Get your full cosmic report</span>
          </div>
        </div>
      </div>
    </>
  );
}

type ReviewItem = {

  initial: string;
  border: string;
  quote: string;
  quoteColor: string;
  name: string;
  text: string;
};

function ReviewCarousel({ reviews }: { reviews: ReviewItem[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollTo = useCallback((idx: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const card = container.children[idx] as HTMLElement;
    if (!card) return;
    container.scrollTo({ left: card.offsetLeft - container.offsetLeft, behavior: 'smooth' });
    setActiveIdx(idx);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % reviews.length;
        const container = scrollRef.current;
        if (container) {
          const card = container.children[next] as HTMLElement;
          if (card) container.scrollTo({ left: card.offsetLeft - container.offsetLeft, behavior: 'smooth' });
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [paused, reviews.length]);

  // Pause on touch, resume after 6s
  const handleTouchStart = () => {
    setPaused(true);
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => setPaused(false), 6000);
  };

  // Sync dot on manual scroll
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    let closest = 0;
    let minDist = Infinity;
    Array.from(container.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const dist = Math.abs(el.offsetLeft - container.offsetLeft - scrollLeft);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIdx(closest);
  };

  return (
    <section className="pl-4 pb-4">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pr-4">What Fans Are Saying</h2>
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-3 pb-3 pr-4 scrollbar-hide snap-x snap-mandatory"
      >
        {reviews.map((r, i) => (
          <div
            key={i}
            className={`min-w-[62%] snap-center glass-panel p-4 rounded-2xl border ${r.quote} relative flex-shrink-0`}
          >
            <span className={`material-symbols-outlined absolute top-3 right-3 ${r.quoteColor} text-3xl`}>format_quote</span>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white border ${r.border} font-serif flex-shrink-0`}>{r.initial}</div>
              <div>
                <div className="flex text-primary mb-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <span key={si} className="material-symbols-outlined text-xs" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  ))}
                </div>
                <p className="text-white text-[11px] font-semibold leading-tight">{r.name}</p>
              </div>
            </div>
            <p className="text-slate-300 text-xs italic leading-relaxed pr-4">{r.text}</p>
          </div>
        ))}
      </div>
      {/* Dot indicator */}
      <div className="flex justify-center gap-1.5 mt-1 pr-4">
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => { scrollTo(i); setPaused(true); if (pauseTimer.current) clearTimeout(pauseTimer.current); pauseTimer.current = setTimeout(() => setPaused(false), 6000); }}
            className={`rounded-full transition-all duration-300 ${i === activeIdx ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-white/20'}`}
          />
        ))}
      </div>
    </section>
  );
}
