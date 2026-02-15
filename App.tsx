
import React, { useState, useEffect } from 'react';
import { 
  Shield, Copy, Check, RefreshCw, AlertTriangle, Eye, EyeOff, 
  Terminal, Info, Save, Zap, Search, MapPin, BarChart3, Fingerprint,
  Package, LayoutGrid, List, Download, ClipboardCheck, ExternalLink,
  ChevronRight, Sparkles
} from 'lucide-react';
import { ObfuscationResult, ObfuscationInput, AddressAnalysis, GroundingSource } from './types';
import { analyzeAndObfuscate } from './services/geminiService';

const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Strict`;
};

const getCookie = (name: string) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

const App: React.FC = () => {
  const [input, setInput] = useState<ObfuscationInput>(() => {
    const saved = getCookie('user_obfuscation_input');
    return saved ? JSON.parse(saved) : { name: '', address: '' };
  });

  const [results, setResults] = useState<ObfuscationResult[]>([]);
  const [analysis, setAnalysis] = useState<AddressAnalysis | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isAllCopied, setIsAllCopied] = useState(false);
  const [showInvisible, setShowInvisible] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<number>(0);

  useEffect(() => {
    if (input.name || input.address) {
      setCookie('user_obfuscation_input', JSON.stringify(input), 30);
      setIsSaved(true);
      const timer = setTimeout(() => setIsSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [input]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(err => {
      console.error('Copy failed', err);
    });
  };

  const copyAllResults = () => {
    const allText = results.map(r => r.version).join('\n---\n');
    navigator.clipboard.writeText(allText).then(() => {
      setIsAllCopied(true);
      setTimeout(() => setIsAllCopied(false), 3000);
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.name || !input.address) {
      setError("Input nama dan alamat wajib diisi.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeAndObfuscate(input);
      setResults(data.variations);
      setAnalysis(data.analysis);
      setSources(data.sources || []);
      setSelectedPreview(0);
    } catch (err) {
      setError("Terjadi kesalahan saat menghubungi mesin AI. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return 'emerald';
    if (score > 50) return 'indigo';
    return 'amber';
  };

  const highlightInvisibles = (text: string) => {
    if (!showInvisible) return text;
    return text.split('').map((char, i) => {
      const code = char.charCodeAt(0);
      // Zero width characters
      if (code === 0x200B || code === 0xFEFF || code === 0x2060) {
        return <span key={i} className="bg-rose-500 text-white rounded px-0.5 mx-0.5 text-[10px] font-black animate-pulse select-none" title="Invisible Character Inserted">ZW</span>;
      }
      // Cyrillic homoglyphs
      if (code >= 0x0400 && code <= 0x04FF) {
        return <span key={i} className="text-blue-600 font-black underline decoration-2 decoration-blue-300" title="Visual Homoglyph Character">
          {char}
        </span>;
      }
      return char;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center py-10 px-4 md:px-8 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header Section */}
      <header className="w-full max-w-5xl text-center mb-16">
        <div className="relative inline-flex mb-8 group">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse"></div>
          <div className="relative p-6 bg-zinc-900 rounded-[2rem] text-white shadow-2xl border border-white/10">
            <Fingerprint size={48} className="text-indigo-400" />
          </div>
        </div>
        <h1 className="text-6xl font-black text-zinc-900 tracking-tighter mb-4 italic">
          OBFUSCATE<span className="text-indigo-600">.ID</span>
        </h1>
        <p className="text-zinc-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Mesin penyamaran data berbasis AI. Ciptakan variasi identitas unik yang kebal terhadap deteksi duplikasi sistem logistik.
        </p>
      </header>

      <main className="w-full max-w-7xl space-y-12">
        {/* Control Center */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <section className="xl:col-span-8 bg-white rounded-[3rem] shadow-2xl shadow-zinc-200/50 border border-zinc-200 p-8 md:p-12 relative overflow-hidden group/card">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover/card:bg-indigo-100 transition-colors"></div>
            
            <div className={`absolute top-8 right-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isSaved ? 'text-emerald-500' : 'text-zinc-300'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isSaved ? 'bg-emerald-500 animate-ping' : 'bg-zinc-300'}`}></div>
              {isSaved ? 'Auto-Sync Active' : 'Persistent Offline'}
            </div>

            <form onSubmit={handleGenerate} className="space-y-10 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                    <Zap size={14} className="text-indigo-500" /> Input Nama
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={input.name}
                      onChange={(e) => setInput({ ...input, name: e.target.value })}
                      className="w-full px-7 py-5 rounded-2xl border-2 border-zinc-100 bg-zinc-50 focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-zinc-900 text-lg placeholder:text-zinc-300"
                      placeholder="e.g. Budi Santoso"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                    <Search size={14} className="text-indigo-500" /> Input Alamat
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={input.address}
                      onChange={(e) => setInput({ ...input, address: e.target.value })}
                      className="w-full px-7 py-5 rounded-2xl border-2 border-zinc-100 bg-zinc-50 focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-zinc-900 text-lg placeholder:text-zinc-300"
                      placeholder="e.g. Jl. Merdeka No. 123"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full py-6 bg-zinc-900 hover:bg-indigo-600 text-white font-black rounded-2xl transition-all shadow-2xl shadow-zinc-900/20 active:scale-[0.98] disabled:opacity-50 overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-center gap-4 tracking-[0.3em] uppercase text-sm">
                  {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} className="group-hover:animate-pulse" />}
                  Generate Evasion Profile
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </form>
          </section>

          {/* AI Intelligence Sidebar */}
          <section className="xl:col-span-4 bg-indigo-950 text-white rounded-[3rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden h-full flex flex-col">
            <div className="absolute -right-20 -bottom-20 opacity-5">
              <Shield size={320} />
            </div>
            
            <h3 className="text-2xl font-black mb-8 flex items-center gap-4 relative z-10 italic tracking-tighter">
              <BarChart3 className="text-indigo-400" /> SYSTEM INSIGHTS
            </h3>
            
            {!analysis ? (
              <div className="space-y-6 opacity-40 flex-1 relative z-10">
                <p className="text-sm font-medium italic">Menunggu input data untuk analisis integrasi sistem...</p>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-indigo-900/50 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-indigo-700 animate-[loading_2s_infinite_ease-in-out]"></div>
                  </div>
                  <div className="h-3 w-3/4 bg-indigo-900/50 rounded-full"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in zoom-in duration-700 relative z-10 flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] block">Address Verification</label>
                  <div className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl text-xs font-black border ${analysis.isValid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                    <div className={`w-2 h-2 rounded-full ${analysis.isValid ? 'bg-emerald-400' : 'bg-rose-400'} shadow-[0_0_10px_rgba(52,211,153,0.5)]`}></div>
                    {analysis.isValid ? 'VERIFIED INDO LOGISTICS' : 'MANUAL VALIDATION REQ'}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] block">Standardized Payload</label>
                  <div className="text-sm font-bold bg-white/5 p-5 rounded-2xl border border-white/10 leading-relaxed italic text-indigo-100 backdrop-blur-sm">
                    {analysis.standardized}
                  </div>
                </div>

                {sources.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] block">Grounding Data (Web)</label>
                    <div className="grid grid-cols-1 gap-2">
                      {sources.map((src, i) => (
                        <a 
                          key={i} 
                          href={src.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group/link"
                        >
                          <span className="text-[10px] font-bold text-indigo-200 truncate pr-4">{src.title || src.uri}</span>
                          <ExternalLink size={12} className="text-indigo-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-10 pt-8 border-t border-white/10 relative z-10">
               <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Protocol Status</div>
               <div className="flex items-center justify-between">
                 <span className="text-2xl font-black text-white italic tracking-tighter uppercase">Stealth-Mode</span>
                 <div className="flex gap-1">
                   {[1,2,3,4].map(i => <div key={i} className="w-1.5 h-4 bg-indigo-500 rounded-sm animate-pulse" style={{animationDelay: `${i*200}ms`}}></div>)}
                 </div>
               </div>
            </div>
          </section>
        </div>

        {/* Results Area */}
        {results.length > 0 && (
          <section className="space-y-10 pt-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-8">
                <h2 className="text-4xl font-black text-zinc-900 italic tracking-tighter flex items-center gap-4">
                  EVASION VARIANTS
                  <div className="h-10 w-px bg-zinc-200"></div>
                  <span className="text-sm font-black bg-zinc-900 text-white px-4 py-1.5 rounded-full not-italic tracking-normal">
                    {results.length} PROFILES
                  </span>
                </h2>
                
                <div className="hidden sm:flex p-1.5 bg-zinc-200 rounded-2xl shadow-inner border border-zinc-100">
                  <button 
                    onClick={() => setViewMode('grid')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-indigo-600' : 'text-zinc-500 hover:text-zinc-800'}`}
                  >
                    <LayoutGrid size={16} /> Grid
                  </button>
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-indigo-600' : 'text-zinc-500 hover:text-zinc-800'}`}
                  >
                    <List size={16} /> List
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={copyAllResults}
                  className={`flex items-center gap-3 px-7 py-3.5 rounded-2xl text-xs font-black transition-all border-2 shadow-sm ${isAllCopied ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-100' : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-900 active:scale-[0.98]'}`}
                >
                  {isAllCopied ? <ClipboardCheck size={18} /> : <Download size={18} />}
                  {isAllCopied ? 'ALL PROFILES COPIED' : 'BATCH EXPORT ALL'}
                </button>
                <button
                  onClick={() => setShowInvisible(!showInvisible)}
                  className={`flex items-center gap-3 px-7 py-3.5 rounded-2xl text-xs font-black transition-all shadow-xl shadow-zinc-200 hover:shadow-indigo-100 active:scale-[0.98] ${
                    showInvisible ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-white hover:bg-indigo-600'
                  }`}
                >
                  {showInvisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  {showInvisible ? 'HIDE DEBUG LAYER' : 'REVEAL PAYLOAD BITS'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* List of Variations */}
              <div className={`lg:col-span-7 space-y-6 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 space-y-0' : ''}`}>
                {results.map((res, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedPreview(idx)}
                    className={`group relative bg-white rounded-[2.5rem] border-3 p-8 transition-all duration-500 cursor-pointer ${
                      selectedPreview === idx 
                        ? 'border-indigo-500 shadow-2xl shadow-indigo-100 -translate-y-2' 
                        : 'border-zinc-100 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-1.5 rounded-full border-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                          res.evasionScore > 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          res.evasionScore > 50 ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          <div className={`w-2 h-2 rounded-full bg-current animate-pulse`}></div>
                          Evasion Level: {res.evasionScore}%
                        </div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                          Complexity: <span className="text-zinc-900">{res.complexity}</span>
                        </span>
                      </div>
                      <div className="p-2 bg-zinc-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                         <ChevronRight size={16} className="text-indigo-500" />
                      </div>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 group-hover:bg-white group-hover:border-indigo-100 p-6 rounded-3xl mb-6 transition-all">
                      <p className="mono text-zinc-900 text-sm font-bold leading-relaxed break-all">
                        {highlightInvisibles(res.version)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {res.techniques.map((t, i) => (
                          <span key={i} className="text-[8px] font-black bg-zinc-100 text-zinc-500 px-3 py-1 rounded-lg uppercase border border-zinc-200 tracking-tighter">
                            {t}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(res.version, idx);
                        }}
                        className={`group/copy flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl text-xs font-black transition-all ${
                          copiedIndex === idx 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
                            : 'bg-indigo-50 text-indigo-700 hover:bg-zinc-900 hover:text-white'
                        }`}
                      >
                        {copiedIndex === idx ? <Check size={16} strokeWidth={3} /> : <Copy size={16} className="group-hover/copy:scale-110 transition-transform" />}
                        {copiedIndex === idx ? 'COPIED!' : 'COPY DATA'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Physical Preview (Stays sticky) */}
              <div className="lg:col-span-5 relative h-full">
                <div className="sticky top-10 space-y-8">
                  <div className="bg-white rounded-[3.5rem] border-3 border-zinc-100 p-10 shadow-2xl relative overflow-hidden group/label">
                    <div className="absolute top-8 right-12 text-[10px] font-black text-zinc-200 uppercase tracking-[0.4em] pointer-events-none italic">
                      Live Label Preview
                    </div>
                    
                    <div className="flex items-center gap-5 mb-12 border-b-2 border-zinc-50 pb-8">
                      <div className="p-4 bg-zinc-900 text-white rounded-3xl shadow-xl transform group-hover/label:rotate-3 transition-transform">
                        <Package size={32} />
                      </div>
                      <div>
                        <h4 className="font-black text-zinc-900 uppercase tracking-tighter text-2xl leading-none mb-1">LOGISTICS_PRO</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">SID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Label Mockup */}
                    <div className="bg-zinc-50 border-2 border-zinc-200 rounded-[2rem] p-8 font-mono relative overflow-hidden shadow-inner">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-900 flex items-center justify-center -translate-y-1/2 translate-x-1/2 rotate-45 border-b-4 border-indigo-500">
                        <span className="text-[9px] text-white font-black -rotate-45 mb-6 pr-2 tracking-widest">ORIGIN</span>
                      </div>
                      
                      <div className="space-y-8">
                        <div>
                          <label className="text-[10px] font-black text-zinc-400 mb-3 uppercase tracking-[0.3em] block">Recipient Information</label>
                          <div className="text-lg font-black text-zinc-900 bg-white p-5 rounded-2xl border-2 border-zinc-100 shadow-sm leading-tight">
                            {results[selectedPreview]?.version.split('\n')[0] || input.name}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-black text-zinc-400 mb-3 uppercase tracking-[0.3em] block">Delivery Coordinates</label>
                          <div className="text-sm font-bold text-zinc-700 bg-white p-5 rounded-2xl border-2 border-zinc-100 shadow-sm leading-relaxed min-h-[120px]">
                            {results[selectedPreview]?.version.split('\n').slice(1).join('\n') || input.address}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end border-t-4 border-zinc-200 pt-10 mt-10 border-dotted">
                        <div className="space-y-2">
                          <div className="w-40 h-8 bg-zinc-200 rounded-lg animate-pulse"></div>
                          <div className="w-24 h-4 bg-zinc-100 rounded-md"></div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-zinc-900 mb-1 uppercase">EXPRESS DELIVERY</div>
                          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Track ID: X-2204-ZB</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 p-8 bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100 relative group/report">
                      <div className="absolute -right-4 -top-4 w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-indigo-100 text-indigo-600 shadow-md transform group-hover/report:scale-110 transition-transform">
                        <Info size={24} />
                      </div>
                      <h5 className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.3em] mb-4">Payload Integrity Report</h5>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black text-indigo-900/60 uppercase">
                            <span>Evasion Strength</span>
                            <span>{results[selectedPreview]?.evasionScore}%</span>
                          </div>
                          <div className="h-2.5 w-full bg-indigo-200/50 rounded-full overflow-hidden p-0.5">
                            <div 
                              className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                              style={{ width: `${results[selectedPreview]?.evasionScore}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-[11px] text-indigo-600/90 leading-relaxed font-bold italic bg-white/40 p-3 rounded-xl">
                          "Profil ini menggunakan teknik hibrida untuk merusak sidik jari bit alamat tanpa mengorbankan keterbacaan oleh kurir manusia."
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Usage Tips */}
                  <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 flex items-start gap-6 border border-white/5">
                    <div className="p-4 bg-white/10 rounded-2xl">
                      <Terminal size={24} className="text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Power User Tip</p>
                      <p className="text-xs font-bold leading-relaxed text-zinc-300">
                        Klik varian di list untuk memperbarui tampilan label secara real-time. Salin profil dengan skor tertinggi untuk keamanan maksimal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-32 py-16 border-t border-zinc-200 w-full max-w-7xl flex flex-col lg:flex-row justify-between items-center gap-10">
        <div className="flex flex-col items-center lg:items-start gap-3">
          <p className="text-zinc-400 font-black text-xs tracking-[0.4em] uppercase">
            OBFUSCATE.ID // SECURE LOGISTICS PROTOCOL 2025
          </p>
          <p className="text-zinc-400 text-[10px] font-medium italic">
            Developed for Indonesian data privacy and delivery management standard.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-10">
          {['Documentation', 'Developer API', 'Privacy & Cookies', 'Security Audit'].map(link => (
            <a key={link} href="#" className="text-zinc-400 text-xs font-black uppercase tracking-widest hover:text-indigo-600 transition-colors">
              {link}
            </a>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer">
             <Info size={18} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all cursor-pointer">
             <Shield size={18} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
