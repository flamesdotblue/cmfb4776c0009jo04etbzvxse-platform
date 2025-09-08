import React, { useState } from 'react';

export default function UpgradeShop({ upgrades, selectedPiece, onSelectPiece, onApplyUpgrade, points, turn, preGame }) {
  const [message, setMessage] = useState('');

  const apply = async (u) => {
    if (!selectedPiece) {
      setMessage('Select a piece first.');
      return;
    }
    const res = onApplyUpgrade(selectedPiece.id, u.id);
    if (!res || !res.ok) {
      setMessage(res?.message || 'Could not apply upgrade.');
    } else {
      setMessage('Upgrade applied!');
      setTimeout(() => setMessage(''), 1200);
    }
  };

  const pieceTitle = selectedPiece ? `${selectedPiece.color} ${{
    P: 'Pawn', N: 'Knight', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King',
  }[selectedPiece.type]}` : 'None';

  return (
    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Upgrades {preGame ? '(Pre-game)' : '(Mid-game)'}</h3>
        <div className="text-xs text-neutral-400">Your points — White: {points.white} • Black: {points.black}</div>
      </div>

      <div className="mt-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800">
        <div className="text-xs text-neutral-400">Selected piece</div>
        <div className="font-medium">{pieceTitle}</div>
        {!selectedPiece && <div className="text-xs text-neutral-500 mt-1">Click a piece on the board to select it.</div>}
        {selectedPiece && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-neutral-300">
            <span className="px-2 py-1 rounded bg-neutral-800/60">K+: {selectedPiece.abilities.addKnightMove ? 'Yes' : 'No'}</span>
            <span className="px-2 py-1 rounded bg-neutral-800/60">Jumper: {selectedPiece.abilities.jumper ? 'Yes' : 'No'}</span>
            <span className="px-2 py-1 rounded bg-neutral-800/60">Teleport: {selectedPiece.abilities.teleportOnce ? (selectedPiece.abilities.teleportUsed ? 'Used' : 'Ready') : 'No'}</span>
            <span className="px-2 py-1 rounded bg-neutral-800/60">Shield: {selectedPiece.abilities.shield ? 'Yes' : 'No'}</span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {upgrades.map((u) => (
          <div key={u.id} className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-start gap-3">
            <div className="flex-1">
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-neutral-400">{u.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-neutral-300">{u.cost} pts</div>
              <button
                onClick={() => apply(u)}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedPiece || (!preGame && selectedPiece.color !== turn)}
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className="mt-3 text-sm text-amber-300">{message}</div>
      )}

      <div className="mt-4 text-xs text-neutral-500">
        Notes:
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>Capture the opposing King to win. Winners gain a bonus.</li>
          <li>Shield cancels the first capture against a piece.</li>
          <li>Jumper lets sliding pieces move through blockers.</li>
          <li>Empower adds Knight moves in addition to normal movement.</li>
          <li>Teleport is once per piece; use the button under the board on your turn.</li>
        </ul>
      </div>
    </div>
  );
}
