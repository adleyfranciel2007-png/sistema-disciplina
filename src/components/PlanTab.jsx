import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { Panel, SectionTitle } from './ui.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { DAY_KEYS, DAY_NAMES, todayKey, BG } from '../lib/constants.js';

export default function PlanTab({ title, icon, color, plan, kind, onToggle, onAdd, onEdit, onRemove }) {
  const [activeDay, setActiveDay] = useState(todayKey());
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');
  const [f3, setF3] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  const items = plan[activeDay] || [];

  const submit = () => {
    if (kind === 'study') {
      onAdd(activeDay, f1, f2);
      setF1(''); setF2('');
    } else {
      onAdd(activeDay, f1, f2, f3);
      setF1(''); setF2(''); setF3('');
    }
  };

  const startEdit = it => {
    setEditingId(it.id);
    setEditValues(kind === 'study' ? { subject: it.subject, topic: it.topic } : { exercise: it.exercise, sets: it.sets, notes: it.notes });
  };

  const saveEdit = id => {
    onEdit(activeDay, id, editValues);
    setEditingId(null);
  };

  return (
    <Panel glow={color}>
      <SectionTitle icon={icon} color={color}>{title}</SectionTitle>

      <div className="flex gap-1 mb-4 overflow-x-auto">
        {DAY_KEYS.map(dk => (
          <button
            key={dk}
            onClick={() => setActiveDay(dk)}
            className="px-3 py-1.5 text-xs uppercase tracking-wide shrink-0"
            style={{
              color: activeDay === dk ? BG : '#94a3b8',
              background: activeDay === dk ? color : 'transparent',
              border: `1px solid ${activeDay === dk ? color : '#1c2536'}`,
            }}
          >
            {dk}{dk === todayKey() ? ' •' : ''}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {items.length === 0 && <p className="text-sm" style={{ color: '#64748b' }}>Nada cadastrado para {DAY_NAMES[DAY_KEYS.indexOf(activeDay)]}.</p>}
        {items.map(it => {
          const isEditing = editingId === it.id;
          return (
            <div key={it.id} className="flex items-center gap-2 px-3 py-2 border flex-wrap" style={{ borderColor: '#1c2536' }}>
              {!isEditing && (
                <button onClick={() => onToggle(activeDay, it.id)}>
                  {it.done ? <CheckCircle2 size={18} color="#4ade80" /> : <Circle size={18} color="#475569" />}
                </button>
              )}

              {isEditing ? (
                kind === 'study' ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2 min-w-0">
                    <input value={editValues.subject} onChange={e => setEditValues(v => ({ ...v, subject: e.target.value }))} className="flex-1 px-2 py-1 text-sm bg-transparent border outline-none" style={{ borderColor: color, color: '#e2e8f0' }} />
                    <input value={editValues.topic} onChange={e => setEditValues(v => ({ ...v, topic: e.target.value }))} className="flex-1 px-2 py-1 text-sm bg-transparent border outline-none" style={{ borderColor: color, color: '#e2e8f0' }} />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2 min-w-0">
                    <input value={editValues.exercise} onChange={e => setEditValues(v => ({ ...v, exercise: e.target.value }))} className="flex-1 px-2 py-1 text-sm bg-transparent border outline-none" style={{ borderColor: color, color: '#e2e8f0' }} />
                    <input value={editValues.sets} onChange={e => setEditValues(v => ({ ...v, sets: e.target.value }))} className="w-full sm:w-28 px-2 py-1 text-sm bg-transparent border outline-none" style={{ borderColor: color, color: '#e2e8f0' }} />
                    <input value={editValues.notes} onChange={e => setEditValues(v => ({ ...v, notes: e.target.value }))} className="flex-1 px-2 py-1 text-sm bg-transparent border outline-none" style={{ borderColor: color, color: '#e2e8f0' }} />
                  </div>
                )
              ) : (
                <div className="flex-1 text-sm min-w-0">
                  {kind === 'study' ? (
                    <>
                      <span style={{ color: '#e2e8f0' }}>{it.subject}</span>
                      {it.topic && <span style={{ color: '#64748b' }}> — {it.topic}</span>}
                    </>
                  ) : (
                    <>
                      <span style={{ color: '#e2e8f0' }}>{it.exercise}</span>
                      <span style={{ color: color }}> {it.sets}</span>
                      {it.notes && <span style={{ color: '#64748b' }}> — {it.notes}</span>}
                    </>
                  )}
                </div>
              )}

              {isEditing ? (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => saveEdit(it.id)}><Check size={16} color="#4ade80" /></button>
                  <button onClick={() => setEditingId(null)}><X size={16} color="#94a3b8" /></button>
                </div>
              ) : (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(it)}><Pencil size={15} color="#94a3b8" /></button>
                  <button onClick={() => setConfirmId(it.id)}><Trash2 size={15} color="#f87171" /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {kind === 'study' ? (
          <>
            <input value={f1} onChange={e => setF1(e.target.value)} placeholder="Matéria" className="flex-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} />
            <input value={f2} onChange={e => setF2(e.target.value)} placeholder="Assunto (opcional)" className="flex-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} />
          </>
        ) : (
          <>
            <input value={f1} onChange={e => setF1(e.target.value)} placeholder="Exercício" className="flex-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} />
            <input value={f2} onChange={e => setF2(e.target.value)} placeholder="Séries (ex: 4x15)" className="w-full sm:w-32 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} />
            <input value={f3} onChange={e => setF3(e.target.value)} placeholder="Obs (opcional)" className="flex-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} />
          </>
        )}
        <button onClick={submit} className="px-4 py-2 text-sm uppercase tracking-wide flex items-center justify-center gap-1" style={{ background: `${color}22`, border: `1px solid ${color}`, color }}>
          <Plus size={14} /> Adicionar
        </button>
      </div>

      <ConfirmDialog
        open={!!confirmId}
        title="Excluir item"
        message="Tem certeza que quer excluir este item? Essa ação não pode ser desfeita."
        onCancel={() => setConfirmId(null)}
        onConfirm={() => { onRemove(activeDay, confirmId); setConfirmId(null); }}
      />
    </Panel>
  );
}
