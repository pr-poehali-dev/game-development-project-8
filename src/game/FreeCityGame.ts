import * as THREE from "three";

// ─── TYPED PLAYER GROUP ───────────────────────────────────────────────────────
interface PlayerGroup extends THREE.Group {
  _leftLeg: THREE.Group;
  _rightLeg: THREE.Group;
  _leftArm: THREE.Group;
  _rightArm: THREE.Group;
}

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

// ─── PLAYER CHARACTER ─────────────────────────────────────────────────────────
function createPlayerMesh(): PlayerGroup {
  const group = new THREE.Group() as PlayerGroup;

  // Scale up player significantly so it's visible
  group.scale.set(1.5, 1.5, 1.5);

  const skinMat = new THREE.MeshLambertMaterial({ color: 0xf4a261 });
  const shirtMat = new THREE.MeshLambertMaterial({ color: 0x1a3a8f }); // bright blue jacket
  const pantsMat = new THREE.MeshLambertMaterial({ color: 0x2d3a61 });
  const shoeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x2d1b00 });
  const armorMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3e, emissive: 0x1122aa });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.3), shirtMat);
  torso.position.y = 1.05;
  group.add(torso);

  // Chest armor
  const armor = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.28, 0.1), armorMat);
  armor.position.set(0, 1.1, 0.2);
  group.add(armor);

  // Belt
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.08, 0.32), new THREE.MeshLambertMaterial({ color: 0x8B7355 }));
  belt.position.y = 0.72;
  group.add(belt);

  // Hips
  const hip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.28), pantsMat);
  hip.position.y = 0.65;
  group.add(hip);

  // Legs with knee pads
  const legMat = new THREE.MeshLambertMaterial({ color: 0x2d3a61 });
  const kneeMat = new THREE.MeshLambertMaterial({ color: 0x1a1a2e, emissive: 0x001133 });

  const leftLeg = new THREE.Group();
  const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.62, 0.23), legMat);
  lLegMesh.position.set(0, -0.31, 0);
  leftLeg.add(lLegMesh);
  const lKnee = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.14, 0.14), kneeMat);
  lKnee.position.set(0, -0.12, 0.1);
  leftLeg.add(lKnee);
  leftLeg.position.set(-0.14, 0.6, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Group();
  const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.62, 0.23), legMat.clone());
  rLegMesh.position.set(0, -0.31, 0);
  rightLeg.add(rLegMesh);
  const rKnee = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.14, 0.14), kneeMat.clone());
  rKnee.position.set(0, -0.12, 0.1);
  rightLeg.add(rKnee);
  rightLeg.position.set(0.14, 0.6, 0);
  group.add(rightLeg);

  // Shoes
  const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.13, 0.32), shoeMat);
  leftShoe.position.set(-0.14, 0.065, 0.05);
  group.add(leftShoe);
  const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.13, 0.32), shoeMat.clone());
  rightShoe.position.set(0.14, 0.065, 0.05);
  group.add(rightShoe);

  // Arms
  const armMat = new THREE.MeshLambertMaterial({ color: 0x1a3a8f });
  const leftArm = new THREE.Group();
  const lArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.62, 0.21), armMat);
  lArmMesh.position.set(0, -0.29, 0);
  leftArm.add(lArmMesh);
  leftArm.position.set(-0.38, 1.2, 0);
  group.add(leftArm);

  const rightArm = new THREE.Group();
  const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.62, 0.21), armMat.clone());
  rArmMesh.position.set(0, -0.29, 0);
  rightArm.add(rArmMesh);
  rightArm.position.set(0.38, 1.2, 0);
  group.add(rightArm);

  // Hands
  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.19, 0.19), skinMat);
  leftHand.position.set(-0.38, 0.89, 0);
  group.add(leftHand);
  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.19, 0.19), skinMat.clone());
  rightHand.position.set(0.38, 0.89, 0);
  group.add(rightHand);

  // Gun in right hand
  const gunMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const gun = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.3), gunMat);
  gun.position.set(0.38, 0.82, 0.15);
  group.add(gun);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 6), gunMat.clone());
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0.38, 0.86, 0.28);
  group.add(barrel);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.16, 8), skinMat.clone());
  neck.position.y = 1.47;
  group.add(neck);

  // Head — bigger and more visible
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.46, 0.42), skinMat.clone());
  head.position.y = 1.73;
  group.add(head);

  // Jaw darker
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.1), new THREE.MeshLambertMaterial({ color: 0xd4875a }));
  jaw.position.set(0, 1.6, 0.22);
  group.add(jaw);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.03), eyeMat);
  leftEye.position.set(-0.1, 1.76, 0.22);
  group.add(leftEye);
  const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.03), eyeMat.clone());
  rightEye.position.set(0.1, 1.76, 0.22);
  group.add(rightEye);

  // Eye whites
  const eWMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lEW = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.025), eWMat);
  lEW.position.set(-0.1, 1.76, 0.215);
  group.add(lEW);
  const rEW = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.025), eWMat.clone());
  rEW.position.set(0.1, 1.76, 0.215);
  group.add(rEW);

  // Hair
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.44), hairMat);
  hairTop.position.y = 1.98;
  group.add(hairTop);
  const hairFront = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.1), hairMat.clone());
  hairFront.position.set(0, 1.92, 0.23);
  group.add(hairFront);
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.3, 0.08), hairMat.clone());
  hairBack.position.set(0, 1.83, -0.25);
  group.add(hairBack);

  // Headset/tactical cap visor
  const capMat = new THREE.MeshLambertMaterial({ color: 0x0a1228, emissive: 0x001144 });
  const cap = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.08, 0.46), capMat);
  cap.position.y = 2.06;
  group.add(cap);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.16), capMat.clone());
  visor.position.set(0, 2.02, 0.3);
  group.add(visor);

  // Shoulder pads
  const shoulderMat = new THREE.MeshLambertMaterial({ color: 0x1a2a6e, emissive: 0x000822 });
  const lShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.28), shoulderMat);
  lShoulder.position.set(-0.41, 1.35, 0);
  group.add(lShoulder);
  const rShoulder = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.28), shoulderMat.clone());
  rShoulder.position.set(0.41, 1.35, 0);
  group.add(rShoulder);

  // Backpack
  const bpMat = new THREE.MeshLambertMaterial({ color: 0x1a1a2e, emissive: 0x000011 });
  const bp = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.5, 0.2), bpMat);
  bp.position.set(0, 1.05, -0.24);
  group.add(bp);

  // Store anim refs
  group._leftLeg = leftLeg;
  group._rightLeg = rightLeg;
  group._leftArm = leftArm;
  group._rightArm = rightArm;

  group.castShadow = true;
  return group;
}

