import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, BookOpen, Dumbbell, Bell, Trophy, Sword, Scale, Bell as BellIcon, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import { loadData, saveData } from './lib/storage.js';
import {
  DAY_NAMES, todayKey, todayDateStr, nowHM, xpToNext, getRank, beep,
  DEFAULT_DATA, ACHIEVEMENTS, genId, CYAN, GOLD, VIOLET, RED, BG,
} from './lib/constants.js';
import { Panel, Bar } from './components/ui.jsx';
import StatusTab from './components/StatusTab.jsx';
import PlanTab from './components/PlanTab.jsx';
import CorpoTab from './components/CorpoTab.jsx';
import AlarmesTab from './components/AlarmesTab.jsx';
import ConquistasTab from './components/ConquistasTab.jsx';
import ProgressoTab from './components/ProgressoTab.jsx';
import SettingsTab from './components/SettingsTab.jsx';
import Onboarding from './components/Onboarding.jsx';
import Toast from './components/Toast.jsx';

const STORAGE_KEY = 'system-data';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState('status');
  const [data, setData] = useState(DEFAULT_DATA);
  const [toast, setToast] = useState(null);
  const [firingAlarm, setFiringAlarm] = useState(null);
  const [notifPermission, setNotifPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  const firedRef = useRef(new Set());
  const saveTimer = useRef(null);

  const showToast = (text, type = 'achievement') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3200);
  };

  /* ---- load ---- */
  useEffect(() => {
    const res = loadData(STORAGE_KEY, DEFAULT_DATA);
    if (res.ok && !res.isNew) {
      const parsed = res.value;
      let water = parsed.water || DEFAULT_DATA.water;
      if (water.date !== todayDateStr()) water = { amount: 0, date: todayDateStr(), awarded: false };
      setData({ ...DEFAULT_DATA, ...parsed, settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) }, water });
    } else if (!res.ok) {
      showToast('Não foi possível carregar seus dados salvos (armazenamento indisponível no navegador).', 'error');
    }
    setLoaded(true);
  }, []);

  /* ---- save (debounced) ---- */
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const res = saveData(STORAGE_KEY, data);
      if (!res.ok) showToast('Falha ao salvar seus dados. Verifique o espaço de armazenamento do navegador.', 'error');
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
  const waterGoalMl = hasProfile ? Math.round(weightNum * (data.settings.waterMlPerKg || 35)) : 0;
  const waterGoalL = (waterGoalMl / 1000).toFixed(1);
  const weightDiff = hasProfile ? weightNum - idealWeight : 0;

  const rank = getRank(data.gamification.level);
  const xpNext = xpToNext(data.gamification.level);

  /* ---- history upsert (once per relevant change, keyed by date) ---- */
  useEffect(() => {
    if (!loaded) return;
    const d = todayDateStr();
    setData(prev => {
      const entry = { date: d, studyDone, studyTotal: todayStudy.length, trainingDone, trainingTotal: todayTraining.length, waterMl: prev.water.amount };
      const idx = prev.history.findIndex(h => h.date === d);
      const history = [...prev.history];
      if (idx >= 0) history[idx] = entry; else history.push(entry);
      const trimmed = history.slice(-60);
      return { ...prev, history: trimmed };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyDone, todayStudy.length, trainingDone, todayTraining.length, data.water.amount, loaded]);

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
      historyDays: data.history.length,
    };
    const newly = ACHIEVEMENTS.filter(a => !data.unlocked.includes(a.id) && a.check(ctx));
    if (newly.length > 0) {
      setData(prev => ({ ...prev, unlocked: [...prev.unlocked, ...newly.map(a => a.id)] }));
      showToast(newly[0].name, 'achievement');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.gamification, data.water.amount, data.studyPlan, data.trainingPlan, data.history.length, loaded]);

  /* ---- alarm ticking ---- */
  useEffect(() => {
    const interval = setInterval(() => {
      const hm = nowHM();
      const dk = todayKey();
      data.alarms.forEach(al => {
        if (!al.active || !al.days.includes(dk) || al.time !== hm) return;
        const fireKey = `${al.id}-${todayDateStr()}-${hm}`;
        if (firedRef.current.has(fireKey)) return;
        firedRef.current.add(fireKey);
        if (data.settings.soundEnabled) beep();
        setFiringAlarm(al);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try { new Notification(`⏰ ${al.label || 'Alarme'}`); } catch (e) {}
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [data.alarms, data.settings.soundEnabled]);

  /* ---- gamification ---- */
  const gainXp = useCallback(amount => {
    setData(prev => {
      let xp = prev.gamification.xp + amount;
      let level = prev.gamification.level;
      let needed = xpToNext(level);
      while (xp >= needed) { xp -= needed; level += 1; needed = xpToNext(level); }
      const tStr = todayDateStr();
      let streak = prev.gamification.streak;
      let streakCountedDate = prev.gamification.streakCountedDate;
      if (streakCountedDate !== tStr) {
        const y = new Date(); y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().slice(0, 10);
        streak = streakCountedDate === yStr ? streak + 1 : 1;
        streakCountedDate = tStr;
      }
      return { ...prev, gamification: { ...prev.gamification, xp, level, streak, streakCountedDate, totalCompleted: prev.gamification.totalCompleted + 1 } };
    });
  }, []);

  /* ---- study/training actions ---- */
  const toggleStudy = (day, id) => {
    const item = data.studyPlan[day].find(i => i.id === id);
    setData(prev => ({ ...prev, studyPlan: { ...prev.studyPlan, [day]: prev.studyPlan[day].map(i => i.id === id ? { ...i, done: !i.done } : i) } }));
    if (item && !item.done) gainXp(data.settings.xpPerTask);
  };
  const toggleTraining = (day, id) => {
    const item = data.trainingPlan[day].find(i => i.id === id);
    setData(prev => ({ ...prev, trainingPlan: { ...prev.trainingPlan, [day]: prev.trainingPlan[day].map(i => i.id === id ? { ...i, done: !i.done } : i) } }));
    if (item && !item.done) gainXp(data.settings.xpPerTask);
  };
  const addStudy = (day, subject, topic) => {
    if (!subject.trim()) return;
    setData(prev => ({ ...prev, studyPlan: { ...prev.studyPlan, [day]: [...prev.studyPlan[day], { id: genId(), subject, topic, done: false }] } }));
  };
  const editStudy = (day, id, values) => {
    setData(prev => ({ ...prev, studyPlan: { ...prev.studyPlan, [day]: prev.studyPlan[day].map(i => i.id === id ? { ...i, ...values } : i) } }));
  };
  const removeStudy = (day, id) => {
    setData(prev => ({ ...prev, studyPlan: { ...prev.studyPlan, [day]: prev.studyPlan[day].filter(i => i.id !== id) } }));
  };
  const addTraining = (day, exercise, sets, notes) => {
    if (!exercise.trim()) return;
    setData(prev => ({ ...prev, trainingPlan: { ...prev.trainingPlan, [day]: [...prev.trainingPlan[day], { id: genId(), exercise, sets, notes, done: false }] } }));
  };
  const editTraining = (day, id, values) => {
    setData(prev => ({ ...prev, trainingPlan: { ...prev.trainingPlan, [day]: prev.trainingPlan[day].map(i => i.id === id ? { ...i, ...values } : i) } }));
  };
  const removeTraining = (day, id) => {
    setData(prev => ({ ...prev, trainingPlan: { ...prev.trainingPlan, [day]: prev.trainingPlan[day].filter(i => i.id !== id) } }));
  };

  /* ---- water ---- */
  const addWater = ml => {
    const newAmount = Math.max(0, data.water.amount + ml);
    const crossedGoal = newAmount >= waterGoalMl && !data.water.awarded && waterGoalMl > 0;
    setData(prev => ({ ...prev, water: { ...prev.water, amount: newAmount, awarded: prev.water.awarded || crossedGoal } }));
    if (crossedGoal) gainXp(data.settings.xpWater);
  };

  /* ---- profile / weight log ---- */
  const updateProfile = (field, value) => setData(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  const logWeightToday = () => {
    if (!hasProfile) return;
    const d = todayDateStr();
    setData(prev => {
      const idx = prev.weightLog.findIndex(w => w.date === d);
      const entry = { date: d, weight: weightNum };
      const log = [...prev.weightLog];
      if (idx >= 0) log[idx] = entry; else log.push(entry);
      return { ...prev, weightLog: log.slice(-90) };
    });
  };

  /* ---- alarms ---- */
  const addAlarm = (time, label, days) => {
    if (!time || days.length === 0) return;
    setData(prev => ({ ...prev, alarms: [...prev.alarms, { id: genId(), time, label, days, active: true }] }));
  };
  const toggleAlarm = id => setData(prev => ({ ...prev, alarms: prev.alarms.map(a => a.id === id ? { ...a, active: !a.active } : a) }));
  const removeAlarm = id => setData(prev => ({ ...prev, alarms: prev.alarms.filter(a => a.id !== id) }));
  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  };

  /* ---- settings ---- */
  const updateSetting = (key, value) => setData(prev => ({ ...prev, settings: { ...prev.settings, [key]: value } }));

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
            <h1 className="sys-title text-xl sm:text-2xl tracking-widest mb-3" style={{ color: CYAN, textShadow: `0 0 16px ${CYAN}88` }}>O SISTEMA DESPERTOU</h1>
            <p className="text-sm sm:text-base mb-1" style={{ color: '#cbd5e1' }}>"Você adquiriu as qualificações para se tornar um Jogador."</p>
            <p className="text-xs sm:text-sm mb-6" style={{ color: '#64748b' }}>A partir de agora, cada estudo, cada série e cada meta cumprida vale experiência. Suba de rank.</p>
            <button onClick={() => setBooted(true)} className="w-full py-3 uppercase tracking-widest text-sm font-bold" style={{ background: `linear-gradient(90deg, ${CYAN}33, ${CYAN}66)`, border: `1px solid ${CYAN}`, color: '#e0fbff' }}>Iniciar</button>
          </Panel>
        </div>
      </div>
    );
  }

  if (!data.onboardingSeen) {
    return (
      <div style={{ background: BG, minHeight: '100vh' }}>
        {fontImport}
        <Onboarding onFinish={() => setData(prev => ({ ...prev, onboardingSeen: true }))} />
      </div>
    );
  }

  const tabs = [
    { id: 'status', label: 'Status', icon: Sword },
    { id: 'estudos', label: 'Estudos', icon: BookOpen },
    { id: 'treinos', label: 'Treinos', icon: Dumbbell },
    { id: 'corpo', label: 'Corpo', icon: Scale },
    { id: 'alarmes', label: 'Alarmes', icon: Bell },
    { id: 'progresso', label: 'Progresso', icon: BarChart2 },
    { id: 'conquistas', label: 'Conquistas', icon: Trophy },
    { id: 'config', label: 'Config', icon: SettingsIcon },
  ];

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#dbe4f0' }} className="pb-16">
      {fontImport}

      <header className="sticky top-0 z-20 border-b" style={{ background: 'rgba(5,8,16,0.92)', borderColor: '#1c2536', backdropFilter: 'blur(6px)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sword size={20} color={CYAN} />
            <span className="sys-title text-xs sm:text-sm tracking-widest" style={{ color: CYAN }}>SISTEMA</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="sys-title text-xs px-2 py-0.5 border" style={{ borderColor: rank.color, color: rank.color }}>RANK {rank.label}</span>
              <span className="text-xs sm:text-sm" style={{ color: '#94a3b8' }}>Nv. {data.gamification.level}</span>
            </div>
            <div className="flex items-center gap-1" style={{ color: '#fb923c' }}>
              <span className="text-xs sm:text-sm">🔥 {data.gamification.streak}</span>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-2"><Bar value={data.gamification.xp} max={xpNext} color={rank.color} height={6} /></div>
        <nav className="max-w-4xl mx-auto px-2 pb-2 flex gap-1 overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm whitespace-nowrap uppercase tracking-wide shrink-0" style={{ color: active ? BG : '#94a3b8', background: active ? CYAN : 'transparent', border: `1px solid ${active ? CYAN : '#1c2536'}` }}>
                <Icon size={14} />{t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 flex flex-col gap-5">
        {tab === 'status' && (
          <StatusTab
            dayName={DAY_NAMES[new Date().getDay()]}
            todayStudy={todayStudy} todayTraining={todayTraining}
            toggleStudy={toggleStudy} toggleTraining={toggleTraining} dayKey={dayKey}
            water={data.water} waterGoalMl={waterGoalMl} waterGoalL={waterGoalL} addWater={addWater}
            hasProfile={hasProfile} rank={rank} gamification={data.gamification} xpNext={xpNext}
          />
        )}
        {tab === 'estudos' && (
          <PlanTab title="Grade de Estudos" icon={BookOpen} color={CYAN} plan={data.studyPlan} kind="study" onToggle={toggleStudy} onAdd={addStudy} onEdit={editStudy} onRemove={removeStudy} />
        )}
        {tab === 'treinos' && (
          <PlanTab title="Grade de Treinos" icon={Dumbbell} color={VIOLET} plan={data.trainingPlan} kind="training" onToggle={toggleTraining} onAdd={addTraining} onEdit={editTraining} onRemove={removeTraining} />
        )}
        {tab === 'corpo' && (
          <CorpoTab profile={data.profile} updateProfile={updateProfile} hasProfile={hasProfile} idealWeight={idealWeight} waterGoalL={waterGoalL} weightDiff={weightDiff} weightLog={data.weightLog} logWeightToday={logWeightToday} />
        )}
        {tab === 'alarmes' && (
          <AlarmesTab alarms={data.alarms} addAlarm={addAlarm} toggleAlarm={toggleAlarm} removeAlarm={removeAlarm} notifPermission={notifPermission} requestNotifications={requestNotifications} />
        )}
        {tab === 'progresso' && <ProgressoTab history={data.history} />}
        {tab === 'conquistas' && <ConquistasTab unlocked={data.unlocked} />}
        {tab === 'config' && <SettingsTab settings={data.settings} updateSetting={updateSetting} />}
      </main>

      <Toast toast={toast} />

      {firingAlarm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="max-w-sm w-full flicker-in">
            <Panel glow={RED} className="text-center">
              <BellIcon size={36} color={RED} className="mx-auto mb-3" style={{ animation: 'pulseGlow 1s infinite', color: RED }} />
              <h3 className="sys-title text-lg tracking-widest mb-2" style={{ color: RED }}>ALARME</h3>
              <p className="mb-5 text-sm sm:text-base">{firingAlarm.label || 'Sem descrição'} — {firingAlarm.time}</p>
              <button onClick={() => setFiringAlarm(null)} className="w-full py-2.5 uppercase tracking-widest text-sm font-bold" style={{ background: `${RED}33`, border: `1px solid ${RED}`, color: '#fff' }}>Dispensar</button>
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
