import * as THREE from "three";

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface GameState {
  health: number;
  armor: number;
  money: number;
  speed: number;
  wantedLevel: number;
  inVehicle: boolean;
  vehicleName: string;
  playerXP: number;
  playerLevel: number;
  nearVehicle: boolean;
  nearNPC: boolean;
  npcName: string;
  combatLog: string[];
  district: string;
}

export type GameEvent =
  | { type: "stateUpdate"; state: Partial<GameState> }
  | { type: "notification"; text: string; kind: "info" | "danger" | "money" | "heal" }
  | { type: "npcDialog"; npcName: string; npcRole: string; npcEmoji: string; color: string }
  | { type: "logAdd"; line: string };

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DISTRICT_ZONES = [
  { name: "ДАУНТАУН", cx: 0, cz: 0, r: 80 },
  { name: "КАЗИНО-СТРИТ", cx: 120, cz: -60, r: 60 },
  { name: "НАБЕРЕЖНАЯ", cx: 200, cz: 80, r: 70 },
  { name: "ТРУЩОБЫ", cx: -180, cz: 100, r: 80 },
  { name: "ЮЖНЫЙ ПОРТ", cx: 160, cz: 200, r: 90 },
  { name: "АВТОРЫНОК", cx: -100, cz: 200, r: 60 },
];

const NPC_CONFIGS = [
  { name: "Маркус Рейн", role: "Информатор", emoji: "🕵️", color: "#FFB932", x: 30, z: -20 },
  { name: "Виктория", role: "Казино-Босс", emoji: "💃", color: "#BF5AF2", x: 120, z: -55 },
  { name: "Карлос", role: "Автодилер", emoji: "🔧", color: "#FF9500", x: -100, z: 195 },
  { name: "Портовый мастер", role: "Контрабанда", emoji: "⚓", color: "#00D4FF", x: 165, z: 195 },
];

const VEHICLE_CONFIGS = [
  { name: "Dodge Viper", emoji: "🏎️", speed: 28, x: 20, z: 10, color: 0xe63946 },
  { name: "Humvee", emoji: "🚙", speed: 16, x: -30, z: 15, color: 0x4a5568 },
  { name: "Yamaha R1", emoji: "🏍️", speed: 24, x: 60, z: -30, color: 0x2d3748 },
  { name: "Police Car", emoji: "🚓", speed: 20, x: -60, z: -40, color: 0x2b6cb0 },
];

// ─── HELPER BUILDERS ─────────────────────────────────────────────────────────
function buildBuilding(w: number, h: number, d: number, color: number, emissive = 0x000000): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshLambertMaterial({ color, emissive });
  return new THREE.Mesh(geo, mat);
}

function buildWindow(w: number, h: number): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(w, h);
  const mat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.4 ? 0xffd700 : 0x1a2a3a, transparent: true, opacity: 0.85 });
  return new THREE.Mesh(geo, mat);
}