// ─── VEHICLE MESH ─────────────────────────────────────────────────────────────
function createVehicleMesh(color: number): THREE.Group {
  const g = new THREE.Group();

  const bodyMat = new THREE.MeshLambertMaterial({ color });
  const glassMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const rimMat = new THREE.MeshLambertMaterial({ color: 0xbbbbbb });
  const chromeMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
  const headMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff2200 });

  // Lower body
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 4.6), bodyMat);
  lowerBody.position.y = 0.6;
  lowerBody.castShadow = true;
  g.add(lowerBody);

  // Upper cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.65, 2.5), bodyMat.clone());
  cabin.position.set(0, 1.12, -0.15);
  g.add(cabin);

  // Cabin roof slight bevel
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.08, 2.4), new THREE.MeshLambertMaterial({ color: Math.floor(color * 0.8) }));
  roof.position.set(0, 1.47, -0.15);
  g.add(roof);

  // Windshield front
  const windFront = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.6), glassMat);
  windFront.position.set(0, 1.12, 1.09);
  windFront.rotation.x = -0.28;
  g.add(windFront);

  // Windshield back
  const windBack = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.58), glassMat.clone());
  windBack.position.set(0, 1.1, -1.42);
  windBack.rotation.x = 0.28;
  g.add(windBack);

  // Side windows
  [-0.96, 0.96].forEach(x => {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), glassMat.clone());
    sw.position.set(x, 1.12, -0.15);
    sw.rotation.y = Math.PI / 2;
    g.add(sw);
  });

  // Door lines
  const doorMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  [-0.95, 0.95].forEach(x => {
    const dl = new THREE.Mesh(new THREE.PlaneGeometry(0.01, 0.5), doorMat);
    dl.position.set(x, 0.6, 0.28);
    dl.rotation.y = Math.PI / 2;
    g.add(dl);
  });

  // Hood
  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.06, 1.6), new THREE.MeshLambertMaterial({ color: Math.floor(color * 1.1) }));
  hood.position.set(0, 0.89, 1.3);
  g.add(hood);

  // Trunk
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.06, 0.8), new THREE.MeshLambertMaterial({ color: Math.floor(color * 1.05) }));
  trunk.position.set(0, 0.89, -1.7);
  g.add(trunk);

  // Bumpers
  const bumperMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.25, 0.18), bumperMat);
  frontBumper.position.set(0, 0.38, 2.4);
  g.add(frontBumper);
  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.25, 0.18), bumperMat.clone());
  rearBumper.position.set(0, 0.38, -2.4);
  g.add(rearBumper);

  // Chrome trim
  const trim = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.04, 4.62), chromeMat);
  trim.position.set(0, 0.33, 0);
  g.add(trim);

  // Wheels
  const wheelPositions: [number, number, number][] = [
    [-1.18, 0.35, 1.5], [1.18, 0.35, 1.5],
    [-1.18, 0.35, -1.5], [1.18, 0.35, -1.5],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wg = new THREE.Group();
    const tyre = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16), wheelMat);
    tyre.rotation.z = Math.PI / 2;
    tyre.castShadow = true;
    wg.add(tyre);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.31, 8), rimMat);
    rim.rotation.z = Math.PI / 2;
    wg.add(rim);
    // Spokes
    for (let s = 0; s < 5; s++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.04), rimMat.clone());
      spoke.rotation.z = (s / 5) * Math.PI * 2;
      spoke.position.set(x > 0 ? 0.16 : -0.16, 0, 0);
      wg.add(spoke);
    }
    wg.position.set(x, y, z);
    g.add(wg);
  });

  // Headlights pair
  [-0.65, 0.65].forEach(x => {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.08), headMat);
    hl.position.set(x, 0.7, 2.35);
    g.add(hl);
    // DRL strip
    const drl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    drl.position.set(x, 0.82, 2.35);
    g.add(drl);
  });

  // Taillights
  [-0.65, 0.65].forEach(x => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.07), tailMat);
    tl.position.set(x, 0.7, -2.35);
    g.add(tl);
    // Indicator
    const ind = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.07), new THREE.MeshBasicMaterial({ color: 0xff8800 }));
    ind.position.set(x, 0.55, -2.35);
    g.add(ind);
  });

  // Exhaust pipes
  [-0.5, 0.5].forEach(x => {
    const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8), chromeMat.clone());
    ex.rotation.x = Math.PI / 2;
    ex.position.set(x, 0.28, -2.42);
    g.add(ex);
  });

  return g;
}

