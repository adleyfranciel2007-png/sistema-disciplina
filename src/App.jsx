import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles, BookOpen, Dumbbell, Droplet, Trophy, Bell, User, Flame,
  CheckCircle2, Circle, Plus, X, Zap, Target, Sword, Clock, Trash2,
  ChevronRight, Volume2, Lock, Scale,
} from 'lucide-react';

/* ---------------------------------- helpers ---------------------------------- */

const DAY_KEYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const genId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const todayKey = () => DAY_KEYS[new Date().getDay()];
const todayDateStr = () => new Date().toDateString();
const pad2 = n => String(n).padStart(2, '0');
const nowHM = () => { const d = new Date(); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };

const xpToNext = level => level * 100;

function getRank(level) {
  if (level >= 25) return { label: 'S', color: '#fbbf24' };
  if (level >= 20) return { label: 'A', color: '#f97316' };
  if (level >= 15) return { label: 'B', color: '#a855f7' };
  if (level >= 10) return { label: 'C', color: '#3b82f6' };
  if (level >= 5) return { label: 'D', color: '#4ade80' };
  return { label: 'E', color: '#94a3b8' };
}

const DEFAULT_STUDY = {
  Dom: [],
  Seg: [
    { id: genId(), subject: 'Inglês', topic: 'Revisão para a prova de hoje', done: false },
    { id: genId(), subject: 'Sistemas de Informação', topic: 'Revisão para a prova de hoje', done: false },
  ],
  Ter: [],
  Qua: [],
  Qui: [],
  Sex: [],
  Sáb: [],
};

const DEFAULT_TRAINING = {
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
  Sáb: [
    { id: genId(), exercise: 'Corrida leve ou pular corda', sets: '20 min', notes: 'Cardio leve' },
  ],
};

const ACHIEVEMENTS = [
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
];

const DEFAULT_DATA = {
  profile: { weight: '', height: '' },
  studyPlan: DEFAULT_STUDY,
  trainingPlan: DEFAULT_TRAINING,
  alarms: [],
  gamification: { xp: 0, level: 1, streak: 0, totalCompleted: 0, streakCountedDate: '' },
  water: { amount: 0, date: todayDateStr(), awarded: false },
  unlocked: ['jogador'],
};

function beep() {
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
    setTimeout(() => {
      try { o.stop(); ctx.close(); } catch (e) {}
    }, 750);
  } catch (e) {}
}

/* ---------------------------------- ui bits ---------------------------------- */

const CYAN = '#22d3ee';
const GOLD = '#fbbf24';
const VIOLET = '#8b5cf6';
const RED = '#f87171';
const BG = '#050810';

