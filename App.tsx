
import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import { Language } from './types';
import { translations } from './services/levelService';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('lumina-lang');
    return (saved as Language) || 'TR';
  });

  useEffect(() => {
    localStorage.setItem('lumina-lang', lang);
  }, [lang]);

  const t = translations[lang];

  return (
    <div className="h-screen w-screen bg-[#0f172a] selection:bg-blue-500/30 flex flex-col overflow-hidden fixed inset-0">
      {/* Arkaplan Efektleri */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Dil Seçimi ve Üst Bar */}
      <nav className="relative z-20 flex justify-between items-center p-3">
        <div className="text-[10px] font-bold text-slate-500 tracking-[0.2em] opacity-40 uppercase">v2.6 MOBILE</div>
        <div className="flex glass rounded-lg overflow-hidden p-0.5 shadow-xl">
          <button
            onClick={() => setLang('TR')}
            className={`px-3 py-1 text-[9px] font-bold transition-all ${lang === 'TR' ? 'bg-blue-500 text-white rounded-md shadow-sm' : 'text-slate-500 hover:text-white'}`}
          >
            TR
          </button>
          <button
            onClick={() => setLang('EN')}
            className={`px-3 py-1 text-[9px] font-bold transition-all ${lang === 'EN' ? 'bg-blue-500 text-white rounded-md shadow-sm' : 'text-slate-500 hover:text-white'}`}
          >
            EN
          </button>
        </div>
      </nav>

      {/* Ana Başlık */}
      <header className="relative pt-1 pb-2 text-center px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-blue-300 via-blue-500 to-indigo-600">
          {t.title}
        </h1>
        <p className="mt-0.5 text-slate-500 font-medium tracking-[0.3em] text-[8px] md:text-[10px] uppercase opacity-80">
          {lang === 'TR' ? 'Mantık • Strateji • Hassasiyet' : 'Logic • Strategy • Precision'}
        </p>
      </header>

      {/* Oyun Alanı */}
      <main className="relative z-10 container mx-auto px-2 flex-grow flex flex-col items-center justify-start py-2">
        <GameBoard language={lang} />
      </main>

      {/* Alt Bilgi */}
      <footer className="relative mt-auto py-2 text-center text-slate-600 text-[8px] uppercase tracking-widest opacity-30">
        © 2025 LUMI GRID
      </footer>
    </div>
  );
};

export default App;
