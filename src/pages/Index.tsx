import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const CITY_BG = "https://cdn.poehali.dev/projects/a9f36bb0-9272-4890-a49e-4be84141c35f/files/099b4c22-04ce-4b83-9ce2-7d8875cc5c63.jpg";
const HERO_IMG = "https://cdn.poehali.dev/projects/a9f36bb0-9272-4890-a49e-4be84141c35f/files/a25c0af9-32a9-485e-b049-5dcc1a404cfc.jpg";

const WORLD_W = 3200;
const WORLD_H = 2400;
const TILE = 80;
const PLAYER_SPEED = 3.2;
const CAR_SPEED = 5.5;

const S = {
  orbitron: { fontFamily: "'Orbitron', monospace" } as React.CSSProperties,
  rajdhani: { fontFamily: "'Rajdhani', sans-serif" } as React.CSSProperties,
  exo: { fontFamily: "'Exo 2', sans-serif" } as React.CSSProperties,
};

// ─── WORLD MAP DATA ─────────────────────────────────────────────────────────
// Tile types: 0=road, 1=building, 2=park, 3=water, 4=sidewalk, 5=highway
const DISTRICTS = [
  { name: "ДАУНТАУН", x: 400, y: 200, color: "#FFB932", desc: "Деловой центр" },
  { name: "ЮЖНЫЙ ПОРТ", x: 2400, y: 1800, color: "#00D4FF", desc: "Промышленная зона" },
  { name: "ТРУЩОБЫ", x: 200, y: 1600, color: "#FF3B3B", desc: "Опасный район" },
  { name: "КАЗИНО-СТРИТ", x: 1400, y: 300, color: "#BF5AF2", desc: "Развлекательный квартал" },
  { name: "НАБЕРЕЖНАЯ", x: 2600, y: 400, color: "#39FF7E", desc: "Богатый район" },
  { name: "АВТОРЫНОК", x: 800, y: 1900, color: "#FF9500", desc: "Транспортный хаб" },
];

const NPC_PERSONS = [
  { id: 1, x: 520, y: 280, name: "Маркус Рейн", role: "Информатор", emoji: "🕵️", color: "#FFB932" },
  { id: 2, x: 1450, y: 380, name: "Виктория", role: "Казино-Босс", emoji: "💃", color: "#BF5AF2" },
  { id: 3, x: 240, y: 1650, name: "Быки", role: "Банда Сталь", emoji: "💀", color: "#FF3B3B" },
  { id: 4, x: 2450, y: 1820, name: "Портовый мастер", role: "Контрабанда", emoji: "⚓", color: "#00D4FF" },
  { id: 5, x: 840, y: 1940, name: "Карлос", role: "Автодилер", emoji: "🔧", color: "#FF9500" },
];

const VEHICLES_WORLD = [
  { id: 1, x: 600, y: 400, vx: 2, vy: 0, emoji: "🚗", name: "Toyota", color: "#fff" },
  { id: 2, x: 1200, y: 600, vx: 0, vy: 1.5, emoji: "🚕", name: "Cab", color: "#FFD700" },
  { id: 3, x: 800, y: 1200, vx: -1.8, vy: 0, emoji: "🚙", name: "SUV", color: "#aaa" },
  { id: 4, x: 1800, y: 900, vx: 0, vy: -2, emoji: "🚓", name: "Police", color: "#00D4FF" },
  { id: 5, x: 2200, y: 1400, vx: 2.5, vy: 0, emoji: "🚚", name: "Truck", color: "#888" },
];

const MISSION_MARKERS = [
  { x: 520, y: 280, label: "A", color: "#FFB932", quest: "Операция «Чёрный рынок»" },
  { x: 2450, y: 1820, label: "B", color: "#00D4FF", quest: "Должник Маркуса" },
  { x: 1450, y: 380, label: "C", color: "#BF5AF2", quest: "Казино-Стрит" },
];

// ─── BOOT SCREEN ─────────────────────────────────────────────────────────────
const BOOT_LINES = [
  "FREE CITY ENGINE v3.7.1 — Initializing...",
  "Loading core modules... [████████████] 100%",
  "Mounting world map... WORLD_W=3200 WORLD_H=2400",
  "Spawning NPCs............. 5 entities loaded",
  "Traffic AI system......... ACTIVE",
  "Physics engine............ ONLINE",
  "Audio subsystem........... READY",
  "Anti-cheat kernel......... BYPASSED ✓",
  "Connecting to FREE CITY servers...",
  "Session authenticated. Player: АЛЕКС РЕЙН",
  "► ЗАГРУЗКА ЗАВЕРШЕНА. Добро пожаловать в FREE CITY.",
];

function BootScreen({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"boot" | "title" | "ready">("boot");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[i]]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase("title"), 600);
      }
    }, 180);
    return () => clearInterval(interval);
  }, []);

  if (phase === "title" || phase === "ready") {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${CITY_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.35 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)' }} />

        <div style={{ position: 'relative', textAlign: 'center', zIndex: 2 }}>
          {/* EXE badge */}
          <div style={{ display: 'inline-block', background: 'rgba(255,185,50,0.1)', border: '1px solid rgba(255,185,50,0.4)', padding: '3px 14px', marginBottom: 20 }}>
            <span style={{ ...S.orbitron, fontSize: '0.62rem', color: '#FFB932', letterSpacing: '0.3em' }}>FREE_CITY.EXE</span>
          </div>

          {/* Title */}
          <div style={{ ...S.orbitron, fontSize: '6rem', fontWeight: 900, color: '#fff', lineHeight: 0.9, letterSpacing: '-0.02em', textShadow: '0 0 60px rgba(255,185,50,0.5), 0 0 120px rgba(255,185,50,0.2)' }}>
            FREE
          </div>
          <div style={{ ...S.orbitron, fontSize: '6rem', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #FFB932, #FF9500)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: 'none', marginBottom: 24 }}>
            CITY
          </div>

          <div style={{ ...S.rajdhani, fontSize: '0.9rem', color: 'rgba(255,220,120,0.6)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 48 }}>
            Open World Crime Simulator
          </div>

          <div style={{ ...S.exo, fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginBottom: 40 }}>
            © 2026 FREE CITY STUDIOS · ALL RIGHTS RESERVED · v1.0.0
          </div>

          <button
            onClick={onDone}
            style={{ ...S.rajdhani, fontWeight: 700, fontSize: '1rem', letterSpacing: '0.25em', color: '#000', background: 'linear-gradient(135deg, #FFB932, #FF9500)', border: 'none', padding: '14px 52px', cursor: 'pointer', textTransform: 'uppercase', boxShadow: '0 0 30px rgba(255,185,50,0.5)', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.05)'; (e.target as HTMLElement).style.boxShadow = '0 0 50px rgba(255,185,50,0.8)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; (e.target as HTMLElement).style.boxShadow = '0 0 30px rgba(255,185,50,0.5)'; }}
          >
            ▶ НАЧАТЬ ИГРУ
          </button>

          <div style={{ ...S.orbitron, fontSize: '0.5rem', color: 'rgba(255,185,50,0.3)', marginTop: 20, letterSpacing: '0.2em' }}>
            WASD / СТРЕЛКИ — ДВИЖЕНИЕ · E — ВОЙТИ В ТРАНСПОРТ · F — ВЗАИМОДЕЙСТВИЕ · ESC — МЕНЮ
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000505', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', zIndex: 9999 }}>
      <div style={{ ...S.orbitron, fontSize: '0.65rem', color: '#39FF7E', letterSpacing: '0.2em', marginBottom: 20 }}>FREE_CITY.EXE — SYSTEM BOOT</div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ ...S.exo, fontSize: '0.75rem', color: i === lines.length - 1 ? '#fff' : '#39FF7E', opacity: i === lines.length - 1 ? 1 : 0.6, lineHeight: 1.6 }}>
            <span style={{ color: 'rgba(57,255,126,0.4)', marginRight: 10 }}>{'>'}</span>{line}
            {i === lines.length - 1 && <span style={{ animation: 'blink 1s step-end infinite', color: '#39FF7E' }}>█</span>}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ ...S.orbitron, fontSize: '0.55rem', color: 'rgba(57,255,126,0.6)', letterSpacing: '0.1em' }}>ЗАГРУЗКА МИРА</span>
          <span style={{ ...S.orbitron, fontSize: '0.55rem', color: '#39FF7E' }}>{progress}%</span>
        </div>
        <div style={{ height: 4, background: 'rgba(57,255,126,0.1)', border: '1px solid rgba(57,255,126,0.3)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #39FF7E, #00CC55)', boxShadow: '0 0 8px rgba(57,255,126,0.6)', transition: 'width 0.15s ease' }} />
        </div>
      </div>
    </div>
  );
}

