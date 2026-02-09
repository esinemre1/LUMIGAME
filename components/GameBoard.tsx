
import React, { useState, useEffect, useCallback } from 'react';
import { CellData, CellState, LevelConfig, GameState, Language } from '../types';
import Cell from './Cell';
import { generateSeededLevel, translations } from '../services/levelService';

const getRegionColor = (index: number) => {
  const baseColors = [
    'rgba(37, 99, 235, 0.6)',   // Canlı Mavi
    'rgba(220, 38, 38, 0.6)',   // Keskin Kırmızı
    'rgba(22, 163, 74, 0.6)',   // Koyu Yeşil
    'rgba(147, 51, 234, 0.6)',  // Derin Mor
    'rgba(234, 88, 12, 0.6)',   // Turuncu
    'rgba(219, 39, 119, 0.6)',  // Sıcak Pembe
    'rgba(13, 148, 136, 0.6)',  // Teal / Turkuaz
    'rgba(202, 138, 4, 0.6)',   // Altın / Sarı
    'rgba(79, 70, 229, 0.6)',   // Çivit Mavisi
    'rgba(180, 83, 9, 0.6)',    // Kehribar / Kahve
  ];
  return baseColors[index % baseColors.length];
};

interface GameBoardProps {
  language: Language;
}

type PlacementMode = 'ORB' | 'BLOCK';

