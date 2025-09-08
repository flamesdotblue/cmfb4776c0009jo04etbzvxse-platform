import React, { useMemo, useState } from 'react';
import HeroSection from './components/HeroSection';
import GameBoard from './components/GameBoard';
import UpgradeShop from './components/UpgradeShop';
import PreGameSetup from './components/PreGameSetup';

// Basic chess setup and utilities
const initialPieces = () => {
  const pieces = [];
  const add = (type, color, row, col) =>
    pieces.push({
      id: `${type}-${color}-${row}-${col}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      color,
      row,
      col,
      hasMoved: false,
      abilities: { addKnightMove: false, jumper: false, teleportOnce: false, teleportUsed: false, shield: false },
    });

  // Pawns
  for (let c = 0; c < 8; c++) add('P', 'white', 6, c);
  for (let c = 0; c < 8; c++) add('P', 'black', 1, c);
  // Rooks
  add('R', 'white', 7, 0); add('R', 'white', 7, 7);
  add('R', 'black', 0, 0); add('R', 'black', 0, 7);
  // Knights
  add('N', 'white', 7, 1); add('N', 'white', 7, 6);
  add('N', 'black', 0, 1); add('N', 'black', 0, 6);
  // Bishops
  add('B', 'white', 7, 2); add('B', 'white', 7, 5);
  add('B', 'black', 0, 2); add('B', 'black', 0, 5);
  // Queens
  add('Q', 'white', 7, 3);
  add('Q', 'black', 0, 3);
  // Kings
  add('K', 'white', 7, 4);
  add('K', 'black', 0, 4);
  return pieces;
};

const pieceValues = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function getPieceAt(pieces, r, c) {
  return pieces.find((p) => p.row === r && p.col === c);
}

function clonePieces(pieces) {
  return pieces.map((p) => ({ ...p, abilities: { ...p.abilities } }));
}

function isKingPresent(pieces, color) {
  return pieces.some((p) => p.type === 'K' && p.color === color);
}

function generateMovesForPiece(piece, pieces) {
  const moves = [];
  const occ = (r, c) => getPieceAt(pieces, r, c);
  const dir = piece.color === 'white' ? -1 : 1;

  const tryAdd = (r, c) => {
    if (!inBounds(r, c)) return;
    const target = occ(r, c);
    if (!target || target.color !== piece.color) moves.push({ r, c, capture: !!target });
  };

  const slide = (dr, dc, limit = 8, canJump = false) => {
    let r = piece.row + dr;
    let c = piece.col + dc;
    let steps = 0;
    while (inBounds(r, c) && steps < limit) {
      const target = occ(r, c);
      if (!target) {
        moves.push({ r, c, capture: false });
      } else {
        if (target.color !== piece.color) moves.push({ r, c, capture: true });
        if (!canJump) break; // if jumper, continue past piece but cannot capture past first enemy (keep simple)
      }
      r += dr; c += dc; steps += 1;
    }
  };

  const addKnight = () => {
    const ks = [
      [2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2],
    ];
    ks.forEach(([dr, dc]) => tryAdd(piece.row + dr, piece.col + dc));
  };

  switch (piece.type) {
    case 'P': {
      const forward = [piece.row + dir, piece.col];
      if (inBounds(...forward) && !occ(...forward)) moves.push({ r: forward[0], c: forward[1], capture: false });
      const startRow = piece.color === 'white' ? 6 : 1;
      const two = [piece.row + dir * 2, piece.col];
      if (piece.row === startRow && !occ(...forward) && inBounds(...two) && !occ(...two))
        moves.push({ r: two[0], c: two[1], capture: false });
      // captures
      [[dir, -1], [dir, 1]].forEach(([dr, dc]) => {
        const r = piece.row + dr, c = piece.col + dc;
        if (inBounds(r, c)) {
          const t = occ(r, c);
          if (t && t.color !== piece.color) moves.push({ r, c, capture: true });
        }
      });
      break;
    }
    case 'R': {
      slide(-1, 0, 8, piece.abilities.jumper);
      slide(1, 0, 8, piece.abilities.jumper);
      slide(0, -1, 8, piece.abilities.jumper);
      slide(0, 1, 8, piece.abilities.jumper);
      break;
    }
    case 'B': {
      slide(-1, -1, 8, piece.abilities.jumper);
      slide(-1, 1, 8, piece.abilities.jumper);
      slide(1, -1, 8, piece.abilities.jumper);
      slide(1, 1, 8, piece.abilities.jumper);
      break;
    }
    case 'Q': {
      // rook + bishop
      [-1, 1].forEach((dr) => {
        slide(dr, 0, 8, piece.abilities.jumper);
        slide(0, dr, 8, piece.abilities.jumper);
        slide(dr, dr, 8, piece.abilities.jumper);
        slide(dr, -dr, 8, piece.abilities.jumper);
      });
      break;
    }
    case 'K': {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          tryAdd(piece.row + dr, piece.col + dc);
        }
      }
      break;
    }
    case 'N': {
      addKnight();
      break;
    }
    default:
      break;
  }

  if (piece.abilities.addKnightMove) {
    addKnight();
  }

  return moves;
}

const defaultUpgrades = [
  { id: 'addKnightMove', name: 'Empower: +Knight Move', cost: 12, description: 'Adds L-shaped jumps to this piece.' },
  { id: 'jumper', name: 'Jumper (Ignore Blockers)', cost: 15, description: 'Sliding moves can jump over pieces.' },
  { id: 'teleportOnce', name: 'Teleport (once)', cost: 20, description: 'Once per game, move to any empty square.' },
  { id: 'shield', name: 'Shield', cost: 10, description: 'Negate the first capture against this piece.' },
  { id: 'promotePawn', name: 'Promote Pawn -> Knight', cost: 8, description: 'Convert a pawn into a knight immediately.' },
];

export default function App() {
  const [pieces, setPieces] = useState(initialPieces);
  const [turn, setTurn] = useState('white');
  const [selected, setSelected] = useState(null); // piece id
  const [legalMoves, setLegalMoves] = useState([]);
  const [points, setPoints] = useState({ white: 20, black: 20 });
  const [winner, setWinner] = useState(null);
  const [preGame, setPreGame] = useState(true);

  const selectedPiece = useMemo(() => pieces.find((p) => p.id === selected) || null, [pieces, selected]);

  const boardMatrix = useMemo(() => {
    const matrix = Array.from({ length: 8 }, () => Array(8).fill(null));
    pieces.forEach((p) => {
      matrix[p.row][p.col] = p;
    });
    return matrix;
  }, [pieces]);

  const onSquareClick = (r, c) => {
    if (winner) return;
    if (preGame) return;

    const piece = pieces.find((p) => p.row === r && p.col === c);

    if (selectedPiece) {
      // try move
      const found = legalMoves.find((m) => m.r === r && m.c === c);
      if (found) {
        makeMove(selectedPiece, { r, c, capture: found.capture });
        return;
      }
      // reselect if clicking same-color piece
      if (piece && piece.color === turn) {
        selectPiece(piece);
        return;
      }
      // otherwise clear selection
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    if (piece && piece.color === turn) {
      selectPiece(piece);
    }
  };

  const selectPiece = (piece) => {
    setSelected(piece.id);
    setLegalMoves(generateMovesForPiece(piece, pieces));
  };

  const makeMove = (piece, move) => {
    setPieces((prev) => {
      let next = clonePieces(prev);
      const me = next.find((p) => p.id === piece.id);
      if (!me) return prev;

      // Handle capture with shield check
      const target = getPieceAt(next, move.r, move.c);
      let captureAward = 0;
      if (target && target.color !== me.color) {
        // If target has shield, consume and cancel capture
        if (target.abilities.shield) {
          // consume shield; attack does not move to target square (keeps move? For simplicity, attacker still moves to target but target remains? That conflicts.)
          // Better: negate capture and attacker does not move.
          const tRef = next.find((p) => p.id === target.id);
          if (tRef) tRef.abilities.shield = false;
          // do not change state (no move). Keep selection and recompute legal moves
          setTimeout(() => {
            setLegalMoves(generateMovesForPiece(me, next));
          }, 0);
          return prev;
        }
        next = next.filter((p) => !(p.row === move.r && p.col === move.c));
        captureAward = pieceValues[target.type] || 0;
      }

      me.row = move.r;
      me.col = move.c;
      me.hasMoved = true;

      const nextTurn = me.color === 'white' ? 'black' : 'white';

      // Award points for capture
      if (captureAward > 0) {
        setPoints((pt) => ({ ...pt, [me.color]: pt[me.color] + captureAward }));
      }

      // Check win by king capture
      if (!isKingPresent(next, nextTurn)) {
        setWinner(me.color);
        // Win bonus
        setPoints((pt) => ({ ...pt, [me.color]: pt[me.color] + 30 }));
      } else {
        setTurn(nextTurn);
      }

      setSelected(null);
      setLegalMoves([]);
      return next;
    });
  };

  const tryTeleportSelected = (r, c) => {
    if (winner || preGame) return;
    if (!selectedPiece) return;
    if (!inBounds(r, c)) return;
    if (getPieceAt(pieces, r, c)) return; // must be empty
    if (selectedPiece.color !== turn) return;
    if (!selectedPiece.abilities.teleportOnce || selectedPiece.abilities.teleportUsed) return;

    setPieces((prev) => {
      const next = clonePieces(prev);
      const me = next.find((p) => p.id === selectedPiece.id);
      if (!me) return prev;
      me.row = r;
      me.col = c;
      me.hasMoved = true;
      me.abilities.teleportUsed = true;
      setTurn(turn === 'white' ? 'black' : 'white');
      setSelected(null);
      setLegalMoves([]);
      return next;
    });
  };

  const applyUpgrade = (pieceId, upgradeId) => {
    const upgrade = defaultUpgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return { ok: false, message: 'Invalid upgrade' };
    const p = pieces.find((x) => x.id === pieceId);
    if (!p) return { ok: false, message: 'No piece selected' };
    if (preGame === false && p.color !== turn) return { ok: false, message: 'Can only upgrade your piece on your turn' };

    // Special rules
    if (upgradeId === 'promotePawn' && p.type !== 'P') {
      return { ok: false, message: 'Promotion applies to pawns only' };
    }

    if (points[p.color] < upgrade.cost) return { ok: false, message: 'Not enough points' };

    setPieces((prev) => {
      const next = clonePieces(prev);
      const me = next.find((x) => x.id === pieceId);
      if (!me) return prev;

      if (upgradeId === 'promotePawn') {
        me.type = 'N';
      } else if (upgradeId === 'teleportOnce') {
        me.abilities.teleportOnce = true;
      } else if (upgradeId === 'shield') {
        me.abilities.shield = true;
      } else if (upgradeId === 'addKnightMove') {
        me.abilities.addKnightMove = true;
      } else if (upgradeId === 'jumper') {
        me.abilities.jumper = true;
      }
      return next;
    });

    setPoints((pt) => ({ ...pt, [p.color]: pt[p.color] - upgrade.cost }));

    return { ok: true };
  };

  const startGame = () => {
    setPreGame(false);
  };

  const resetGame = () => {
    setPieces(initialPieces());
    setTurn('white');
    setSelected(null);
    setLegalMoves([]);
    setPoints({ white: 20, black: 20 });
    setWinner(null);
    setPreGame(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Custom Chess: Points & Upgrades</h1>
            <p className="text-neutral-400">Earn points by capturing and winning. Spend points to empower your pieces before and during the match.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700">
              <div className="text-xs text-neutral-400">Turn</div>
              <div className="font-medium capitalize">{turn}{winner ? ' (game over)' : ''}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700">
              <div className="text-xs text-neutral-400">Points (White)</div>
              <div className="font-semibold">{points.white}</div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700">
              <div className="text-xs text-neutral-400">Points (Black)</div>
              <div className="font-semibold">{points.black}</div>
            </div>
            <button onClick={resetGame} className="px-3 py-2 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-white transition">Reset</button>
          </div>
        </header>

        {preGame ? (
          <PreGameSetup
            pieces={pieces}
            points={points}
            onApplyUpgrade={applyUpgrade}
            onStart={startGame}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <GameBoard
                board={boardMatrix}
                selectedId={selected}
                legalMoves={legalMoves}
                onSquareClick={onSquareClick}
                onSelectPiece={(p) => selectPiece(p)}
                onTeleportTo={tryTeleportSelected}
                canTeleport={!!(selectedPiece && selectedPiece.abilities.teleportOnce && !selectedPiece.abilities.teleportUsed)}
                winner={winner}
              />
            </div>
            <div className="lg:col-span-4">
              <UpgradeShop
                upgrades={defaultUpgrades}
                selectedPiece={selectedPiece}
                onSelectPiece={(p) => selectPiece(p)}
                onApplyUpgrade={applyUpgrade}
                points={points}
                turn={turn}
                preGame={preGame}
              />
            </div>
          </div>
        )}

        {winner && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500 text-emerald-300">
            <div className="font-semibold">{winner} wins!</div>
            <div className="text-sm">Win bonus awarded. Reset to play again.</div>
          </div>
        )}
      </div>
    </div>
  );
}
