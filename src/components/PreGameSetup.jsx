import React, { useMemo, useState } from 'react';

export default function PreGameSetup({ pieces, points, onApplyUpgrade, onStart }) {
  const [side, setSide] = useState('white');
  const myPieces = useMemo(() => pieces.filter((p) => p.color === side), [pieces, side]);
  const [selectedId, setSelectedId] = useState(null);
  const selected = myPieces.find((p) => p.id === selectedId) || null;

  const upgrades = [
    { id: 'addKnightMove', name: 'Empower: +Knight Move', cost: 12 },
    { id: 'jumper', name: 'Jumper (Ignore Blockers)', cost: 15 },
    { id: 'teleportOnce', name: 'Teleport (once)', cost: 20 },
    { id: 'shield', name: 'Shield', cost: 10 },
    { id: 'promotePawn', name: 'Promote Pawn -> Knight', cost: 8 },
  ];

  const title = (p) => `${p.color} ${({ P:'Pawn', N:'Knight', B:'Bishop', R:'Rook', Q:'Queen', K:'King' })[p.type]}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pre-game Setup</h3>
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setSide('white')} className={`px-2 py-1 rounded ${side==='white'?'bg-neutral-100 text-neutral-900':'bg-neutral-800 text-neutral-300'}`}>White</button>
              <button onClick={() => setSide('black')} className={`px-2 py-1 rounded ${side==='black'?'bg-neutral-100 text-neutral-900':'bg-neutral-800 text-neutral-300'}`}>Black</button>
            </div>
          </div>
          <div className="text-neutral-400 text-sm mt-1">Spend your starting points to upgrade your lineup before the match.</div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {myPieces.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`p-3 rounded-lg border ${selectedId===p.id? 'border-sky-500 bg-sky-500/10' : 'border-neutral-800 bg-neutral-950'} text-left`}
              >
                <div className="font-medium">{title(p)}</div>
                <div className="text-xs text-neutral-500 mt-1">Abilities: {[
                  p.abilities.addKnightMove && 'K+',
                  p.abilities.jumper && 'Jumper',
                  p.abilities.teleportOnce && 'TP',
                  p.abilities.shield && 'Shield',
                ].filter(Boolean).join(', ') || 'None'}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Your Points</h4>
            <div className="text-sm">White: {points.white} • Black: {points.black}</div>
          </div>

          <div className="mt-3">
            <div className="text-xs text-neutral-400 mb-2">Select a piece, then apply an upgrade:</div>
            <div className="space-y-2">
              {upgrades.map((u) => (
                <div key={u.id} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{u.name}</div>
                    <div className="text-xs text-neutral-400">Cost: {u.cost} pts</div>
                  </div>
                  <button
                    className="px-3 py-1.5 rounded bg-neutral-100 text-neutral-900 hover:bg-white disabled:opacity-50"
                    onClick={() => {
                      if (!selected) return;
                      const res = onApplyUpgrade(selected.id, u.id);
                      if (!res?.ok) {
                        alert(res?.message || 'Could not apply upgrade.');
                      }
                    }}
                    disabled={!selected}
                  >Apply</button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={onStart} className="mt-4 w-full px-4 py-2 rounded-lg bg-emerald-500 text-neutral-900 font-semibold hover:bg-emerald-400">Start Game</button>
        </div>
      </div>
    </div>
  );
}
