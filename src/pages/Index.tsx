import { useState, useEffect, useRef } from "react";

const CITY_BG = "https://cdn.poehali.dev/projects/a9f36bb0-9272-4890-a49e-4be84141c35f/files/099b4c22-04ce-4b83-9ce2-7d8875cc5c63.jpg";
const HERO_IMG = "https://cdn.poehali.dev/projects/a9f36bb0-9272-4890-a49e-4be84141c35f/files/a25c0af9-32a9-485e-b049-5dcc1a404cfc.jpg";

type Tab = "game" | "quests" | "inventory" | "skills" | "economy" | "transport";

interface Quest {
  id: number;
  title: string;
  desc: string;
  reward: number;
  xp: number;
  status: "active" | "completed" | "available";
  type: "main" | "side";
  objective?: string;
}

interface NPC {
  name: string;
  role: string;
  avatar: string;
  lines: string[];
  choices: { text: string; result: string; money?: number }[];
}

const QUESTS: Quest[] = [
  { id: 1, title: "Операция «Чёрный рынок»", desc: "Найди источник нелегального оружия в доках", reward: 15000, xp: 850, status: "active", type: "main", objective: "Прибыть в порт Эйсен" },
  { id: 2, title: "Должник Маркуса", desc: "Взыскать долг с Рэя Торреса", reward: 3500, xp: 220, status: "active", type: "side", objective: "Найти Торреса в баре 'Rust'" },
  { id: 3, title: "Гонка по Северному шоссе", desc: "Выиграть нелегальные гонки", reward: 8000, xp: 400, status: "available", type: "side" },
  { id: 4, title: "Предатель в рядах", desc: "Выяснить, кто сдаёт информацию полиции", reward: 20000, xp: 1200, status: "available", type: "main" },
  { id: 5, title: "Ограбление банка «Нова»", desc: "Идеальное ограбление — никаких следов", reward: 50000, xp: 3000, status: "available", type: "main" },
  { id: 6, title: "Доставка медикаментов", desc: "Доставить груз в трущобы до рассвета", reward: 2000, xp: 150, status: "completed", type: "side" },
];

const NPC_DATA: NPC = {
  name: "Маркус Рейн",
  role: "Информатор / Торговец",
  avatar: "🕵️",
  lines: [
    "Слышал, на доках появились новые игроки. Опасные ребята.",
    "Нужен человек для деликатного дела. Хорошо заплачу.",
    "В этом городе выживают те, кто умеет молчать... и стрелять.",
  ],
  choices: [
    { text: "Расскажи про доки", result: "Там орудует банда «Сталь». Трое охранников, склад за воротами." },
    { text: "Взять задание ($3 500)", result: "Найди Торреса в баре 'Rust'. Приведи деньги или что останется от него.", money: 3500 },
    { text: "Купить информацию ($500)", result: "Полиция готовит облаву на Северном. Езди осторожно эту ночь.", money: -500 },
    { text: "Уйти", result: "" },
  ],
};

const WEAPONS = [
  { name: "Desert Eagle", ammo: 7, maxAmmo: 7, emoji: "🔫", damage: 85, tier: "S" },
  { name: "M4A1", ammo: 28, maxAmmo: 30, emoji: "🪖", damage: 62, tier: "A" },
  { name: "Нож", ammo: null, maxAmmo: null, emoji: "🔪", damage: 40, tier: "B" },
  { name: "Граната", ammo: 3, maxAmmo: 3, emoji: "💣", damage: 95, tier: "S" },
];

const VEHICLES = [
  { name: "Dodge Viper '22", type: "Суперкар", speed: 340, hp: 620, emoji: "🏎️", fuel: 80 },
  { name: "Yamaha R1", type: "Мотоцикл", speed: 299, hp: 180, emoji: "🏍️", fuel: 95 },
  { name: "Humvee Tac", type: "Внедорожник", speed: 160, hp: 450, emoji: "🚙", fuel: 60 },
  { name: "Bell 407", type: "Вертолёт", speed: 240, hp: 900, emoji: "🚁", fuel: 45 },
  { name: "Катер Speed", type: "Катер", speed: 110, hp: 280, emoji: "🚤", fuel: 70 },
];

const INVENTORY = [
  { emoji: "🔫", name: "Desert Eagle", qty: 1, equipped: true },
  { emoji: "🪖", name: "Тактический жилет", qty: 1, equipped: true },
  { emoji: "💊", name: "Аптечка", qty: 5, equipped: false },
  { emoji: "💣", name: "Граната Ф-1", qty: 3, equipped: false },
  { emoji: "🔑", name: "Ключ от склада", qty: 1, equipped: false },
  { emoji: "📱", name: "Зашифрованный телефон", qty: 1, equipped: false },
  { emoji: "💰", name: "Кейс с деньгами", qty: 2, equipped: false },
  { emoji: "🗡️", name: "Боевой нож", qty: 1, equipped: false },
  { emoji: "🎯", name: "Снайперка L115", qty: 1, equipped: false },
  { emoji: "🧪", name: "Адреналин", qty: 2, equipped: false },
  { emoji: "🛡️", name: "Кевларовая вставка", qty: 3, equipped: false },
  { emoji: "", name: "", qty: 0, equipped: false },
];

