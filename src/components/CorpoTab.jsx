import React from 'react';
import { Scale, Droplet, Target, Flame, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Panel, SectionTitle } from './ui.jsx';
import { GOLD, ACTIVITY_LEVELS } from '../lib/constants.js';

export default function CorpoTab({ profile, updateProfile, hasProfile, idealWeight, waterGoalL, weightDiff, weightLog, logWeightToday }) {
  const weightNum = parseFloat(profile.weight);
  const heightNum = parseFloat(profile.height);
  const ageNum = parseFloat(profile.age);
  const hasBmrInputs = hasProfile && !isNaN(ageNum) && ageNum > 0 && (profile.sex === 'homem' || profile.sex === 'mulher');

  let bmr = null, tdee = null, target = null, tooLow = false;
  if (hasBmrInputs) {
    bmr = profile.sex === 'homem'
      ? 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5
      : 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    const activity = ACTIVITY_LEVELS.find(a => a.id === profile.activity) || ACTIVITY_LEVELS[0];
    tdee = bmr * activity.mult;
    target = tdee - 500;
    tooLow = target < 1200;
  }

  const chartData = weightLog.map(w => ({ date: w.date.slice(5), peso: w.weight }));

  return (
    <>
      <Panel glow="#38bdf8">
        <SectionTitle icon={Scale} color="#38bdf8">Seus Dados</SectionTitle>
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <label className="flex-1 text-xs" style={{ color: '#64748b' }}>
            Peso atual (kg)
            <input type="number" value={profile.weight} onChange={e => updateProfile('weight', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} placeholder="ex: 78" />
          </label>
          <label className="flex-1 text-xs" style={{ color: '#64748b' }}>
            Altura (cm)
            <input type="number" value={profile.height} onChange={e => updateProfile('height', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} placeholder="ex: 175" />
          </label>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <label className="flex-1 text-xs" style={{ color: '#64748b' }}>
            Idade
            <input type="number" value={profile.age} onChange={e => updateProfile('age', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }} placeholder="ex: 22" />
          </label>
          <label className="flex-1 text-xs" style={{ color: '#64748b' }}>
            Sexo (para o cálculo calórico)
            <select value={profile.sex} onChange={e => updateProfile('sex', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }}>
              <option value="" style={{ color: '#000' }}>Prefiro não dizer</option>
              <option value="homem" style={{ color: '#000' }}>Homem</option>
              <option value="mulher" style={{ color: '#000' }}>Mulher</option>
            </select>
          </label>
        </div>
        <label className="text-xs block" style={{ color: '#64748b' }}>
          Nível de atividade
          <select value={profile.activity} onChange={e => updateProfile('activity', e.target.value)} className="w-full mt-1 px-3 py-2 text-sm bg-transparent border outline-none" style={{ borderColor: '#1c2536', color: '#e2e8f0' }}>
            {ACTIVITY_LEVELS.map(a => <option key={a.id} value={a.id} style={{ color: '#000' }}>{a.label}</option>)}
          </select>
        </label>
        {hasProfile && (
          <button onClick={logWeightToday} className="mt-4 px-4 py-2 text-xs uppercase tracking-wide" style={{ background: '#38bdf822', border: '1px solid #38bdf8', color: '#38bdf8' }}>
            Registrar peso de hoje no histórico
          </button>
        )}
      </Panel>

      {hasProfile ? (
        <>
          <Panel glow="#38bdf8">
            <SectionTitle icon={Droplet} color="#38bdf8">Meta de Água</SectionTitle>
            <p className="text-2xl sys-title" style={{ color: '#38bdf8' }}>{waterGoalL} L / dia</p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>Estimativa padrão de 35 ml por kg de peso corporal (ajustável em Configurações).</p>
          </Panel>

          <Panel glow={GOLD}>
            <SectionTitle icon={Target} color={GOLD}>Peso Ideal Estimado</SectionTitle>
            <p className="text-2xl sys-title" style={{ color: GOLD }}>{idealWeight.toFixed(1)} kg</p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>Baseado em IMC 22 (faixa saudável) para {profile.height} cm.</p>

            {weightDiff > 0.5 ? (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1c2536' }}>
                <p className="text-sm mb-1" style={{ color: '#cbd5e1' }}>Diferença até o peso ideal: <b style={{ color: GOLD }}>{weightDiff.toFixed(1)} kg</b></p>
                <p className="text-sm" style={{ color: '#cbd5e1' }}>Tempo estimado a ~0,5 kg/semana: <b style={{ color: GOLD }}>~{Math.ceil(weightDiff / 0.5)} semanas</b></p>
                <p className="text-xs mt-3" style={{ color: '#64748b' }}>Estimativa geral, não é orientação nutricional individualizada. Para um plano seguro e ajustado a você, o ideal é consultar um nutricionista.</p>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1c2536' }}>
                <p className="text-sm" style={{ color: '#4ade80' }}>Seu peso atual já está na faixa saudável estimada. Foco em manter a rotina e ganhar condicionamento.</p>
              </div>
            )}
          </Panel>

          <Panel glow="#fb923c">
            <SectionTitle icon={Flame} color="#fb923c">Calorias</SectionTitle>
            {!hasBmrInputs ? (
              <p className="text-sm" style={{ color: '#64748b' }}>Preencha idade e sexo acima para ver uma estimativa de calorias de manutenção e de déficit — sem isso, o cálculo fica genérico demais para ser útil.</p>
            ) : (
              <>
                <p className="text-sm mb-1" style={{ color: '#cbd5e1' }}>Manutenção estimada (TDEE): <b style={{ color: '#fb923c' }}>{Math.round(tdee)} kcal/dia</b></p>
                {weightDiff > 0.5 ? (
                  <>
                    <p className="text-sm mb-1" style={{ color: '#cbd5e1' }}>Meta sugerida com déficit seguro (500 kcal/dia): <b style={{ color: '#fb923c' }}>{Math.round(target)} kcal/dia</b></p>
                    {tooLow && (
                      <p className="text-xs mt-2" style={{ color: '#f87171' }}>Esse valor ficou abaixo de 1200 kcal/dia, considerado baixo demais para manter de forma segura — um déficit menor (ex: 300 kcal/dia) ou acompanhamento profissional é mais indicado nesse caso.</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm" style={{ color: '#4ade80' }}>Você já está na faixa de peso saudável — foco em manter a manutenção calórica acima.</p>
                )}
                <p className="text-xs mt-3" style={{ color: '#64748b' }}>Estimativa via fórmula de Mifflin-St Jeor. É uma referência geral, não substitui avaliação de um nutricionista.</p>
              </>
            )}
          </Panel>
        </>
      ) : (
        <Panel glow="#1c2536">
          <p className="text-sm" style={{ color: '#64748b' }}>Preencha peso e altura acima para ver sua meta de água, peso ideal e estimativa calórica.</p>
        </Panel>
      )}

      {weightLog.length > 1 && (
        <Panel glow="#38bdf8">
          <SectionTitle icon={TrendingUp} color="#38bdf8">Histórico de Peso</SectionTitle>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#1c2536" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#0d1420', border: '1px solid #1c2536', color: '#e2e8f0' }} />
                <Line type="monotone" dataKey="peso" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}
    </>
  );
}