// ─── PLAYER CHARACTER (3D humanoid) ──────────────────────────────────────────
function createPlayerMesh(): THREE.Group {
  const group = new THREE.Group();

  const skin = 0xf4a261;
  const shirt = 0x1a1a2e;
  const pants = 0x2d3561;
  const shoe = 0x1a1a1a;
  const hair = 0x2d1b00;

  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.55, 0.7, 0.3);
  const torsoMat = new THREE.MeshLambertMaterial({ color: shirt });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 1.05;
  group.add(torso);

  // Chest armor plate
  const armorGeo = new THREE.BoxGeometry(0.52, 0.3, 0.12);
  const armorMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3e, emissive: 0x111122 });
  const armor = new THREE.Mesh(armorGeo, armorMat);
  armor.position.set(0, 1.1, 0.21);
  group.add(armor);

  // Belt
  const beltGeo = new THREE.BoxGeometry(0.58, 0.08, 0.32);
  const beltMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.y = 0.72;
  group.add(belt);

  // Hips
  const hipGeo = new THREE.BoxGeometry(0.5, 0.1, 0.28);
  const hipMat = new THREE.MeshLambertMaterial({ color: pants });
  const hip = new THREE.Mesh(hipGeo, hipMat);
  hip.position.y = 0.65;
  group.add(hip);

  // Legs
  const legMat = new THREE.MeshLambertMaterial({ color: pants });
  const leftLeg = new THREE.Group();
  const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.22), legMat);
  leftLegMesh.position.y = -0.3;
  leftLeg.add(leftLegMesh);
  leftLeg.position.set(-0.14, 0.6, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.22), legMat.clone());
  rightLegMesh.position.y = -0.3;
  rightLeg.add(rightLegMesh);
  rightLeg.position.set(0.14, 0.6, 0);
  group.add(rightLeg);

  // Shoes
  const shoeMat = new THREE.MeshLambertMaterial({ color: shoe });
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.3), shoeMat);
  leftShoe.position.set(-0.14, 0.06, 0.04);
  group.add(leftShoe);
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.3), shoeMat.clone());
  rightShoe.position.set(0.14, 0.06, 0.04);
  group.add(rightShoe);

  // Arms
  const armMat = new THREE.MeshLambertMaterial({ color: shirt });
  const leftArm = new THREE.Group();
  const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), armMat);
  leftArmMesh.position.y = -0.28;
  leftArm.add(leftArmMesh);
  leftArm.position.set(-0.38, 1.2, 0);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.2), armMat.clone());
  rightArmMesh.position.y = -0.28;
  rightArm.add(rightArmMesh);
  rightArm.position.set(0.38, 1.2, 0);
  group.add(rightArm);

  // Hands
  const handMat = new THREE.MeshLambertMaterial({ color: skin });
  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.18, 0.18), handMat);
  leftHand.position.set(-0.38, 0.9, 0);
  group.add(leftHand);
  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.18, 0.18), handMat.clone());
  rightHand.position.set(0.38, 0.9, 0);
  group.add(rightHand);

  // Neck
  const neckMat = new THREE.MeshLambertMaterial({ color: skin });
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.15, 8), neckMat);
  neck.position.y = 1.47;
  group.add(neck);

  // Head
  const headMat = new THREE.MeshLambertMaterial({ color: skin });
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.4), headMat);
  head.position.y = 1.72;
  group.add(head);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
  const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.02), eyeMat);
  leftEye.position.set(-0.1, 1.75, 0.21);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.02), eyeMat.clone());
  rightEye.position.set(0.1, 1.75, 0.21);
  group.add(rightEye);

  // Hair
  const hairMat = new THREE.MeshLambertMaterial({ color: hair });
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.14, 0.42), hairMat);
  hairTop.position.y = 1.96;
  group.add(hairTop);

  const hairFront = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.08), hairMat.clone());
  hairFront.position.set(0, 1.9, 0.22);
  group.add(hairFront);

  // Stubble (dark lower face)
  const stubbleMat = new THREE.MeshLambertMaterial({ color: 0xd4875a });
  const stubble = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.12, 0.02), stubbleMat);
  stubble.position.set(0, 1.6, 0.21);
  group.add(stubble);

  // Store refs for animation
  (group as THREE.Group & { leftLeg: THREE.Group; rightLeg: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; head: THREE.Mesh }).leftLeg = leftLeg;
  (group as THREE.Group & { leftLeg: THREE.Group; rightLeg: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; head: THREE.Mesh }).rightLeg = rightLeg;
  (group as THREE.Group & { leftLeg: THREE.Group; rightLeg: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; head: THREE.Mesh }).leftArm = leftArm;
  (group as THREE.Group & { leftLeg: THREE.Group; rightLeg: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; head: THREE.Mesh }).rightArm = rightArm;
  (group as THREE.Group & { leftLeg: THREE.Group; rightLeg: THREE.Group; leftArm: THREE.Group; rightArm: THREE.Group; head: THREE.Mesh }).head = head;

  group.castShadow = true;
  return group;
}