const SKILLS = [
  { name: "Стрельба", level: 7, maxLevel: 10, xp: 680, maxXp: 1000, color: "#FF3B3B", emoji: "🎯" },
  { name: "Вождение", level: 8, maxLevel: 10, xp: 820, maxXp: 1000, color: "#00D4FF", emoji: "🏎️" },
  { name: "Скрытность", level: 5, maxLevel: 10, xp: 320, maxXp: 1000, color: "#39FF7E", emoji: "👤" },
  { name: "Харизма", level: 6, maxLevel: 10, xp: 510, maxXp: 1000, color: "#FF9500", emoji: "💬" },
  { name: "Взлом", level: 4, maxLevel: 10, xp: 240, maxXp: 1000, color: "#BF5AF2", emoji: "💻" },
  { name: "Выживание", level: 9, maxLevel: 10, xp: 950, maxXp: 1000, color: "#FFD60A", emoji: "⚔️" },
];

const STOCKS = [
  { name: "ArmsTech Corp", ticker: "ARMTC", price: 248.50, change: +5.2, owned: 10 },
  { name: "NovaDrive Auto", ticker: "NDA", price: 87.30, change: -1.8, owned: 25 },
  { name: "ShadowNet Inc", ticker: "SHNT", price: 512.00, change: +12.4, owned: 5 },
  { name: "FreeCity Media", ticker: "FCM", price: 33.75, change: +0.3, owned: 50 },
];

