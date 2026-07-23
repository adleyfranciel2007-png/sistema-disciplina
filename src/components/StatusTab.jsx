import React from 'react';
import { Target, Droplet, Plus } from 'lucide-react';
import { Panel, Bar, SectionTitle } from './ui.jsx';
import { CYAN } from '../lib/constants.js';

export default function StatusTab({ dayName, todayStudy, todayTraining, toggleStudy, toggleTraining, dayKey, water, waterGoalMl, waterGoalL, addWater, hasProfile, rank, gamification, xpNext }) {
  const allQuests = [
    ...todayStudy.map(i => ({ ...i, kind: 'study', label: `${i.subject}${i.topic ? ' — ' + i.topic : ''}` })),
    ...todayTraining.map(i => ({ ...i, kind: 'training', label: `${i.exercise} (${i.sets})` })),
  ];
  const doneCount = allQuests.filter(q => q.done).length;

  return (
    <>
      <Panel glow={rank.color}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: '#64748b' }}>{dayName}</p>
            <p className="sys-title text-lg" style={{ color: rank.color }}>Nível {gamification.level} · Rank {rank.label}</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: '#64748b' }}>XP</p>
            <p className="text-sm" style={{ color: '#cbd5e1' }}>{gamification.xp} / {xpNext}</p>
          </div>
        </div>
        <div className="mt-3"><Bar value={gamification.xp} max={xpNext} color={rank.color} /></div>
      </Panel>

      <Panel glow={CYAN}>
        <SectionTitle icon={Target} color={CYAN}>Missões de Hoje ({doneCount}/{allQuests.length})</SectionTitle>
        {allQuests.length === 0 && <p className="text-sm" style={{ color: '#64748b' }}>Nenhum estudo ou treino cadastrado para hoje. Adicione nas abas Estudos e Treinos.</p>}
        <div className="flex flex-col gap-2">
          {allQuests.map(q => (
            <button
              key={q.id}
              onClick={() => q.kind === 'study' ? toggleStudy(dayKey, q.id) : toggleTraining(dayKey, q.id)}
              className="flex items-center gap-2 text-left px-3 py-2 border"
              style={{ borderColor: q.done ? '#16a34a55' : '#1c2536', background: q.done ? '#16a34a11' : 'transparent' }}
            >
              {q.done ? <span style={{ color: '#4ade80' }}>✔</span> : <span style={{ color: '#475569' }}>○</span>}
              <span className="text-sm" style={{ color: q.done ? '#94a3b8' : '#e2e8f0', textDecoration: q.done ? 'line-through' : 'none' }}>
                {q.label}
              </span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel glow="#38bdf8">
        <SectionTitle icon={Droplet} color="#38bdf8">Água de Hoje</SectionTitle>
        {!hasProfile ? (
          <p className="text-sm" style={{ color: '#64748b' }}>Informe seu peso na aba Corpo para calcular sua meta diária de água.</p>
        ) : (
          <>
            <p className="text-sm mb-2" style={{ color: '#cbd5e1' }}>{(water.amount / 1000).toFixed(2)} L de {waterGoalL} L</p>
            <Bar value={water.amount} max={waterGoalMl} color="#38bdf8" />
            <div className="flex gap-2 mt-3 flex-wrap">
              {[250, 500].map(ml => (
                <button key={ml} onClick={() => addWater(ml)} className="px-3 py-1.5 text-xs border flex items-center gap-1" style={{ borderColor: '#38bdf855', color: '#38bdf8' }}>
                  <Plus size={12} /> {ml} ml
                </button>
              ))}
              <button onClick={() => addWater(-250)} className="px-3 py-1.5 text-xs border" style={{ borderColor: '#47556955', color: '#64748b' }}>-250 ml</button>
            </div>
          </>
        )}
      </Panel>
    </>
  );
}
