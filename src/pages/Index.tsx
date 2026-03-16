import { useState, useEffect, useRef, useCallback } from "react";
import { FreeCityEngine, GameState, GameEvent } from "@/game/FreeCityGame";

const HERO_IMG = "https://cdn.poehali.dev/projects/a9f36bb0-9272-4890-a49e-4be84141c35f/files/a25c0af9-32a9-485e-b049-5dcc1a404cfc.jpg";
const CITY_BG = "https://cdn.poehali.dev/projects/a9f36bb0-9272-4890-a49e-4be84141c35f/files/099b4c22-04ce-4b83-9ce2-7d8875cc5c63.jpg";

const S = {
  orbitron: { fontFamily: "'Orbitron', monospace" } as React.CSSProperties,
  rajdhani: { fontFamily: "'Rajdhani', sans-serif" } as React.CSSProperties,
  exo: { fontFamily: "'Exo 2', sans-serif" } as React.CSSProperties,
};

const BOOT_LINES = [
  "FREE CITY ENGINE v3.7.1 — Initializing...",
  "Loading THREE.js renderer... WebGL2 OK",
  "Mounting 3D world geometry...",
  "Spawning player character (3D humanoid)...",
  "Generating city blocks... 81 blocks loaded",
  "NPC AI system: 4 entities active",
  "Vehicle physics: 4 vehicles spawned",
  "Shadow map: 2048x2048 PCF Soft",
  "Audio subsystem... READY",
  "Anti-cheat kernel... BYPASSED ✓",
  "► ЗАГРУЗКА ЗАВЕРШЕНА. Добро пожаловать в FREE CITY.",
];

function BootScreen({ onStart }: { onStart: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines(p => [...p, BOOT_LINES[i]]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        i++;
      } else {
        clearInterval(id);
        setTimeout(() => setReady(true), 500);
      }
    }, 200);
    return () => clearInterval(id);
  }, []);

  if (ready) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${CITY_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.38 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.88) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', userSelect: 'none' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,185,50,0.08)', border: '1px solid rgba(255,185,50,0.35)', padding: '3px 16px', marginBottom: 22, letterSpacing: '0.3em' }}>
            <span style={{ ...S.orbitron, fontSize: '0.6rem', color: '#FFB932' }}>FREE_CITY.EXE  —  v1.0.0</span>
          </div>
          <div style={{ ...S.orbitron, fontSize: '5.5rem', fontWeight: 900, color: '#fff', lineHeight: 0.88, letterSpacing: '-0.02em', textShadow: '0 0 60px rgba(255,185,50,0.45)' }}>FREE</div>
          <div style={{ ...S.orbitron, fontSize: '5.5rem', fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.02em', background: 'linear-gradient(90deg,#FFB932,#FF7A00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 20 }}>CITY</div>
          <div style={{ ...S.rajdhani, fontSize: '0.9rem', color: 'rgba(255,220,120,0.55)', letterSpacing: '0.38em', textTransform: 'uppercase', marginBottom: 50 }}>Open World Crime Simulator  ·  3D</div>
          <button onClick={onStart}
            style={{ ...S.rajdhani, fontWeight: 700, fontSize: '1rem', letterSpacing: '0.28em', color: '#000', background: 'linear-gradient(135deg,#FFB932,#FF8800)', border: 'none', padding: '15px 60px', cursor: 'pointer', textTransform: 'uppercase', boxShadow: '0 0 35px rgba(255,185,50,0.55)', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.06)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}>
            ▶ НАЧАТЬ ИГРУ
          </button>
          <div style={{ ...S.orbitron, fontSize: '0.44rem', color: 'rgba(255,185,50,0.28)', marginTop: 22, letterSpacing: '0.15em', lineHeight: 2 }}>
            WASD / ↑↓←→ — ДВИЖЕНИЕ  ·  ПКМ+МЫШЬ — КАМЕРА  ·  SCROLL — ZOOM<br />
            E / F — ВОЙТИ/ВЫЙТИ ИЗ АВТО  ·  G — СТРЕЛЯТЬ  ·  H — ЛЕЧИТЬСЯ
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000608', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '50px 80px', zIndex: 9999 }}>
      <div style={{ ...S.orbitron, fontSize: '0.6rem', color: '#39FF7E', letterSpacing: '0.2em', marginBottom: 18 }}>FREE_CITY.EXE — SYSTEM BOOT</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ ...S.exo, fontSize: '0.72rem', color: i === lines.length - 1 ? '#fff' : '#39FF7E', opacity: i === lines.length - 1 ? 1 : 0.55, lineHeight: 1.55 }}>
            <span style={{ color: 'rgba(57,255,126,0.38)', marginRight: 10 }}>{'>'}</span>{line}
            {i === lines.length - 1 && <span>█</span>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ ...S.orbitron, fontSize: '0.52rem', color: 'rgba(57,255,126,0.55)' }}>ЗАГРУЗКА 3D МИРА</span>
          <span style={{ ...S.orbitron, fontSize: '0.52rem', color: '#39FF7E' }}>{progress}%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(57,255,126,0.08)', border: '1px solid rgba(57,255,126,0.25)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#39FF7E,#00CC55)', boxShadow: '0 0 8px rgba(57,255,126,0.5)', transition: 'width 0.18s ease' }} />
        </div>
      </div>
    </div>
  );
}

