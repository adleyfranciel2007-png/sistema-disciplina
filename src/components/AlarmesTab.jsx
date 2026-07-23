import React, { useState } from 'react';
import { Bell, Clock, Plus, Trash2, Volume2 } from 'lucide-react';
import { Panel, SectionTitle } from './ui.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { DAY_KEYS, CYAN, GOLD, BG, todayKey } from '../lib/constants.js';

export default function AlarmesTab({ alarms, addAlarm, toggleAlarm, removeAlarm, notifPermission, requestNotifications }) {
  const [time, setTime] = useState('07:00');
  const [label, setLabel] = useState('');
  const [days, setDays] = useState([todayKey()]);
  const [confirmId, setConfirmId] = useState(null);

  const toggleDay = d => setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);

  const submit = () => {
    addAlarm(time, label, days);
    setLabel('');
  };

  return (
    <>
      {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
        <Panel glow={GOLD} className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs sm:text-sm" style={{ color: '#e2e8f0' }}>Ative notificações para receber o alarme mesmo se trocar de aba.</p>
          <button onClick={requestNotifications} className="px-3 py-1.5 text-xs uppercase" style={{ background: `${GOLD}22`, border: `1px solid ${GOLD}`, color: GOLD }}>Ativar</button>
        </Panel>
      )}

      <Panel glow={CYAN}>
        <SectionTitle icon={Bell} color={CYAN}>Novo Alarme</SectionTitle>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 flex-wrap">
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} />
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Rótulo (ex: Acordar / Estudar)" className="flex-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} />
          </div>
          <div className="flex gap-1 flex-wrap">
            {DAY_KEYS.map(dk => (
              <button key={dk} onClick={() => toggleDay(dk)} className="px-3 py-1.5 text-xs uppercase" style={{ color: days.includes(dk) ? BG : '#94a3b8', background: days.includes(dk) ? CYAN : 'transparent', border: `1px solid ${days.includes(dk) ? CYAN : '#1c2536'}` }}>{dk}</button>
            ))}
          </div>
          <button onClick={submit} className="self-start px-4 py-2 text-sm uppercase tracking-wide flex items-center gap-1" style={{ background: `${CYAN}22`, border: `1px solid ${CYAN}`, color: CYAN }}>
            <Plus size={14} /> Criar Alarme
          </button>
        </div>
      </Panel>

      <Panel glow={CYAN}>
        <SectionTitle icon={Clock} color={CYAN}>Seus Alarmes</SectionTitle>
        {alarms.length === 0 && <p className="text-sm" style={{ color: '#64748b' }}>Nenhum alarme cadastrado ainda.</p>}
        <div className="flex flex-col gap-2">
          {alarms.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-3 py-2 border flex-wrap" style={{ borderColor: '#1c2536' }}>
              <span className="sys-title text-sm" style={{ color: a.active ? CYAN : '#475569' }}>{a.time}</span>
              <span className="text-sm flex-1" style={{ color: '#cbd5e1' }}>{a.label || 'Sem rótulo'}</span>
              <span className="text-xs" style={{ color: '#64748b' }}>{a.days.join(', ')}</span>
              <button onClick={() => toggleAlarm(a.id)} className="px-2 py-1 text-xs uppercase" style={{ border: `1px solid ${a.active ? '#4ade80' : '#475569'}`, color: a.active ? '#4ade80' : '#475569' }}>{a.active ? 'Ativo' : 'Pausado'}</button>
              <button onClick={() => setConfirmId(a.id)}><Trash2 size={16} color="#f87171" /></button>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4" style={{ color: '#475569' }}>
          <Volume2 size={12} className="inline mr-1" />
          O alarme toca enquanto esta aba estiver aberta no navegador. Mantenha-a aberta em segundo plano no horário desejado.
        </p>
      </Panel>

      <ConfirmDialog
        open={!!confirmId}
        title="Excluir alarme"
        message="Tem certeza que quer excluir este alarme?"
        onCancel={() => setConfirmId(null)}
        onConfirm={() => { removeAlarm(confirmId); setConfirmId(null); }}
      />
    </>
  );
}
