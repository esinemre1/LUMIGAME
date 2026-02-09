
import { LevelConfig, Language } from '../types';

class SeededRandom {
  seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export const generateSeededLevel = (levelIndex: number): LevelConfig => {
  const rng = new SeededRandom(levelIndex + 100);

  // 200 seviye için daha geniş bir zorluk skalası
  let size = 6;
  if (levelIndex > 20) size = 8;
  if (levelIndex > 60) size = 10;
  if (levelIndex > 130) size = 12;

  let solution: { row: number; col: number }[] = [];
  let success = false;
  let attempts = 0;

  // Find a valid solution that respects row, col, and ADJACENCY constraints
  while (!success && attempts < 2000) {
    attempts++;
    solution = [];
    const availableCols = Array.from({ length: size }, (_, i) => i);

    for (let r = 0; r < size; r++) {
      const shuffledCols = [...availableCols].sort(() => rng.next() - 0.5);
      let found = false;
      for (const c of shuffledCols) {
        // Check adjacency with existing solution orbs
        const isAdjacent = solution.some(s =>
          Math.abs(s.row - r) <= 1 && Math.abs(s.col - c) <= 1
        );
        if (!isAdjacent) {
          solution.push({ row: r, col: c });
          availableCols.splice(availableCols.indexOf(c), 1);
          found = true;
          break;
        }
      }
      if (!found) break; // Retry the whole grid
    }
    if (solution.length === size) success = true;
  }

  // Region generation (BFS ensures connectivity)
  const regions: number[][] = Array.from({ length: size }, () => Array(size).fill(-1));
  const queue: { r: number; c: number; regId: number }[] = [];

  solution.forEach((pos, idx) => {
    regions[pos.row][pos.col] = idx;
    queue.push({ r: pos.row, c: pos.col, regId: idx });
  });

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  while (queue.length > 0) {
    const currentIdx = Math.floor(rng.next() * queue.length);
    const { r, c, regId } = queue.splice(currentIdx, 1)[0];

    const sortedDirs = [...dirs].sort(() => rng.next() - 0.5);
    for (const [dr, dc] of sortedDirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && regions[nr][nc] === -1) {
        regions[nr][nc] = regId;
        queue.push({ r: nr, c: nc, regId });
      }
    }
  }

  // Scanner generation - Level ilerledikçe tarayıcı sayısı biraz azalabilir (daha zor)
  const scanners: { row: number; col: number; value: number }[] = [];
  const scannerLimit = Math.max(5, Math.floor(size * 1.8) - Math.floor(levelIndex / 50));
  let scanAttempts = 0;
  while (scanners.length < scannerLimit && scanAttempts < 300) {
    scanAttempts++;
    const r = Math.floor(rng.next() * size);
    const c = Math.floor(rng.next() * size);

    if (!solution.some(s => s.row === r && s.col === c) && !scanners.some(s => s.row === r && s.col === c)) {
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          if (solution.some(s => s.row === r + dr && s.col === c + dc)) count++;
        }
      }
      scanners.push({ row: r, col: c, value: count });
    }
  }

  return { size, regions, scanners, solution };
};

export const translations = {
  TR: {
    title: "LUMI IZGARASI",
    moves: "Hamleler",
    target: "Hedef",
    level: "Bölüm",
    next: "Sonraki",
    prev: "Önceki",
    reset: "Sıfırla",
    hint: "İpucu",
    wonTitle: "Izgara Onarıldı!",
    wonDesc: "Lumina küreleri kusursuz bir dengede.",
    playAgain: "Tekrar Oyna",
    nextLevel: "Sonraki Bölüm",
    loading: "Yeni ızgara inşa ediliyor...",
    rulesTitle: "Izgara Kuralları",
    rule1: "Her satır, sütun ve renkli bölge tam olarak bir küre içermelidir.",
    rule2: "Küreler çapraz dahil birbirine değemez (çevresindeki 8 hücre boş kalmalı).",
    rule3: "Sayılar tarayıcılardır: Etrafındaki 8 hücredeki küre sayısını gösterir. '0' ise etrafı tamamen boştur.",
    rule4: "Tıklayarak küre yerleştirin, mod değiştirerek veya sağ tıkla boş yerleri (×) işaretleyin.",
    allDone: "Tüm küreler yerleştirilmiş!",
    hintRow: (r: number) => `${r}. satırda bir şeyler eksik...`,
    hintCol: (c: number) => `${c}. sütunu kontrol etmelisin.`,
    hintGeneric: "Dikkatli bakarsan çözüm orada."
  },
  EN: {
    title: "LUMI GRID",
    moves: "Moves",
    target: "Target",
    level: "Level",
    next: "Next",
    prev: "Prev",
    reset: "Reset",
    hint: "Hint",
    wonTitle: "Grid Restored!",
    wonDesc: "The Lumina orbs are in perfect balance.",
    playAgain: "Play Again",
    nextLevel: "Next Level",
    loading: "Building new grid...",
    rulesTitle: "Grid Rules",
    rule1: "Each row, column, and colored region must have exactly one orb.",
    rule2: "Orbs cannot touch each other, even diagonally (8 adjacent cells must be empty).",
    rule3: "Numbers are scanners: they show orb counts in 8 neighbors. '0' means the area is clear.",
    rule4: "Click to place orbs, switch modes or right-click to mark empty spots (×).",
    allDone: "All orbs seem to be placed!",
    hintRow: (r: number) => `Something is missing in row ${r}...`,
    hintCol: (c: number) => `Check column ${c} carefully.`,
    hintGeneric: "The solution is there if you look closely."
  }
};

export const getLocalHint = (currentGrid: any, level: LevelConfig, lang: Language) => {
  const missing = level.solution.find(sol => {
    return !currentGrid.some((row: any) =>
      row.some((cell: any) => cell.row === sol.row && cell.col === sol.col && cell.state === 'ORB')
    );
  });

  const t = translations[lang];
  if (!missing) return t.allDone;

  const rand = Math.random();
  if (rand < 0.4) return t.hintRow(missing.row + 1);
  if (rand < 0.8) return t.hintCol(missing.col + 1);
  return t.hintGeneric;
};