function Panel({ children, glow = CYAN, className = '', style = {}, padded = true }) {
  return (
    <div
      className={`relative border ${padded ? 'p-4' : ''} ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(13,20,34,0.92), rgba(6,9,17,0.96))',
        borderColor: glow + '4d',
        boxShadow: `0 0 22px ${glow}1f, inset 0 0 30px rgba(0,0,0,0.35)`,
        clipPath: 'polygon(0 14px, 14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Bar({ value, max, color = CYAN, height = 10 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height, background: '#0a0e18', border: '1px solid #1c2536' }} className="w-full overflow-hidden">
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: `0 0 10px ${color}`,
          transition: 'width 0.5s ease',
        }}
      />
    </div>
  );
}

function SectionTitle({ icon: Icon, children, color = CYAN }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={18} color={color} />
      <h2
        className="text-sm sm:text-base tracking-widest uppercase"
        style={{ fontFamily: "'Orbitron', sans-serif", color, textShadow: `0 0 12px ${color}66` }}
      >
        {children}
      </h2>
    </div>
  );
}

/* ---------------------------------- app ---------------------------------- */

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState('status');
  const [data, setData] = useState(DEFAULT_DATA);
  const [toast, setToast] = useState(null);
  const [firingAlarm, setFiringAlarm] = useState(null);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const firedRef = useRef(new Set());
  const saveTimer = useRef(null);

  /* ---- load ---- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem('system-data');
      if (raw) {
        const parsed = JSON.parse(raw);
        let water = parsed.water || DEFAULT_DATA.water;
        if (water.date !== todayDateStr()) {
          water = { amount: 0, date: todayDateStr(), awarded: false };
        }
        setData({ ...DEFAULT_DATA, ...parsed, water });
      }
    } catch (e) {
      // no saved data yet — defaults are already set
    } finally {
      setLoaded(true);
    }
  }, []);

  /* ---- save (debounced) ---- */
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem('system-data', JSON.stringify(data));
      } catch (e) {}
    }, 400);
    return () => clearTimeout(saveTimer.current);
  }, [data, loaded]);

  /* ---- derived values ---- */
  const dayKey = todayKey();
  const todayStudy = data.studyPlan[dayKey] || [];
  const todayTraining = data.trainingPlan[dayKey] || [];
  const studyDone = todayStudy.filter(i => i.done).length;
  const trainingDone = todayTraining.filter(i => i.done).length;

  const weightNum = parseFloat(data.profile.weight);
  const heightNum = parseFloat(data.profile.height);
  const hasProfile = !isNaN(weightNum) && weightNum > 0 && !isNaN(heightNum) && heightNum > 0;
  const idealWeight = hasProfile ? 22 * Math.pow(heightNum / 100, 2) : null;
  const waterGoalMl = hasProfile ? Math.round(weightNum * 35) : 0;
  const waterGoalL = (waterGoalMl / 1000).toFixed(1);
  const weightDiff = hasProfile ? weightNum - idealWeight : 0;

  const rank = getRank(data.gamification.level);
  const xpNext = xpToNext(data.gamification.level);

  /* ---- achievement checking ---- */
  useEffect(() => {
    if (!loaded) return;
    const ctx = {
      totalCompleted: data.gamification.totalCompleted,
      streak: data.gamification.streak,
      level: data.gamification.level,
      waterToday: data.water.amount,
      waterGoalMl,
      trainingTotal: todayTraining.length,
      trainingDone,
      studyTotal: todayStudy.length,
      studyDone,
    };
    const newly = ACHIEVEMENTS.filter(a => !data.unlocked.includes(a.id) && a.check(ctx));
    if (newly.length > 0) {
      setData(prev => ({ ...prev, unlocked: [...prev.unlocked, ...newly.map(a => a.id)] }));
      setToast({ type: 'achievement', text: newly[0].name });
      setTimeout(() => setToast(null), 3200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.gamification, data.water.amount, data.studyPlan, data.trainingPlan, loaded]);

  /* ---- alarm ticking ---- */
  useEffect(() => {
    const interval = setInterval(() => {
      const hm = nowHM();
      const dk = todayKey();
      data.alarms.forEach(al => {
        if (!al.active) return;
        if (!al.days.includes(dk)) return;
        if (al.time !== hm) return;
        const fireKey = `${al.id}-${todayDateStr()}-${hm}`;
        if (firedRef.current.has(fireKey)) return;
        firedRef.current.add(fireKey);
        beep();
        setFiringAlarm(al);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try { new Notification(`⏰ ${al.label || 'Alarme'}`); } catch (e) {}
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [data.alarms]);

  /* ---- actions ---- */
  const gainXp = useCallback(amount => {
    setData(prev => {
      let xp = prev.gamification.xp + amount;
      let level = prev.gamification.level;
      let needed = xpToNext(level);
      while (xp >= needed) {
        xp -= needed;
        level += 1;
        needed = xpToNext(level);
      }
      const tStr = todayDateStr();
      let streak = prev.gamification.streak;
      let streakCountedDate = prev.gamification.streakCountedDate;
      if (streakCountedDate !== tStr) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        streak = streakCountedDate === y.toDateString() ? streak + 1 : 1;
        streakCountedDate = tStr;
      }
      return {
        ...prev,
        gamification: {
          ...prev.gamification,
          xp, level, streak, streakCountedDate,
          totalCompleted: prev.gamification.totalCompleted + 1,
        },
      };
    });
  }, []);

  const toggleStudy = (day, id) => {
    setData(prev => {
      const items = prev.studyPlan[day].map(i => i.id === id ? { ...i, done: !i.done } : i);
      return { ...prev, studyPlan: { ...prev.studyPlan, [day]: items } };
    });
    const item = data.studyPlan[day].find(i => i.id === id);
    if (item && !item.done) gainXp(25);
  };

  const toggleTraining = (day, id) => {
    setData(prev => {
      const items = prev.trainingPlan[day].map(i => i.id === id ? { ...i, done: !i.done } : i);
      return { ...prev, trainingPlan: { ...prev.trainingPlan, [day]: items } };
    });
    const item = data.trainingPlan[day].find(i => i.id === id);
    if (item && !item.done) gainXp(25);
  };

  const addStudy = (day, subject, topic) => {
    if (!subject.trim()) return;
    setData(prev => ({
      ...prev,
      studyPlan: {
        ...prev.studyPlan,
        [day]: [...prev.studyPlan[day], { id: genId(), subject, topic, done: false }],
      },
    }));
  };

  const removeStudy = (day, id) => {
    setData(prev => ({ ...prev, studyPlan: { ...prev.studyPlan, [day]: prev.studyPlan[day].filter(i => i.id !== id) } }));
  };

  const addTraining = (day, exercise, sets, notes) => {
    if (!exercise.trim()) return;
    setData(prev => ({
      ...prev,
      trainingPlan: {
        ...prev.trainingPlan,
        [day]: [...prev.trainingPlan[day], { id: genId(), exercise, sets, notes, done: false }],
      },
    }));
  };

  const removeTraining = (day, id) => {
    setData(prev => ({ ...prev, trainingPlan: { ...prev.trainingPlan, [day]: prev.trainingPlan[day].filter(i => i.id !== id) } }));
  };

  const addWater = ml => {
    setData(prev => {
      const amount = Math.max(0, prev.water.amount + ml);
      return { ...prev, water: { ...prev.water, amount } };
    });
    if (data.water.amount + ml >= waterGoalMl && !data.water.awarded && waterGoalMl > 0) {
      setData(prev => ({ ...prev, water: { ...prev.water, awarded: true } }));
      gainXp(15);
    }
  };

  const updateProfile = (field, value) => {
    setData(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  };

  const addAlarm = (time, label, days) => {
    if (!time || days.length === 0) return;
    setData(prev => ({ ...prev, alarms: [...prev.alarms, { id: genId(), time, label, days, active: true }] }));
  };

  const toggleAlarm = id => {
    setData(prev => ({ ...prev, alarms: prev.alarms.map(a => a.id === id ? { ...a, active: !a.active } : a) }));
  };

  const removeAlarm = id => {
    setData(prev => ({ ...prev, alarms: prev.alarms.filter(a => a.id !== id) }));
  };

  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  };

  /* ---------------------------------- render ---------------------------------- */

  const fontImport = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
      * { font-family: 'Rajdhani', sans-serif; }
      .sys-title { font-family: 'Orbitron', sans-serif; }
      @keyframes flicker { 0% { opacity: 0; } 15% { opacity: 1; } 20% { opacity: 0.4; } 30% { opacity: 1; } 100% { opacity: 1; } }
      @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 8px currentColor; } 50% { box-shadow: 0 0 20px currentColor; } }
      .flicker-in { animation: flicker 1.1s ease-out; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-thumb { background: #22d3ee55; }
      ::-webkit-scrollbar-track { background: #050810; }
    `}</style>
  );

  if (!loaded) {
    return (
      <div style={{ background: BG, minHeight: '100vh' }} className="flex items-center justify-center">
        {fontImport}
        <p className="sys-title tracking-widest" style={{ color: CYAN }}>CARREGANDO SISTEMA...</p>
      </div>
    );
  }

  if (!booted) {
    return (
      <div style={{ background: BG, minHeight: '100vh' }} className="flex items-center justify-center p-6">
        {fontImport}
        <div className="flicker-in max-w-md w-full">
          <Panel glow={CYAN} className="text-center">
            <Sparkles size={40} color={CYAN} className="mx-auto mb-4" style={{ filter: `drop-shadow(0 0 10px ${CYAN})` }} />
            <h1 className="sys-title text-xl sm:text-2xl tracking-widest mb-3" style={{ color: CYAN, textShadow: `0 0 16px ${CYAN}88` }}>
              O SISTEMA DESPERTOU
            </h1>
            <p className="text-sm sm:text-base mb-1" style={{ color: '#cbd5e1' }}>
              "Você adquiriu as qualificações para se tornar um Jogador."
            </p>
            <p className="text-xs sm:text-sm mb-6" style={{ color: '#64748b' }}>
              A partir de agora, cada estudo, cada série e cada meta cumprida vale experiência. Suba de rank.
            </p>
            <button
              onClick={() => setBooted(true)}
              className="w-full py-3 uppercase tracking-widest text-sm font-bold"
              style={{ background: `linear-gradient(90deg, ${CYAN}33, ${CYAN}66)`, border: `1px solid ${CYAN}`, color: '#e0fbff' }}
            >
              Iniciar
            </button>
          </Panel>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'status', label: 'Status', icon: Sword },
    { id: 'estudos', label: 'Estudos', icon: BookOpen },
    { id: 'treinos', label: 'Treinos', icon: Dumbbell },
    { id: 'corpo', label: 'Corpo', icon: Scale },
    { id: 'alarmes', label: 'Alarmes', icon: Bell },
    { id: 'conquistas', label: 'Conquistas', icon: Trophy },
  ];

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#dbe4f0' }} className="pb-16">
      {fontImport}

      {/* header */}
      <header className="sticky top-0 z-20 border-b" style={{ background: 'rgba(5,8,16,0.92)', borderColor: '#1c2536', backdropFilter: 'blur(6px)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sword size={20} color={CYAN} />
            <span className="sys-title text-xs sm:text-sm tracking-widest" style={{ color: CYAN }}>SISTEMA</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="sys-title text-xs px-2 py-0.5 border" style={{ borderColor: rank.color, color: rank.color }}>
                RANK {rank.label}
              </span>
              <span className="text-xs sm:text-sm" style={{ color: '#94a3b8' }}>Nv. {data.gamification.level}</span>
            </div>
            <div className="flex items-center gap-1" style={{ color: '#fb923c' }}>
              <Flame size={16} />
              <span className="text-xs sm:text-sm">{data.gamification.streak}</span>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <Bar value={data.gamification.xp} max={xpNext} color={rank.color} height={6} />
        </div>
        <nav className="max-w-4xl mx-auto px-2 pb-2 flex gap-1 overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap uppercase tracking-wide shrink-0"
                style={{
                  color: active ? BG : '#94a3b8',
                  background: active ? CYAN : 'transparent',
                  border: `1px solid ${active ? CYAN : '#1c2536'}`,
                }}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 flex flex-col gap-5">
        {tab === 'status' && (
          <StatusTab
            dayName={DAY_NAMES[new Date().getDay()]}
            todayStudy={todayStudy}
            todayTraining={todayTraining}
            toggleStudy={toggleStudy}
            toggleTraining={toggleTraining}
            dayKey={dayKey}
            water={data.water}
            waterGoalMl={waterGoalMl}
            waterGoalL={waterGoalL}
            addWater={addWater}
            hasProfile={hasProfile}
            rank={rank}
            gamification={data.gamification}
            xpNext={xpNext}
          />
        )}

        {tab === 'estudos' && (
          <PlanTab
            title="Grade de Estudos"
            icon={BookOpen}
            color={CYAN}
            plan={data.studyPlan}
            kind="study"
            onToggle={toggleStudy}
            onAdd={addStudy}
            onRemove={removeStudy}
          />
        )}

        {tab === 'treinos' && (
          <PlanTab
            title="Grade de Treinos"
            icon={Dumbbell}
            color={VIOLET}
            plan={data.trainingPlan}
            kind="training"
            onToggle={toggleTraining}
            onAdd={addTraining}
            onRemove={removeTraining}
          />
        )}

        {tab === 'corpo' && (
          <CorpoTab
            profile={data.profile}
            updateProfile={updateProfile}
            hasProfile={hasProfile}
            idealWeight={idealWeight}
            waterGoalL={waterGoalL}
            weightDiff={weightDiff}
            weightNum={weightNum}
          />
        )}

        {tab === 'alarmes' && (
          <AlarmesTab
            alarms={data.alarms}
            addAlarm={addAlarm}
            toggleAlarm={toggleAlarm}
            removeAlarm={removeAlarm}
            notifPermission={notifPermission}
            requestNotifications={requestNotifications}
          />
        )}

        {tab === 'conquistas' && <ConquistasTab unlocked={data.unlocked} />}
      </main>

      {/* toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flicker-in">
          <Panel glow={GOLD} className="flex items-center gap-2 px-4 py-2">
            <Trophy size={16} color={GOLD} />
            <span className="text-xs sm:text-sm" style={{ color: GOLD }}>Conquista desbloqueada: {toast.text}</span>
          </Panel>
        </div>
      )}

      {/* alarm firing modal */}
      {firingAlarm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="max-w-sm w-full flicker-in">
            <Panel glow={RED} className="text-center">
              <Bell size={36} color={RED} className="mx-auto mb-3" style={{ animation: 'pulseGlow 1s infinite', color: RED }} />
              <h3 className="sys-title text-lg tracking-widest mb-2" style={{ color: RED }}>ALARME</h3>
              <p className="mb-5 text-sm sm:text-base">{firingAlarm.label || 'Sem descrição'} — {firingAlarm.time}</p>
              <button
                onClick={() => setFiringAlarm(null)}
                className="w-full py-2.5 uppercase tracking-widest text-sm font-bold"
                style={{ background: `${RED}33`, border: `1px solid ${RED}`, color: '#fff' }}
              >
                Dispensar
              </button>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- status tab ---------------------------------- */

function StatusTab({ dayName, todayStudy, todayTraining, toggleStudy, toggleTraining, dayKey, water, waterGoalMl, waterGoalL, addWater, hasProfile, rank, gamification, xpNext }) {
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
              {q.done ? <CheckCircle2 size={18} color="#4ade80" /> : <Circle size={18} color="#475569" />}
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
            <p className="text-sm mb-2" style={{ color: '#cbd5e1' }}>
              {(water.amount / 1000).toFixed(2)} L de {waterGoalL} L
            </p>
            <Bar value={water.amount} max={waterGoalMl} color="#38bdf8" />
            <div className="flex gap-2 mt-3 flex-wrap">
              {[250, 500].map(ml => (
                <button key={ml} onClick={() => addWater(ml)} className="px-3 py-1.5 text-xs border flex items-center gap-1" style={{ borderColor: '#38bdf855', color: '#38bdf8' }}>
                  <Plus size={12} /> {ml} ml
                </button>
              ))}
              <button onClick={() => addWater(-250)} className="px-3 py-1.5 text-xs border" style={{ borderColor: '#47556955', color: '#64748b' }}>
                -250 ml
              </button>
            </div>
          </>
        )}
      </Panel>
    </>
  );
}

/* ---------------------------------- plan tab (study / training) ---------------------------------- */

function PlanTab({ title, icon, color, plan, kind, onToggle, onAdd, onRemove }) {
  const [activeDay, setActiveDay] = useState(todayKey());
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('');
  const [f3, setF3] = useState('');

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
        {items.map(it => (
          <div key={it.id} className="flex items-center gap-2 px-3 py-2 border" style={{ borderColor: '#1c2536' }}>
            <button onClick={() => onToggle(activeDay, it.id)}>
              {it.done ? <CheckCircle2 size={18} color="#4ade80" /> : <Circle size={18} color="#475569" />}
            </button>
            <div className="flex-1 text-sm">
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
            <button onClick={() => onRemove(activeDay, it.id)}>
              <Trash2 size={16} color="#f87171" />
            </button>
          </div>
        ))}
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
    </Panel>
  );
}