// ─── NPC MESH ─────────────────────────────────────────────────────────────────
function createNPCMesh(color: number): THREE.Group {
  const g = new THREE.Group();
  g.scale.set(1.3, 1.3, 1.3);

  const skinMat = new THREE.MeshLambertMaterial({ color: 0xf4a261 });
  const clothMat = new THREE.MeshLambertMaterial({ color });
  const pantsMat = new THREE.MeshLambertMaterial({ color: 0x2a2a3e });
  const hairMat = new THREE.MeshLambertMaterial({ color: 0x1a0f00 });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.26), clothMat);
  torso.position.y = 0.98;
  g.add(torso);

  // Arms
  const lArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 0.18), clothMat.clone());
  lArm.position.set(-0.34, 0.98, 0);
  g.add(lArm);
  const rArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 0.18), clothMat.clone());
  rArm.position.set(0.34, 0.98, 0);
  g.add(rArm);

  // Legs
  const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.2), pantsMat);
  lLeg.position.set(-0.12, 0.4, 0);
  g.add(lLeg);
  const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.55, 0.2), pantsMat.clone());
  rLeg.position.set(0.12, 0.4, 0);
  g.add(rLeg);

  // Shoes
  const shoeMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  const lShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.28), shoeMat);
  lShoe.position.set(-0.12, 0.1, 0.04);
  g.add(lShoe);
  const rShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.28), shoeMat.clone());
  rShoe.position.set(0.12, 0.1, 0.04);
  g.add(rShoe);

  // Head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.4, 0.36), skinMat);
  head.position.y = 1.55;
  g.add(head);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
  [-0.09, 0.09].forEach(x => {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.055, 0.02), eyeMat.clone());
    eye.position.set(x, 1.58, 0.19);
    g.add(eye);
  });

  // Hair
  const hair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.13, 0.38), hairMat);
  hair.position.y = 1.77;
  g.add(hair);

  return g;
}