function Bar({ value, color, bgColor, height = 7 }: { value: number; color: string; bgColor: string; height?: number }) {
  return (
    <div style={{ height, background: bgColor, border: `1px solid ${color}28`, overflow: 'hidden', borderRadius: 1 }}>
      <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, value))}%`, background: color, boxShadow: `0 0 6px ${color}88`, transition: 'width 0.4s ease' }} />
    </div>
  );
}

type Tab = "game" | "quests" | "inventory" | "skills" | "economy";

const QUESTS_DATA = [
  { id: 1, title: "Операция «Чёрный рынок»", reward: 15000, xp: 850, status: "active" as const, objective: "Прибыть в порт Эйсен" },
  { id: 2, title: "Должник Маркуса", reward: 3500, xp: 220, status: "active" as const, objective: "Найти Торреса" },
  { id: 3, title: "Гонка по Северному шоссе", reward: 8000, xp: 400, status: "available" as const },
  { id: 4, title: "Ограбление банка «Нова»", reward: 50000, xp: 3000, status: "available" as const },
  { id: 5, title: "Доставка медикаментов", reward: 2000, xp: 150, status: "completed" as const },
];

const SKILLS = [
  { name: "Стрельба", level: 7, xp: 680, color: "#FF3B3B", emoji: "🎯" },
  { name: "Вождение", level: 8, xp: 820, color: "#00D4FF", emoji: "🏎️" },
  { name: "Скрытность", level: 5, xp: 320, color: "#39FF7E", emoji: "👤" },
  { name: "Харизма", level: 6, xp: 510, color: "#FF9500", emoji: "💬" },
  { name: "Взлом", level: 4, xp: 240, color: "#BF5AF2", emoji: "💻" },
  { name: "Выживание", level: 9, xp: 950, color: "#FFD60A", emoji: "⚔️" },
];

const INVENTORY_ITEMS = ["🔫","🪖","💊","💊","💊","💣","💣","🔑","📱","💰","🗡️","🧪"];

export default function Index() {
  const [phase, setPhase] = useState<"boot" | "playing">("boot");
  const [tab, setTab] = useState<Tab>("game");
  const [state, setState] = useState<GameState>({
    health: 78, armor: 55, money: 47350, speed: 0,
    wantedLevel: 2, inVehicle: false, vehicleName: "",
    playerXP: 6820, playerLevel: 12,
    nearVehicle: false, nearNPC: false, npcName: "",
    combatLog: ["▶ Инициализация...", "▶ Мир загружен", "▶ Добро пожаловать!"],
    district: "ДАУНТАУН",
  });
  const [notifications, setNotifications] = useState<{ id: number; text: string; kind: string }[]>([]);
  const [npcDialog, setNpcDialog] = useState<{ npcName: string; npcRole: string; npcEmoji: string; color: string } | null>(null);
  const [npcResult, setNpcResult] = useState("");
  const [quests, setQuests] = useState(QUESTS_DATA);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FreeCityEngine | null>(null);
  const notifId = useRef(0);

  const addNotif = useCallback((text: string, kind = "info") => {
    const id = ++notifId.current;
    setNotifications(p => [...p, { id, text, kind }]);
    setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 3200);
  }, []);

  const handleEvent = useCallback((e: GameEvent) => {
    if (e.type === "stateUpdate") setState(p => ({ ...p, ...e.state }));
    else if (e.type === "notification") addNotif(e.text, e.kind);
    else if (e.type === "logAdd") setState(p => ({ ...p, combatLog: [e.line, ...p.combatLog.slice(0, 6)] }));
    else if (e.type === "npcDialog") setNpcDialog({ npcName: e.npcName, npcRole: e.npcRole, npcEmoji: e.npcEmoji, color: e.color });
  }, [addNotif]);

  useEffect(() => {
    if (phase !== "playing" || !canvasRef.current) return;
    const engine = new FreeCityEngine();
    engineRef.current = engine;
    engine.init(canvasRef.current, handleEvent);
    setState(engine.getState());
    return () => engine.destroy();
  }, [phase, handleEvent]);

  const completeQuest = (id: number) => {
    const q = quests.find(qq => qq.id === id);
    if (!q || q.status !== "active") return;
    setQuests(prev => prev.map(qq => qq.id === id ? { ...qq, status: "completed" as const } : qq));
    engineRef.current?.addMoney(q.reward);
    setState(p => ({ ...p, playerXP: Math.min(100000, p.playerXP + q.xp) }));
    addNotif(`✅ +$${q.reward.toLocaleString()}`, "money");
  };

  if (phase === "boot") return <BootScreen onStart={() => setPhase("playing")} />;

  const maxXP = 10000;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#020408' }}>

      {/* 3D CANVAS */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, display: 'block', width: '100%', height: '100%' }} />

      {/* NOTIFICATIONS */}
      <div style={{ position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', pointerEvents: 'none' }}>
        {notifications.map(n => (
          <div key={n.id} className="notif-in hud-panel" style={{ padding: '5px 14px', ...S.rajdhani, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap', color: n.kind === 'danger' ? '#FF3B3B' : n.kind === 'money' ? '#39FF7E' : n.kind === 'heal' ? '#00D4FF' : '#FFB932' }}>
            {n.text}
          </div>
        ))}
      </div>

      {/* PROXIMITY HINT */}
      {(state.nearVehicle || state.nearNPC) && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, 90px)', zIndex: 20, pointerEvents: 'none' }}>
          <div className="hud-panel pulse-glow" style={{ padding: '6px 16px', ...S.rajdhani, fontWeight: 700, fontSize: '0.72rem', color: '#FFB932', letterSpacing: '0.12em', textAlign: 'center' }}>
            {state.nearNPC ? `[E / F]  Говорить с ${state.npcName}` : `[E / F]  Сесть в машину`}
          </div>
        </div>
      )}

      {/* CROSSHAIR */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 5, pointerEvents: 'none' }}>
        <div style={{ width: 20, height: 20, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,185,50,0.45)' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,185,50,0.45)' }} />
          <div style={{ position: 'absolute', top: 5, left: 5, right: 5, bottom: 5, border: '1px solid rgba(255,185,50,0.25)', borderRadius: '50%' }} />
        </div>
      </div>

      {/* TOP-LEFT — PLAYER HUD */}
      <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 20, width: 218 }}>
        <div className="hud-panel corner-tl" style={{ padding: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #FFB932', flexShrink: 0 }}>
              <img src={HERO_IMG} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...S.orbitron, fontSize: '0.46rem', color: '#FFB932', letterSpacing: '0.15em' }}>FREE CITY</div>
              <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.88rem', color: '#fff', lineHeight: 1 }}>АЛЕКС РЕЙН</div>
              <div style={{ ...S.exo, fontSize: '0.57rem', color: 'rgba(255,220,120,0.5)', marginTop: 1 }}>📍 {state.district}</div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ ...S.orbitron, fontSize: '0.4rem', color: '#00D4FF' }}>LVL</div>
              <div style={{ ...S.orbitron, fontSize: '1.1rem', fontWeight: 900, color: '#00D4FF', lineHeight: 1 }}>{state.playerLevel}</div>
            </div>
          </div>
          <div style={{ marginBottom: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ ...S.rajdhani, fontSize: '0.5rem', fontWeight: 700, color: 'rgba(0,212,255,0.6)' }}>XP</span>
              <span style={{ ...S.orbitron, fontSize: '0.44rem', color: 'rgba(0,212,255,0.42)' }}>{state.playerXP}/{maxXP}</span>
            </div>
            <Bar value={(state.playerXP / maxXP) * 100} color="#00D4FF" bgColor="rgba(0,212,255,0.07)" height={4} />
          </div>
          {[
            { label: "❤ HP", val: state.health, color: "#FF3B3B", bg: "rgba(255,59,59,0.09)" },
            { label: "🛡 БРОНЯ", val: state.armor, color: "#00D4FF", bg: "rgba(0,212,255,0.07)" },
            { label: "⚡ ВЫНОСЛ", val: 90, color: "#39FF7E", bg: "rgba(57,255,126,0.06)" },
          ].map(b => (
            <div key={b.label} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ ...S.rajdhani, fontSize: '0.54rem', fontWeight: 700, color: b.color, letterSpacing: '0.07em' }}>{b.label}</span>
                <span style={{ ...S.orbitron, fontSize: '0.46rem', color: b.color }}>{b.val}%</span>
              </div>
              <Bar value={b.val} color={b.color} bgColor={b.bg} />
            </div>
          ))}
        </div>
      </div>

      {/* TOP-RIGHT */}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
        <div className="hud-panel" style={{ padding: '5px 13px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...S.orbitron, fontSize: '0.44rem', color: 'rgba(57,255,126,0.6)' }}>$</span>
          <span style={{ ...S.orbitron, fontSize: '0.95rem', fontWeight: 700, color: '#39FF7E' }}>{state.money.toLocaleString()}</span>
        </div>
        <div className="hud-panel" style={{ padding: '4px 11px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ ...S.rajdhani, fontSize: '0.52rem', fontWeight: 700, color: 'rgba(255,59,59,0.6)', marginRight: 3 }}>РОЗЫСК</span>
          {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 11, color: s <= state.wantedLevel ? '#FFB932' : 'rgba(255,185,50,0.14)', textShadow: s <= state.wantedLevel ? '0 0 5px #FFB932' : 'none' }}>★</span>)}
        </div>
        {state.inVehicle && (
          <div className="hud-panel pulse-glow" style={{ padding: '7px 13px', textAlign: 'center' }}>
            <div style={{ ...S.orbitron, fontSize: '0.44rem', color: '#00D4FF', letterSpacing: '0.1em', marginBottom: 1 }}>🚗 {state.vehicleName}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'center' }}>
              <span style={{ ...S.orbitron, fontSize: '1.4rem', fontWeight: 900, color: '#FFB932' }}>{state.speed}</span>
              <span style={{ ...S.rajdhani, fontSize: '0.55rem', color: 'rgba(255,185,50,0.5)' }}>КМ/Ч</span>
            </div>
          </div>
        )}
      </div>

      {/* ACTIVE QUEST */}
      <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10, pointerEvents: 'none' }}>
        <div className="hud-panel" style={{ padding: '5px 18px', textAlign: 'center', minWidth: 235 }}>
          <div style={{ ...S.orbitron, fontSize: '0.44rem', color: '#FFB932', letterSpacing: '0.2em', marginBottom: 1 }}>◆ ЗАДАНИЕ</div>
          <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>Операция «Чёрный рынок»</div>
          <div style={{ ...S.exo, fontSize: '0.6rem', color: 'rgba(255,220,120,0.55)', marginTop: 1 }}>▶ Прибыть в порт Эйсен</div>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 20, width: 390, maxHeight: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
        <div className="hud-panel corner-tl" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'inherit' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,185,50,0.12)', flexShrink: 0 }}>
            {([
              { id: "game", label: "ЭКРАН" },
              { id: "quests", label: "ЗАДАНИЯ" },
              { id: "inventory", label: "ИНВЕНТ." },
              { id: "skills", label: "УМЕНИЯ" },
              { id: "economy", label: "ФИНАНСЫ" },
            ] as { id: Tab; label: string }[]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 10px', borderBottom: `2px solid ${tab === t.id ? '#FFB932' : 'transparent'}`, color: tab === t.id ? '#FFB932' : 'rgba(255,185,50,0.38)', cursor: 'pointer', background: 'transparent', flexShrink: 0, transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: 11 }}>

            {tab === "game" && (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ ...S.orbitron, fontSize: '0.48rem', color: '#FFB932', letterSpacing: '0.14em', marginBottom: 6 }}>◈ ДЕЙСТВИЯ</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                    {[
                      { emoji: "🔫", label: "СТРЕЛЯТЬ", sub: "G — огонь", color: "#FF3B3B", fn: () => engineRef.current?.triggerFight() },
                      { emoji: "💊", label: "ЛЕЧИТЬСЯ", sub: "H — +25 HP", color: "#39FF7E", fn: () => { setState(p => ({ ...p, health: Math.min(100, p.health + 25) })); addNotif("💊 +25 HP", "heal"); } },
                      { emoji: "💰", label: "ОГРАБЛЕНИЕ", sub: "+$500", color: "#BF5AF2", fn: () => engineRef.current?.addMoney(500) },
                      { emoji: "🚔", label: "ПРОВОКАЦИЯ", sub: "+розыск", color: "#FFB932", fn: () => { setState(p => ({ ...p, wantedLevel: Math.min(5, p.wantedLevel + 1) })); addNotif("🚔 Розыск!", "danger"); } },
                    ].map(a => (
                      <div key={a.label} onClick={a.fn}
                        style={{ padding: 8, textAlign: 'center', background: 'rgba(5,8,14,0.9)', border: `1px solid ${a.color}22`, cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = a.color + '66')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = a.color + '22')}>
                        <div style={{ fontSize: '1.2rem' }}>{a.emoji}</div>
                        <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.62rem', color: a.color, letterSpacing: '0.07em' }}>{a.label}</div>
                        <div style={{ ...S.exo, fontSize: '0.5rem', color: a.color + '60' }}>{a.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.orbitron, fontSize: '0.48rem', color: '#FFB932', letterSpacing: '0.14em', marginBottom: 5 }}>◈ БОЙ-ЛОГ</div>
                  {state.combatLog.map((l, i) => (
                    <div key={i} style={{ ...S.exo, fontSize: '0.65rem', color: i === 0 ? 'rgba(255,220,120,0.9)' : 'rgba(255,220,120,0.3)', lineHeight: 1.55 }}>{l}</div>
                  ))}
                </div>
                <div style={{ background: 'rgba(255,185,50,0.025)', border: '1px solid rgba(255,185,50,0.09)', padding: 8 }}>
                  <div style={{ ...S.orbitron, fontSize: '0.4rem', color: 'rgba(255,185,50,0.35)', letterSpacing: '0.1em', lineHeight: 2 }}>
                    WASD / СТРЕЛКИ — ДВИЖЕНИЕ<br />
                    ПКМ + МЫШЬ — КАМЕРА  ·  SCROLL — ZOOM<br />
                    E / F — АВТО / NPC  ·  G — БОЙ  ·  H — ЛЕЧЕНИЕ
                  </div>
                </div>
              </div>
            )}

            {tab === "quests" && (
              <div className="fade-in-up">
                <div style={{ ...S.orbitron, fontSize: '0.48rem', color: '#FFB932', letterSpacing: '0.14em', marginBottom: 8 }}>◈ ЗАДАНИЯ</div>
                {quests.map(q => (
                  <div key={q.id} className="mission-item" style={{ paddingTop: 7, paddingBottom: 7, marginBottom: 4, borderLeftColor: q.status === 'completed' ? '#39FF7E' : q.status === 'active' ? '#FFB932' : 'transparent', opacity: q.status === 'completed' ? 0.48 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.75rem', color: q.status === 'completed' ? 'rgba(255,220,120,0.35)' : '#fff', textDecoration: q.status === 'completed' ? 'line-through' : 'none' }}>
                          {q.status === 'completed' ? '✓ ' : q.status === 'active' ? '▶ ' : '○ '}{q.title}
                        </div>
                        {'objective' in q && q.objective && q.status === 'active' && (
                          <div style={{ ...S.exo, fontSize: '0.56rem', color: '#00D4FF', marginTop: 2 }}>📍 {q.objective}</div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: 8, flexShrink: 0 }}>
                        <div style={{ ...S.orbitron, fontSize: '0.54rem', color: '#39FF7E' }}>${q.reward.toLocaleString()}</div>
                        <div style={{ ...S.rajdhani, fontSize: '0.5rem', color: '#00D4FF' }}>{q.xp} XP</div>
                        {q.status === 'active' && (
                          <button onClick={() => completeQuest(q.id)} style={{ ...S.rajdhani, fontSize: '0.5rem', color: '#FFB932', cursor: 'pointer', border: '1px solid rgba(255,185,50,0.28)', padding: '1px 5px', marginTop: 3, background: 'transparent' }}>СДАТЬ</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "inventory" && (
              <div className="fade-in-up">
                <div style={{ ...S.orbitron, fontSize: '0.48rem', color: '#FFB932', letterSpacing: '0.14em', marginBottom: 8 }}>◈ ИНВЕНТАРЬ</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
                  {INVENTORY_ITEMS.map((emoji, i) => (
                    <div key={i} className="inv-slot" style={{ height: 55 }} onClick={() => addNotif(`📦 ${emoji}`, "info")}>
                      <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
                    </div>
                  ))}
                  {Array.from({ length: 4 }).map((_, i) => <div key={`e${i}`} className="inv-slot" style={{ height: 55 }} />)}
                </div>
              </div>
            )}

            {tab === "skills" && (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ ...S.orbitron, fontSize: '0.48rem', color: '#FFB932', letterSpacing: '0.14em' }}>◈ ХАРАКТЕРИСТИКИ</div>
                {SKILLS.map(skill => (
                  <div key={skill.name} className="hud-panel" style={{ padding: 9 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: '0.95rem' }}>{skill.emoji}</span>
                        <span style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.78rem', color: '#fff' }}>{skill.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} style={{ width: 10, height: 10, background: i < skill.level ? skill.color : 'rgba(255,255,255,0.06)', border: `1px solid ${i < skill.level ? skill.color : 'rgba(255,255,255,0.07)'}`, borderRadius: 2, boxShadow: i < skill.level ? `0 0 3px ${skill.color}55` : 'none' }} />
                          ))}
                        </div>
                        <span style={{ ...S.orbitron, fontSize: '0.65rem', fontWeight: 700, color: skill.color }}>{skill.level}</span>
                      </div>
                    </div>
                    <Bar value={skill.xp / 10} color={skill.color} bgColor={`${skill.color}10`} height={3} />
                  </div>
                ))}
              </div>
            )}

            {tab === "economy" && (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div style={{ ...S.orbitron, fontSize: '0.48rem', color: '#FFB932', letterSpacing: '0.14em' }}>◈ ФИНАНСЫ</div>
                <div className="hud-panel" style={{ padding: 11 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ ...S.orbitron, fontSize: '0.42rem', color: 'rgba(57,255,126,0.55)' }}>НА РУКАХ</div>
                      <div style={{ ...S.orbitron, fontSize: '1rem', fontWeight: 700, color: '#39FF7E' }}>${state.money.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ ...S.orbitron, fontSize: '0.42rem', color: 'rgba(0,212,255,0.55)' }}>АКЦИИ</div>
                      <div style={{ ...S.orbitron, fontSize: '1rem', fontWeight: 700, color: '#00D4FF' }}>$124,380</div>
                    </div>
                  </div>
                </div>
                {[
                  { name: "ArmsTech Corp", ticker: "ARMTC", price: 248.5, change: +5.2 },
                  { name: "NovaDrive Auto", ticker: "NDA", price: 87.3, change: -1.8 },
                  { name: "ShadowNet Inc", ticker: "SHNT", price: 512.0, change: +12.4 },
                ].map(s => (
                  <div key={s.ticker} className="hud-panel" style={{ padding: '7px 9px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => addNotif(`📈 ${s.name}`, "info")}>
                    <div>
                      <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.75rem', color: '#fff' }}>{s.name}</div>
                      <div style={{ ...S.orbitron, fontSize: '0.42rem', color: 'rgba(255,185,50,0.4)' }}>{s.ticker}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ ...S.orbitron, fontSize: '0.72rem', fontWeight: 700, color: s.change > 0 ? '#39FF7E' : '#FF3B3B' }}>${s.price}</div>
                      <div style={{ ...S.rajdhani, fontSize: '0.52rem', color: s.change > 0 ? '#39FF7E' : '#FF3B3B' }}>{s.change > 0 ? '+' : ''}{s.change}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* NPC DIALOG */}
      {npcDialog && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 30, background: 'rgba(0,0,0,0.6)' }}>
          <div className="dialog-box fade-in-up" style={{ width: 480, padding: 15 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', background: 'rgba(255,185,50,0.07)', border: `2px solid ${npcDialog.color}50` }}>{npcDialog.npcEmoji}</div>
              <div>
                <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.95rem', color: npcDialog.color }}>{npcDialog.npcName}</div>
                <div style={{ ...S.exo, fontSize: '0.6rem', color: npcDialog.color + '60' }}>{npcDialog.npcRole}</div>
              </div>
              <button onClick={() => { setNpcDialog(null); setNpcResult(""); }} style={{ marginLeft: 'auto', color: 'rgba(255,185,50,0.45)', fontSize: '1rem', cursor: 'pointer', background: 'transparent', border: 'none' }}>✕</button>
            </div>
            <div style={{ ...S.exo, fontSize: '0.78rem', color: 'rgba(255,220,120,0.85)', lineHeight: 1.65, marginBottom: 10, padding: '8px 11px', background: 'rgba(255,185,50,0.04)', borderLeft: `2px solid ${npcDialog.color}40` }}>
              {npcResult || `"Что тебе нужно? Говори быстрее."`}
            </div>
            {!npcResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { text: "Есть работа для меня?", res: "Порт, склад 7. Возьми груз и уходи. Заплачу $5 000.", money: 5000 },
                  { text: "Купить информацию ($500)", res: "Полиция контролирует Северный мост. Объезжай через набережную.", money: -500 },
                  { text: "Уйти", res: "" },
                ].map((c, i) => (
                  <div key={i} className="dialog-choice" onClick={() => {
                    if (!c.res) { setNpcDialog(null); setNpcResult(""); return; }
                    if (c.money) {
                      setState(p => ({ ...p, money: p.money + c.money }));
                      addNotif(c.money > 0 ? `💰 +$${c.money}` : `💸 -$${Math.abs(c.money)}`, c.money > 0 ? "money" : "danger");
                    }
                    setNpcResult(c.res);
                  }}>
                    <span style={{ color: 'rgba(0,212,255,0.6)', marginRight: 6 }}>[{i + 1}]</span>{c.text}
                  </div>
                ))}
              </div>
            ) : (
              <div className="dialog-choice" style={{ textAlign: 'center', color: '#FFB932' }} onClick={() => { setNpcDialog(null); setNpcResult(""); }}>
                [ЗАКРЫТЬ] ▶
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
