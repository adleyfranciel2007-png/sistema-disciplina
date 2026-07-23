import React from 'react';
import { Trophy, Lock } from 'lucide-react';
import { Panel, SectionTitle } from './ui.jsx';
import { ACHIEVEMENTS, GOLD } from '../lib/constants.js';

export default function ConquistasTab({ unlocked }) {
  return (
    <Panel glow={GOLD}>
      <SectionTitle icon={Trophy} color={GOLD}>Conquistas ({unlocked.length}/{ACHIEVEMENTS.length})</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div key={a.id} className="p-3 border flex gap-3 items-start" style={{ borderColor: isUnlocked ? GOLD + '55' : '#1c2536', background: isUnlocked ? GOLD + '0d' : 'transparent' }}>
              {isUnlocked ? <Trophy size={20} color={GOLD} className="shrink-0 mt-0.5" /> : <Lock size={20} color="#475569" className="shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm" style={{ color: isUnlocked ? GOLD : '#94a3b8' }}>{a.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{isUnlocked ? a.desc : '???'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
