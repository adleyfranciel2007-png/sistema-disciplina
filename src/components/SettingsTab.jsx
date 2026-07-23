import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Panel, SectionTitle } from './ui.jsx';
import { CYAN } from '../lib/constants.js';

export default function SettingsTab({ settings, updateSetting }) {
  return (
    <Panel glow={CYAN}>
      <SectionTitle icon={SettingsIcon} color={CYAN}>Configurações</SectionTitle>
      <div className="flex flex-col gap-4">
        <label className="text-xs" style={{ color: '#64748b' }}>
          XP por missão concluída (estudo/treino)
          <input type="number" min="1" value={settings.xpPerTask} onChange={e => updateSetting('xpPerTask', Math.max(1, parseInt(e.target.value) || 1))} className="w-full mt-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} />
        </label>
        <label className="text-xs" style={{ color: '#64748b' }}>
          XP ao bater a meta de água
          <input type="number" min="0" value={settings.xpWater} onChange={e => updateSetting('xpWater', Math.max(0, parseInt(e.target.value) || 0))} className="w-full mt-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} />
        </label>
        <label className="text-xs" style={{ color: '#64748b' }}>
          Água por kg de peso (ml) — padrão 35 ml/kg
          <input type="number" min="10" value={settings.waterMlPerKg} onChange={e => updateSetting('waterMlPerKg', Math.max(10, parseInt(e.target.value) || 35))} className="w-full mt-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} />
        </label>
        <label className="flex items-center gap-2 text-sm" style={{ color: '#cbd5e1' }}>
          <input type="checkbox" checked={settings.soundEnabled} onChange={e => updateSetting('soundEnabled', e.target.checked)} />
          Som ao disparar alarme
        </label>
      </div>
    </Panel>
  );
}
