
import React from 'react';
import { CellData, CellState } from '../types';

interface CellProps {
  data: CellData;
  onClick: (e: React.MouseEvent | React.TouchEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  regionColor: string;
}

const Cell: React.FC<CellProps> = ({ data, onClick, onContextMenu, regionColor }) => {
  const renderContent = () => {
    if (data.state === CellState.ORB) {
      return (
        <div className={`w-[70%] h-[70%] rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center
          ${data.isError ? 'bg-red-500 animate-pulse' : 'bg-white shadow-white/20 border-2 border-blue-400'}`}>
          <div className="w-[30%] h-[30%] bg-blue-400 rounded-full opacity-60"></div>
        </div>
      );
    }
    if (data.state === CellState.BLOCKED) {
      return <div className="text-white/60 text-lg md:text-xl font-light select-none">×</div>;
    }
    if (data.scannerValue !== null) {
      // Rakamların daha belirgin olması için beyaz renk ve shadow eklendi
      return (
        <div className="text-white font-black text-sm md:text-base select-none drop-shadow-md">
          {data.scannerValue}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      style={{ backgroundColor: regionColor }}
      className={`
        relative w-full aspect-square flex items-center justify-center cursor-pointer 
        transition-all duration-200 border border-black/10 hover:brightness-110 active:scale-95
        ${data.isError ? 'ring-2 ring-red-400 ring-inset' : ''}
      `}
    >
      {renderContent()}
    </div>
  );
};

export default Cell;