export default function Index() {
  const [tab, setTab] = useState<Tab>("game");
  const [health, setHealth] = useState(78);
  const [armor] = useState(55);
  const [stamina] = useState(90);
  const [money, setMoney] = useState(47350);
  const [wantedLevel, setWantedLevel] = useState(2);
  const [activeWeapon, setActiveWeapon] = useState(0);
  const [inVehicle, setInVehicle] = useState<number | null>(null);
  const [showNPC, setShowNPC] = useState(false);
  const [npcLine, setNpcLine] = useState(0);
  const [npcResult, setNpcResult] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [playerXP, setPlayerXP] = useState(6820);
  const maxXP = 10000;
  const [notifications, setNotifications] = useState<{ id: number; text: string; type: string }[]>([]);
  const [combatLog, setCombatLog] = useState([
    "▶ Вошёл в зону «Северный порт»",
    "⚠ Обнаружена активность банды Сталь",
    "💰 Получен бонус за скрытность: +250$",
  ]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [speed, setSpeed] = useState(0);
  const speedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifId = useRef(0);

  useEffect(() => {
    return () => { if (speedRef.current) clearInterval(speedRef.current); };
  }, []);

  const addNotif = (text: string, type = "info") => {
    const id = ++notifId.current;
    setNotifications(p => [...p, { id, text, type }]);
    setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 3500);
  };

  const addLog = (msg: string) => setCombatLog(p => [msg, ...p.slice(0, 6)]);

  const handleHeal = () => {
    if (health < 100) {
      setHealth(h => Math.min(100, h + 25));
      addNotif("💊 Аптечка использована +25 HP", "heal");
      addLog("💊 Использовал аптечку: +25 HP");
    }
  };

  const handleShoot = () => {
    const w = WEAPONS[activeWeapon];
    const dmg = Math.floor(Math.random() * w.damage + 20);
    addLog(`🔫 Выстрел из ${w.name}: ${dmg} урона`);
    if (Math.random() > 0.65) {
      setHealth(h => Math.max(0, h - Math.floor(Math.random() * 15 + 5)));
      addLog("⚠ Получен входящий огонь!");
      addNotif("⚠ Получен урон!", "danger");
    } else {
      addNotif(`🎯 Враг поражён! ${dmg} урона`, "combat");
    }
    setPlayerXP(x => Math.min(maxXP, x + 50));
  };

  const handleWanted = () => {
    setWantedLevel(w => Math.min(5, w + 1));
    addNotif("🚔 Уровень розыска повышен!", "danger");
    addLog("🚔 Полиция объявила облаву!");
  };

  const handleDriveVehicle = (idx: number) => {
    setInVehicle(idx);
    setTab("game");
    addNotif(`🚗 Сел в ${VEHICLES[idx].name}`, "info");
    addLog(`🚗 Транспортное средство: ${VEHICLES[idx].name}`);
    let s = 0;
    if (speedRef.current) clearInterval(speedRef.current);
    speedRef.current = setInterval(() => {
      s = Math.min(VEHICLES[idx].speed, s + Math.random() * 30 + 10);
      setSpeed(Math.floor(s));
      if (s >= VEHICLES[idx].speed && speedRef.current) clearInterval(speedRef.current);
    }, 300);
  };

  const handleExitVehicle = () => {
    setInVehicle(null);
    setSpeed(0);
    if (speedRef.current) clearInterval(speedRef.current);
    addNotif("🚗 Вышел из транспорта", "info");
  };

  const handleNPCChoice = (choice: typeof NPC_DATA.choices[0]) => {
    if (!choice.result) { setShowNPC(false); setShowResult(false); setNpcResult(""); return; }
    if (choice.money) {
      setMoney(m => m + choice.money!);
      addNotif(choice.money > 0 ? `💰 +$${choice.money.toLocaleString()}` : `💸 -$${Math.abs(choice.money).toLocaleString()}`, choice.money > 0 ? "money" : "warn");
      addLog(`💰 ${choice.money > 0 ? "Заработано" : "Потрачено"} $${Math.abs(choice.money).toLocaleString()}`);
    }
    setNpcResult(choice.result);
    setShowResult(true);
    setPlayerXP(x => Math.min(maxXP, x + 100));
  };

  const completeMission = (quest: Quest) => {
    setMoney(m => m + quest.reward);
    setPlayerXP(x => Math.min(maxXP, x + quest.xp));
    addNotif(`✅ Задание выполнено! +$${quest.reward.toLocaleString()}`, "money");
    addLog(`✅ Задание «${quest.title}» выполнено`);
  };

  const S = {
    orbitron: { fontFamily: "'Orbitron', monospace" } as React.CSSProperties,
    rajdhani: { fontFamily: "'Rajdhani', sans-serif" } as React.CSSProperties,
    exo: { fontFamily: "'Exo 2', sans-serif" } as React.CSSProperties,
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#020408' }}>
      {/* BACKGROUND */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <img src={CITY_BG} alt="city" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.65 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,8,14,0.3) 0%, rgba(5,8,14,0.1) 40%, rgba(5,8,14,0.6) 100%)' }} />
      </div>
      {/* VIGNETTE */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2,4,10,0.85) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* NOTIFICATIONS */}
      <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', pointerEvents: 'none' }}>
        {notifications.map(n => (
          <div key={n.id} className="notif-in hud-panel" style={{ padding: '6px 16px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: n.type === 'danger' ? '#FF3B3B' : n.type === 'money' ? '#39FF7E' : n.type === 'heal' ? '#00D4FF' : '#FFB932', ...S.rajdhani }}>
            {n.text}
          </div>
        ))}
      </div>

      {/* TOP LEFT — PLAYER HUD */}
      <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 20, width: 220 }}>
        <div className="hud-panel corner-tl" style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #FFB932', flexShrink: 0 }}>
              <img src={HERO_IMG} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...S.orbitron, fontSize: '0.52rem', color: '#FFB932', letterSpacing: '0.15em' }}>ИГРОК</div>
              <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.88rem', color: '#fff', lineHeight: 1 }}>АЛЕКС РЕЙН</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...S.orbitron, fontSize: '0.45rem', color: '#00D4FF' }}>LVL</div>
              <div style={{ ...S.orbitron, fontSize: '1.1rem', fontWeight: 900, color: '#00D4FF', lineHeight: 1 }}>12</div>
            </div>
          </div>

          {/* XP */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ ...S.rajdhani, fontSize: '0.55rem', color: 'rgba(0,212,255,0.6)', fontWeight: 700, letterSpacing: '0.1em' }}>ОПЫТ</span>
              <span style={{ ...S.orbitron, fontSize: '0.5rem', color: 'rgba(0,212,255,0.5)' }}>{playerXP.toLocaleString()} / {maxXP.toLocaleString()}</span>
            </div>
            <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${(playerXP / maxXP) * 100}%` }} /></div>
          </div>

          {/* Health */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ ...S.rajdhani, fontSize: '0.58rem', fontWeight: 700, color: '#FF3B3B', letterSpacing: '0.1em' }}>❤ ЗДОРОВЬЕ</span>
              <span style={{ ...S.orbitron, fontSize: '0.55rem', color: '#FF3B3B' }}>{health}%</span>
            </div>
            <div className="health-bar"><div className="health-fill" style={{ width: `${health}%` }} /></div>
          </div>

          {/* Armor */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ ...S.rajdhani, fontSize: '0.58rem', fontWeight: 700, color: '#00D4FF', letterSpacing: '0.1em' }}>🛡 БРОНЯ</span>
              <span style={{ ...S.orbitron, fontSize: '0.55rem', color: '#00D4FF' }}>{armor}%</span>
            </div>
            <div className="armor-bar"><div className="armor-fill" style={{ width: `${armor}%` }} /></div>
          </div>

          {/* Stamina */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ ...S.rajdhani, fontSize: '0.58rem', fontWeight: 700, color: '#39FF7E', letterSpacing: '0.1em' }}>⚡ ВЫНОСЛ.</span>
              <span style={{ ...S.orbitron, fontSize: '0.55rem', color: '#39FF7E' }}>{stamina}%</span>
            </div>
            <div className="stamina-bar"><div className="stamina-fill" style={{ width: `${stamina}%` }} /></div>
          </div>
        </div>
      </div>

      {/* TOP RIGHT — MONEY + WANTED */}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <div className="hud-panel" style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...S.orbitron, fontSize: '0.5rem', color: 'rgba(57,255,126,0.7)', letterSpacing: '0.1em' }}>БАЛАНС</span>
          <span style={{ ...S.orbitron, fontSize: '1rem', fontWeight: 700, color: '#39FF7E' }}>${money.toLocaleString()}</span>
        </div>
        <div className="hud-panel" style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ ...S.rajdhani, fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,59,59,0.7)', marginRight: 4, letterSpacing: '0.1em' }}>РОЗЫСК</span>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{ fontSize: 13, color: s <= wantedLevel ? '#FFB932' : 'rgba(255,185,50,0.2)', textShadow: s <= wantedLevel ? '0 0 8px rgba(255,185,50,0.8)' : 'none', transition: 'all 0.3s' }}>★</span>
          ))}
        </div>

        {inVehicle !== null && (
          <div className="hud-panel pulse-glow" style={{ padding: '8px 14px', textAlign: 'center' }}>
            <div style={{ ...S.orbitron, fontSize: '0.5rem', color: '#00D4FF', letterSpacing: '0.15em', marginBottom: 2 }}>{VEHICLES[inVehicle].emoji} {VEHICLES[inVehicle].name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center' }}>
              <span style={{ ...S.orbitron, fontSize: '1.5rem', fontWeight: 900, color: '#FFB932' }}>{speed}</span>
              <span style={{ ...S.rajdhani, fontSize: '0.6rem', color: 'rgba(255,185,50,0.6)' }}>КМ/Ч</span>
            </div>
          </div>
        )}
      </div>

      {/* ACTIVE QUEST — top center */}
      <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <div className="hud-panel" style={{ padding: '6px 20px', textAlign: 'center', minWidth: 240 }}>
          <div style={{ ...S.orbitron, fontSize: '0.48rem', color: '#FFB932', letterSpacing: '0.2em', marginBottom: 2 }}>◆ ТЕКУЩЕЕ ЗАДАНИЕ</div>
          <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Операция «Чёрный рынок»</div>
          <div style={{ ...S.exo, fontSize: '0.62rem', color: 'rgba(255,220,120,0.65)', marginTop: 2 }}>▶ Прибыть в порт Эйсен</div>
        </div>
      </div>

      {/* MINIMAP — bottom right */}
      <div style={{ position: 'fixed', bottom: 80, right: 12, zIndex: 20 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ ...S.orbitron, fontSize: '0.48rem', color: '#FFB932', textAlign: 'center', marginBottom: 2, fontWeight: 700 }}>N</div>
          <div style={{ width: 136, height: 136, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,185,50,0.4)', boxShadow: '0 0 20px rgba(255,185,50,0.12), inset 0 0 30px rgba(0,0,0,0.5)', position: 'relative' }}>
            <div style={{ width: '100%', height: '100%', background: 'radial-gradient(circle, #0d1520 0%, #070d16 100%)', position: 'relative' }}>
              <svg width="136" height="136" style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
                <line x1="68" y1="0" x2="68" y2="136" stroke="#FFB932" strokeWidth="0.5" />
                <line x1="0" y1="68" x2="136" y2="68" stroke="#FFB932" strokeWidth="0.5" />
                <circle cx="68" cy="68" r="28" fill="none" stroke="#FFB932" strokeWidth="0.5" />
                <circle cx="68" cy="68" r="53" fill="none" stroke="#FFB932" strokeWidth="0.5" />
              </svg>
              <svg width="136" height="136" style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
                <line x1="18" y1="43" x2="118" y2="43" stroke="#334466" strokeWidth="2.5" />
                <line x1="18" y1="83" x2="118" y2="83" stroke="#334466" strokeWidth="2.5" />
                <line x1="38" y1="8" x2="38" y2="128" stroke="#334466" strokeWidth="2.5" />
                <line x1="88" y1="8" x2="88" y2="128" stroke="#334466" strokeWidth="2.5" />
                <rect x="43" y="48" width="40" height="30" fill="#1a2230" />
                <rect x="12" y="50" width="22" height="28" fill="#1a2230" />
                <rect x="93" y="48" width="22" height="30" fill="#1a2230" />
              </svg>
              {/* Player dot */}
              <div style={{ position: 'absolute', left: '50%', top: '50%', width: 8, height: 8, background: '#FFB932', borderRadius: '50%', transform: 'translate(-50%,-50%)', boxShadow: '0 0 8px #FFB932', zIndex: 10 }} />
              {/* Enemies */}
              {[{ x: 35, y: 38 }, { x: 65, y: 28 }, { x: 24, y: 63 }].map((e, i) => (
                <div key={i} className="minimap-dot minimap-enemy" style={{ left: `${e.x}%`, top: `${e.y}%` }} />
              ))}
              {/* Mission marker */}
              <div style={{ position: 'absolute', left: '70%', top: '60%', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '7px solid #FFB932', transform: 'translate(-50%,-50%)', filter: 'drop-shadow(0 0 4px #FFB932)' }} />
            </div>
          </div>
          <div style={{ ...S.orbitron, fontSize: '0.42rem', color: 'rgba(255,185,50,0.4)', textAlign: 'center', marginTop: 4 }}>⚔ СЕВЕРНЫЙ ПОРТ</div>
        </div>
      </div>

      {/* WEAPON SLOTS */}
      <div style={{ position: 'fixed', bottom: 12, right: 12, zIndex: 20, display: 'flex', gap: 4 }}>
        {WEAPONS.map((w, i) => (
          <div key={i} onClick={() => { setActiveWeapon(i); addNotif(`🔫 ${w.name}`, "info"); }}
            style={{ width: 52, height: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,14,0.9)', border: `1px solid ${i === activeWeapon ? '#FFB932' : 'rgba(255,185,50,0.15)'}`, boxShadow: i === activeWeapon ? '0 0 15px rgba(255,185,50,0.3)' : 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '1.3rem' }}>{w.emoji}</span>
            {w.ammo !== null && <span style={{ ...S.orbitron, fontSize: '0.42rem', color: i === activeWeapon ? '#FFB932' : 'rgba(255,185,50,0.4)', marginTop: 1 }}>{w.ammo}/{w.maxAmmo}</span>}
            <span style={{ ...S.rajdhani, fontSize: '0.42rem', color: 'rgba(255,185,50,0.4)', position: 'absolute', top: 2, right: 3 }}>{i + 1}</span>
          </div>
        ))}
      </div>

      {/* MAIN PANEL */}
      <div style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 20, width: 424, maxHeight: 'calc(100vh - 190px)', display: 'flex', flexDirection: 'column' }}>
        <div className="hud-panel corner-tl" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'inherit', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,185,50,0.15)', overflowX: 'auto', flexShrink: 0 }}>
            {([
              { id: "game", label: "ЭКРАН" },
              { id: "quests", label: "ЗАДАНИЯ" },
              { id: "inventory", label: "ИНВЕНТ." },
              { id: "skills", label: "УМЕНИЯ" },
              { id: "economy", label: "ФИНАНСЫ" },
              { id: "transport", label: "ТРАНСПОРТ" },
            ] as { id: Tab; label: string }[]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ ...S.rajdhani, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.65rem', padding: '7px 10px', borderBottom: `2px solid ${tab === t.id ? '#FFB932' : 'transparent'}`, color: tab === t.id ? '#FFB932' : 'rgba(255,185,50,0.45)', cursor: 'pointer', background: 'transparent', flexShrink: 0, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: 12 }}>

            {/* GAME TAB */}
            {tab === "game" && (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ ...S.orbitron, fontSize: '0.52rem', color: '#FFB932', letterSpacing: '0.15em', marginBottom: 6 }}>◈ БОЕВОЙ ЛОГ</div>
                  {combatLog.map((log, i) => (
                    <div key={i} style={{ ...S.exo, fontSize: '0.68rem', color: i === 0 ? 'rgba(255,220,120,0.9)' : 'rgba(255,220,120,0.38)', lineHeight: 1.5 }}>{log}</div>
                  ))}
                </div>

                <div>
                  <div style={{ ...S.orbitron, fontSize: '0.52rem', color: '#FFB932', letterSpacing: '0.15em', marginBottom: 8 }}>◈ ДЕЙСТВИЯ</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { emoji: "🔫", label: "СТРЕЛЯТЬ", sub: WEAPONS[activeWeapon].name, color: "#FF3B3B", onClick: handleShoot },
                      { emoji: "💊", label: "ЛЕЧИТЬСЯ", sub: "+25 HP", color: "#39FF7E", onClick: handleHeal },
                      { emoji: "💬", label: "ДИАЛОГ NPC", sub: "Маркус Рейн", color: "#00D4FF", onClick: () => setShowNPC(true) },
                      { emoji: "🚔", label: "ПРОВОКАЦИЯ", sub: "+1 розыск", color: "#FFB932", onClick: handleWanted },
                    ].map(a => (
                      <div key={a.label} onClick={a.onClick}
                        style={{ padding: 8, textAlign: 'center', background: 'rgba(5,8,14,0.9)', border: `1px solid ${a.color}33`, cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.border = `1px solid ${a.color}88`)}
                        onMouseLeave={e => (e.currentTarget.style.border = `1px solid ${a.color}33`)}>
                        <div style={{ fontSize: '1.3rem' }}>{a.emoji}</div>
                        <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.63rem', color: a.color, letterSpacing: '0.08em' }}>{a.label}</div>
                        <div style={{ ...S.exo, fontSize: '0.55rem', color: `${a.color}80` }}>{a.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {inVehicle !== null ? (
                  <div onClick={handleExitVehicle}
                    style={{ padding: 8, textAlign: 'center', background: 'rgba(5,8,14,0.9)', border: '1px solid rgba(255,59,59,0.3)', cursor: 'pointer' }}>
                    <span style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.7rem', color: '#FF3B3B', letterSpacing: '0.1em' }}>
                      🚪 ВЫЙТИ ИЗ {VEHICLES[inVehicle].name.toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div onClick={() => setTab("transport")}
                    style={{ padding: 8, textAlign: 'center', background: 'rgba(5,8,14,0.9)', border: '1px solid rgba(0,212,255,0.2)', cursor: 'pointer' }}>
                    <span style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.7rem', color: '#00D4FF', letterSpacing: '0.1em' }}>🚗 ВЫБРАТЬ ТРАНСПОРТ</span>
                  </div>
                )}
              </div>
            )}

            {/* QUESTS TAB */}
            {tab === "quests" && (
              <div className="fade-in-up">
                <div style={{ ...S.orbitron, fontSize: '0.52rem', color: '#FFB932', letterSpacing: '0.15em', marginBottom: 10 }}>◈ ЗАДАНИЯ И МИССИИ</div>
                {(["main", "side"] as const).map(type => (
                  <div key={type}>
                    <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.6rem', color: type === 'main' ? '#FFB932' : '#00D4FF', letterSpacing: '0.15em', marginTop: 8, marginBottom: 4 }}>
                      {type === 'main' ? '◆ СЮЖЕТНЫЕ' : '◇ ПОБОЧНЫЕ'}
                    </div>
                    {QUESTS.filter(q => q.type === type).map(q => (
                      <div key={q.id} className="mission-item" style={{ paddingTop: 7, paddingBottom: 7, marginBottom: 4, borderLeftColor: q.status === 'completed' ? '#39FF7E' : q.status === 'active' ? '#FFB932' : 'transparent', opacity: q.status === 'completed' ? 0.55 : 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.78rem', color: q.status === 'completed' ? 'rgba(255,220,120,0.4)' : '#fff', textDecoration: q.status === 'completed' ? 'line-through' : 'none' }}>
                              {q.status === 'completed' ? '✓ ' : q.status === 'active' ? '▶ ' : '○ '}{q.title}
                            </div>
                            <div style={{ ...S.exo, fontSize: '0.62rem', color: 'rgba(255,220,120,0.5)', marginTop: 2 }}>{q.desc}</div>
                            {q.objective && q.status === 'active' && (
                              <div style={{ ...S.exo, fontSize: '0.6rem', color: '#00D4FF', marginTop: 3 }}>📍 {q.objective}</div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', marginLeft: 8, flexShrink: 0 }}>
                            <div style={{ ...S.orbitron, fontSize: '0.58rem', color: '#39FF7E', whiteSpace: 'nowrap' }}>${q.reward.toLocaleString()}</div>
                            <div style={{ ...S.rajdhani, fontSize: '0.53rem', color: '#00D4FF' }}>{q.xp} XP</div>
                            {q.status === 'active' && (
                              <button onClick={() => completeMission(q)}
                                style={{ ...S.rajdhani, fontSize: '0.52rem', color: '#FFB932', cursor: 'pointer', border: '1px solid rgba(255,185,50,0.3)', padding: '1px 6px', marginTop: 3, background: 'transparent' }}>
                                СДАТЬ
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* INVENTORY TAB */}
            {tab === "inventory" && (
              <div className="fade-in-up">
                <div style={{ ...S.orbitron, fontSize: '0.52rem', color: '#FFB932', letterSpacing: '0.15em', marginBottom: 10 }}>◈ ИНВЕНТАРЬ</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                  {INVENTORY.map((item, i) => (
                    <div key={i} className={`inv-slot ${item.equipped ? 'equipped' : ''}`} style={{ height: 58 }}
                      onClick={() => item.name && addNotif(`📦 ${item.name}`, "info")}>
                      {item.emoji && <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>}
                      {item.qty > 0 && <span className="inv-badge">×{item.qty}</span>}
                    </div>
                  ))}
                </div>
                <div style={{ ...S.exo, fontSize: '0.58rem', color: 'rgba(255,185,50,0.4)', marginTop: 8, textAlign: 'center' }}>
                  Слоты: {INVENTORY.filter(i => i.emoji).length} / 12
                </div>
              </div>
            )}

            {/* SKILLS TAB */}
            {tab === "skills" && (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ ...S.orbitron, fontSize: '0.52rem', color: '#FFB932', letterSpacing: '0.15em', marginBottom: 4 }}>◈ ХАРАКТЕРИСТИКИ ГЕРОЯ</div>
                {SKILLS.map(skill => (
                  <div key={skill.name} className="hud-panel" style={{ padding: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.1rem' }}>{skill.emoji}</span>
                        <span style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.82rem', color: '#fff', letterSpacing: '0.05em' }}>{skill.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {Array.from({ length: skill.maxLevel }).map((_, i) => (
                            <div key={i} style={{ width: 11, height: 11, background: i < skill.level ? skill.color : 'rgba(255,255,255,0.07)', boxShadow: i < skill.level ? `0 0 4px ${skill.color}80` : 'none', border: `1px solid ${i < skill.level ? skill.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 2, transition: 'all 0.2s' }} />
                          ))}
                        </div>
                        <span style={{ ...S.orbitron, fontSize: '0.72rem', fontWeight: 700, color: skill.color }}>{skill.level}</span>
                      </div>
                    </div>
                    <div className="skill-bar">
                      <div style={{ height: '100%', width: `${(skill.xp / skill.maxXp) * 100}%`, background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`, boxShadow: `0 0 4px ${skill.color}60`, borderRadius: 2, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ ...S.rajdhani, fontSize: '0.52rem', color: 'rgba(255,220,120,0.4)', marginTop: 3, textAlign: 'right' }}>{skill.xp} / {skill.maxXp} XP</div>
                  </div>
                ))}
              </div>
            )}

            {/* ECONOMY TAB */}
            {tab === "economy" && (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ ...S.orbitron, fontSize: '0.52rem', color: '#FFB932', letterSpacing: '0.15em' }}>◈ ФИНАНСЫ И БИРЖА</div>
                <div className="hud-panel" style={{ padding: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ ...S.orbitron, fontSize: '0.48rem', color: 'rgba(57,255,126,0.6)', letterSpacing: '0.1em' }}>НА РУКАХ</div>
                      <div style={{ ...S.orbitron, fontSize: '1.1rem', fontWeight: 700, color: '#39FF7E' }}>${money.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ ...S.orbitron, fontSize: '0.48rem', color: 'rgba(0,212,255,0.6)', letterSpacing: '0.1em' }}>В АКЦИЯХ</div>
                      <div style={{ ...S.orbitron, fontSize: '1.1rem', fontWeight: 700, color: '#00D4FF' }}>$124,380</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.6rem', color: 'rgba(255,185,50,0.7)', letterSpacing: '0.15em', marginBottom: 6 }}>◇ БИРЖА FREE CITY</div>
                  {STOCKS.map(s => (
                    <div key={s.ticker} className="hud-panel" style={{ padding: '8px 10px', marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => addNotif(`📈 ${s.name}: $${s.price}`, "info")}>
                      <div>
                        <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.78rem', color: '#fff' }}>{s.name}</div>
                        <div style={{ ...S.orbitron, fontSize: '0.48rem', color: 'rgba(255,185,50,0.5)' }}>{s.ticker} · {s.owned} акций</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ ...S.orbitron, fontSize: '0.78rem', fontWeight: 700, color: s.change > 0 ? '#39FF7E' : '#FF3B3B' }}>${s.price}</div>
                        <div style={{ ...S.rajdhani, fontSize: '0.58rem', color: s.change > 0 ? '#39FF7E' : '#FF3B3B' }}>{s.change > 0 ? '+' : ''}{s.change}%</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.6rem', color: 'rgba(255,185,50,0.7)', letterSpacing: '0.15em', marginBottom: 6 }}>◇ ПРОФЕССИИ</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { name: "Наёмник", pay: "$2k–15k", emoji: "⚔️" },
                      { name: "Контрабандист", pay: "$5k–30k", emoji: "📦" },
                      { name: "Брокер", pay: "$1k–50k", emoji: "📊" },
                      { name: "Гонщик", pay: "$3k–20k", emoji: "🏎️" },
                    ].map(p => (
                      <div key={p.name} className="hud-panel" style={{ padding: 8, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => addNotif(`${p.emoji} Профессия: ${p.name}`, "info")}>
                        <div style={{ fontSize: '1.2rem' }}>{p.emoji}</div>
                        <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.65rem', color: '#fff' }}>{p.name}</div>
                        <div style={{ ...S.orbitron, fontSize: '0.48rem', color: '#39FF7E' }}>{p.pay}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TRANSPORT TAB */}
            {tab === "transport" && (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ ...S.orbitron, fontSize: '0.52rem', color: '#FFB932', letterSpacing: '0.15em', marginBottom: 4 }}>◈ ТРАНСПОРТНЫЙ ПАРК</div>
                {VEHICLES.map((v, i) => (
                  <div key={i} className={`hud-panel ${selectedVehicle === i ? 'pulse-glow' : ''}`}
                    style={{ padding: 12, cursor: 'pointer', transition: 'all 0.2s', borderColor: selectedVehicle === i ? '#FFB932' : undefined }}
                    onClick={() => setSelectedVehicle(selectedVehicle === i ? null : i)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: '2rem' }}>{v.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{v.name}</div>
                            <div style={{ ...S.exo, fontSize: '0.6rem', color: 'rgba(255,185,50,0.5)' }}>{v.type}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ ...S.orbitron, fontSize: '0.7rem', fontWeight: 700, color: '#00D4FF' }}>{v.speed} км/ч</div>
                            <div style={{ ...S.rajdhani, fontSize: '0.55rem', color: 'rgba(255,185,50,0.5)' }}>HP: {v.hp}</div>
                          </div>
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <div style={{ ...S.rajdhani, fontSize: '0.5rem', color: 'rgba(57,255,126,0.6)', marginBottom: 2 }}>ТОПЛИВО {v.fuel}%</div>
                          <div style={{ height: 3, background: 'rgba(57,255,126,0.1)', border: '1px solid rgba(57,255,126,0.2)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${v.fuel}%`, background: '#39FF7E', boxShadow: '0 0 4px rgba(57,255,126,0.5)' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedVehicle === i && (
                      <button onClick={e => { e.stopPropagation(); handleDriveVehicle(i); setSelectedVehicle(null); }}
                        style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.72rem', color: '#FFB932', letterSpacing: '0.15em', cursor: 'pointer', background: 'rgba(255,185,50,0.08)', border: '1px solid #FFB932', width: '100%', padding: '8px 0', marginTop: 10 }}>
                        🚗 СЕСТЬ ЗА РУЛЬ
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* NPC DIALOG */}
      {showNPC && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 32, background: 'rgba(0,0,0,0.55)' }}>
          <div className="dialog-box fade-in-up" style={{ width: 500, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', background: 'rgba(255,185,50,0.08)', border: '2px solid rgba(255,185,50,0.4)' }}>{NPC_DATA.avatar}</div>
              <div>
                <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '1rem', color: '#FFB932' }}>{NPC_DATA.name}</div>
                <div style={{ ...S.exo, fontSize: '0.63rem', color: 'rgba(255,185,50,0.5)' }}>{NPC_DATA.role}</div>
              </div>
              <button onClick={() => { setShowNPC(false); setShowResult(false); setNpcResult(""); }}
                style={{ marginLeft: 'auto', color: 'rgba(255,185,50,0.5)', fontSize: '1.2rem', cursor: 'pointer', background: 'transparent', border: 'none' }}>✕</button>
            </div>

            <div style={{ ...S.exo, fontSize: '0.8rem', color: 'rgba(255,220,120,0.85)', lineHeight: 1.65, marginBottom: 12, padding: '8px 12px', background: 'rgba(255,185,50,0.04)', borderLeft: '2px solid rgba(255,185,50,0.35)' }}>
              "{showResult ? npcResult : NPC_DATA.lines[npcLine % NPC_DATA.lines.length]}"
            </div>

            {!showResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NPC_DATA.choices.map((c, i) => (
                  <div key={i} className="dialog-choice" onClick={() => handleNPCChoice(c)}>
                    <span style={{ color: 'rgba(0,212,255,0.7)', marginRight: 6 }}>[{i + 1}]</span>
                    {c.text}
                  </div>
                ))}
              </div>
            ) : (
              <div className="dialog-choice" style={{ textAlign: 'center', color: '#FFB932' }}
                onClick={() => { setShowResult(false); setNpcLine(l => l + 1); }}>
                [ПРОДОЛЖИТЬ] ▶
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
