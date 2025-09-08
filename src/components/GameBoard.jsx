import React from 'react';

function Square({ dark, onClick, isSelected, isMove, isCapture, children }) {
  const base = dark ? 'bg-neutral-800' : 'bg-neutral-700/60';
  const sel = isSelected ? 'ring-2 ring-sky-400' : '';
  const move = isMove ? (isCapture ? 'after:bg-rose-500/70' : 'after:bg-sky-400/70') : '';
  return (
    <button
      onClick={onClick}
      className={`relative w-full aspect-square ${base} ${sel} flex items-center justify-center transition`}
    >
      {isMove && (
        <span className={`absolute inset-1 rounded-md ${move} after:content-[''] after:absolute after:inset-0 after:rounded-md`} />
      )}
      {children}
    </button>
  );
}

function Piece({ piece, isSelected }) {
  const color = piece.color === 'white' ? 'text-neutral-100' : 'text-neutral-200';
  const bg = piece.color === 'white' ? 'bg-white/10' : 'bg-white/5';
  const badge = (text, cls) => (
    <span className={`text-[10px] px-1 py-0.5 rounded ${cls}`}>{text}</span>
  );
  const label = {
    P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
  }[piece.type];
  return (
    <div className={`w-11 h-11 md:w-14 md:h-14 rounded-lg ${bg} border border-white/10 flex items-center justify-center ${color} ${isSelected ? 'ring-2 ring-sky-400' : ''}`}>
      <div className="text-2xl md:text-3xl leading-none select-none">{label}</div>
      <div className="absolute top-1 left-1 flex gap-1">
        {piece.abilities.addKnightMove && badge('K+', 'bg-sky-500/20 text-sky-300 border border-sky-500/40')}
        {piece.abilities.jumper && badge('J', 'bg-violet-500/20 text-violet-300 border border-violet-500/40')}
        {piece.abilities.teleportOnce && !piece.abilities.teleportUsed && badge('TP', 'bg-amber-500/20 text-amber-300 border border-amber-500/40')}
        {piece.abilities.shield && badge('S', 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40')}
      </div>
    </div>
  );
}

export default function GameBoard({ board, selectedId, legalMoves, onSquareClick, onSelectPiece, onTeleportTo, canTeleport, winner }) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-8 gap-1 p-2 rounded-xl bg-neutral-900 border border-neutral-800">
        {board.map((row, r) => (
          <React.Fragment key={r}>
            {row.map((cell, c) => {
              const dark = (r + c) % 2 === 1;
              const isSelected = selectedId && cell && cell.id === selectedId;
              const lm = legalMoves.find((m) => m.r === r && m.c === c);
              return (
                <Square
                  key={`${r}-${c}`}
                  dark={dark}
                  isSelected={isSelected}
                  isMove={!!lm}
                  isCapture={!!(lm && lm.capture)}
                  onClick={() => onSquareClick(r, c)}
                >
                  {cell && (
                    <div onClick={(e) => { e.stopPropagation(); onSelectPiece(cell); }}>
                      <Piece piece={cell} isSelected={isSelected} />
                    </div>
                  )}
                </Square>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-neutral-400">Tip: Select a piece to view moves. Capture the opposing king to win.</div>
        <div className="flex items-center gap-2">
          <button
            disabled={!canTeleport || !selectedId || winner}
            onClick={() => {
              if (!canTeleport) return;
              // Enter teleport mode by clicking a target empty square next; for simplicity, prompt row,col
              const input = window.prompt('Teleport to (e.g., 1,1 for row 1 col 1). Rows/cols are 1-8.');
              if (!input) return;
              const parts = input.split(',').map((x) => parseInt(x.trim(), 10));
              if (parts.length !== 2 || parts.some((n) => isNaN(n) || n < 1 || n > 8)) return;
              const r = parts[0] - 1; const c = parts[1] - 1;
              onTeleportTo(r, c);
            }}
            className={`px-3 py-2 rounded-lg text-sm border border-neutral-700 ${canTeleport && !winner ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20' : 'bg-neutral-900 text-neutral-500 cursor-not-allowed'}`}
          >
            Teleport (once)
          </button>
        </div>
      </div>
    </div>
  );
}
