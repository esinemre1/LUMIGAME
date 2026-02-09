
export enum CellState {
  EMPTY = 'EMPTY',
  ORB = 'ORB',
  BLOCKED = 'BLOCKED',
}

export interface CellData {
  id: string;
  row: number;
  col: number;
  regionId: number;
  state: CellState;
  scannerValue: number | null;
  isError: boolean;
}

export interface LevelConfig {
  size: number;
  regions: number[][];
  scanners: { row: number; col: number; value: number }[];
  solution: { row: number; col: number }[];
}

export type Language = 'TR' | 'EN';

export interface GameState {
  grid: CellData[][];
  level: LevelConfig | null;
  status: 'playing' | 'won' | 'loading';
  moves: number;
  currentLevel: number;
}
