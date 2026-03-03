"use client";

import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

interface Idol {
  id: string;
  group_name: string;
  member_name: string;
}

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);

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
  const [teaserData, setTeaserData] = useState<Record<string, unknown> | null>(null);
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

  const handleAnalyze = async () => {
    if (!name || !email || !month || !day || !year || !selectedCity) {
      alert("Please fill all required fields and select a valid city from the dropdown");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        email,
        nickname: name,
        birth_date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
        birth_city: String(selectedCity.display_name || ''),
        longitude: parseFloat(String(selectedCity.lon || '0')),
        is_time_known: !isTimeUnknown,
        birth_time: isTimeUnknown ? null : birthTime,
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
          <div className="relative group">
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between group-hover:border-primary/50 transition-colors relative">
              <span className="text-slate-400 text-sm font-medium z-0 pointer-events-none">K-POP GROUP</span>
              <div className="flex items-center gap-2 text-white z-0 pointer-events-none">
                <span className="font-serif">{selectedGroup}</span>
                <span className="material-symbols-outlined text-slate-500">expand_more</span>
              </div>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
              >
                {availableGroups.map(g => <option key={g} value={g} className="text-black">{g}</option>)}
              </select>
            </div>
          </div>
          <div className="relative group">
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between group-hover:border-primary/50 transition-colors relative">
              <span className="text-slate-400 text-sm font-medium z-0 pointer-events-none">SELECT MEMBER</span>
              <div className="flex items-center gap-2 text-white z-0 pointer-events-none">
                <span className="font-serif">{availableMembers.find(m => m.id === selectedMember)?.member_name || 'Loading...'}</span>
                <span className="material-symbols-outlined text-slate-500">expand_more</span>
              </div>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none z-10"
                disabled={availableMembers.length === 0}
              >
                {availableMembers.map(m => <option key={m.id} value={m.id} className="text-black">{m.member_name}</option>)}
              </select>
            </div>
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
              <div>
                <input
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-600 outline-none"
                  placeholder="Where should we email your report? 💌" type="email"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                <input
                  value={birthTime} onChange={(e) => setBirthTime(e.target.value)} disabled={isTimeUnknown}
                  className="w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all [color-scheme:dark] placeholder:text-slate-600 outline-none disabled:opacity-50"
                  type="time"
                />
              </div>
              <div className="flex items-center gap-2 px-1">
                <div className="relative flex items-center">
                  <input
                    checked={isTimeUnknown} onChange={(e) => setIsTimeUnknown(e.target.checked)}
                    className="peer h-4 w-4 shrink-0 rounded-sm border border-white/20 bg-surface/50 text-primary focus:ring-1 focus:ring-primary focus:ring-offset-0 appearance-none outline-none checked:bg-primary"
                    id="birth_time_unknown" type="checkbox"
                  />
                  <svg className="pointer-events-none absolute left-0 top-0 hidden h-4 w-4 text-onyx peer-checked:block" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <label className="text-xs text-slate-400 cursor-pointer select-none" htmlFor="birth_time_unknown">I don&apos;t know my exact birth time</label>
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
          <section className="px-4">
            <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-xl text-white">Your BiasMatrix Score</h3>
                  <p className="text-xs text-slate-400 mt-1">Based on 5 elemental pillars</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-serif text-primary italic">{String(teaserData.score || '88')}</span><span className="text-sm text-slate-500">/100</span>
                </div>
              </div>

              <div className="relative h-56 w-full flex items-center justify-center mb-6">
                <svg className="absolute w-48 h-48 text-white/5" viewBox="0 0 100 100">
                  <polygon fill="none" points="50,5 95,38 82,90 18,90 5,38" stroke="currentColor" strokeWidth="0.5"></polygon>
                  <polygon fill="none" points="50,25 72,41 66,67 34,67 28,41" stroke="currentColor" strokeWidth="0.5"></polygon>
                </svg>
                <div className="radar-chart w-32 h-32 bg-gradient-to-tr from-primary/30 to-primary/10 border border-primary/50 relative z-10 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-light uppercase text-center leading-tight">SYNERGY<br />HIGH</span>
                </div>

                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-surface border border-white/10 p-1.5 rounded-full text-primary shadow-lg z-20">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span>
                </div>
                <div className="absolute top-[35%] right-2 bg-surface border border-white/10 p-1.5 rounded-full text-slate-500 shadow-lg z-20">
                  <span className="material-symbols-outlined text-sm">landscape</span>
                </div>
                <div className="absolute bottom-[15%] right-8 bg-surface border border-white/10 p-1.5 rounded-full text-slate-500 shadow-lg z-20">
                  <span className="material-symbols-outlined text-sm">hardware</span>
                </div>
                <div className="absolute bottom-[15%] left-8 bg-surface border border-white/10 p-1.5 rounded-full text-primary shadow-lg z-20">
                  <span className="material-symbols-outlined text-sm">water_drop</span>
                </div>
                <div className="absolute top-[35%] left-2 bg-surface border border-white/10 p-1.5 rounded-full text-primary shadow-lg z-20">
                  <span className="material-symbols-outlined text-sm">forest</span>
                </div>
              </div>

              <div className="bg-surface/50 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-slate-300 leading-relaxed text-center font-serif">
                  {String(teaserData.insight || "Your Wood and Fire elements create a nurturing cycle with Jungkook's dominant Earth energy.")}
                </p>
              </div>
            </div>
          </section>
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
        <section className="pl-4 pb-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pr-4">What Fans Are Saying</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 pr-4 scrollbar-hide snap-x">
            <div className="min-w-[85%] snap-center glass-panel p-5 rounded-2xl border border-primary/20 relative flex-shrink-0">
              <span className="material-symbols-outlined absolute top-4 right-4 text-primary/20 text-4xl">format_quote</span>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white border border-primary/30 font-serif">S</div>
                <div>
                  <div className="flex text-primary text-[10px] mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm">star</span>
                    ))}
                  </div>
                  <p className="text-white text-xs font-semibold">Sarah, LA</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm italic leading-relaxed">&quot;The Twin Flame analysis was scarily accurate! I cried reading it.&quot;</p>
            </div>

            <div className="min-w-[85%] snap-center glass-panel p-5 rounded-2xl border border-white/10 relative flex-shrink-0">
              <span className="material-symbols-outlined absolute top-4 right-4 text-white/10 text-4xl">format_quote</span>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white border border-white/20 font-serif">M</div>
                <div>
                  <div className="flex text-primary text-[10px] mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm">star</span>
                    ))}
                  </div>
                  <p className="text-white text-xs font-semibold">Min-ji, Seoul</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm italic leading-relaxed">&quot;I didn&apos;t believe in Saju until this. It knew things about my personality I never told anyone.&quot;</p>
            </div>
          </div>
        </section>

        <footer className="mt-4 text-center pb-8 px-6">
          <p className="text-[10px] text-slate-600">BiasMatrix © 2026. All rights reserved.</p>
        </footer>
      </main>

      {/* STICKY CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-onyx via-onyx to-transparent pt-12">
        <div className="max-w-md mx-auto">
          <div className="w-full bg-gradient-to-r from-primary-light via-primary to-yellow-600 rounded-xl p-[1px] shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <button
              onClick={() => {
                if (!reportId) {
                  alert("Please submit your Celestial Profile first to unlock the report.");
                  return;
                }
                const handleCheckout = async () => {
                  try {
                    const res = await axios.post('/api/create-checkout', { reportId });
                    if (res.data.checkoutUrl) {
                      window.location.href = res.data.checkoutUrl;
                    }
                  } catch (err) {
                    console.error("Checkout error:", err);
                    alert("Unable to initiate checkout. Please try again later.");
                  }
                };
                handleCheckout();
              }}
              className="w-full bg-onyx rounded-[11px] px-4 py-3 flex items-center justify-between relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative z-10 text-left">
                <p className="text-white font-serif font-bold text-sm tracking-wide">Unlock 15-Page Deep Insight</p>
                <p className="text-[10px] text-primary-light uppercase tracking-wider font-medium">One-time payment</p>
              </div>
              <div className="relative z-10 bg-white text-onyx px-4 py-1.5 rounded-lg font-bold text-sm group-hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-lg ml-2 whitespace-nowrap">
                $14.99 <span className="text-lg leading-none mb-0.5">➔</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
