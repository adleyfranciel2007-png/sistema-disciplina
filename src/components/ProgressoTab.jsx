import React from 'react';
import { BarChart2 } from 'lucide-react';
import { BarChart, Bar as RBar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Panel, SectionTitle } from './ui.jsx';
import { CYAN, VIOLET } from '../lib/constants.js';

export default function ProgressoTab({ history }) {
  const last7 = history.slice(-7).map(h => ({
    date: h.date.slice(5),
    estudos: h.studyTotal > 0 ? Math.round((h.studyDone / h.studyTotal) * 100) : 0,
    treinos: h.trainingTotal > 0 ? Math.round((h.trainingDone / h.trainingTotal) * 100) : 0,
  }));

  return (
    <Panel glow={CYAN}>
      <SectionTitle icon={BarChart2} color={CYAN}>Progresso (últimos 7 dias)</SectionTitle>
      {last7.length === 0 ? (
        <p className="text-sm" style={{ color: '#64748b' }}>Ainda não há histórico suficiente. Complete missões por alguns dias para ver seu progresso aqui.</p>
      ) : (
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={last7}>
              <CartesianGrid stroke="#1c2536" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ background: '#0d1420', border: '1px solid #1c2536', color: '#e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <RBar dataKey="estudos" fill={CYAN} name="Estudos (%)" />
              <RBar dataKey="treinos" fill={VIOLET} name="Treinos (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p className="text-xs mt-3" style={{ color: '#475569' }}>Percentual de missões concluídas por dia, com base nos itens cadastrados naquele dia da semana.</p>
    </Panel>
  );
}