/* ---------------------------------- corpo tab ---------------------------------- */

function CorpoTab({ profile, updateProfile, hasProfile, idealWeight, waterGoalL, weightDiff, weightNum }) {
  return (
    <>
      <Panel glow="#38bdf8">
        <SectionTitle icon={Scale} color="#38bdf8">Seus Dados</SectionTitle>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 text-xs" style={{ color: '#64748b' }}>
            Peso atual (kg)
            <input
              type="number"
              value={profile.weight}
              onChange={e => updateProfile('weight', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm bg-transparent border outline-none"
              style={{ borderColor: '#1c2536', color: '#e2e8f0' }}
              placeholder="ex: 78"
            />
          </label>
          <label className="flex-1 text-xs" style={{ color: '#64748b' }}>
            Altura (cm)
            <input
              type="number"
              value={profile.height}
              onChange={e => updateProfile('height', e.target.value)}
              className="w-full mt-1 px-3 py-2 text-sm bg-transparent border outline-none"
              style={{ borderColor: '#1c2536', color: '#e2e8f0' }}
              placeholder="ex: 175"
            />
          </label>
        </div>
      </Panel>

      {hasProfile ? (
        <>
          <Panel glow="#38bdf8">
            <SectionTitle icon={Droplet} color="#38bdf8">Meta de Água</SectionTitle>
            <p className="text-2xl sys-title" style={{ color: '#38bdf8' }}>{waterGoalL} L / dia</p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>Estimativa de 35 ml por kg de peso corporal.</p>
          </Panel>

          <Panel glow={GOLD}>
            <SectionTitle icon={Target} color={GOLD}>Peso Ideal Estimado</SectionTitle>
            <p className="text-2xl sys-title" style={{ color: GOLD }}>{idealWeight.toFixed(1)} kg</p>
            <p className="text-xs mt-1" style={{ color: '#64748b' }}>Baseado em IMC 22 (dentro da faixa saudável) para {profile.height} cm.</p>

            {weightDiff > 0.5 ? (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1c2536' }}>
                <p className="text-sm mb-1" style={{ color: '#cbd5e1' }}>
                  Diferença até o peso ideal: <b style={{ color: GOLD }}>{weightDiff.toFixed(1)} kg</b>
                </p>
                <p className="text-sm mb-1" style={{ color: '#cbd5e1' }}>
                  Déficit calórico diário sugerido (seguro): <b style={{ color: GOLD }}>300–500 kcal/dia</b>
                </p>
                <p className="text-sm" style={{ color: '#cbd5e1' }}>
                  Tempo estimado nesse ritmo (~0,5 kg/semana): <b style={{ color: GOLD }}>~{Math.ceil(weightDiff / 0.5)} semanas</b>
                </p>
                <p className="text-xs mt-3" style={{ color: '#64748b' }}>
                  Estimativa geral, não é orientação nutricional individualizada. Para um plano seguro e ajustado a você, o ideal é consultar um nutricionista.
                </p>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1c2536' }}>
                <p className="text-sm" style={{ color: '#4ade80' }}>Seu peso atual já está na faixa saudável estimada. Foco em manter a rotina e ganhar condicionamento.</p>
              </div>
            )}
          </Panel>
        </>
      ) : (
        <Panel glow="#1c2536">
          <p className="text-sm" style={{ color: '#64748b' }}>Preencha peso e altura acima para ver sua meta de água, peso ideal e recomendação de déficit calórico.</p>
        </Panel>
      )}
    </>
  );
}

/* ---------------------------------- alarmes tab ---------------------------------- */

function AlarmesTab({ alarms, addAlarm, toggleAlarm, removeAlarm, notifPermission, requestNotifications }) {
  const [time, setTime] = useState('07:00');
  const [label, setLabel] = useState('');
  const [days, setDays] = useState([todayKey()]);

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
          <button onClick={requestNotifications} className="px-3 py-1.5 text-xs uppercase" style={{ background: `${GOLD}22`, border: `1px solid ${GOLD}`, color: GOLD }}>
            Ativar
          </button>
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
              <button
                key={dk}
                onClick={() => toggleDay(dk)}
                className="px-3 py-1.5 text-xs uppercase"
                style={{ color: days.includes(dk) ? BG : '#94a3b8', background: days.includes(dk) ? CYAN : 'transparent', border: `1px solid ${days.includes(dk) ? CYAN : '#1c2536'}` }}
              >
                {dk}
              </button>
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
              <button onClick={() => toggleAlarm(a.id)} className="px-2 py-1 text-xs uppercase" style={{ border: `1px solid ${a.active ? '#4ade80' : '#475569'}`, color: a.active ? '#4ade80' : '#475569' }}>
                {a.active ? 'Ativo' : 'Pausado'}
              </button>
              <button onClick={() => removeAlarm(a.id)}><Trash2 size={16} color="#f87171" /></button>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4" style={{ color: '#475569' }}>
          <Volume2 size={12} className="inline mr-1" />
          O alarme toca enquanto esta aba estiver aberta no navegador. Mantenha-a aberta em segundo plano no horário desejado.
        </p>
      </Panel>
    </>
  );
}

/* ---------------------------------- conquistas tab ---------------------------------- */

function ConquistasTab({ unlocked }) {
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