// ─── VEHICLE MESH ─────────────────────────────────────────────────────────────
function createVehicleMesh(color: number): THREE.Group {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.BoxGeometry(2.2, 0.7, 4.5);
  const bodyMat = new THREE.MeshLambertMaterial({ color });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.5;
  body.castShadow = true;
  group.add(body);

  // Cabin
  const cabinGeo = new THREE.BoxGeometry(1.8, 0.6, 2.4);
  const cabinMat = new THREE.MeshLambertMaterial({ color: 0x223344, transparent: true, opacity: 0.85 });
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 1.05, -0.2);
  group.add(cabin);

  // Windshield
  const windGeo = new THREE.PlaneGeometry(1.7, 0.55);
  const windMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  const wind = new THREE.Mesh(windGeo, windMat);
  wind.position.set(0, 1.05, 0.82);
  wind.rotation.x = -0.25;
  group.add(wind);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const rimMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });

  const wheelPositions = [
    [-1.18, 0.38, 1.4], [1.18, 0.38, 1.4],
    [-1.18, 0.38, -1.4], [1.18, 0.38, -1.4],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wg = new THREE.Group();
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.rotation.z = Math.PI / 2;
    w.castShadow = true;
    wg.add(w);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.29, 6), rimMat);
    rim.rotation.z = Math.PI / 2;
    wg.add(rim);
    wg.position.set(x, y, z);
    group.add(wg);
  });

  // Headlights
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
  [-0.6, 0.6].forEach(x => {
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.06), lightMat);
    light.position.set(x, 0.6, 2.28);
    group.add(light);
  });

  // Taillights
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });
  [-0.6, 0.6].forEach(x => {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.06), tailMat);
    t.position.set(x, 0.6, -2.28);
    group.add(t);
  });

  return group;
}

// ─── NPC MESH ─────────────────────────────────────────────────────────────────
function createNPCMesh(color: number): THREE.Group {
  const g = new THREE.Group();
  const skin = new THREE.MeshLambertMaterial({ color: 0xf4a261 });
  const cloth = new THREE.MeshLambertMaterial({ color });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.8, 4, 8), cloth);
  body.position.y = 0.75;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), skin);
  head.position.y = 1.55;
  g.add(head);
  return g;
}