// ─── GAME WORLD CANVAS ───────────────────────────────────────────────────────
interface Vec2 { x: number; y: number; }

interface WorldState {
  player: Vec2 & { dir: number; inCar: number | null; speed: number };
  camera: Vec2;
  cars: Array<{ id: number; x: number; y: number; vx: number; vy: number; emoji: string; name: string; bounceTimer: number }>;
}

function drawWorld(ctx: CanvasRenderingContext2D, state: WorldState, w: number, h: number) {
  const { camera } = state;

  // === BACKGROUND ===
  ctx.fillStyle = '#0d1520';
  ctx.fillRect(0, 0, w, h);

  // Road grid
  const roadColor = '#1a2235';
  const lineColor = '#FFB93215';
  const sidewalkColor = '#141d2e';

  // Draw blocks
  for (let bx = 0; bx < WORLD_W; bx += 480) {
    for (let by = 0; by < WORLD_H; by += 360) {
      const sx = bx - camera.x;
      const sy = by - camera.y;
      if (sx > -500 && sx < w + 500 && sy > -400 && sy < h + 400) {
        // Block base (sidewalk)
        ctx.fillStyle = sidewalkColor;
        ctx.fillRect(sx + 80, sy + 80, 320, 200);

        // Building variation
        const seed = (bx * 7 + by * 13) % 5;
        if (seed === 0) {
          // Park
          ctx.fillStyle = '#0d1f0f';
          ctx.fillRect(sx + 90, sy + 90, 300, 180);
          ctx.fillStyle = '#1a3a1a';
          for (let t = 0; t < 4; t++) {
            const tx = sx + 120 + t * 70;
            const ty = sy + 150;
            ctx.beginPath();
            ctx.arc(tx, ty, 18, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Buildings
          const bldH = 80 + seed * 30;
          ctx.fillStyle = `hsl(${210 + seed * 8}, 20%, ${8 + seed * 2}%)`;
          ctx.fillRect(sx + 95, sy + 85, 290, 190);
          // Windows
          ctx.fillStyle = 'rgba(255,220,100,0.15)';
          for (let wx = 0; wx < 8; wx++) {
            for (let wy = 0; wy < 5; wy++) {
              if (Math.random() > 0.35) {
                ctx.fillRect(sx + 108 + wx * 34, sy + 97 + wy * 34, 18, 20);
              }
            }
          }
          // Rooftop
          ctx.fillStyle = `hsl(${210 + seed * 8}, 25%, 12%)`;
          ctx.fillRect(sx + 110, sy + 85, 260, 8);
        }

        // Road border highlights
        ctx.strokeStyle = 'rgba(255,185,50,0.04)';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 80, sy + 80, 320, 200);
      }
    }
  }

  // Road lanes
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([30, 20]);
  for (let x = 0; x < WORLD_W; x += 480) {
    const sx = x - camera.x;
    ctx.beginPath();
    ctx.moveTo(sx + 40, -camera.y);
    ctx.lineTo(sx + 40, WORLD_H - camera.y);
    ctx.stroke();
  }
  for (let y = 0; y < WORLD_H; y += 360) {
    const sy = y - camera.y;
    ctx.beginPath();
    ctx.moveTo(-camera.x, sy + 40);
    ctx.lineTo(WORLD_W - camera.x, sy + 40);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // === DISTRICT LABELS ===
  DISTRICTS.forEach(d => {
    const sx = d.x - camera.x;
    const sy = d.y - camera.y;
    if (sx > -200 && sx < w + 200 && sy > -60 && sy < h + 60) {
      ctx.font = "bold 11px 'Orbitron', monospace";
      ctx.fillStyle = d.color + '80';
      ctx.textAlign = 'center';
      ctx.fillText(d.name, sx, sy);
      ctx.font = "9px 'Exo 2', sans-serif";
      ctx.fillStyle = d.color + '40';
      ctx.fillText(d.desc, sx, sy + 14);
    }
  });

  // === MISSION MARKERS ===
  MISSION_MARKERS.forEach(m => {
    const sx = m.x - camera.x;
    const sy = m.y - camera.y;
    if (sx > -60 && sx < w + 60 && sy > -60 && sy < h + 60) {
      const pulse = (Math.sin(Date.now() * 0.003) + 1) / 2;
      ctx.beginPath();
      ctx.arc(sx, sy - 20, 14 + pulse * 4, 0, Math.PI * 2);
      ctx.strokeStyle = m.color + '50';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = m.color;
      ctx.beginPath();
      ctx.arc(sx, sy - 20, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.font = "bold 10px 'Orbitron'";
      ctx.textAlign = 'center';
      ctx.fillText(m.label, sx, sy - 15);
    }
  });

  // === NPC PERSONS ===
  NPC_PERSONS.forEach(npc => {
    const sx = npc.x - camera.x;
    const sy = npc.y - camera.y;
    if (sx > -60 && sx < w + 60 && sy > -60 && sy < h + 60) {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(sx, sy + 6, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.fillText(npc.emoji, sx, sy);

      ctx.font = "bold 8px 'Rajdhani'";
      ctx.fillStyle = npc.color;
      ctx.textAlign = 'center';
      ctx.fillText(npc.name, sx, sy + 18);
    }
  });

  // === AI CARS ===
  state.cars.forEach(car => {
    const sx = car.x - camera.x;
    const sy = car.y - camera.y;
    if (sx > -60 && sx < w + 60 && sy > -60 && sy < h + 60) {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.ellipse(sx, sy + 8, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Headlights
      const angle = Math.atan2(car.vy, car.vx);
      ctx.fillStyle = 'rgba(255,220,100,0.4)';
      ctx.beginPath();
      ctx.arc(sx + Math.cos(angle) * 18, sy + Math.sin(angle) * 8, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '26px serif';
      ctx.textAlign = 'center';
      ctx.fillText(car.emoji, sx, sy + 4);
    }
  });

  // === PLAYER ===
  const px = w / 2;
  const py = h / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(px, py + 10, state.player.inCar !== null ? 22 : 12, state.player.inCar !== null ? 8 : 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (state.player.inCar !== null) {
    // In vehicle
    const v = VEHICLES_WORLD.find(v => v.id === state.player.inCar);
    ctx.font = '34px serif';
    ctx.textAlign = 'center';
    ctx.fillText(v?.emoji || '🚗', px, py + 6);

    // Speed glow
    if (state.player.speed > 2) {
      const grad = ctx.createRadialGradient(px, py, 0, px, py, 40 + state.player.speed * 4);
      grad.addColorStop(0, 'rgba(255,185,50,0.12)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, 40 + state.player.speed * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // On foot
    const bob = Math.sin(Date.now() * 0.01) * 1.5;
    // Glow ring
    ctx.strokeStyle = 'rgba(255,185,50,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py + bob, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Direction indicator
    const rad = (state.player.dir * Math.PI) / 180;
    ctx.strokeStyle = '#FFB932';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, py + bob);
    ctx.lineTo(px + Math.sin(rad) * 22, py + bob - Math.cos(rad) * 22);
    ctx.stroke();

    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🧍', px, py + bob + 8);
  }

  // Player name tag
  ctx.font = "bold 9px 'Rajdhani', sans-serif";
  ctx.fillStyle = '#FFB932';
  ctx.textAlign = 'center';
  ctx.fillText('АЛЕКС РЕЙН', px, py - 22);
}

// ─── MAIN GAME ────────────────────────────────────────────────────────────────
type GameTab = "game" | "quests" | "inventory" | "skills" | "economy" | "map";

export default function Index() {
  const [phase, setPhase] = useState<"boot" | "playing">("boot");
  const [tab, setTab] = useState<GameTab>("game");
  const [health, setHealth] = useState(78);
  const [armor] = useState(55);
  const [stamina] = useState(90);
  const [money, setMoney] = useState(47350);
  const [wantedLevel, setWantedLevel] = useState(2);
  const [playerXP, setPlayerXP] = useState(6820);
  const [activeWeapon, setActiveWeapon] = useState(0);
  const [notifications, setNotifications] = useState<{ id: number; text: string; type: string }[]>([]);
  const [combatLog, setCombatLog] = useState([
    "▶ Вошёл в зону «Северный порт»",
    "⚠ Обнаружена активность банды Сталь",
    "💰 Бонус за скрытность: +250$",
  ]);
  const [showNPC, setShowNPC] = useState<typeof NPC_PERSONS[0] | null>(null);
  const [npcResult, setNpcResult] = useState("");
  const [showFullMap, setShowFullMap] = useState(false);
  const [nearVehicle, setNearVehicle] = useState<number | null>(null);
  const [nearNPC, setNearNPC] = useState<number | null>(null);
  const [inCar, setInCar] = useState<number | null>(null);
  const [speed, setSpeed] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const notifId = useRef(0);
  const keys = useRef<Record<string, boolean>>({});
  const rafRef = useRef<number>(0);

  const worldRef = useRef<WorldState>({
    player: { x: 640, y: 420, dir: 0, inCar: null, speed: 0 },
    camera: { x: 640 - 500, y: 420 - 300 },
    cars: VEHICLES_WORLD.map(v => ({ ...v, bounceTimer: 0 })),
  });

  const maxXP = 10000;

  const addNotif = useCallback((text: string, type = "info") => {
    const id = ++notifId.current;
    setNotifications(p => [...p, { id, text, type }]);
    setTimeout(() => setNotifications(p => p.filter(n => n.id !== id)), 3200);
  }, []);

  const addLog = useCallback((msg: string) => {
    setCombatLog(p => [msg, ...p.slice(0, 6)]);
  }, []);

  // Input
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      keys.current[e.code] = e.type === 'keydown';
      // Enter vehicle
      if (e.type === 'keydown' && (e.code === 'KeyE' || e.code === 'KeyF')) {
        const w = worldRef.current;
        if (w.player.inCar !== null) {
          // exit car
          w.player.inCar = null;
          w.player.speed = 0;
          setInCar(null);
          setSpeed(0);
          addNotif("🚗 Вышел из машины", "info");
          addLog("🚗 Пешком");
        } else if (nearVehicle !== null) {
          w.player.inCar = nearVehicle;
          setInCar(nearVehicle);
          addNotif(`🚗 Сел в ${VEHICLES_WORLD.find(v => v.id === nearVehicle)?.emoji}`, "info");
          addLog(`🚗 За рулём`);
        } else if (nearNPC !== null) {
          const npc = NPC_PERSONS.find(n => n.id === nearNPC);
          if (npc) setShowNPC(npc);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); };
  }, [phase, nearVehicle, nearNPC, addNotif, addLog]);

  // Game loop
  useEffect(() => {
    if (phase !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const loop = () => {
      const w = worldRef.current;
      const k = keys.current;
      const spd = w.player.inCar !== null ? CAR_SPEED : PLAYER_SPEED;

      let dx = 0, dy = 0;
      if (k['ArrowLeft'] || k['KeyA']) dx = -1;
      if (k['ArrowRight'] || k['KeyD']) dx = 1;
      if (k['ArrowUp'] || k['KeyW']) dy = -1;
      if (k['ArrowDown'] || k['KeyS']) dy = 1;

      if (dx !== 0 || dy !== 0) {
        // Normalize diagonal
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / len * spd;
        const ny = dy / len * spd;
        w.player.x = Math.max(40, Math.min(WORLD_W - 40, w.player.x + nx));
        w.player.y = Math.max(40, Math.min(WORLD_H - 40, w.player.y + ny));
        w.player.speed = spd;
        if (dx !== 0 || dy !== 0) {
          w.player.dir = Math.atan2(dx, -dy) * 180 / Math.PI;
        }
      } else {
        w.player.speed = 0;
      }

      // Camera follows player
      const cw = canvas.width;
      const ch = canvas.height;
      w.camera.x = w.player.x - cw / 2;
      w.camera.y = w.player.y - ch / 2;

      // AI cars move
      w.cars = w.cars.map(car => {
        const nx = car.x + car.vx;
        const ny = car.y + car.vy;
        let nvx = car.vx;
        let nvy = car.vy;
        let bt = car.bounceTimer;
        if (nx <= 20 || nx >= WORLD_W - 20) { nvx = -nvx; bt = 30; }
        if (ny <= 20 || ny >= WORLD_H - 20) { nvy = -nvy; bt = 30; }
        if (bt > 0) bt--;
        return { ...car, x: nx, y: ny, vx: nvx, vy: nvy, bounceTimer: bt };
      });

      // Proximity checks
      let nv: number | null = null;
      let nn: number | null = null;
      VEHICLES_WORLD.forEach(v => {
        const dist = Math.hypot(v.x - w.player.x, v.y - w.player.y);
        if (dist < 55 && w.player.inCar === null) nv = v.id;
      });
      NPC_PERSONS.forEach(npc => {
        const dist = Math.hypot(npc.x - w.player.x, npc.y - w.player.y);
        if (dist < 60 && w.player.inCar === null) nn = npc.id;
      });
      setNearVehicle(nv);
      setNearNPC(nn);
      setSpeed(Math.round(w.player.speed * 40));

      // Draw
      drawWorld(ctx, w, cw, ch);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  // Resize
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = window.innerWidth;
      c.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleShoot = () => {
    const dmg = Math.floor(Math.random() * 80 + 20);
    addLog(`🔫 Выстрел: ${dmg} урона`);
    if (Math.random() > 0.6) {
      setHealth(h => Math.max(0, h - Math.floor(Math.random() * 15 + 5)));
      addNotif("⚠ Получен урон!", "danger");
    } else {
      addNotif(`🎯 Враг поражён! ${dmg} урона`, "combat");
    }
    setPlayerXP(x => Math.min(maxXP, x + 50));
  };

  const handleHeal = () => {
    setHealth(h => Math.min(100, h + 25));
    addNotif("💊 +25 HP", "heal");
    addLog("💊 Лечение");
  };

  const WEAPONS = [
    { name: "Desert Eagle", emoji: "🔫", damage: 85 },
    { name: "M4A1", emoji: "🪖", damage: 62 },
    { name: "Нож", emoji: "🔪", damage: 40 },
    { name: "Граната", emoji: "💣", damage: 95 },
  ];

  const QUESTS = [
    { id: 1, title: "Операция «Чёрный рынок»", reward: 15000, xp: 850, status: "active" as const, type: "main" as const, objective: "Прибыть в порт Эйсен" },
    { id: 2, title: "Должник Маркуса", reward: 3500, xp: 220, status: "active" as const, type: "side" as const, objective: "Найти Торреса в баре 'Rust'" },
    { id: 3, title: "Гонка по Северному шоссе", reward: 8000, xp: 400, status: "available" as const, type: "side" as const },
    { id: 4, title: "Ограбление банка «Нова»", reward: 50000, xp: 3000, status: "available" as const, type: "main" as const },
    { id: 5, title: "Доставка медикаментов", reward: 2000, xp: 150, status: "completed" as const, type: "side" as const },
  ];

  const SKILLS = [
    { name: "Стрельба", level: 7, xp: 680, color: "#FF3B3B", emoji: "🎯" },
    { name: "Вождение", level: 8, xp: 820, color: "#00D4FF", emoji: "🏎️" },
    { name: "Скрытность", level: 5, xp: 320, color: "#39FF7E", emoji: "👤" },
    { name: "Харизма", level: 6, xp: 510, color: "#FF9500", emoji: "💬" },
    { name: "Взлом", level: 4, xp: 240, color: "#BF5AF2", emoji: "💻" },
    { name: "Выживание", level: 9, xp: 950, color: "#FFD60A", emoji: "⚔️" },
  ];

  const INVENTORY = ["🔫","🪖","💊","💊","💊","💣","💣","💣","🔑","📱","💰","🗡️"];

  if (phase === "boot") return <BootScreen onDone={() => setPhase("playing")} />;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#020408' }}>

      {/* GAME CANVAS */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, display: 'block' }} />

      {/* VIGNETTE */}
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at center, transparent 45%, rgba(2,4,10,0.7) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* NOTIFICATIONS */}
      <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', pointerEvents: 'none' }}>
        {notifications.map(n => (
          <div key={n.id} className="notif-in hud-panel" style={{ padding: '5px 14px', ...S.rajdhani, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: n.type === 'danger' ? '#FF3B3B' : n.type === 'money' ? '#39FF7E' : n.type === 'heal' ? '#00D4FF' : '#FFB932' }}>
            {n.text}
          </div>
        ))}
      </div>

      {/* PROXIMITY HINT */}
      {(nearVehicle !== null || nearNPC !== null) && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, 80px)', zIndex: 20, pointerEvents: 'none' }}>
          <div className="hud-panel" style={{ padding: '5px 14px', ...S.rajdhani, fontWeight: 700, fontSize: '0.7rem', color: '#FFB932', letterSpacing: '0.1em', textAlign: 'center' }}>
            {nearNPC !== null
              ? `[F / E] Говорить с ${NPC_PERSONS.find(n => n.id === nearNPC)?.name}`
              : `[E] Сесть в ${VEHICLES_WORLD.find(v => v.id === nearVehicle)?.emoji}`}
          </div>
        </div>
      )}

      {/* TOP LEFT — PLAYER HUD */}
      <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 20, width: 214 }}>
        <div className="hud-panel corner-tl" style={{ padding: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #FFB932', flexShrink: 0 }}>
              <img src={HERO_IMG} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...S.orbitron, fontSize: '0.48rem', color: '#FFB932', letterSpacing: '0.15em' }}>ИГРОК</div>
              <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.85rem', color: '#fff', lineHeight: 1 }}>АЛЕКС РЕЙН</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...S.orbitron, fontSize: '0.42rem', color: '#00D4FF' }}>LVL</div>
              <div style={{ ...S.orbitron, fontSize: '1.05rem', fontWeight: 900, color: '#00D4FF', lineHeight: 1 }}>12</div>
            </div>
          </div>
          {/* XP */}
          <div style={{ marginBottom: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ ...S.rajdhani, fontSize: '0.52rem', color: 'rgba(0,212,255,0.6)', fontWeight: 700 }}>XP</span>
              <span style={{ ...S.orbitron, fontSize: '0.48rem', color: 'rgba(0,212,255,0.5)' }}>{playerXP}/{maxXP}</span>
            </div>
            <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${(playerXP / maxXP) * 100}%` }} /></div>
          </div>
          {[
            { label: "❤ HP", val: health, color: "#FF3B3B", cls: "health-bar", fillCls: "health-fill" },
            { label: "🛡 БРОНЯ", val: armor, color: "#00D4FF", cls: "armor-bar", fillCls: "armor-fill" },
            { label: "⚡ ВЫНОСЛ", val: stamina, color: "#39FF7E", cls: "stamina-bar", fillCls: "stamina-fill" },
          ].map(bar => (
            <div key={bar.label} style={{ marginBottom: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ ...S.rajdhani, fontSize: '0.55rem', fontWeight: 700, color: bar.color, letterSpacing: '0.1em' }}>{bar.label}</span>
                <span style={{ ...S.orbitron, fontSize: '0.5rem', color: bar.color }}>{bar.val}%</span>
              </div>
              <div className={bar.cls}><div className={bar.fillCls} style={{ width: `${bar.val}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP RIGHT — MONEY + WANTED + SPEED */}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 20, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
        <div className="hud-panel" style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...S.orbitron, fontSize: '0.48rem', color: 'rgba(57,255,126,0.7)' }}>$</span>
          <span style={{ ...S.orbitron, fontSize: '0.95rem', fontWeight: 700, color: '#39FF7E' }}>{money.toLocaleString()}</span>
        </div>
        <div className="hud-panel" style={{ padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ ...S.rajdhani, fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,59,59,0.7)', marginRight: 3 }}>РОЗЫСК</span>
          {[1,2,3,4,5].map(s => (
            <span key={s} style={{ fontSize: 12, color: s <= wantedLevel ? '#FFB932' : 'rgba(255,185,50,0.18)', textShadow: s <= wantedLevel ? '0 0 6px #FFB932' : 'none' }}>★</span>
          ))}
        </div>
        {inCar !== null && (
          <div className="hud-panel pulse-glow" style={{ padding: '7px 12px', textAlign: 'center' }}>
            <div style={{ ...S.orbitron, fontSize: '0.46rem', color: '#00D4FF', letterSpacing: '0.12em', marginBottom: 1 }}>
              {VEHICLES_WORLD.find(v => v.id === inCar)?.emoji} В ДВИЖЕНИИ
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'center' }}>
              <span style={{ ...S.orbitron, fontSize: '1.5rem', fontWeight: 900, color: '#FFB932' }}>{speed}</span>
              <span style={{ ...S.rajdhani, fontSize: '0.58rem', color: 'rgba(255,185,50,0.6)' }}>КМ/Ч</span>
            </div>
          </div>
        )}
      </div>

      {/* ACTIVE QUEST — top center */}
      <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 10, pointerEvents: 'none' }}>
        <div className="hud-panel" style={{ padding: '5px 18px', textAlign: 'center', minWidth: 230 }}>
          <div style={{ ...S.orbitron, fontSize: '0.46rem', color: '#FFB932', letterSpacing: '0.2em', marginBottom: 1 }}>◆ ЗАДАНИЕ</div>
          <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>Операция «Чёрный рынок»</div>
          <div style={{ ...S.exo, fontSize: '0.6rem', color: 'rgba(255,220,120,0.6)', marginTop: 1 }}>▶ Прибыть в порт Эйсен</div>
        </div>
      </div>

      {/* MINIMAP */}
      <div style={{ position: 'fixed', bottom: 78, right: 12, zIndex: 20 }}>
        <div style={{ ...S.orbitron, fontSize: '0.44rem', color: '#FFB932', textAlign: 'center', marginBottom: 1, fontWeight: 700 }}>N</div>
        <div style={{ width: 130, height: 130, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,185,50,0.4)', boxShadow: '0 0 18px rgba(255,185,50,0.1)', position: 'relative', cursor: 'pointer' }} onClick={() => setShowFullMap(true)}>
          <canvas id="minimap" style={{ width: '100%', height: '100%', display: 'block', background: '#0a0f1a' }}>
            {/* We draw minimap as static SVG overlay */}
          </canvas>
          {/* SVG minimap */}
          <svg width="130" height="130" style={{ position: 'absolute', inset: 0 }}>
            {/* Background */}
            <rect width="130" height="130" fill="#0a0f1a" />
            {/* Grid roads */}
            {[0,1,2,3,4,5,6].map(i => (
              <line key={`h${i}`} x1="0" y1={i * 20} x2="130" y2={i * 20} stroke="#1a2a3a" strokeWidth="4" />
            ))}
            {[0,1,2,3,4,5,6].map(i => (
              <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="130" stroke="#1a2a3a" strokeWidth="4" />
            ))}
            {/* Districts */}
            {DISTRICTS.map(d => (
              <circle key={d.name} cx={d.x / WORLD_W * 130} cy={d.y / WORLD_H * 130} r="4" fill={d.color + '60'} />
            ))}
            {/* Mission markers */}
            {MISSION_MARKERS.map(m => (
              <polygon key={m.label} points={`${m.x / WORLD_W * 130},${m.y / WORLD_H * 130 - 7} ${m.x / WORLD_W * 130 - 5},${m.y / WORLD_H * 130 + 3} ${m.x / WORLD_W * 130 + 5},${m.y / WORLD_H * 130 + 3}`} fill={m.color} />
            ))}
            {/* Player dot - reactive via worldRef would need state, show center approximately */}
            <PlayerMinimapDot worldRef={worldRef} />
          </svg>
          <div style={{ ...S.orbitron, position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: '0.38rem', color: 'rgba(255,185,50,0.4)' }}>TAP — КАРТА</div>
        </div>
      </div>

      {/* WEAPON SLOTS */}
      <div style={{ position: 'fixed', bottom: 12, right: 12, zIndex: 20, display: 'flex', gap: 3 }}>
        {WEAPONS.map((w, i) => (
          <div key={i} onClick={() => { setActiveWeapon(i); addNotif(`🔫 ${w.name}`, "info"); }}
            style={{ width: 50, height: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,14,0.92)', border: `1px solid ${i === activeWeapon ? '#FFB932' : 'rgba(255,185,50,0.13)'}`, boxShadow: i === activeWeapon ? '0 0 12px rgba(255,185,50,0.28)' : 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '1.2rem' }}>{w.emoji}</span>
            <span style={{ ...S.orbitron, fontSize: '0.38rem', color: 'rgba(255,185,50,0.35)', position: 'absolute', top: 2, right: 3 }}>{i + 1}</span>
          </div>
        ))}
      </div>

      {/* MAIN PANEL */}
      <div style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 20, width: 400, maxHeight: 'calc(100vh - 195px)', display: 'flex', flexDirection: 'column' }}>
        <div className="hud-panel corner-tl" style={{ display: 'flex', flexDirection: 'column', maxHeight: 'inherit', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,185,50,0.13)', overflowX: 'auto', flexShrink: 0 }}>
            {([
              { id: "game", label: "ЭКРАН" },
              { id: "quests", label: "ЗАДАНИЯ" },
              { id: "inventory", label: "ИНВЕНТ." },
              { id: "skills", label: "УМЕНИЯ" },
              { id: "economy", label: "ФИНАНСЫ" },
              { id: "map", label: "КАРТА" },
            ] as { id: GameTab; label: string }[]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 9px', borderBottom: `2px solid ${tab === t.id ? '#FFB932' : 'transparent'}`, color: tab === t.id ? '#FFB932' : 'rgba(255,185,50,0.4)', cursor: 'pointer', background: 'transparent', flexShrink: 0, transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: 11 }}>

            {/* GAME */}
            {tab === "game" && (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ ...S.orbitron, fontSize: '0.5rem', color: '#FFB932', letterSpacing: '0.15em', marginBottom: 5 }}>◈ БОЙ И ДЕЙСТВИЯ</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                    {[
                      { emoji: "🔫", label: "СТРЕЛЯТЬ", sub: WEAPONS[activeWeapon].name, color: "#FF3B3B", fn: handleShoot },
                      { emoji: "💊", label: "ЛЕЧИТЬСЯ", sub: "+25 HP", color: "#39FF7E", fn: handleHeal },
                      { emoji: "🚔", label: "ПРОВОКАЦИЯ", sub: "+1 розыск", color: "#FFB932", fn: () => { setWantedLevel(w => Math.min(5, w + 1)); addNotif("🚔 Розыск повышен!", "danger"); addLog("🚔 Полиция объявила облаву!"); } },
                      { emoji: "💰", label: "ОГРАБЛЕНИЕ", sub: "NPC +$500", color: "#BF5AF2", fn: () => { setMoney(m => m + 500); addNotif("💰 +$500 ограбление", "money"); addLog("💰 Ограблен прохожий: +$500"); setPlayerXP(x => Math.min(maxXP, x + 80)); } },
                    ].map(a => (
                      <div key={a.label} onClick={a.fn}
                        style={{ padding: 8, textAlign: 'center', background: 'rgba(5,8,14,0.9)', border: `1px solid ${a.color}2a`, cursor: 'pointer', transition: 'all 0.18s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = a.color + '70')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = a.color + '2a')}>
                        <div style={{ fontSize: '1.25rem' }}>{a.emoji}</div>
                        <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.62rem', color: a.color, letterSpacing: '0.07em' }}>{a.label}</div>
                        <div style={{ ...S.exo, fontSize: '0.53rem', color: a.color + '70' }}>{a.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...S.orbitron, fontSize: '0.5rem', color: '#FFB932', letterSpacing: '0.15em', marginBottom: 5 }}>◈ БОЙ-ЛОГ</div>
                  {combatLog.map((l, i) => (
                    <div key={i} style={{ ...S.exo, fontSize: '0.66rem', color: i === 0 ? 'rgba(255,220,120,0.9)' : 'rgba(255,220,120,0.35)', lineHeight: 1.5 }}>{l}</div>
                  ))}
                </div>
                <div style={{ ...S.orbitron, fontSize: '0.46rem', color: 'rgba(255,185,50,0.35)', letterSpacing: '0.12em', lineHeight: 1.8 }}>
                  WASD / ↑↓←→ — ДВИЖЕНИЕ<br />
                  E / F — ВОЙТИ В АВТО / NPC<br />
                  1-4 — ОРУЖИЕ
                </div>
              </div>
            )}

            {/* QUESTS */}
            {tab === "quests" && (
              <div className="fade-in-up">
                <div style={{ ...S.orbitron, fontSize: '0.5rem', color: '#FFB932', letterSpacing: '0.15em', marginBottom: 8 }}>◈ АКТИВНЫЕ ЗАДАНИЯ</div>
                {QUESTS.map(q => (
                  <div key={q.id} className="mission-item" style={{ paddingTop: 7, paddingBottom: 7, marginBottom: 4, borderLeftColor: q.status === 'completed' ? '#39FF7E' : q.status === 'active' ? '#FFB932' : 'transparent', opacity: q.status === 'completed' ? 0.5 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.76rem', color: q.status === 'completed' ? 'rgba(255,220,120,0.35)' : '#fff', textDecoration: q.status === 'completed' ? 'line-through' : 'none' }}>
                          {q.status === 'completed' ? '✓ ' : q.status === 'active' ? '▶ ' : '○ '}{q.title}
                        </div>
                        {q.objective && q.status === 'active' && <div style={{ ...S.exo, fontSize: '0.58rem', color: '#00D4FF', marginTop: 2 }}>📍 {q.objective}</div>}
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: 8, flexShrink: 0 }}>
                        <div style={{ ...S.orbitron, fontSize: '0.56rem', color: '#39FF7E' }}>${q.reward.toLocaleString()}</div>
                        <div style={{ ...S.rajdhani, fontSize: '0.5rem', color: '#00D4FF' }}>{q.xp} XP</div>
                        {q.status === 'active' && (
                          <button onClick={() => { setMoney(m => m + q.reward); setPlayerXP(x => Math.min(maxXP, x + q.xp)); addNotif(`✅ +$${q.reward.toLocaleString()}`, "money"); addLog(`✅ Задание «${q.title}» выполнено`); }}
                            style={{ ...S.rajdhani, fontSize: '0.5rem', color: '#FFB932', cursor: 'pointer', border: '1px solid rgba(255,185,50,0.3)', padding: '1px 5px', marginTop: 3, background: 'transparent' }}>
                            СДАТЬ
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* INVENTORY */}
            {tab === "inventory" && (
              <div className="fade-in-up">
                <div style={{ ...S.orbitron, fontSize: '0.5rem', color: '#FFB932', letterSpacing: '0.15em', marginBottom: 8 }}>◈ ИНВЕНТАРЬ</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4 }}>
                  {INVENTORY.map((emoji, i) => (
                    <div key={i} className="inv-slot" style={{ height: 56 }} onClick={() => addNotif(`📦 ${emoji}`, "info")}>
                      <span style={{ fontSize: '1.4rem' }}>{emoji}</span>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 16 - INVENTORY.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="inv-slot" style={{ height: 56 }} />
                  ))}
                </div>
              </div>
            )}

            {/* SKILLS */}
            {tab === "skills" && (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ ...S.orbitron, fontSize: '0.5rem', color: '#FFB932', letterSpacing: '0.15em' }}>◈ ХАРАКТЕРИСТИКИ</div>
                {SKILLS.map(skill => (
                  <div key={skill.name} className="hud-panel" style={{ padding: 9 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: '1rem' }}>{skill.emoji}</span>
                        <span style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.8rem', color: '#fff' }}>{skill.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} style={{ width: 10, height: 10, background: i < skill.level ? skill.color : 'rgba(255,255,255,0.07)', border: `1px solid ${i < skill.level ? skill.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 2, boxShadow: i < skill.level ? `0 0 3px ${skill.color}70` : 'none' }} />
                          ))}
                        </div>
                        <span style={{ ...S.orbitron, fontSize: '0.68rem', fontWeight: 700, color: skill.color }}>{skill.level}</span>
                      </div>
                    </div>
                    <div className="skill-bar">
                      <div style={{ height: '100%', width: `${skill.xp / 10}%`, background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)`, boxShadow: `0 0 4px ${skill.color}60`, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ECONOMY */}
            {tab === "economy" && (
              <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                <div style={{ ...S.orbitron, fontSize: '0.5rem', color: '#FFB932', letterSpacing: '0.15em' }}>◈ ФИНАНСЫ</div>
                <div className="hud-panel" style={{ padding: 11 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ ...S.orbitron, fontSize: '0.44rem', color: 'rgba(57,255,126,0.6)' }}>НА РУКАХ</div>
                      <div style={{ ...S.orbitron, fontSize: '1.05rem', fontWeight: 700, color: '#39FF7E' }}>${money.toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ ...S.orbitron, fontSize: '0.44rem', color: 'rgba(0,212,255,0.6)' }}>АКЦИИ</div>
                      <div style={{ ...S.orbitron, fontSize: '1.05rem', fontWeight: 700, color: '#00D4FF' }}>$124,380</div>
                    </div>
                  </div>
                </div>
                {[
                  { name: "ArmsTech Corp", ticker: "ARMTC", price: 248.5, change: +5.2 },
                  { name: "NovaDrive Auto", ticker: "NDA", price: 87.3, change: -1.8 },
                  { name: "ShadowNet Inc", ticker: "SHNT", price: 512.0, change: +12.4 },
                  { name: "FreeCity Media", ticker: "FCM", price: 33.75, change: +0.3 },
                ].map(s => (
                  <div key={s.ticker} className="hud-panel" style={{ padding: '7px 9px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => addNotif(`📈 ${s.name}`, "info")}>
                    <div>
                      <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.76rem', color: '#fff' }}>{s.name}</div>
                      <div style={{ ...S.orbitron, fontSize: '0.44rem', color: 'rgba(255,185,50,0.45)' }}>{s.ticker}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ ...S.orbitron, fontSize: '0.75rem', fontWeight: 700, color: s.change > 0 ? '#39FF7E' : '#FF3B3B' }}>${s.price}</div>
                      <div style={{ ...S.rajdhani, fontSize: '0.55rem', color: s.change > 0 ? '#39FF7E' : '#FF3B3B' }}>{s.change > 0 ? '+' : ''}{s.change}%</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MAP TAB */}
            {tab === "map" && (
              <div className="fade-in-up">
                <div style={{ ...S.orbitron, fontSize: '0.5rem', color: '#FFB932', letterSpacing: '0.15em', marginBottom: 8 }}>◈ КАРТА FREE CITY</div>
                <div style={{ position: 'relative', background: '#0a0f1a', border: '1px solid rgba(255,185,50,0.2)', overflow: 'hidden', cursor: 'pointer', aspectRatio: '4/3' }} onClick={() => setShowFullMap(true)}>
                  <svg width="100%" height="100%" viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} style={{ display: 'block' }}>
                    <rect width={WORLD_W} height={WORLD_H} fill="#0a0f1a" />
                    {/* Road grid */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={i * 360} x2={WORLD_W} y2={i * 360} stroke="#1a2a3a" strokeWidth="60" />
                    ))}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line key={`v${i}`} x1={i * 480} y1="0" x2={i * 480} y2={WORLD_H} stroke="#1a2a3a" strokeWidth="60" />
                    ))}
                    {/* Districts */}
                    {DISTRICTS.map(d => (
                      <g key={d.name}>
                        <circle cx={d.x} cy={d.y} r="80" fill={d.color + '18'} stroke={d.color + '50'} strokeWidth="4" />
                        <text x={d.x} y={d.y} textAnchor="middle" fill={d.color} fontSize="60" fontFamily="Orbitron,monospace" fontWeight="bold">{d.name}</text>
                        <text x={d.x} y={d.y + 80} textAnchor="middle" fill={d.color + '80'} fontSize="45" fontFamily="Exo 2,sans-serif">{d.desc}</text>
                      </g>
                    ))}
                    {/* Missions */}
                    {MISSION_MARKERS.map(m => (
                      <g key={m.label}>
                        <polygon points={`${m.x},${m.y - 80} ${m.x - 55},${m.y + 30} ${m.x + 55},${m.y + 30}`} fill={m.color} />
                        <text x={m.x} y={m.y + 15} textAnchor="middle" fill="#000" fontSize="55" fontFamily="Orbitron" fontWeight="900">{m.label}</text>
                      </g>
                    ))}
                    {/* NPCs */}
                    {NPC_PERSONS.map(npc => (
                      <circle key={npc.id} cx={npc.x} cy={npc.y} r="35" fill={npc.color + '60'} stroke={npc.color} strokeWidth="5" />
                    ))}
                    {/* Player */}
                    <circle cx={worldRef.current.player.x} cy={worldRef.current.player.y} r="50" fill="#FFB932" />
                    <circle cx={worldRef.current.player.x} cy={worldRef.current.player.y} r="80" fill="none" stroke="#FFB932" strokeWidth="8" opacity="0.4" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0)', pointerEvents: 'none' }}>
                    <div style={{ ...S.orbitron, fontSize: '0.5rem', color: 'rgba(255,185,50,0.4)', position: 'absolute', bottom: 6, right: 8 }}>НАЖМИ — ПОЛНАЯ КАРТА</div>
                  </div>
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DISTRICTS.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                      <span style={{ ...S.rajdhani, fontSize: '0.6rem', color: 'rgba(255,220,120,0.6)' }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* FULL MAP MODAL */}
      {showFullMap && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="hud-panel fade-in-up" style={{ width: '90vw', maxWidth: 900, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ ...S.orbitron, fontSize: '0.65rem', color: '#FFB932', letterSpacing: '0.2em', fontWeight: 700 }}>◆ КАРТА FREE CITY</span>
              <button onClick={() => setShowFullMap(false)} style={{ ...S.rajdhani, color: 'rgba(255,185,50,0.5)', fontSize: '1.1rem', cursor: 'pointer', background: 'transparent', border: 'none' }}>✕ ЗАКРЫТЬ</button>
            </div>
            <div style={{ position: 'relative', background: '#0a0f1a', border: '1px solid rgba(255,185,50,0.2)', overflow: 'hidden', aspectRatio: '4/3' }}>
              <svg width="100%" height="100%" viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}>
                <rect width={WORLD_W} height={WORLD_H} fill="#0a0f1a" />
                {Array.from({ length: 8 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 360} x2={WORLD_W} y2={i * 360} stroke="#1a2a3a" strokeWidth="55" />)}
                {Array.from({ length: 8 }).map((_, i) => <line key={`v${i}`} x1={i * 480} y1="0" x2={i * 480} y2={WORLD_H} stroke="#1a2a3a" strokeWidth="55" />)}
                {/* Blocks */}
                {Array.from({ length: 7 }).map((_, bx) =>
                  Array.from({ length: 6 }).map((_, by) => {
                    const seed = (bx * 7 + by * 13) % 5;
                    const bxp = bx * 480 + 80; const byp = by * 360 + 80;
                    return <rect key={`b${bx}${by}`} x={bxp} y={byp} width="320" height="200" fill={seed === 0 ? '#0d1f0f' : `hsl(${210 + seed * 8}, 20%, 9%)`} />;
                  })
                )}
                {/* Districts */}
                {DISTRICTS.map(d => (
                  <g key={d.name}>
                    <circle cx={d.x} cy={d.y} r="120" fill={d.color + '10'} stroke={d.color + '40'} strokeWidth="6" />
                    <text x={d.x} y={d.y + 10} textAnchor="middle" fill={d.color + 'cc'} fontSize="70" fontFamily="Orbitron,monospace" fontWeight="bold">{d.name}</text>
                    <text x={d.x} y={d.y + 90} textAnchor="middle" fill={d.color + '60'} fontSize="50" fontFamily="Exo 2,sans-serif">{d.desc}</text>
                  </g>
                ))}
                {/* Missions */}
                {MISSION_MARKERS.map(m => (
                  <g key={m.label}>
                    <polygon points={`${m.x},${m.y - 100} ${m.x - 65},${m.y + 40} ${m.x + 65},${m.y + 40}`} fill={m.color} opacity="0.95" />
                    <text x={m.x} y={m.y + 20} textAnchor="middle" fill="#000" fontSize="70" fontFamily="Orbitron" fontWeight="900">{m.label}</text>
                    <text x={m.x} y={m.y + 120} textAnchor="middle" fill={m.color} fontSize="40" fontFamily="Exo 2">{m.quest}</text>
                  </g>
                ))}
                {/* NPCs */}
                {NPC_PERSONS.map(npc => (
                  <g key={npc.id}>
                    <circle cx={npc.x} cy={npc.y} r="45" fill={npc.color + '50'} stroke={npc.color} strokeWidth="7" />
                    <text x={npc.x} y={npc.y + 90} textAnchor="middle" fill={npc.color} fontSize="42" fontFamily="Rajdhani,sans-serif" fontWeight="bold">{npc.name}</text>
                  </g>
                ))}
                {/* AI Cars */}
                {worldRef.current.cars.map(car => (
                  <circle key={car.id} cx={car.x} cy={car.y} r="30" fill="#ffffff30" stroke="#ffffff50" strokeWidth="4" />
                ))}
                {/* Player */}
                <circle cx={worldRef.current.player.x} cy={worldRef.current.player.y} r="60" fill="#FFB932cc" />
                <circle cx={worldRef.current.player.x} cy={worldRef.current.player.y} r="100" fill="none" stroke="#FFB932" strokeWidth="10" opacity="0.5" />
                <text x={worldRef.current.player.x} y={worldRef.current.player.y - 90} textAnchor="middle" fill="#FFB932" fontSize="55" fontFamily="Rajdhani">АЛЕКС РЕЙН</text>
              </svg>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, marginTop: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFB932' }} />
                <span style={{ ...S.rajdhani, fontSize: '0.65rem', color: 'rgba(255,220,120,0.7)' }}>Игрок</span>
              </div>
              {DISTRICTS.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                  <span style={{ ...S.rajdhani, fontSize: '0.6rem', color: 'rgba(255,220,120,0.55)' }}>{d.name}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid #FFB932' }} />
                <span style={{ ...S.rajdhani, fontSize: '0.6rem', color: 'rgba(255,220,120,0.55)' }}>Задания A B C</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NPC DIALOG */}
      {showNPC && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 30, background: 'rgba(0,0,0,0.55)' }}>
          <div className="dialog-box fade-in-up" style={{ width: 480, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', background: 'rgba(255,185,50,0.08)', border: `2px solid ${showNPC.color}60` }}>{showNPC.emoji}</div>
              <div>
                <div style={{ ...S.rajdhani, fontWeight: 700, fontSize: '0.95rem', color: showNPC.color }}>{showNPC.name}</div>
                <div style={{ ...S.exo, fontSize: '0.6rem', color: showNPC.color + '70' }}>{showNPC.role}</div>
              </div>
              <button onClick={() => { setShowNPC(null); setNpcResult(""); }} style={{ marginLeft: 'auto', color: 'rgba(255,185,50,0.5)', fontSize: '1rem', cursor: 'pointer', background: 'transparent', border: 'none' }}>✕</button>
            </div>
            <div style={{ ...S.exo, fontSize: '0.78rem', color: 'rgba(255,220,120,0.85)', lineHeight: 1.65, marginBottom: 10, padding: '7px 10px', background: 'rgba(255,185,50,0.04)', borderLeft: `2px solid ${showNPC.color}40` }}>
              {npcResult || `"Привет. Что тебе нужно?"`}
            </div>
            {!npcResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { text: "Есть работа для меня?", res: "Да. Порт, склад 7. Там груз. Возьми и исчезни — заплачу $5000.", money: 5000 },
                  { text: "Купить информацию ($500)", res: "Полиция контролирует Северный мост. Объезжай через набережную.", money: -500 },
                  { text: "Уйти", res: "" },
                ].map((c, i) => (
                  <div key={i} className="dialog-choice" onClick={() => {
                    if (!c.res) { setShowNPC(null); setNpcResult(""); return; }
                    if (c.money) {
                      setMoney(m => m + c.money!);
                      addNotif(c.money > 0 ? `💰 +$${c.money}` : `💸 -$${Math.abs(c.money)}`, c.money > 0 ? "money" : "warn");
                    }
                    setNpcResult(c.res);
                  }}>
                    <span style={{ color: 'rgba(0,212,255,0.65)', marginRight: 6 }}>[{i + 1}]</span>{c.text}
                  </div>
                ))}
              </div>
            ) : (
              <div className="dialog-choice" style={{ textAlign: 'center', color: '#FFB932' }} onClick={() => { setShowNPC(null); setNpcResult(""); }}>
                [ЗАКРЫТЬ] ▶
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// ─── MINIMAP PLAYER DOT ───────────────────────────────────────────────────────
function PlayerMinimapDot({ worldRef }: { worldRef: React.MutableRefObject<WorldState> }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      const p = worldRef.current.player;
      setPos({ x: p.x / WORLD_W * 130, y: p.y / WORLD_H * 130 });
    }, 100);
    return () => clearInterval(id);
  }, [worldRef]);
  return <circle cx={pos.x} cy={pos.y} r="5" fill="#FFB932" filter="url(#glow)" />;
}