// ─── CITY BUILDER ─────────────────────────────────────────────────────────────
function buildCity(scene: THREE.Scene) {
  // ── Ground ──────────────────────────────────────────────────────────────────
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x111a24 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── Road grid ────────────────────────────────────────────────────────────────
  const BLOCK = 50; // block spacing
  const ROAD_W = 14;
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x1c2535 });
  const sideWalkMat = new THREE.MeshLambertMaterial({ color: 0x252e3d });
  const lineMatY = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.25, transparent: true });
  const lineMatW = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });

  for (let i = -6; i <= 6; i++) {
    // Horizontal roads
    const hr = new THREE.Mesh(new THREE.PlaneGeometry(800, ROAD_W), roadMat.clone());
    hr.rotation.x = -Math.PI / 2;
    hr.position.set(0, 0.01, i * BLOCK);
    scene.add(hr);

    // Vertical roads
    const vr = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, 800), roadMat.clone());
    vr.rotation.x = -Math.PI / 2;
    vr.position.set(i * BLOCK, 0.01, 0);
    scene.add(vr);

    // Center dashes H
    for (let j = -15; j <= 15; j++) {
      if (j % 2 === 0) {
        const d = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 4.5), lineMatY.clone());
        d.rotation.x = -Math.PI / 2;
        d.position.set(j * 13, 0.02, i * BLOCK);
        scene.add(d);
      }
      // Center dashes V
      if (j % 2 === 0) {
        const dv = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 0.22), lineMatY.clone());
        dv.rotation.x = -Math.PI / 2;
        dv.position.set(i * BLOCK, 0.02, j * 13);
        scene.add(dv);
      }
    }

    // Sidewalks alongside each road
    for (let s = -1; s <= 1; s += 2) {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(800, 3.5), sideWalkMat.clone());
      sw.rotation.x = -Math.PI / 2;
      sw.position.set(0, 0.015, i * BLOCK + s * (ROAD_W / 2 + 1.75));
      scene.add(sw);
      // Curb
      const curb = new THREE.Mesh(new THREE.BoxGeometry(800, 0.08, 0.18), new THREE.MeshLambertMaterial({ color: 0x3a4a5e }));
      curb.position.set(0, 0.04, i * BLOCK + s * (ROAD_W / 2 + 0.09));
      scene.add(curb);
    }
    for (let s = -1; s <= 1; s += 2) {
      const sw = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 800), sideWalkMat.clone());
      sw.rotation.x = -Math.PI / 2;
      sw.position.set(i * BLOCK + s * (ROAD_W / 2 + 1.75), 0.015, 0);
      scene.add(sw);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 800), new THREE.MeshLambertMaterial({ color: 0x3a4a5e }));
      curb.position.set(i * BLOCK + s * (ROAD_W / 2 + 0.09), 0.04, 0);
      scene.add(curb);
    }
  }

  // ── Zebra crossings ─────────────────────────────────────────────────────────
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      for (let s = -1; s <= 1; s += 2) {
        for (let stripe = 0; stripe < 5; stripe++) {
          const z = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.0), lineMatW.clone());
          z.rotation.x = -Math.PI / 2;
          z.position.set(
            i * BLOCK + s * (ROAD_W / 2 - 1) + s * stripe * 0.0,
            0.02,
            j * BLOCK + ROAD_W / 2 + 1 + stripe * 1.2
          );
          scene.add(z);
        }
      }
    }
  }

  // ── Block ground ─────────────────────────────────────────────────────────────
  const blockGroundColors = [0x1a2230, 0x1c2538, 0x16202e];
  for (let bx = -5; bx <= 5; bx++) {
    for (let bz = -5; bz <= 5; bz++) {
      const c = blockGroundColors[Math.abs(bx + bz) % blockGroundColors.length];
      const bg = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), new THREE.MeshLambertMaterial({ color: c }));
      bg.rotation.x = -Math.PI / 2;
      bg.position.set(bx * BLOCK, 0.012, bz * BLOCK);
      scene.add(bg);
    }
  }

  // ── Buildings ────────────────────────────────────────────────────────────────
  const bColors = [
    0x1e3a5f, // deep blue
    0x2a1f4e, // purple
    0x1a3a2a, // dark green
    0x3a1f1f, // dark red
    0x1e2a40, // navy
    0x2d2240, // indigo
    0x1a3550, // steel blue
    0x261a3a, // dark violet
  ];
  const glowColors = [0xffd700, 0xff6600, 0x00aaff, 0xff00aa, 0x00ffaa, 0xffee00];

  for (let bx = -5; bx <= 5; bx++) {
    for (let bz = -5; bz <= 5; bz++) {
      const seed = Math.abs(bx * 7 + bz * 13 + bx * bz);

      if (seed % 8 === 0) {
        // Park
        const parkMat = new THREE.MeshLambertMaterial({ color: 0x0d2210 });
        const park = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), parkMat);
        park.rotation.x = -Math.PI / 2;
        park.position.set(bx * BLOCK, 0.02, bz * BLOCK);
        scene.add(park);

        // Path
        const pathMat = new THREE.MeshLambertMaterial({ color: 0x2a3040 });
        const path = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 28), pathMat);
        path.rotation.x = -Math.PI / 2;
        path.position.set(bx * BLOCK, 0.03, bz * BLOCK);
        scene.add(path);

        // Trees cluster
        for (let t = 0; t < 6; t++) {
          const rng = (seed * (t + 1) * 17) % 100;
          const tx = bx * BLOCK + ((rng % 22) - 11);
          const tz = bz * BLOCK + (((rng * 3) % 22) - 11);
          const trunkH = 2.5 + (rng % 3);
          const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.24, trunkH, 7),
            new THREE.MeshLambertMaterial({ color: 0x5c3d1e })
          );
          trunk.position.set(tx, trunkH / 2, tz);
          trunk.castShadow = true;
          scene.add(trunk);

          const foliageR = 1.8 + (rng % 10) * 0.15;
          const foliage = new THREE.Mesh(
            new THREE.SphereGeometry(foliageR, 7, 5),
            new THREE.MeshLambertMaterial({ color: 0x1a4a18, emissive: 0x041204 })
          );
          foliage.position.set(tx, trunkH + foliageR * 0.8, tz);
          foliage.castShadow = true;
          scene.add(foliage);
        }

        // Bench
        const benchMat = new THREE.MeshLambertMaterial({ color: 0x5c3d1e });
        const bench = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 0.5), benchMat);
        bench.position.set(bx * BLOCK + 4, 0.45, bz * BLOCK + 4);
        scene.add(bench);
        const benchLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.5), benchMat.clone());
        benchLeg1.position.set(bx * BLOCK + 3.4, 0.2, bz * BLOCK + 4);
        scene.add(benchLeg1);
        const benchLeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.5), benchMat.clone());
        benchLeg2.position.set(bx * BLOCK + 4.6, 0.2, bz * BLOCK + 4);
        scene.add(benchLeg2);

        continue;
      }

      // Building placement
      const numB = 1 + (seed % 3);
      for (let b = 0; b < numB; b++) {
        const bw = 7 + (seed % 5) * 2;
        const bd = 7 + (seed % 4) * 2;
        const bh = 8 + (seed % 9) * 4 + Math.abs(bx) * 1.5 + Math.abs(bz) * 1.5;
        const ci = (seed + b * 3) % bColors.length;
        const bldColor = bColors[ci];

        const bldMat = new THREE.MeshLambertMaterial({ color: bldColor, emissive: new THREE.Color(bldColor).multiplyScalar(0.15) });
        const bld = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bldMat);

        const ox = numB > 1 ? (b - (numB - 1) / 2) * (bw + 1.5) : 0;
        bld.position.set(bx * BLOCK + ox, bh / 2, bz * BLOCK);
        bld.castShadow = true;
        bld.receiveShadow = true;
        scene.add(bld);

        // ── Windows ──────────────────────────────────────────────────────────
        const wRows = Math.floor(bh / 2.8);
        const wCols = Math.floor(bw / 2.2);
        const wDepthCols = Math.floor(bd / 2.2);
        const winOnMat = new THREE.MeshBasicMaterial({ color: glowColors[(seed + b) % glowColors.length] });
        const winOffMat = new THREE.MeshBasicMaterial({ color: 0x0a1828 });

        // Front windows
        for (let wr = 0; wr < wRows; wr++) {
          for (let wc = 0; wc < wCols; wc++) {
            const on = ((seed + wr * 7 + wc * 3) % 4) !== 0;
            const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), on ? winOnMat : winOffMat.clone());
            win.position.set(
              bx * BLOCK + ox - bw / 2 + 1.2 + wc * 2.1,
              1.8 + wr * 2.8,
              bz * BLOCK + bd / 2 + 0.01
            );
            scene.add(win);
          }
        }
        // Side windows
        for (let wr = 0; wr < wRows; wr++) {
          for (let wc = 0; wc < wDepthCols; wc++) {
            const on = ((seed + wr * 5 + wc * 11) % 3) !== 0;
            const win = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), on ? winOnMat.clone() : winOffMat.clone());
            win.position.set(
              bx * BLOCK + ox + bw / 2 + 0.01,
              1.8 + wr * 2.8,
              bz * BLOCK - bd / 2 + 1.2 + wc * 2.1
            );
            win.rotation.y = Math.PI / 2;
            scene.add(win);
          }
        }

        // ── Rooftop ───────────────────────────────────────────────────────────
        // HVAC unit
        const hvac = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.3, 0.8, bd * 0.3), new THREE.MeshLambertMaterial({ color: 0x3a4a5e }));
        hvac.position.set(bx * BLOCK + ox - bw * 0.15, bh + 0.4, bz * BLOCK - bd * 0.1);
        scene.add(hvac);

        // Antenna
        if ((seed + b) % 3 === 0) {
          const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 3.5 + (seed % 3), 5), new THREE.MeshLambertMaterial({ color: 0x888888 }));
          ant.position.set(bx * BLOCK + ox, bh + 1.75, bz * BLOCK);
          scene.add(ant);
          // Blink light
          const bl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff2200 }));
          bl.position.set(bx * BLOCK + ox, bh + 3.6, bz * BLOCK);
          scene.add(bl);
        }

        // Neon sign on tall buildings
        if (bh > 25 && (seed % 3) === 0) {
          const neonColor = glowColors[seed % glowColors.length];
          const neonMat = new THREE.MeshBasicMaterial({ color: neonColor });
          const neonSign = new THREE.Mesh(new THREE.PlaneGeometry(bw * 0.7, 1.5), neonMat);
          neonSign.position.set(bx * BLOCK + ox, bh - 2, bz * BLOCK + bd / 2 + 0.08);
          scene.add(neonSign);
          // Glow box
          const glowBox = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.72, 1.55, 0.25), new THREE.MeshBasicMaterial({ color: neonColor, transparent: true, opacity: 0.18 }));
          glowBox.position.copy(neonSign.position);
          scene.add(glowBox);
          // Point light for neon glow
          const neonPL = new THREE.PointLight(neonColor, 1.2, 22);
          neonPL.position.set(bx * BLOCK + ox, bh - 2, bz * BLOCK + bd / 2 + 3);
          scene.add(neonPL);
        }

        // Ground floor accent (shop front)
        const shopMat = new THREE.MeshLambertMaterial({ color: 0x0a1422 });
        const shop = new THREE.Mesh(new THREE.BoxGeometry(bw, 2.5, 0.08), shopMat);
        shop.position.set(bx * BLOCK + ox, 1.25, bz * BLOCK + bd / 2 + 0.04);
        scene.add(shop);

        // Shop window
        const shopWin = new THREE.Mesh(new THREE.PlaneGeometry(bw * 0.6, 1.6), new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3 }));
        shopWin.position.set(bx * BLOCK + ox, 1.3, bz * BLOCK + bd / 2 + 0.09);
        scene.add(shopWin);
      }

      // ── Street lamps ─────────────────────────────────────────────────────────
      if ((bx + bz) % 2 === 0) {
        const offsets: [number, number][] = [[18, 18], [-18, -18]];
        offsets.forEach(([ox, oz]) => {
          const poleMat = new THREE.MeshLambertMaterial({ color: 0x555566 });
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 6.5, 7), poleMat);
          pole.position.set(bx * BLOCK + ox, 3.25, bz * BLOCK + oz);
          pole.castShadow = true;
          scene.add(pole);

          // Arm
          const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), poleMat.clone());
          arm.position.set(bx * BLOCK + ox + 0.6, 6.4, bz * BLOCK + oz);
          scene.add(arm);

          // Lamp head
          const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.55), new THREE.MeshBasicMaterial({ color: 0xfffacc }));
          lamp.position.set(bx * BLOCK + ox + 1.2, 6.3, bz * BLOCK + oz);
          scene.add(lamp);

          const pl = new THREE.PointLight(0xffeeaa, 1.1, 18);
          pl.position.set(bx * BLOCK + ox + 1.2, 6.1, bz * BLOCK + oz);
          scene.add(pl);
        });
      }
    }
  }

  // ── Port / Water ──────────────────────────────────────────────────────────────
  const waterMat = new THREE.MeshLambertMaterial({ color: 0x071420, transparent: true, opacity: 0.88 });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(130, 100), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(200, 0.03, 200);
  scene.add(water);

  // Water shimmer lines
  for (let w = 0; w < 12; w++) {
    const wl = new THREE.Mesh(new THREE.PlaneGeometry(120, 0.3), new THREE.MeshBasicMaterial({ color: 0x1166aa, transparent: true, opacity: 0.22 }));
    wl.rotation.x = -Math.PI / 2;
    wl.position.set(200, 0.04 + w * 0.001, 155 + w * 8);
    scene.add(wl);
  }

  // Dock
  const dockMat = new THREE.MeshLambertMaterial({ color: 0x2a1f14 });
  const dock = new THREE.Mesh(new THREE.BoxGeometry(40, 0.5, 8), dockMat);
  dock.position.set(175, 0.25, 155);
  scene.add(dock);
  // Dock posts
  for (let dp = 0; dp < 6; dp++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.5, 6), dockMat.clone());
    post.position.set(158 + dp * 6, 1.25, 155);
    scene.add(post);
  }

  // Highway
  const hwMat = new THREE.MeshLambertMaterial({ color: 0x1a2540 });
  const hw = new THREE.Mesh(new THREE.BoxGeometry(800, 0.7, 12), hwMat);
  hw.position.set(0, 4, -290);
  scene.add(hw);
  // Highway pillars
  for (let p = -8; p <= 8; p++) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 4, 1.2), new THREE.MeshLambertMaterial({ color: 0x2a3550 }));
    pillar.position.set(p * 50, 2, -290);
    scene.add(pillar);
  }
}