// ─── CITY BUILDER ─────────────────────────────────────────────────────────────
function buildCity(scene: THREE.Scene) {
  // Ground
  const groundGeo = new THREE.PlaneGeometry(600, 600);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x0d1520 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Road grid
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x1a2235 });
  const markingMat = new THREE.MeshBasicMaterial({ color: 0xffd70020 });

  // Roads horizontal and vertical
  for (let i = -5; i <= 5; i++) {
    const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(600, 14), roadMat);
    hRoad.rotation.x = -Math.PI / 2;
    hRoad.position.set(0, 0.01, i * 50);
    scene.add(hRoad);

    const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(14, 600), roadMat.clone());
    vRoad.rotation.x = -Math.PI / 2;
    vRoad.position.set(i * 50, 0.01, 0);
    scene.add(vRoad);

    // Dashed center lines
    for (let j = -12; j <= 12; j++) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 4), markingMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(j * 10, 0.02, i * 50);
      scene.add(dash);

      const dashV = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.3), markingMat.clone());
      dashV.rotation.x = -Math.PI / 2;
      dashV.position.set(i * 50, 0.02, j * 10);
      scene.add(dashV);
    }
  }

  // Sidewalks
  const sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x141d2e });
  for (let i = -4; i <= 4; i++) {
    for (let j = -4; j <= 4; j++) {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(36, 0.04, 36), sidewalkMat);
      sw.position.set(i * 50, 0.02, j * 50);
      scene.add(sw);
    }
  }

  // Buildings
  const buildingColors = [0x1a2235, 0x162030, 0x1c2840, 0x131e2e, 0x1e2845, 0x162538];
  const windowColors = [0xffd700, 0xffee88, 0x88ccff, 0x1a2a3a];

  for (let bx = -4; bx <= 4; bx++) {
    for (let bz = -4; bz <= 4; bz++) {
      const seed = Math.abs(bx * 7 + bz * 13) % 8;
      if (seed === 0) {
        // Park / plaza
        const parkMat = new THREE.MeshLambertMaterial({ color: 0x0d1f0f });
        const park = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), parkMat);
        park.rotation.x = -Math.PI / 2;
        park.position.set(bx * 50, 0.03, bz * 50);
        scene.add(park);

        // Trees
        for (let t = 0; t < 5; t++) {
          const tx = bx * 50 + (Math.random() - 0.5) * 22;
          const tz = bz * 50 + (Math.random() - 0.5) * 22;
          const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 2, 6), new THREE.MeshLambertMaterial({ color: 0x4a3728 }));
          trunk.position.set(tx, 1, tz);
          trunk.castShadow = true;
          scene.add(trunk);
          const foliage = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 6), new THREE.MeshLambertMaterial({ color: 0x1a4a1a }));
          foliage.position.set(tx, 3.5, tz);
          foliage.castShadow = true;
          scene.add(foliage);
        }
        continue;
      }

      const numBuildings = 1 + (seed % 3);
      for (let b = 0; b < numBuildings; b++) {
        const bw = 8 + seed * 2;
        const bd = 8 + (seed % 3) * 3;
        const bh = 6 + seed * 5 + Math.abs(bx + bz) * 2;
        const colIdx = Math.abs(bx + bz * 3 + b) % buildingColors.length;
        const bld = buildBuilding(bw, bh, bd, buildingColors[colIdx]);

        const ox = (b - numBuildings / 2) * (bw + 2);
        bld.position.set(bx * 50 + ox, bh / 2, bz * 50);
        bld.castShadow = true;
        bld.receiveShadow = true;
        scene.add(bld);

        // Windows
        const rowCount = Math.floor(bh / 2.5);
        const colCount = Math.floor(bw / 2);
        for (let wr = 0; wr < rowCount; wr++) {
          for (let wc = 0; wc < colCount; wc++) {
            const win = buildWindow(0.9, 1.2);
            win.material.color.setHex(windowColors[Math.floor(Math.random() * windowColors.length)]);
            win.position.set(
              bx * 50 + ox - (bw / 2) + 1.5 + wc * 2,
              1.5 + wr * 2.5,
              bz * 50 + bd / 2 + 0.01
            );
            scene.add(win);
          }
        }

        // Rooftop features
        if (Math.random() > 0.5) {
          const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 4), new THREE.MeshLambertMaterial({ color: 0x888888 }));
          antenna.position.set(bx * 50 + ox, bh + 1.5, bz * 50);
          scene.add(antenna);
        }
        // Roof light
        if (seed > 3) {
          const roofLight = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff3322 }));
          roofLight.position.set(bx * 50 + ox, bh + 0.2, bz * 50);
          scene.add(roofLight);
        }
      }

      // Street lights
      if ((bx + bz) % 2 === 0) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 5, 6), new THREE.MeshLambertMaterial({ color: 0x666666 }));
        pole.position.set(bx * 50 + 18, 2.5, bz * 50 + 18);
        scene.add(pole);
        const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfffacc }));
        lamp.position.set(bx * 50 + 18, 5.2, bz * 50 + 18);
        scene.add(lamp);
        // Point light
        const pl = new THREE.PointLight(0xfffacc, 0.6, 20);
        pl.position.set(bx * 50 + 18, 5, bz * 50 + 18);
        scene.add(pl);
      }
    }
  }

  // Water/port at edge
  const waterMat = new THREE.MeshLambertMaterial({ color: 0x0a1828, transparent: true, opacity: 0.85 });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(120, 80), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(180, 0.05, 200);
  scene.add(water);

  // Highway elevated
  const hwMat = new THREE.MeshLambertMaterial({ color: 0x1e2840 });
  const hw = new THREE.Mesh(new THREE.BoxGeometry(600, 0.6, 10), hwMat);
  hw.position.set(0, 3, -250);
  scene.add(hw);
}

// ─── MAIN ENGINE ─────────────────────────────────────────────────────────────
export class FreeCityEngine {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private player!: THREE.Group;
  private vehicles: Array<{ mesh: THREE.Group; config: typeof VEHICLE_CONFIGS[0]; occupied: boolean }> = [];
  private npcs: Array<{ mesh: THREE.Group; config: typeof NPC_CONFIGS[0] }> = [];

  private keys: Record<string, boolean> = {};
  private playerVelocity = new THREE.Vector3();
  private playerRotation = 0;
  private camDistance = 9;
  private camAngleH = 0;
  private camAngleV = 0.35;
  private mouse = { x: 0, y: 0, down: false };
  private clock = new THREE.Clock();
  private animTime = 0;
  private inVehicle = false;
  private currentVehicleIdx = -1;
  private raycaster = new THREE.Raycaster();

  private state: GameState = {
    health: 78, armor: 55, money: 47350, speed: 0,
    wantedLevel: 2, inVehicle: false, vehicleName: "",
    playerXP: 6820, playerLevel: 12,
    nearVehicle: false, nearNPC: false, npcName: "",
    combatLog: ["▶ Инициализация Free City Engine...", "▶ Мир загружен", "▶ Добро пожаловать в Free City"],
    district: "ДАУНТАУН",
  };

  private eventCallback: ((e: GameEvent) => void) | null = null;
  private raf = 0;

