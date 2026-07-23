export const DAY_KEYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export const CYAN = '#22d3ee';
export const GOLD = '#fbbf24';
export const VIOLET = '#8b5cf6';
export const RED = '#f87171';
export const GREEN = '#4ade80';
export const BG = '#050810';

export const genId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export const todayKey = () => DAY_KEYS[new Date().getDay()];
export const todayDateStr = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD, sortable
export const pad2 = n => String(n).padStart(2, '0');
export const nowHM = () => { const d = new Date(); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };

export const xpToNext = level => level * 100;

export function getRank(level) {
  if (level >= 25) return { label: 'S', color: GOLD };
  if (level >= 20) return { label: 'A', color: '#f97316' };
  if (level >= 15) return { label: 'B', color: VIOLET };
  if (level >= 10) return { label: 'C', color: '#3b82f6' };
  if (level >= 5) return { label: 'D', color: GREEN };
  return { label: 'E', color: '#94a3b8' };
}

export const ACTIVITY_LEVELS = [
  { id: 'sedentario', label: 'Sedentário (pouco ou nenhum exercício)', mult: 1.2 },
  { id: 'leve', label: 'Leve (exercício leve 1-3x/semana)', mult: 1.375 },
  { id: 'moderado', label: 'Moderado (exercício moderado 3-5x/semana)', mult: 1.55 },
  { id: 'intenso', label: 'Intenso (exercício pesado 6-7x/semana)', mult: 1.725 },
];

export const DEFAULT_STUDY = {
  Dom: [],
  Seg: [
    { id: genId(), subject: 'Inglês', topic: 'Revisão para a prova de hoje', done: false },
    { id: genId(), subject: 'Sistemas de Informação', topic: 'Revisão para a prova de hoje', done: false },
  ],
  Ter: [], Qua: [], Qui: [], Sex: [], Sáb: [],
};

export const DEFAULT_TRAINING = {
  Dom: [],
  Seg: [
    { id: genId(), exercise: 'Flexão de braço', sets: '4x15', notes: 'Peito, ombro e tríceps' },
    { id: genId(), exercise: 'Mergulho entre cadeiras', sets: '3x12', notes: 'Tríceps' },
    { id: genId(), exercise: 'Prancha', sets: '3x40s', notes: 'Core' },
  ],
  Ter: [
    { id: genId(), exercise: 'Remada invertida (mesa ou toalha na porta)', sets: '4x12', notes: 'Costas' },
    { id: genId(), exercise: 'Superman', sets: '3x15', notes: 'Lombar' },
    { id: genId(), exercise: 'Prancha lateral', sets: '3x30s cada lado', notes: 'Core' },
  ],
  Qua: [
    { id: genId(), exercise: 'Agachamento livre', sets: '4x20', notes: 'Pernas' },
    { id: genId(), exercise: 'Afundo (passada)', sets: '3x12 cada perna', notes: 'Pernas e glúteo' },
    { id: genId(), exercise: 'Panturrilha em pé', sets: '4x20', notes: 'Panturrilha' },
  ],
  Qui: [
    { id: genId(), exercise: 'Abdominal supra', sets: '4x20', notes: 'Core' },
    { id: genId(), exercise: 'Burpee', sets: '4x15', notes: 'Cardio / corpo todo' },
    { id: genId(), exercise: 'Mountain climber', sets: '3x30s', notes: 'Cardio' },
  ],
  Sex: [
    { id: genId(), exercise: 'Flexão de braço', sets: '4x15', notes: 'Push' },
    { id: genId(), exercise: 'Remada invertida', sets: '4x12', notes: 'Pull' },
    { id: genId(), exercise: 'Agachamento livre', sets: '3x20', notes: 'Pernas' },
  ],
  Sáb: [{ id: genId(), exercise: 'Corrida leve ou pular corda', sets: '20 min', notes: 'Cardio leve' }],
};

export const ACHIEVEMENTS = [
  { id: 'jogador', name: 'Jogador', desc: '"Você adquiriu as qualificações para se tornar um Jogador." O sistema despertou em você.', check: () => true },
  { id: 'primeira-missao', name: 'Primeira Missão', desc: 'Complete sua primeira missão diária.', check: c => c.totalCompleted >= 1 },
  { id: 'sequencia-3', name: 'Chama Acesa', desc: '3 dias seguidos cumprindo missões.', check: c => c.streak >= 3 },
  { id: 'sequencia-7', name: 'Uma Semana de Foco', desc: '7 dias seguidos cumprindo missões.', check: c => c.streak >= 7 },
  { id: 'sequencia-30', name: 'Disciplina de Monarca', desc: '30 dias seguidos cumprindo missões.', check: c => c.streak >= 30 },
  { id: 'hidratado', name: 'Hidratado', desc: 'Bateu a meta de água do dia.', check: c => c.waterGoalMl > 0 && c.waterToday >= c.waterGoalMl },
  { id: 'guerreiro', name: 'Guerreiro de Calistenia', desc: 'Completou todos os treinos do dia.', check: c => c.trainingTotal > 0 && c.trainingDone === c.trainingTotal },
  { id: 'estudioso', name: 'Mente Afiada', desc: 'Completou todos os estudos do dia.', check: c => c.studyTotal > 0 && c.studyDone === c.studyTotal },
  { id: 'nivel-5', name: 'Rank D Alcançado', desc: 'Chegou ao nível 5.', check: c => c.level >= 5 },
  { id: 'nivel-10', name: 'Rank C Alcançado', desc: 'Chegou ao nível 10.', check: c => c.level >= 10 },
  { id: 'nivel-20', name: 'Rank A Alcançado', desc: 'Chegou ao nível 20.', check: c => c.level >= 20 },
  { id: 'cem-missoes', name: 'Caçador Veterano', desc: '100 missões concluídas no total.', check: c => c.totalCompleted >= 100 },
  { id: 'historiador', name: 'Registro Constante', desc: '7 dias de histórico registrados.', check: c => c.historyDays >= 7 },
];

export const DEFAULT_SETTINGS = {
  xpPerTask: 25,
  xpWater: 15,
  waterMlPerKg: 35,
  soundEnabled: true,
};

export const DEFAULT_DATA = {
  profile: { weight: '', height: '', age: '', sex: '', activity: 'sedentario' },
  studyPlan: DEFAULT_STUDY,
  trainingPlan: DEFAULT_TRAINING,
  alarms: [],
  gamification: { xp: 0, level: 1, streak: 0, totalCompleted: 0, streakCountedDate: '' },
  water: { amount: 0, date: todayDateStr(), awarded: false },
  unlocked: ['jogador'],
  settings: DEFAULT_SETTINGS,
  history: [], // [{ date, studyDone, studyTotal, trainingDone, trainingTotal, waterMl }]
  weightLog: [], // [{ date, weight }]
  onboardingSeen: false,
};

export function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.value = 880;
    g.gain.value = 0.16;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => { try { o.stop(); ctx.close(); } catch (e) {} }, 750);
  } catch (e) {}
}