const GameBoard: React.FC<GameBoardProps> = ({ language }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedLevel = localStorage.getItem('lumina-level');
    return {
      grid: [],
      level: null,
      status: 'loading',
      moves: 0,
      currentLevel: savedLevel ? parseInt(savedLevel) : 1,
    };
  });
  const [placementMode, setPlacementMode] = useState<PlacementMode>('ORB');
  const [showRules, setShowRules] = useState(false);
  const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState(false);

  const t = translations[language];

  const initLevel = useCallback((lvl: number) => {
    setGameState(prev => ({ ...prev, status: 'loading', moves: 0 }));
    localStorage.setItem('lumina-level', lvl.toString());
    
    const level = generateSeededLevel(lvl);
    
    const initialGrid: CellData[][] = Array.from({ length: level.size }, (_, r) =>
      Array.from({ length: level.size }, (_, c) => {
        const scanner = level.scanners.find(s => s.row === r && s.col === c);
        return {
          id: `${r}-${c}`,
          row: r,
          col: c,
          regionId: level.regions[r][c],
          state: CellState.EMPTY,
          scannerValue: scanner ? scanner.value : null,
          isError: false,
        };
      })
    );

    setGameState(prev => ({
      ...prev,
      grid: initialGrid,
      level,
      status: 'playing',
      moves: 0,
      currentLevel: lvl,
    }));
    setIsLevelSelectorOpen(false);
  }, []);

  useEffect(() => {
    initLevel(gameState.currentLevel);
  }, [initLevel]);

  const validateGrid = (grid: CellData[][]) => {
    const size = grid.length;
    const newGrid = grid.map(row => row.map(cell => ({ ...cell, isError: false })));
    let hasError = false;

    const orbPositions: { r: number, c: number }[] = [];
    grid.forEach(row => row.forEach(cell => {
      if (cell.state === CellState.ORB) orbPositions.push({ r: cell.row, c: cell.col });
    }));

    const rowCounts = new Array(size).fill(0);
    const colCounts = new Array(size).fill(0);
    const regionCounts = new Array(size).fill(0);

    orbPositions.forEach(({ r, c }) => {
      rowCounts[r]++;
      colCounts[c]++;
      regionCounts[grid[r][c].regionId]++;
    });

    orbPositions.forEach(({ r, c }) => {
      const cell = newGrid[r][c];
      let orbIsError = false;
      if (rowCounts[r] > 1 || colCounts[c] > 1 || regionCounts[cell.regionId] > 1) {
        orbIsError = true;
      }
      orbPositions.forEach(other => {
        if (r === other.r && c === other.c) return;
        if (Math.abs(r - other.r) <= 1 && Math.abs(c - other.c) <= 1) {
          orbIsError = true;
        }
      });
      if (orbIsError) {
        cell.isError = true;
        hasError = true;
      }
    });

    newGrid.forEach(row => row.forEach(cell => {
      if (cell.scannerValue !== null) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = cell.row + dr, nc = cell.col + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && grid[nr][nc].state === CellState.ORB) count++;
          }
        }
        if (count > cell.scannerValue) {
          cell.isError = true;
          hasError = true;
        }
      }
    }));

    const isWon = !hasError && orbPositions.length === size;
    return { newGrid, isWon };
  };

  const toggleCell = (r: number, c: number, modeOverride?: PlacementMode) => {
    if (gameState.status !== 'playing') return;
    setGameState(prev => {
      const newGrid = prev.grid.map(row => row.map(cell => ({...cell})));
      const cell = newGrid[r][c];
      const mode = modeOverride || placementMode;

      if (mode === 'ORB') {
        cell.state = cell.state === CellState.ORB ? CellState.EMPTY : CellState.ORB;
      } else {
        cell.state = cell.state === CellState.BLOCKED ? CellState.EMPTY : CellState.BLOCKED;
      }

      const { newGrid: validatedGrid, isWon } = validateGrid(newGrid);
      return { ...prev, grid: validatedGrid, status: isWon ? 'won' : 'playing', moves: prev.moves + 1 };
    });
  };

  if (gameState.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-h-screen overflow-hidden">
      {/* Üst Bilgi Alanı */}
      <div className="flex justify-between w-full max-w-sm mb-3 px-3 py-2 glass rounded-xl items-center gap-2 shadow-lg">
        <div className="text-left flex-1">
          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">{t.level}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => initLevel(Math.max(1, gameState.currentLevel - 1))} className="text-blue-400 p-1 active:scale-90 transition-transform">◀</button>
            <button 
              onClick={() => setIsLevelSelectorOpen(true)}
              className="px-2 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 rounded border border-blue-500/20 transition-all active:scale-95"
            >
              <p className="text-sm font-bold text-white whitespace-nowrap">{gameState.currentLevel}</p>
            </button>
            <button onClick={() => initLevel(Math.min(200, gameState.currentLevel + 1))} className="text-blue-400 p-1 active:scale-90 transition-transform">▶</button>
          </div>
        </div>
        <div className="text-center px-2">
          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">{t.moves}</p>
          <p className="text-lg font-bold text-blue-400">{gameState.moves}</p>
        </div>
        <div className="text-right flex-1">
          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold">{t.target}</p>
          <p className="text-lg font-bold text-blue-400">{gameState.level?.size}</p>
        </div>
      </div>

      {/* Oyun Izgarası */}
      <div className="relative w-full max-w-[90vw] md:max-w-md p-0.5 bg-slate-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden">
        <div 
          className="grid gap-[1px]" 
          style={{ 
            gridTemplateColumns: `repeat(${gameState.level?.size}, minmax(0, 1fr))` 
          }}
        >
          {gameState.grid.map((row, r) => 
            row.map((cell, c) => (
              <Cell 
                key={cell.id} 
                data={cell} 
                onClick={() => toggleCell(r, c)} 
                onContextMenu={(e) => { e.preventDefault(); toggleCell(r, c, 'BLOCK'); }} 
                regionColor={getRegionColor(cell.regionId)} 
              />
            ))
          )}
        </div>

        {gameState.status === 'won' && (
          <div className="absolute inset-0 bg-blue-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center z-30 animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-bold mb-1">{t.wonTitle}</h2>
            <p className="text-sm text-blue-100 mb-6">{t.wonDesc}</p>
            <div className="flex flex-col gap-2 w-full max-w-[160px]">
               {gameState.currentLevel < 200 && (
                 <button onClick={() => initLevel(gameState.currentLevel + 1)} className="py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-all active:scale-95 shadow-lg">
                    {t.nextLevel}
                 </button>
               )}
               <button onClick={() => initLevel(gameState.currentLevel)} className="py-2.5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all active:scale-95 border border-white/10">
                  {t.playAgain}
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobil Mod Seçici */}
      <div className="mt-4 flex gap-2 glass p-1 rounded-xl shadow-lg">
        <button 
          onClick={() => setPlacementMode('ORB')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all active:scale-95 ${placementMode === 'ORB' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-current opacity-80"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider">{language === 'TR' ? 'KÜRE' : 'ORB'}</span>
        </button>
        <button 
          onClick={() => setPlacementMode('BLOCK')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all active:scale-95 ${placementMode === 'BLOCK' ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
        >
          <span className="text-xl leading-none font-light">×</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">{language === 'TR' ? 'İŞARET' : 'MARK'}</span>
        </button>
      </div>

      {/* Kontroller */}
      <div className="mt-4 flex gap-3">
        <button onClick={() => initLevel(gameState.currentLevel)} className="px-5 py-2 glass hover:bg-slate-700/50 rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95 uppercase tracking-wide">{t.reset}</button>
        <button 
          onClick={() => setShowRules(true)}
          className="w-9 h-9 flex items-center justify-center glass rounded-lg hover:bg-slate-700/50 transition-all shadow-md active:scale-95"
        >
          <span className="text-lg font-bold text-blue-400">?</span>
        </button>
      </div>

      {/* Bölüm Seçici Modal */}
      {isLevelSelectorOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsLevelSelectorOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-[#1e293b] rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">
                {language === 'TR' ? 'BÖLÜM SEÇ' : 'SELECT LEVEL'}
              </h3>
              <button onClick={() => setIsLevelSelectorOpen(false)} className="text-slate-400 text-3xl active:scale-90 transition-transform">&times;</button>
            </div>
            
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 overflow-y-auto pr-2 custom-scrollbar">
              {Array.from({ length: 200 }, (_, i) => i + 1).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => initLevel(lvl)}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all active:scale-90
                    ${gameState.currentLevel === lvl 
                      ? 'bg-blue-500 text-white shadow-lg ring-2 ring-blue-300' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/5'}
                  `}
                >
                  {lvl}
                </button>
              ))}
            </div>
            
            <div className="mt-6 text-center text-[10px] text-slate-500 uppercase tracking-widest opacity-50">
              {language === 'TR' ? 'TOPLAM 200 BÖLÜM' : 'TOTAL 200 LEVELS'}
            </div>
          </div>
        </div>
      )}

      {/* Açılır Kapanır Kurallar Paneli */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-end justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRules(false)}></div>
          <div className="relative w-full max-w-md bg-[#1e293b] rounded-t-3xl p-6 pb-12 shadow-2xl border-t border-white/10 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-white uppercase tracking-widest">{t.rulesTitle}</h3>
               <button onClick={() => setShowRules(false)} className="text-slate-400 text-2xl active:scale-90 transition-transform">&times;</button>
            </div>
            <ul className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                {t.rule1}
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                {t.rule2}
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                {t.rule3}
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold">4</span>
                {t.rule4}
              </li>
            </ul>
            <button 
              onClick={() => setShowRules(false)}
              className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
