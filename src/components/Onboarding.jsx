import React, { useState } from 'react';
import { Sword, BookOpen, Dumbbell, Scale, Bell, Trophy, ChevronRight } from 'lucide-react';
import { Panel } from './ui.jsx';
import { CYAN } from '../lib/constants.js';

const STEPS = [
  { icon: Sword, title: 'Status', text: 'Aqui você vê seu nível, rank e as missões do dia — os estudos e treinos que você cadastrou viram missões automaticamente.' },
  { icon: BookOpen, title: 'Estudos', text: 'Monte sua grade por dia da semana. Pode trocar as matérias de qualquer dia a qualquer momento — hoje é prova, amanhã pode ser outra coisa.' },
  { icon: Dumbbell, title: 'Treinos', text: 'Mesmo esquema dos estudos, mas para seus treinos de calistenia: exercício, séries e observações.' },
  { icon: Scale, title: 'Corpo', text: 'Coloque peso, altura, idade e sexo para calcular sua meta de água, peso ideal e estimativa de calorias.' },
  { icon: Bell, title: 'Alarmes', text: 'Crie alarmes por horário e dia da semana. Eles tocam enquanto esta aba estiver aberta no navegador.' },
  { icon: Trophy, title: 'Conquistas', text: 'Cada missão cumprida dá XP. Suba de nível, mantenha sequências e desbloqueie conquistas.' },
];

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="max-w-sm w-full">
        <Panel glow={CYAN} className="text-center">
          <Icon size={34} color={CYAN} className="mx-auto mb-3" style={{ filter: `drop-shadow(0 0 8px ${CYAN})` }} />
          <h3 className="sys-title text-base tracking-widest mb-2" style={{ color: CYAN }}>{s.title.toUpperCase()}</h3>
          <p className="text-sm mb-6" style={{ color: '#cbd5e1' }}>{s.text}</p>
          <div className="flex items-center justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === step ? CYAN : '#1c2536' }} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={onFinish} className="flex-1 py-2.5 uppercase tracking-widest text-xs" style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8' }}>Pular</button>
            <button
              onClick={() => isLast ? onFinish() : setStep(s => s + 1)}
              className="flex-1 py-2.5 uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-1"
              style={{ background: `${CYAN}33`, border: `1px solid ${CYAN}`, color: '#e0fbff' }}
            >
              {isLast ? 'Começar' : 'Próximo'} <ChevronRight size={14} />
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