  // ── Init ──────────────────────────────────────────────────────────────────
  init(canvas: HTMLCanvasElement, onEvent: (e: GameEvent) => void) {
    this.eventCallback = onEvent;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x04080f);
    this.scene.fog = new THREE.Fog(0x04080f, 80, 280);

    // Camera
    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 500);

    // Lights
    const ambient = new THREE.AmbientLight(0x101828, 2.5);
    this.scene.add(ambient);

    const moonLight = new THREE.DirectionalLight(0x3a5a8a, 1.2);
    moonLight.position.set(-60, 120, -40);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.set(2048, 2048);
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 400;
    moonLight.shadow.camera.left = -150;
    moonLight.shadow.camera.right = 150;
    moonLight.shadow.camera.top = 150;
    moonLight.shadow.camera.bottom = -150;
    this.scene.add(moonLight);

    // Neon accent lights
    const neon1 = new THREE.PointLight(0xff6600, 1.5, 60);
    neon1.position.set(30, 15, -20);
    this.scene.add(neon1);
    const neon2 = new THREE.PointLight(0x00aaff, 1.2, 50);
    neon2.position.set(-40, 12, 30);
    this.scene.add(neon2);
    const neon3 = new THREE.PointLight(0xff0055, 0.9, 45);
    neon3.position.set(80, 10, -40);
    this.scene.add(neon3);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starVerts = [];
    for (let i = 0; i < 3000; i++) {
      starVerts.push((Math.random() - 0.5) * 800, Math.random() * 200 + 30, (Math.random() - 0.5) * 800);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.7 });
    this.scene.add(new THREE.Points(starGeo, starMat));

    // Build city
    buildCity(this.scene);

    // Player
    this.player = createPlayerMesh();
    this.player.position.set(0, 0, 0);
    this.player.castShadow = true;
    this.scene.add(this.player);

    // Vehicles
    VEHICLE_CONFIGS.forEach(cfg => {
      const mesh = createVehicleMesh(cfg.color);
      mesh.position.set(cfg.x, 0, cfg.z);
      this.scene.add(mesh);
      this.vehicles.push({ mesh, config: cfg, occupied: false });
    });

    // NPCs
    NPC_CONFIGS.forEach(cfg => {
      const colorHex = parseInt(cfg.color.replace('#', ''), 16);
      const mesh = createNPCMesh(colorHex);
      mesh.position.set(cfg.x, 0, cfg.z);
      this.scene.add(mesh);
      this.npcs.push({ mesh, config: cfg });

      // Name label (floating sprite)
      const canvas2 = document.createElement('canvas');
      canvas2.width = 256; canvas2.height = 64;
      const ctx = canvas2.getContext('2d')!;
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 256, 64);
      ctx.fillStyle = cfg.color;
      ctx.font = 'bold 22px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cfg.name, 128, 28);
      ctx.fillStyle = 'rgba(255,220,120,0.6)';
      ctx.font = '16px Exo 2, sans-serif';
      ctx.fillText(cfg.role, 128, 50);
      const tex = new THREE.CanvasTexture(canvas2);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      sprite.scale.set(4, 1, 1);
      sprite.position.set(cfg.x, 3.2, cfg.z);
      this.scene.add(sprite);
    });

    // Input
    this.setupInput();

    // Start loop
    this.loop();

    // Resize
    window.addEventListener('resize', this.onResize);
  }

  private setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyE' || e.code === 'KeyF') this.tryInteract();
      if (e.code === 'KeyG') this.shoot();
      if (e.code === 'KeyH') this.heal();
    });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    window.addEventListener('mousedown', (e) => { if (e.button === 2) this.mouse.down = true; });
    window.addEventListener('mouseup', (e) => { if (e.button === 2) this.mouse.down = false; });
    window.addEventListener('mousemove', (e) => {
      if (this.mouse.down) {
        this.camAngleH -= e.movementX * 0.006;
        this.camAngleV = Math.max(0.1, Math.min(1.1, this.camAngleV - e.movementY * 0.005));
      }
      this.mouse.x = e.clientX; this.mouse.y = e.clientY;
    });
    window.addEventListener('wheel', (e) => {
      this.camDistance = Math.max(4, Math.min(22, this.camDistance + e.deltaY * 0.012));
    });
    window.addEventListener('contextmenu', e => e.preventDefault());
  }

  private tryInteract() {
    if (this.inVehicle) {
      // Exit vehicle
      this.inVehicle = false;
      const v = this.vehicles[this.currentVehicleIdx];
      v.occupied = false;
      this.player.visible = true;
      this.player.position.copy(v.mesh.position).add(new THREE.Vector3(2.5, 0, 0));
      this.currentVehicleIdx = -1;
      this.updateState({ inVehicle: false, vehicleName: "", speed: 0 });
      this.emit({ type: "notification", text: "🚪 Вышел из машины", kind: "info" });
      this.addLog("🚗 Пешком");
      return;
    }

    // Check vehicle proximity
    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      const dist = this.player.position.distanceTo(v.mesh.position);
      if (dist < 5 && !v.occupied) {
        v.occupied = true;
        this.inVehicle = true;
        this.currentVehicleIdx = i;
        this.player.visible = false;
        this.updateState({ inVehicle: true, vehicleName: v.config.name });
        this.emit({ type: "notification", text: `🚗 Сел в ${v.config.emoji} ${v.config.name}`, kind: "info" });
        this.addLog(`🚗 За рулём: ${v.config.name}`);
        return;
      }
    }

    // Check NPC proximity
    for (const npc of this.npcs) {
      const dist = this.player.position.distanceTo(npc.mesh.position);
      if (dist < 5) {
        this.emit({ type: "npcDialog", npcName: npc.config.name, npcRole: npc.config.role, npcEmoji: npc.config.emoji, color: npc.config.color });
        return;
      }
    }
  }

  private shoot() {
    const dmg = Math.floor(Math.random() * 80 + 20);
    this.addLog(`🔫 Выстрел: ${dmg} урона`);
    if (Math.random() > 0.6) {
      this.updateState({ health: Math.max(0, this.state.health - Math.floor(Math.random() * 12 + 5)) });
      this.emit({ type: "notification", text: "⚠ Получен урон!", kind: "danger" });
    } else {
      this.emit({ type: "notification", text: `🎯 Враг поражён! ${dmg} урона`, kind: "info" });
      this.updateState({ playerXP: Math.min(100000, this.state.playerXP + 50) });
    }
  }

  private heal() {
    this.updateState({ health: Math.min(100, this.state.health + 25) });
    this.emit({ type: "notification", text: "💊 +25 HP", kind: "heal" });
    this.addLog("💊 Лечение: +25 HP");
  }

  private addLog(line: string) {
    this.state.combatLog = [line, ...this.state.combatLog.slice(0, 6)];
    this.emit({ type: "logAdd", line });
  }

  private updateState(partial: Partial<GameState>) {
    Object.assign(this.state, partial);
    this.emit({ type: "stateUpdate", state: partial });
  }

  private emit(e: GameEvent) {
    this.eventCallback?.(e);
  }

  getState(): GameState { return { ...this.state }; }

  // ── Game Loop ─────────────────────────────────────────────────────────────
  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.animTime += dt;

    this.updateMovement(dt);
    this.updateCamera();
    this.updateProximity();
    this.animateCharacter();
    this.renderer.render(this.scene, this.camera);
  };

  private updateMovement(dt: number) {
    const k = this.keys;
    const spd = this.inVehicle
      ? this.vehicles[this.currentVehicleIdx].config.speed
      : 7;

    let moving = false;
    const forward = new THREE.Vector3(-Math.sin(this.camAngleH), 0, -Math.cos(this.camAngleH));
    const right = new THREE.Vector3(Math.cos(this.camAngleH), 0, -Math.sin(this.camAngleH));
    const move = new THREE.Vector3();

    if (k['ArrowUp'] || k['KeyW']) { move.add(forward); moving = true; }
    if (k['ArrowDown'] || k['KeyS']) { move.sub(forward); moving = true; }
    if (k['ArrowRight'] || k['KeyD']) { move.add(right); moving = true; }
    if (k['ArrowLeft'] || k['KeyA']) { move.sub(right); moving = true; }

    if (moving) {
      move.normalize().multiplyScalar(spd * dt);
      const target = this.inVehicle
        ? this.vehicles[this.currentVehicleIdx].mesh
        : this.player;
      target.position.add(move);
      // Clamp to world bounds
      target.position.x = Math.max(-280, Math.min(280, target.position.x));
      target.position.z = Math.max(-280, Math.min(280, target.position.z));

      // Face direction
      if (move.length() > 0.001) {
        const angle = Math.atan2(move.x, move.z);
        target.rotation.y = angle;
      }

      if (this.inVehicle) {
        this.player.position.copy(this.vehicles[this.currentVehicleIdx].mesh.position);
      }
    }

    const speedKmh = moving ? Math.round(spd * (this.inVehicle ? 8 : 2.5)) : 0;
    if (speedKmh !== this.state.speed) {
      this.updateState({ speed: speedKmh });
    }

    // Update district
    const px = this.player.position.x;
    const pz = this.player.position.z;
    for (const d of DISTRICT_ZONES) {
      if (Math.hypot(px - d.cx, pz - d.cz) < d.r) {
        if (d.name !== this.state.district) {
          this.updateState({ district: d.name });
          this.emit({ type: "notification", text: `📍 ${d.name}`, kind: "info" });
        }
        break;
      }
    }
  }

  private updateCamera() {
    const target = this.inVehicle
      ? this.vehicles[this.currentVehicleIdx].mesh.position
      : this.player.position;

    const camX = target.x + this.camDistance * Math.sin(this.camAngleH) * Math.cos(this.camAngleV);
    const camY = target.y + this.camDistance * Math.sin(this.camAngleV) + 2;
    const camZ = target.z + this.camDistance * Math.cos(this.camAngleH) * Math.cos(this.camAngleV);

    this.camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.12);
    this.camera.lookAt(target.x, target.y + 1.5, target.z);
  }

  private updateProximity() {
    let nearV = false, nearN = false, npcName = "";
    const pp = this.player.position;

    if (!this.inVehicle) {
      for (const v of this.vehicles) {
        if (pp.distanceTo(v.mesh.position) < 5 && !v.occupied) { nearV = true; break; }
      }
      for (const n of this.npcs) {
        if (pp.distanceTo(n.mesh.position) < 5) { nearN = true; npcName = n.config.name; break; }
      }
    }

    if (nearV !== this.state.nearVehicle || nearN !== this.state.nearNPC || npcName !== this.state.npcName) {
      this.updateState({ nearVehicle: nearV, nearNPC: nearN, npcName });
    }
  }

  private animateCharacter() {
    if (!this.player.visible) return;
    type AnimPlayer = THREE.Group & { leftLeg?: THREE.Group; rightLeg?: THREE.Group; leftArm?: THREE.Group; rightArm?: THREE.Group };
    const p = this.player as AnimPlayer;
    const moving = this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['ArrowDown'] || this.keys['KeyS']
      || this.keys['ArrowLeft'] || this.keys['KeyA'] || this.keys['ArrowRight'] || this.keys['KeyD'];

    if (moving) {
      const swing = Math.sin(this.animTime * 8) * 0.4;
      if (p.leftLeg) p.leftLeg.rotation.x = swing;
      if (p.rightLeg) p.rightLeg.rotation.x = -swing;
      if (p.leftArm) p.leftArm.rotation.x = -swing * 0.7;
      if (p.rightArm) p.rightArm.rotation.x = swing * 0.7;
    } else {
      if (p.leftLeg) p.leftLeg.rotation.x *= 0.85;
      if (p.rightLeg) p.rightLeg.rotation.x *= 0.85;
      if (p.leftArm) p.leftArm.rotation.x *= 0.85;
      if (p.rightArm) p.rightArm.rotation.x *= 0.85;
      // Idle bob
      const bob = Math.sin(this.animTime * 1.5) * 0.015;
      this.player.position.y = bob;
    }

    // NPC idle animation
    this.npcs.forEach((npc, i) => {
      npc.mesh.rotation.y = this.animTime * 0.4 + i * 1.2;
    });
  }

  // ── Public API ────────────────────────────────────────────────────────────
  addMoney(amount: number) {
    this.updateState({ money: this.state.money + amount });
    this.emit({ type: "notification", text: `💰 +$${amount.toLocaleString()}`, kind: "money" });
    this.addLog(`💰 +$${amount.toLocaleString()}`);
  }

  triggerFight() {
    this.shoot();
    this.updateState({ wantedLevel: Math.min(5, this.state.wantedLevel + 1) });
    this.emit({ type: "notification", text: "🚔 Розыск повышен!", kind: "danger" });
    this.addLog("🚔 Полиция объявила облаву!");
  }

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}