// ─── MAIN ENGINE ─────────────────────────────────────────────────────────────
export class FreeCityEngine {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private player!: PlayerGroup;
  private vehicles: Array<{ mesh: THREE.Group; config: typeof VEHICLE_CONFIGS[0]; occupied: boolean }> = [];
  private npcs: Array<{ mesh: THREE.Group; config: typeof NPC_CONFIGS[0] }> = [];

  private keys: Record<string, boolean> = {};
  private playerRotation = 0;
  private camDistance = 10;
  private camAngleH = 0;
  // Third-person angle ~30° above horizon (not top-down)
  private camAngleV = 0.5;
  private mouse = { x: 0, y: 0, down: false };
  private clock = new THREE.Clock();
  private animTime = 0;
  private inVehicle = false;
  private currentVehicleIdx = -1;
  private neonLights: THREE.PointLight[] = [];
  private neonTime = 0;

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
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06101e);
    this.scene.fog = new THREE.FogExp2(0x060d1a, 0.007);

    // Camera — perspective from behind player, slightly elevated
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 600);
    // Position will be set in loop

    // ── Lighting ──────────────────────────────────────────────────────────────
    // Ambient — brighter so city is visible
    const ambient = new THREE.AmbientLight(0x223355, 3.5);
    this.scene.add(ambient);

    // Hemisphere — sky vs ground
    const hemi = new THREE.HemisphereLight(0x334466, 0x0a1020, 1.8);
    this.scene.add(hemi);

    // Moon directional
    const moon = new THREE.DirectionalLight(0x4466aa, 1.5);
    moon.position.set(-60, 120, -40);
    moon.castShadow = true;
    moon.shadow.mapSize.set(2048, 2048);
    moon.shadow.camera.near = 1;
    moon.shadow.camera.far = 500;
    moon.shadow.camera.left = -200;
    moon.shadow.camera.right = 200;
    moon.shadow.camera.top = 200;
    moon.shadow.camera.bottom = -200;
    this.scene.add(moon);

    // Strong neon accent lights around player spawn
    const neonConfigs = [
      { color: 0xff6600, x: 30, y: 18, z: -20, intensity: 2.2, range: 70 },
      { color: 0x0088ff, x: -40, y: 15, z: 30, intensity: 1.8, range: 60 },
      { color: 0xff0055, x: 80, y: 12, z: -40, intensity: 1.5, range: 55 },
      { color: 0x00ffaa, x: -80, y: 14, z: -60, intensity: 1.4, range: 50 },
      { color: 0xaa00ff, x: 60, y: 16, z: 60, intensity: 1.6, range: 58 },
    ];
    neonConfigs.forEach(nc => {
      const pl = new THREE.PointLight(nc.color, nc.intensity, nc.range);
      pl.position.set(nc.x, nc.y, nc.z);
      this.scene.add(pl);
      this.neonLights.push(pl);
    });

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const sv: number[] = [];
    for (let i = 0; i < 3000; i++) {
      sv.push((Math.random() - 0.5) * 900, Math.random() * 220 + 40, (Math.random() - 0.5) * 900);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3));
    this.scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.22, transparent: true, opacity: 0.75 })));

    // Moon disc
    const moonDisc = new THREE.Mesh(new THREE.CircleGeometry(8, 16), new THREE.MeshBasicMaterial({ color: 0xeeeedd }));
    moonDisc.position.set(-120, 180, -300);
    moonDisc.rotation.y = 0.3;
    this.scene.add(moonDisc);

    // Build city
    buildCity(this.scene);

    // Player
    this.player = createPlayerMesh();
    this.player.position.set(0, 0, 0);
    this.player.castShadow = true;
    this.scene.add(this.player);

    // Player spotlight
    const playerSpot = new THREE.PointLight(0xffffff, 1.0, 12);
    playerSpot.position.set(0, 3, 0);
    this.player.add(playerSpot);

    // Vehicles
    VEHICLE_CONFIGS.forEach(cfg => {
      const mesh = createVehicleMesh(cfg.color);
      mesh.position.set(cfg.x, 0, cfg.z);
      this.scene.add(mesh);
      this.vehicles.push({ mesh, config: cfg, occupied: false });
    });

    // NPCs + labels
    NPC_CONFIGS.forEach(cfg => {
      const colorHex = parseInt(cfg.color.replace('#', ''), 16);
      const mesh = createNPCMesh(colorHex);
      mesh.position.set(cfg.x, 0, cfg.z);
      this.scene.add(mesh);
      this.npcs.push({ mesh, config: cfg });

      // Floating label
      const cvs = document.createElement('canvas');
      cvs.width = 280; cvs.height = 72;
      const ctx = cvs.getContext('2d')!;
      ctx.clearRect(0, 0, 280, 72);
      ctx.fillStyle = cfg.color;
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cfg.name, 140, 28);
      ctx.fillStyle = 'rgba(255,220,120,0.7)';
      ctx.font = '17px sans-serif';
      ctx.fillText(cfg.role, 140, 52);
      const tex = new THREE.CanvasTexture(cvs);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
      sprite.scale.set(4.5, 1.2, 1);
      sprite.position.set(cfg.x, 4.5, cfg.z);
      this.scene.add(sprite);
    });

    this.setupInput();
    this.loop();
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
        this.camAngleH -= e.movementX * 0.005;
        this.camAngleV = Math.max(0.12, Math.min(1.2, this.camAngleV - e.movementY * 0.004));
      }
    });
    window.addEventListener('wheel', (e) => {
      this.camDistance = Math.max(3, Math.min(24, this.camDistance + e.deltaY * 0.012));
    });
    window.addEventListener('contextmenu', e => e.preventDefault());
  }

  private tryInteract() {
    if (this.inVehicle) {
      this.inVehicle = false;
      const v = this.vehicles[this.currentVehicleIdx];
      v.occupied = false;
      this.player.visible = true;
      this.player.position.copy(v.mesh.position).add(new THREE.Vector3(2.8, 0, 0));
      this.currentVehicleIdx = -1;
      this.updateState({ inVehicle: false, vehicleName: "", speed: 0 });
      this.emit({ type: "notification", text: "🚪 Вышел из машины", kind: "info" });
      this.addLog("🚗 Пешком");
      return;
    }
    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      if (this.player.position.distanceTo(v.mesh.position) < 5.5 && !v.occupied) {
        v.occupied = true;
        this.inVehicle = true;
        this.currentVehicleIdx = i;
        this.player.visible = false;
        this.updateState({ inVehicle: true, vehicleName: v.config.name });
        this.emit({ type: "notification", text: `🚗 ${v.config.emoji} ${v.config.name}`, kind: "info" });
        this.addLog(`🚗 ${v.config.name}`);
        return;
      }
    }
    for (const npc of this.npcs) {
      if (this.player.position.distanceTo(npc.mesh.position) < 5) {
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
      this.emit({ type: "notification", text: `🎯 ${dmg} урона нанесено`, kind: "info" });
      this.updateState({ playerXP: Math.min(100000, this.state.playerXP + 50) });
    }
  }

  heal() {
    const prev = this.state.health;
    const next = Math.min(100, prev + 25);
    this.updateState({ health: next, money: Math.max(0, this.state.money - 120) });
    this.emit({ type: "notification", text: `💊 HP: ${prev} → ${next}`, kind: "heal" });
    this.addLog(`💊 +${next - prev} HP`);
  }

  addMoney(amount: number) {
    this.updateState({ money: this.state.money + amount });
    this.emit({ type: "notification", text: amount > 0 ? `💰 +$${amount}` : `💸 -$${Math.abs(amount)}`, kind: amount > 0 ? "money" : "danger" });
    this.addLog(`💰 ${amount > 0 ? '+' : ''}$${amount}`);
  }

  triggerFight() {
    this.shoot();
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.animTime += dt;
    this.neonTime += dt;

    // Animate neon lights
    this.neonLights.forEach((l, i) => {
      l.intensity = 1.4 + Math.sin(this.neonTime * (1.1 + i * 0.3)) * 0.5;
    });

    this.updateMovement(dt);
    this.updateCamera();
    this.updateProximity();
    this.renderer.render(this.scene, this.camera);
  };

  private updateMovement(dt: number) {
    const SPEED = this.inVehicle ? this.vehicles[this.currentVehicleIdx].config.speed : 8;
    const TURN = 2.2;

    const fwd = this.keys['KeyW'] || this.keys['ArrowUp'];
    const bwd = this.keys['KeyS'] || this.keys['ArrowDown'];
    const left = this.keys['KeyA'] || this.keys['ArrowLeft'];
    const right = this.keys['KeyD'] || this.keys['ArrowRight'];

    const moving = fwd || bwd;

    if (left) this.playerRotation += TURN * dt;
    if (right) this.playerRotation -= TURN * dt;

    const obj = this.inVehicle ? this.vehicles[this.currentVehicleIdx].mesh : this.player;
    obj.rotation.y = this.playerRotation;

    if (moving) {
      const dir = fwd ? 1 : -1;
      const moveX = Math.sin(this.playerRotation) * SPEED * dir * dt;
      const moveZ = Math.cos(this.playerRotation) * SPEED * dir * dt;

      // Clamp to city bounds
      const nx = obj.position.x + moveX;
      const nz = obj.position.z + moveZ;
      if (Math.abs(nx) < 290) obj.position.x = nx;
      if (Math.abs(nz) < 290) obj.position.z = nz;

      // Walk animation
      if (!this.inVehicle) {
        const swing = Math.sin(this.animTime * 8) * 0.45;
        this.player._leftLeg.rotation.x = swing;
        this.player._rightLeg.rotation.x = -swing;
        this.player._leftArm.rotation.x = -swing * 0.6;
        this.player._rightArm.rotation.x = swing * 0.6;
      }

      if (this.inVehicle) {
        const speedKmh = Math.round(SPEED * Math.abs(dir) * 12);
        this.updateState({ speed: speedKmh });
        // Rotate wheels
        const v = this.vehicles[this.currentVehicleIdx];
        v.mesh.children.forEach(child => {
          if (child instanceof THREE.Group) {
            child.children.forEach(c => { if (c instanceof THREE.Mesh && (c.geometry as THREE.CylinderGeometry).parameters?.radiusTop > 0.3) { c.rotation.x += dir * SPEED * dt * 0.8; } });
          }
        });
      }
    } else {
      if (!this.inVehicle) {
        this.player._leftLeg.rotation.x *= 0.85;
        this.player._rightLeg.rotation.x *= 0.85;
        this.player._leftArm.rotation.x *= 0.85;
        this.player._rightArm.rotation.x *= 0.85;
      }
      if (this.inVehicle) this.updateState({ speed: 0 });
    }

    // Sync player to vehicle
    if (this.inVehicle) {
      const vm = this.vehicles[this.currentVehicleIdx].mesh;
      this.player.position.copy(vm.position);
    }

    // Update district
    const pos = obj.position;
    for (const zone of DISTRICT_ZONES) {
      const d = Math.sqrt((pos.x - zone.cx) ** 2 + (pos.z - zone.cz) ** 2);
      if (d < zone.r) {
        if (this.state.district !== zone.name) this.updateState({ district: zone.name });
        break;
      }
    }
  }

  private updateCamera() {
    const target = this.inVehicle
      ? this.vehicles[this.currentVehicleIdx].mesh.position
      : this.player.position;

    // Third-person camera positioned behind player
    const h = this.camAngleH + this.playerRotation;
    const camX = target.x - Math.sin(h) * this.camDistance * Math.cos(this.camAngleV);
    const camY = target.y + this.camDistance * Math.sin(this.camAngleV) + 2.0;
    const camZ = target.z - Math.cos(h) * this.camDistance * Math.cos(this.camAngleV);

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(target.x, target.y + 1.2, target.z);
  }

  private updateProximity() {
    if (this.inVehicle) {
      this.updateState({ nearVehicle: false, nearNPC: false, npcName: "" });
      return;
    }
    let nearV = false, nearN = false, npcName = "";
    for (const v of this.vehicles) {
      if (!v.occupied && this.player.position.distanceTo(v.mesh.position) < 5.5) { nearV = true; break; }
    }
    for (const n of this.npcs) {
      if (this.player.position.distanceTo(n.mesh.position) < 5) { nearN = true; npcName = n.config.name; break; }
    }
    if (nearV !== this.state.nearVehicle || nearN !== this.state.nearNPC || npcName !== this.state.npcName) {
      this.updateState({ nearVehicle: nearV, nearNPC: nearN, npcName });
    }
  }

  private updateState(partial: Partial<GameState>) {
    this.state = { ...this.state, ...partial };
    this.emit({ type: "stateUpdate", state: partial });
  }

  private emit(e: GameEvent) {
    this.eventCallback?.(e);
  }

  private addLog(line: string) {
    this.emit({ type: "logAdd", line });
  }

  getState(): GameState {
    return { ...this.state };
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