import * as THREE from 'three';
import { Question } from '../types/game';
import {
  createOptionDoorTexture,
  createTextTexture,
  createPlatformTexture,
  createHazardStripeTexture,
  createSecurityFacilityTexture,
  createLaserBarrierTexture,
  createConstructionSteelTexture,
  createDiamondPlateTexture,
  createConveyorBeltTexture,
  createLavaTexture,
  createCrackedObsidianTexture,
  createSurvivalTileTexture
} from './textures';
import { soundManager } from '../audio/soundManager';

export interface GroundCollider {
  box: THREE.Box3;
  mesh?: THREE.Mesh;
}

export interface TriggerZone {
  type: 'GATE' | 'FLOOR' | 'SWITCH' | 'CHECKPOINT' | 'FINISH';
  box: THREE.Box3;
  spCode: 'SP 4.4.1' | 'SP 4.4.2' | 'SP 4.4.3' | 'SP 4.4.4' | 'NONE';
  questionGlobalIndex: number; // 0..15 (-1 for checkpoints/finish)
  optionIndex: number; // 0 (A), 1 (B), 2 (C)
  label: string;
}

export interface RollingFireball {
  group: THREE.Group;
  initialPos: THREE.Vector3;
  speed: number;
  minX: number;
  maxX: number;
  direction: number; // 1 or -1
  radius: number;
  box: THREE.Box3;
  station: 'SP 4.4.2';
}

export interface RotatingLaserBar {
  mesh: THREE.Mesh;
  box: THREE.Box3;
}

export interface RotatingLaser {
  group: THREE.Group;
  centerPos: THREE.Vector3;
  speed: number;
  height: number;
  length: number;
  station: 'SP 4.4.3';
}

export interface FallingHazardBlock {
  mesh: THREE.Mesh;
  initialY: number;
  targetY: number;
  state: 'HANGING' | 'FALLING' | 'WAITING' | 'RISING';
  timer: number;
  speed: number;
  box: THREE.Box3;
  station: 'SP 4.4.4';
}

export interface TemporaryTile {
  mesh: THREE.Mesh;
  collider: GroundCollider;
  steppedOn: boolean;
  stepTimer: number;
  initialPos: THREE.Vector3;
  isFallen: boolean;
  fallSpeed: number;
  station: 'SP 4.4.1' | 'SP 4.4.4';
  originalColor?: number;
  maxTime?: number;
}

export interface MovingPlatformData {
  mesh: THREE.Mesh;
  initialY: number;
  initialX: number;
  initialZ?: number;
  minZ?: number;
  maxZ?: number;
  axis: 'x' | 'y' | 'z_forward';
  speed: number;
  amplitude: number;
  offset: number;
  collider: GroundCollider;
  trigger?: TriggerZone;
}

export interface FallingTileData {
  mesh: THREE.Mesh;
  initialY: number;
  isFalling: boolean;
  fallSpeed: number;
  collider: GroundCollider;
  qIndex: number;
  optIndex: number;
}

export interface Station4TileRef {
  qIndex: number; // 12..15
  optIndex: number; // 0, 1, 2
  letter: 'A' | 'B' | 'C';
  tileMesh: THREE.Mesh;
  topDecalMesh: THREE.Mesh;
  billboardMesh: THREE.Mesh;
  baseMat: THREE.MeshStandardMaterial;
  topMat: THREE.MeshBasicMaterial;
  bbMat: THREE.MeshBasicMaterial;
}

export interface Station4Barrier {
  qIndex: number;
  mesh: THREE.Mesh;
  collider: GroundCollider;
  archGroup: THREE.Group;
  signMesh?: THREE.Mesh;
  isUnlocked: boolean;
}

export class WorldManager {
  public scene: THREE.Scene;
  public groundColliders: GroundCollider[] = [];
  public triggerZones: TriggerZone[] = [];
  public movingPlatforms: MovingPlatformData[] = [];
  public fallingTiles: FallingTileData[] = [];
  public station4Tiles: Station4TileRef[] = [];
  public station4Barriers: Station4Barrier[] = [];
  public fireballs: RollingFireball[] = [];
  public rotatingLasers: RotatingLaser[] = [];
  public fallingBlocks: FallingHazardBlock[] = [];
  public temporaryTiles: TemporaryTile[] = [];
  public signs: { [key: string]: { mesh: THREE.Mesh; badge: string; qIndex: number; optIndex: number } } = {};
  public trophyMesh: THREE.Group | null = null;
  public confettiParticles: THREE.Points | null = null;
  public lavaMesh: THREE.Mesh | null = null;
  public emberParticles: THREE.Points | null = null;
  public questionCheckpoints: THREE.Vector3[] = [];
  public spCheckpoints: { [key: string]: THREE.Vector3 } = {};

  // Animated environmental elements
  private warningBeacons: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildEnvironment();
    this.buildWorldGeometry();
  }

  private buildEnvironment() {
    this.scene.background = new THREE.Color(0x38BDF8);
    this.scene.fog = new THREE.Fog(0x38BDF8, 80, 500);

    // Warm Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xFFFBEB, 1.4);
    sunLight.position.set(50, 75, -20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 900;
    const d = 75;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xBAE6FD, 0xFEF08A, 0.75);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.45);
    this.scene.add(ambientLight);

    this.createClouds();
    this.createDistantScenery();
  }

  private createClouds() {
    const cloudGeo = new THREE.DodecahedronGeometry(5, 1);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.9,
      transparent: true,
      opacity: 0.9
    });

    for (let i = 0; i < 35; i++) {
      const cloudGroup = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);
      for (let p = 0; p < numPuffs; p++) {
        const puff = new THREE.Mesh(cloudGeo, cloudMat);
        puff.position.set(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 8
        );
        const scale = 0.8 + Math.random() * 0.7;
        puff.scale.set(scale, scale * 0.65, scale);
        cloudGroup.add(puff);
      }

      cloudGroup.position.set(
        (Math.random() - 0.5) * 260,
        28 + Math.random() * 25,
        -30 + i * 26 + (Math.random() - 0.5) * 15
      );
      this.scene.add(cloudGroup);
    }
  }

  private createDistantScenery() {
    const islandMat = new THREE.MeshStandardMaterial({ color: 0x86EFAC, roughness: 0.85 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.95 });

    for (let i = 0; i < 18; i++) {
      const island = new THREE.Group();
      const side = (i % 2 === 0 ? 1 : -1) * (50 + Math.random() * 30);
      const zPos = i * 48;

      const topGeo = new THREE.CylinderGeometry(8, 12, 4, 7);
      const topMesh = new THREE.Mesh(topGeo, islandMat);
      island.add(topMesh);

      const bottomGeo = new THREE.ConeGeometry(12, 16, 7);
      const bottomMesh = new THREE.Mesh(bottomGeo, rockMat);
      bottomMesh.rotation.x = Math.PI;
      bottomMesh.position.y = -8;
      island.add(bottomMesh);

      island.position.set(side, -15 + Math.random() * 10, zPos);
      this.scene.add(island);
    }
  }

  public addGroundCollider(mesh: THREE.Mesh): GroundCollider {
    mesh.updateMatrixWorld(true);
    let box: THREE.Box3;
    if (mesh.geometry instanceof THREE.BoxGeometry) {
      const params = mesh.geometry.parameters;
      const hw = params.width / 2;
      const hh = params.height / 2;
      const hd = params.depth / 2;
      box = new THREE.Box3(
        new THREE.Vector3(mesh.position.x - hw, mesh.position.y - hh, mesh.position.z - hd),
        new THREE.Vector3(mesh.position.x + hw, mesh.position.y + hh, mesh.position.z + hd)
      );
    } else {
      box = new THREE.Box3().setFromObject(mesh);
    }
    const collider: GroundCollider = { box, mesh };
    this.groundColliders.push(collider);
    return collider;
  }

  private buildWorldGeometry() {
    const startTex = createPlatformTexture('#3B82F6', '#1D4ED8');
    const goldTex = createPlatformTexture('#F59E0B', '#D97706');
    const hazardTex = createHazardStripeTexture();
    // Consistent Left-to-Right layout: A (Screen Left: +5.2), B (Screen Center: 0), C (Screen Right: -5.2)
    const xOffsets = [5.2, 0, -5.2];
    const badges = ['A', 'B', 'C'];

    // =========================================================================
    // 0. STARTING HUB (Z = -20 to 18)
    // =========================================================================
    const spawnHub = new THREE.Mesh(
      new THREE.BoxGeometry(22, 2.5, 30),
      new THREE.MeshStandardMaterial({ map: startTex, roughness: 0.5 })
    );
    spawnHub.position.set(0, -1.25, -6);
    this.scene.add(spawnHub);
    this.addGroundCollider(spawnHub);
    this.createSideFences(-21, 30, 22);

    this.createSpawnCircle(new THREE.Vector3(0, 0, -12), 0x38BDF8);
    this.createFlagPole(new THREE.Vector3(-8, 0, -12), 'START', 0x38BDF8);
    this.createGrandEntranceArch(new THREE.Vector3(0, 0, 0), 'PINTU MULA');

    const startGateTriggerBox = new THREE.Box3(
      new THREE.Vector3(-6, 0, -1.0),
      new THREE.Vector3(6, 6, 2.0)
    );
    this.triggerZones.push({
      type: 'CHECKPOINT',
      box: startGateTriggerBox,
      spCode: 'NONE',
      questionGlobalIndex: -1,
      optionIndex: -1,
      label: 'START_GATE'
    });

    const runWay1 = new THREE.Mesh(
      new THREE.BoxGeometry(18, 2.5, 18),
      new THREE.MeshStandardMaterial({ map: startTex, roughness: 0.5 })
    );
    runWay1.position.set(0, -1.25, 12);
    this.scene.add(runWay1);
    this.addGroundCollider(runWay1);
    this.createSideFences(3, 18, 18);

    // Starting Checkpoint for Station 1 (Soalan 1)
    this.spCheckpoints['SP 4.4.1'] = new THREE.Vector3(0, 1.2, 6);

    // =========================================================================
    // 1. STATION 1: TILE JUMP CHALLENGE (SP 4.4.1) — Soalan 1 hingga 4
    // Precision-jumping obstacle course: floating tiles of varied sizes, heights,
    // horizontal moving tiles, and crumbling tiles.
    // =========================================================================
    const sp1TileTex = createPlatformTexture('#10B981', '#059669');
    let currentZ = 26;

    for (let q = 0; q < 4; q++) {
      const qIndex = q;
      const stageStartZ = currentZ;
      this.questionCheckpoints[qIndex] = new THREE.Vector3(0, 1.2, stageStartZ + 2);

      // Launch Platform
      const launchPlatform = new THREE.Mesh(
        new THREE.BoxGeometry(16, 2.5, 8),
        new THREE.MeshStandardMaterial({ map: sp1TileTex, roughness: 0.5 })
      );
      launchPlatform.position.set(0, -1.25, stageStartZ + 4);
      this.scene.add(launchPlatform);
      this.addGroundCollider(launchPlatform);

      // STATIC JUMPING TILES SECTION:
      // All tiles are completely stationary (no horizontal, vertical, rotation, or crumbling movement).
      // Straightforward, clear path with large tiles and comfortable short jumping distances.

      // Tile 1: First static jumping tile
      const t1Geo = new THREE.BoxGeometry(5.6, 1.4, 4.6);
      const t1Mesh = new THREE.Mesh(
        t1Geo,
        new THREE.MeshStandardMaterial({ color: 0x10B981, roughness: 0.4 })
      );
      t1Mesh.position.set(0, -0.6, stageStartZ + 12.5);
      this.scene.add(t1Mesh);
      this.addGroundCollider(t1Mesh);

      // Tile 2: Second static jumping tile
      const t2Geo = new THREE.BoxGeometry(5.6, 1.4, 4.6);
      const t2Mesh = new THREE.Mesh(
        t2Geo,
        new THREE.MeshStandardMaterial({ color: 0x34D399, roughness: 0.4 })
      );
      t2Mesh.position.set(0, -0.6, stageStartZ + 18.5);
      this.scene.add(t2Mesh);
      this.addGroundCollider(t2Mesh);

      // Tile 3: Third static jumping tile directly leading to answer platforms
      const t3Geo = new THREE.BoxGeometry(5.6, 1.4, 4.6);
      const t3Mesh = new THREE.Mesh(
        t3Geo,
        new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 })
      );
      t3Mesh.position.set(0, -0.6, stageStartZ + 24.5);
      this.scene.add(t3Mesh);
      this.addGroundCollider(t3Mesh);

      // Answer Platforms / Gateways
      const gateZ = stageStartZ + 31;
      for (let opt = 0; opt < 3; opt++) {
        const xPos = xOffsets[opt];
        const badge = badges[opt];

        const platMesh = new THREE.Mesh(
          new THREE.BoxGeometry(4.6, 2.2, 7.5),
          new THREE.MeshStandardMaterial({ map: sp1TileTex, roughness: 0.5 })
        );
        platMesh.position.set(xPos, -1.1, gateZ);
        this.scene.add(platMesh);
        this.addGroundCollider(platMesh);

        this.createPlatformSign(new THREE.Vector3(xPos, 0, gateZ + 2.8), badge, qIndex, opt);

        const triggerBox = new THREE.Box3(
          new THREE.Vector3(xPos - 2.1, -0.2, gateZ - 2.0),
          new THREE.Vector3(xPos + 2.1, 2.5, gateZ + 2.5)
        );
        this.triggerZones.push({
          type: 'FLOOR',
          box: triggerBox,
          spCode: 'SP 4.4.1',
          questionGlobalIndex: qIndex,
          optionIndex: opt,
          label: `SP 4.4.1 Soalan ${qIndex + 1} Tile Jump ${badge}`
        });
      }

      // Connecting Landing Island
      const landingIsland = new THREE.Mesh(
        new THREE.BoxGeometry(16, 2.5, 10),
        new THREE.MeshStandardMaterial({ map: sp1TileTex, roughness: 0.5 })
      );
      landingIsland.position.set(0, -1.25, gateZ + 10);
      this.scene.add(landingIsland);
      this.addGroundCollider(landingIsland);

      currentZ = gateZ + 16;
    }

    // Direct solid bridge connecting Station 1 to Station 2 Start Island
    const bridge1to2 = new THREE.Mesh(
      new THREE.BoxGeometry(16, 2.5, 20),
      new THREE.MeshStandardMaterial({ map: hazardTex, roughness: 0.6 })
    );
    bridge1to2.position.set(0, -1.25, currentZ + 10);
    this.scene.add(bridge1to2);
    this.addGroundCollider(bridge1to2);
    this.createSideFences(currentZ, 20, 16);
    currentZ += 20;

    // =========================================================================
    // 2. STATION 2: FIREBALL ESCAPE (SP 4.4.2) — Soalan 5 hingga 8
    // Focus: DODGING rolling fireballs, using safe alcoves/bays, narrow passages!
    // =========================================================================
    const constrSteelTex = createConstructionSteelTexture();

    const sp2StartIsland = new THREE.Mesh(
      new THREE.BoxGeometry(22, 2.5, 24),
      new THREE.MeshStandardMaterial({ map: constrSteelTex, roughness: 0.5 })
    );
    sp2StartIsland.position.set(0, -1.25, currentZ + 12);
    this.scene.add(sp2StartIsland);
    this.addGroundCollider(sp2StartIsland);
    this.createSideFences(currentZ, 24, 22);

    this.createSpawnCircle(new THREE.Vector3(0, 0, currentZ + 8), 0x0EA5E9);
    this.createFlagPole(new THREE.Vector3(-7, 0, currentZ + 8), 'PUSINGAN 2', 0x0EA5E9);
    this.createArchway(new THREE.Vector3(0, 0, currentZ + 18), 'PUSINGAN 2: FIREBALL ESCAPE', 0x0284C7);

    // Exact SP 2 Starting Point
    this.spCheckpoints['SP 4.4.2'] = new THREE.Vector3(0, 1.2, currentZ + 8);

    const sp2TriggerBox = new THREE.Box3(
      new THREE.Vector3(-10, 0, currentZ + 2),
      new THREE.Vector3(10, 6, currentZ + 20)
    );
    this.triggerZones.push({
      type: 'CHECKPOINT',
      box: sp2TriggerBox,
      spCode: 'SP 4.4.2',
      questionGlobalIndex: -1,
      optionIndex: -1,
      label: 'SP_START_SP 4.4.2'
    });

    currentZ += 24;

    for (let q = 0; q < 4; q++) {
      const qIndex = 4 + q; // 4..7
      this.questionCheckpoints[qIndex] = new THREE.Vector3(0, 1.2, currentZ);

      // Fireball Gauntlet Corridor (wide floor with side safety bays)
      const corridorLength = 26;
      const corridorFloor = new THREE.Mesh(
        new THREE.BoxGeometry(16, 2.5, corridorLength),
        new THREE.MeshStandardMaterial({ map: constrSteelTex, roughness: 0.6 })
      );
      corridorFloor.position.set(0, -1.25, currentZ + corridorLength / 2);
      this.scene.add(corridorFloor);
      this.addGroundCollider(corridorFloor);

      // Safe alcoves / bays on sides (Green marked safety zones where fireballs never go!)
      this.createSafeAlcove(new THREE.Vector3(-8.5, 0, currentZ + 8), 1);
      this.createSafeAlcove(new THREE.Vector3(8.5, 0, currentZ + 16), -1);

      // Side walls to contain fireballs
      this.createSideWalls(currentZ, corridorLength, 16);

      // ROLLING FIREBALLS:
      // Fireball 1 (moving across X)
      this.createRollingFireball(
        new THREE.Vector3(-5.5, 1.2, currentZ + 8),
        -6.0,
        6.0,
        3.8 + q * 0.4
      );

      // Fireball 2 (moving across X with opposite phase)
      this.createRollingFireball(
        new THREE.Vector3(5.5, 1.2, currentZ + 17),
        -6.0,
        6.0,
        -(4.2 + q * 0.4)
      );

      // Question Answer Platforms at end of fireball corridor
      const platZ = currentZ + corridorLength + 6;
      for (let opt = 0; opt < 3; opt++) {
        const xPos = xOffsets[opt];
        const badge = badges[opt];

        const platMesh = new THREE.Mesh(
          new THREE.BoxGeometry(4.8, 2.2, 8.5),
          new THREE.MeshStandardMaterial({ map: hazardTex, roughness: 0.5 })
        );
        platMesh.position.set(xPos, -1.1, platZ);
        this.scene.add(platMesh);
        this.addGroundCollider(platMesh);

        this.createPlatformSign(new THREE.Vector3(xPos, 0, platZ + 3.2), badge, qIndex, opt);

        const triggerBox = new THREE.Box3(
          new THREE.Vector3(xPos - 2.0, -0.2, platZ - 2.0),
          new THREE.Vector3(xPos + 2.0, 2.2, platZ + 2.8)
        );
        this.triggerZones.push({
          type: 'FLOOR',
          box: triggerBox,
          spCode: 'SP 4.4.2',
          questionGlobalIndex: qIndex,
          optionIndex: opt,
          label: `SP 4.4.2 Soalan ${qIndex + 1} Fireball Safe Pad ${badge}`
        });
      }

      // Connecting Landing Island
      const landingIsland = new THREE.Mesh(
        new THREE.BoxGeometry(16, 2.5, 10),
        new THREE.MeshStandardMaterial({ map: constrSteelTex, roughness: 0.6 })
      );
      landingIsland.position.set(0, -1.25, platZ + 10.5);
      this.scene.add(landingIsland);
      this.addGroundCollider(landingIsland);

      currentZ = platZ + 17;
    }

    // Direct solid bridge connecting Station 2 to Station 3 Start Island
    const bridge2to3 = new THREE.Mesh(
      new THREE.BoxGeometry(16, 2.5, 20),
      new THREE.MeshStandardMaterial({ map: createDiamondPlateTexture(), roughness: 0.6 })
    );
    bridge2to3.position.set(0, -1.25, currentZ + 10);
    this.scene.add(bridge2to3);
    this.addGroundCollider(bridge2to3);
    this.createSideFences(currentZ, 20, 16);
    currentZ += 20;

    // =========================================================================
    // 3. STATION 3: ROTATING LASER CHALLENGE (SP 4.4.3) — Soalan 9 hingga 12
    // Timing & coordination: Rotating laser beams, horizontal sweeping barriers,
    // low beams requiring jumps, safe waiting zones.
    // =========================================================================
    const diamondTex = createDiamondPlateTexture();

    const sp3StartIsland = new THREE.Mesh(
      new THREE.BoxGeometry(22, 2.5, 24),
      new THREE.MeshStandardMaterial({ map: diamondTex, roughness: 0.5 })
    );
    sp3StartIsland.position.set(0, -1.25, currentZ + 12);
    this.scene.add(sp3StartIsland);
    this.addGroundCollider(sp3StartIsland);
    this.createSideFences(currentZ, 24, 22);

    this.createSpawnCircle(new THREE.Vector3(0, 0, currentZ + 8), 0xF59E0B);
    this.createFlagPole(new THREE.Vector3(-7, 0, currentZ + 8), 'PUSINGAN 3', 0xF59E0B);
    this.createArchway(new THREE.Vector3(0, 0, currentZ + 18), 'PUSINGAN 3: ROTATING LASERS', 0xD97706);

    // Exact SP 3 Starting Point
    this.spCheckpoints['SP 4.4.3'] = new THREE.Vector3(0, 1.2, currentZ + 8);

    const sp3TriggerBox = new THREE.Box3(
      new THREE.Vector3(-10, 0, currentZ + 2),
      new THREE.Vector3(10, 6, currentZ + 20)
    );
    this.triggerZones.push({
      type: 'CHECKPOINT',
      box: sp3TriggerBox,
      spCode: 'SP 4.4.3',
      questionGlobalIndex: -1,
      optionIndex: -1,
      label: 'SP_START_SP 4.4.3'
    });

    currentZ += 24;

    for (let q = 0; q < 4; q++) {
      const qIndex = 8 + q; // 8..11
      this.questionCheckpoints[qIndex] = new THREE.Vector3(0, 1.2, currentZ);

      // Laser Course Corridor
      const laserCorrLen = 28;
      const corridorFloor = new THREE.Mesh(
        new THREE.BoxGeometry(16, 2.5, laserCorrLen),
        new THREE.MeshStandardMaterial({ map: diamondTex, roughness: 0.5 })
      );
      corridorFloor.position.set(0, -1.25, currentZ + laserCorrLen / 2);
      this.scene.add(corridorFloor);
      this.addGroundCollider(corridorFloor);
      this.createSideWalls(currentZ, laserCorrLen, 16);

      // ROTATING LASER OBSTACLES (Station 3):
      // Kesemua soalan menggunakan susunan seragam seperti Soalan 1 dan 2:
      // 1 tiang palang berputar di tengah (Z + 14) dengan pad zon selamat di hadapan (Z + 6) dan di belakang (Z + 22)
      this.createSafeWaitingPad(new THREE.Vector3(0, 0.05, currentZ + 6));
      const rotSpeed = q % 2 === 0 ? 0.44 : -0.44;
      this.createRotatingLaser(new THREE.Vector3(0, 0.38, currentZ + 14), rotSpeed, 11.5);
      this.createSafeWaitingPad(new THREE.Vector3(0, 0.05, currentZ + 22));

      // Question Answer Platforms
      const platZ = currentZ + laserCorrLen + 6;
      for (let opt = 0; opt < 3; opt++) {
        const xPos = xOffsets[opt];
        const badge = badges[opt];

        const platMesh = new THREE.Mesh(
          new THREE.BoxGeometry(4.8, 2.2, 8.5),
          new THREE.MeshStandardMaterial({ map: diamondTex, roughness: 0.5 })
        );
        platMesh.position.set(xPos, -1.1, platZ);
        this.scene.add(platMesh);
        this.addGroundCollider(platMesh);

        this.createPlatformSign(new THREE.Vector3(xPos, 0, platZ + 3.2), badge, qIndex, opt);

        const triggerBox = new THREE.Box3(
          new THREE.Vector3(xPos - 2.3, -0.25, platZ - 3.8),
          new THREE.Vector3(xPos + 2.3, 2.8, platZ + 3.8)
        );
        this.triggerZones.push({
          type: 'FLOOR',
          box: triggerBox,
          spCode: 'SP 4.4.3',
          questionGlobalIndex: qIndex,
          optionIndex: opt,
          label: `SP 4.4.3 Soalan ${qIndex + 1} Laser Pad ${badge}`
        });
      }

      // Connecting Landing Island
      const landingIsland = new THREE.Mesh(
        new THREE.BoxGeometry(16, 2.5, 10),
        new THREE.MeshStandardMaterial({ map: diamondTex, roughness: 0.5 })
      );
      landingIsland.position.set(0, -1.25, platZ + 10.5);
      this.scene.add(landingIsland);
      this.addGroundCollider(landingIsland);

      currentZ = platZ + 17;
    }

    // Direct solid bridge connecting Station 3 to Station 4 Start Island
    const bridge3to4 = new THREE.Mesh(
      new THREE.BoxGeometry(16, 2.5, 20),
      new THREE.MeshStandardMaterial({ map: createCrackedObsidianTexture(), roughness: 0.7 })
    );
    bridge3to4.position.set(0, -1.25, currentZ + 10);
    this.scene.add(bridge3to4);
    this.addGroundCollider(bridge3to4);
    this.createSideFences(currentZ, 20, 16);
    currentZ += 20;

    // =========================================================================
    // 4. STATION 4: FALLING FLOOR SURVIVAL (SP 4.4.4) — Soalan 13 hingga 16
    // Survival obstacle course: Collapsing floors that crumble seconds after stepping,
    // rising bubbling lava, and falling ceiling hazard blocks!
    // =========================================================================
    const lavaTex = createLavaTexture();
    const obsidianTex = createCrackedObsidianTexture();

    const sp4StartIsland = new THREE.Mesh(
      new THREE.BoxGeometry(22, 2.5, 24),
      new THREE.MeshStandardMaterial({ map: obsidianTex, roughness: 0.6 })
    );
    sp4StartIsland.position.set(0, -1.25, currentZ + 12);
    this.scene.add(sp4StartIsland);
    this.addGroundCollider(sp4StartIsland);
    this.createSideFences(currentZ, 24, 22);

    this.createSpawnCircle(new THREE.Vector3(0, 0, currentZ + 8), 0xEF4444);
    this.createFlagPole(new THREE.Vector3(-7, 0, currentZ + 8), 'PUSINGAN 4', 0xEF4444);
    this.createArchway(new THREE.Vector3(0, 0, currentZ + 18), 'PUSINGAN 4: FALLING FLOOR SURVIVAL', 0xDC2626);

    // Exact SP 4 Starting Point
    this.spCheckpoints['SP 4.4.4'] = new THREE.Vector3(0, 1.2, currentZ + 8);

    // Bubbling molten lava sea below the entire survival zone
    const lavaPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 240),
      new THREE.MeshStandardMaterial({
        map: lavaTex,
        emissive: new THREE.Color(0xEA580C),
        emissiveIntensity: 0.7,
        roughness: 0.8
      })
    );
    lavaPlane.rotation.x = -Math.PI / 2;
    lavaPlane.position.set(0, -8.0, currentZ + 110);
    this.scene.add(lavaPlane);
    this.lavaMesh = lavaPlane;

    this.createEmberParticles(new THREE.Vector3(0, -6, currentZ + 110));

    const sp4TriggerBox = new THREE.Box3(
      new THREE.Vector3(-10, 0, currentZ + 2),
      new THREE.Vector3(10, 6, currentZ + 20)
    );
    this.triggerZones.push({
      type: 'CHECKPOINT',
      box: sp4TriggerBox,
      spCode: 'SP 4.4.4',
      questionGlobalIndex: -1,
      optionIndex: -1,
      label: 'SP_START_SP 4.4.4'
    });

    currentZ += 24;

    for (let q = 0; q < 4; q++) {
      const qIndex = 12 + q; // 12..15
      const stageStartZ = currentZ;
      this.questionCheckpoints[qIndex] = new THREE.Vector3(0, 1.2, stageStartZ + 2);

      // =======================================================================
      // 1. QUESTION ANSWERING ISLAND (Player answers question HERE before bridge)
      // =======================================================================
      const islandLen = 16;
      const questionIsland = new THREE.Mesh(
        new THREE.BoxGeometry(18, 2.5, islandLen),
        new THREE.MeshStandardMaterial({ map: obsidianTex, roughness: 0.6 })
      );
      questionIsland.position.set(0, -1.25, stageStartZ + islandLen / 2);
      this.scene.add(questionIsland);
      this.addGroundCollider(questionIsland);
      this.createSideFences(stageStartZ, islandLen, 18);
      this.createSpawnCircle(new THREE.Vector3(0, 0, stageStartZ + 2), 0x8B5CF6);

      // 3 Answer Tiles (A, B, C) on the question island: Left (A), Middle (B), Right (C)
      const padZ = stageStartZ + 7.5;
      const s4Letters: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
      const s4XPositions = [5.0, 0.0, -5.0]; // Left (A: +5.0), Center (B: 0.0), Right (C: -5.0)
      const s4NeonColors = ['#10B981', '#0EA5E9', '#8B5CF6'];

      for (let opt = 0; opt < 3; opt++) {
        const xPos = s4XPositions[opt];
        const letter = s4Letters[opt];
        const neonCol = s4NeonColors[opt];

        // Physical Answer Pad Mesh on island surface
        const tileGeo = new THREE.BoxGeometry(4.4, 0.4, 4.8);
        const tileMat = new THREE.MeshStandardMaterial({
          map: obsidianTex,
          roughness: 0.35,
          metalness: 0.1
        });
        const tileMesh = new THREE.Mesh(tileGeo, tileMat);
        tileMesh.position.set(xPos, 0.15, padZ);
        this.scene.add(tileMesh);
        const collider = this.addGroundCollider(tileMesh);

        // High-Visibility Top Surface Decal (Displays ONLY the bold letter A, B, or C)
        const topDecalGeo = new THREE.PlaneGeometry(4.0, 4.4);
        const topTex = createSurvivalTileTexture(letter, 'NORMAL');
        const topMat = new THREE.MeshBasicMaterial({
          map: topTex,
          transparent: true,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2
        });
        const topDecalMesh = new THREE.Mesh(topDecalGeo, topMat);
        topDecalMesh.rotation.x = -Math.PI / 2;
        topDecalMesh.rotation.z = Math.PI;
        topDecalMesh.position.set(xPos, 0.36, padZ);
        this.scene.add(topDecalMesh);

        // Floating 3D Billboard at back of answer pad (facing approaching player)
        const bbGeo = new THREE.PlaneGeometry(3.0, 1.8);
        const bbTex = createOptionDoorTexture(letter, neonCol);
        const bbMat = new THREE.MeshBasicMaterial({ map: bbTex, side: THREE.DoubleSide });
        const bbMesh = new THREE.Mesh(bbGeo, bbMat);
        bbMesh.position.set(xPos, 1.8, padZ + 2.7);
        bbMesh.rotation.y = Math.PI;
        this.scene.add(bbMesh);

        // Billboard posts
        const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
        const p1 = new THREE.Mesh(postGeo, postMat);
        p1.position.set(xPos - 1.2, 0.9, padZ + 2.7);
        this.scene.add(p1);
        const p2 = new THREE.Mesh(postGeo, postMat);
        p2.position.set(xPos + 1.2, 0.9, padZ + 2.7);
        this.scene.add(p2);

        // Store reference for dynamic answer highlighting & resets
        this.station4Tiles.push({
          qIndex,
          optIndex: opt,
          letter,
          tileMesh,
          topDecalMesh,
          billboardMesh: bbMesh,
          baseMat: tileMat,
          topMat,
          bbMat
        });

        // Trigger Box covering the entire pad
        const triggerBox = new THREE.Box3(
          new THREE.Vector3(xPos - 2.2, -0.4, padZ - 2.4),
          new THREE.Vector3(xPos + 2.2, 3.5, padZ + 2.4)
        );
        this.triggerZones.push({
          type: 'FLOOR',
          box: triggerBox,
          spCode: 'SP 4.4.4',
          questionGlobalIndex: qIndex,
          optionIndex: opt,
          label: `SP 4.4.4 Soalan ${qIndex + 1} Survival Tile ${letter}`
        });
      }

      // Barrier Gate at entrance of Crumbling Bridge (at stageStartZ + 14.5)
      const barrierZ = stageStartZ + 14.5;
      const archGroup = new THREE.Group();
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
      const pLeft = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.5, 1.2), pillarMat);
      pLeft.position.set(-5.5, 2.75, 0);
      archGroup.add(pLeft);
      const pRight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.5, 1.2), pillarMat);
      pRight.position.set(5.5, 2.75, 0);
      archGroup.add(pRight);
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(12.2, 0.9, 1.4), pillarMat);
      topBar.position.set(0, 5.2, 0);
      archGroup.add(topBar);

      // Gate archway (clean physical barrier arch without text billboard)
      archGroup.position.set(0, 0, barrierZ);
      this.scene.add(archGroup);

      // Energy Barrier Mesh (blocking door until question answered correctly)
      const barrierMat = new THREE.MeshStandardMaterial({
        color: 0xEF4444,
        emissive: new THREE.Color(0xDC2626),
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.65,
        roughness: 0.2
      });
      const barrierMesh = new THREE.Mesh(new THREE.BoxGeometry(10.0, 4.6, 0.4), barrierMat);
      barrierMesh.position.set(0, 2.3, barrierZ);
      this.scene.add(barrierMesh);
      const barrierCollider = this.addGroundCollider(barrierMesh);

      this.station4Barriers.push({
        qIndex,
        mesh: barrierMesh,
        collider: barrierCollider,
        archGroup,
        isUnlocked: false
      });

      // =======================================================================
      // 2. CRUMBLING BRIDGE OBSTACLE (Roblox-style crumbling platforms across lava)
      // Spaced with distinct gaps and staggered X positions so players MUST jump,
      // with larger, comfortable landing tiles suitable for Form 1 students!
      // =======================================================================
      const bridgeConfigs = [
        { zOff: 20.0, x: -2.0, color: 0x00E5FF }, // Platform 1: Cyan (Left)
        { zOff: 25.2, x: 2.0, color: 0xFFD600 },  // Platform 2: Yellow (Right)
        { zOff: 30.4, x: -2.0, color: 0xFF1744 }, // Platform 3: Hot Magenta (Left)
        { zOff: 35.6, x: 2.0, color: 0x00E676 },  // Platform 4: Lime Green (Right)
        { zOff: 40.8, x: 0.0, color: 0xFF6D00 }   // Platform 5: Electric Orange (Center)
      ];

      bridgeConfigs.forEach(cfg => {
        const stepZ = stageStartZ + cfg.zOff;
        const stepX = cfg.x;
        const crumbGeo = new THREE.BoxGeometry(3.6, 1.2, 2.8);
        const crumbMat = new THREE.MeshStandardMaterial({
          color: cfg.color,
          roughness: 0.35,
          metalness: 0.2
        });
        const crumbMesh = new THREE.Mesh(crumbGeo, crumbMat);
        crumbMesh.position.set(stepX, -0.6, stepZ);
        this.scene.add(crumbMesh);

        // Add 4 Roblox stud accents on platform surface
        const studGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 12);
        const studMat = new THREE.MeshStandardMaterial({
          color: cfg.color,
          roughness: 0.3
        });
        for (const sx of [-1.0, 1.0]) {
          for (const sz of [-0.75, 0.75]) {
            const stud = new THREE.Mesh(studGeo, studMat);
            stud.position.set(sx, 0.64, sz);
            crumbMesh.add(stud);
          }
        }

        const collider = this.addGroundCollider(crumbMesh);

        this.temporaryTiles.push({
          mesh: crumbMesh,
          collider,
          steppedOn: false,
          stepTimer: 0.8,
          maxTime: 0.8,
          originalColor: cfg.color,
          initialPos: new THREE.Vector3(stepX, -0.6, stepZ),
          isFallen: false,
          fallSpeed: 0,
          station: 'SP 4.4.4'
        });
      });

      // =======================================================================
      // 3. LANDING ISLAND (At end of Crumbling Bridge)
      // =======================================================================
      const landingIsland = new THREE.Mesh(
        new THREE.BoxGeometry(16, 2.5, 10),
        new THREE.MeshStandardMaterial({ map: obsidianTex, roughness: 0.6 })
      );
      landingIsland.position.set(0, -1.25, stageStartZ + 49.8);
      this.scene.add(landingIsland);
      this.addGroundCollider(landingIsland);
      this.createSideFences(stageStartZ + 44.8, 10, 16);
      this.createSpawnCircle(new THREE.Vector3(0, 0, stageStartZ + 49.8), 0x10B981);

      // Trigger Zone on Landing Island (crosses bridge -> proceeds to next stage)
      const landTriggerBox = new THREE.Box3(
        new THREE.Vector3(-7.5, -0.3, stageStartZ + 45.0),
        new THREE.Vector3(7.5, 3.5, stageStartZ + 54.0)
      );
      this.triggerZones.push({
        type: 'CHECKPOINT',
        box: landTriggerBox,
        spCode: 'SP 4.4.4',
        questionGlobalIndex: qIndex,
        optionIndex: -1,
        label: `STATION4_LANDING_${qIndex}`
      });

      currentZ = stageStartZ + 55;
    }

    // Direct solid bridge connecting Station 4 to Victory Summit
    const bridge4toVictory = new THREE.Mesh(
      new THREE.BoxGeometry(18, 2.5, 24),
      new THREE.MeshStandardMaterial({ map: goldTex, roughness: 0.4 })
    );
    bridge4toVictory.position.set(0, -1.25, currentZ + 12);
    this.scene.add(bridge4toVictory);
    this.addGroundCollider(bridge4toVictory);
    this.createSideFences(currentZ, 24, 18);
    currentZ += 24;

    // =========================================================================
    // 5. VICTORY SUMMIT (FINISH LINE)
    // =========================================================================
    const finishPlatform = new THREE.Mesh(
      new THREE.BoxGeometry(26, 2.5, 42),
      new THREE.MeshStandardMaterial({ map: goldTex, roughness: 0.4 })
    );
    finishPlatform.position.set(0, -1.25, currentZ + 21);
    this.scene.add(finishPlatform);
    this.addGroundCollider(finishPlatform);
    this.createSideFences(currentZ, 42, 26);

    this.createArchway(new THREE.Vector3(0, 0, currentZ + 8), 'GARISAN PENAMAT', 0xEAB308);

    const finishTriggerBox = new THREE.Box3(
      new THREE.Vector3(-10, 0, currentZ + 6),
      new THREE.Vector3(10, 6, currentZ + 11)
    );
    this.triggerZones.push({
      type: 'FINISH',
      box: finishTriggerBox,
      spCode: 'NONE',
      questionGlobalIndex: 15,
      optionIndex: -1,
      label: 'FINISH_LINE'
    });

    this.createVictoryTrophy(new THREE.Vector3(0, 1.5, currentZ + 26));
    this.createConfettiParticles(new THREE.Vector3(0, 7, currentZ + 26));
  }

  // ===========================================================================
  // HAZARDS BUILDERS & COLLISION CHECK
  // ===========================================================================

  private createRollingFireball(pos: THREE.Vector3, minX: number, maxX: number, speed: number) {
    const group = new THREE.Group();

    // Glowing core sphere
    const sphereGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xEA580C,
      emissive: new THREE.Color(0xF97316),
      emissiveIntensity: 0.9,
      roughness: 0.4
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphereMesh);

    // Fiery outer glow spikes / flame crust
    const spikeGeo = new THREE.DodecahedronGeometry(1.4, 0);
    const spikeMat = new THREE.MeshBasicMaterial({
      color: 0xFEF08A,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const spikeMesh = new THREE.Mesh(spikeGeo, spikeMat);
    group.add(spikeMesh);

    group.position.copy(pos);
    this.scene.add(group);

    const box = new THREE.Box3().setFromCenterAndSize(pos, new THREE.Vector3(2.2, 2.2, 2.2));

    this.fireballs.push({
      group,
      initialPos: pos.clone(),
      speed: Math.abs(speed),
      minX,
      maxX,
      direction: speed >= 0 ? 1 : -1,
      radius: 1.2,
      box,
      station: 'SP 4.4.2'
    });
  }

  private createSafeAlcove(pos: THREE.Vector3, side: number) {
    const alcoveGroup = new THREE.Group();
    const padMat = new THREE.MeshStandardMaterial({ color: 0x10B981, roughness: 0.4 });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.5, 5.0), padMat);
    pad.position.y = -1.25;
    alcoveGroup.add(pad);
    this.addGroundCollider(pad);

    // Glowing green boundary line
    const border = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.1, 5.0),
      new THREE.MeshBasicMaterial({ color: 0x34D399 })
    );
    border.position.set(-side * 1.7, 0.05, 0);
    alcoveGroup.add(border);

    alcoveGroup.position.copy(pos);
    this.scene.add(alcoveGroup);
  }

  private createSideWalls(startZ: number, length: number, width: number) {
    const wallGeo = new THREE.BoxGeometry(0.6, 4.0, length);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });

    const left = new THREE.Mesh(wallGeo, wallMat);
    left.position.set(-width / 2 + 0.3, 1.0, startZ + length / 2);
    this.scene.add(left);
    this.addGroundCollider(left);

    const right = new THREE.Mesh(wallGeo, wallMat);
    right.position.set(width / 2 - 0.3, 1.0, startZ + length / 2);
    this.scene.add(right);
    this.addGroundCollider(right);
  }

  private createRotatingLaser(pos: THREE.Vector3, speed: number, length: number) {
    const group = new THREE.Group();

    // Center pivot post with metallic finish
    const postMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.8, roughness: 0.3 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 1.8, 16), postMat);
    group.add(post);

    // Hazard warning beacon on top of post
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      emissive: new THREE.Color(0xD97706),
      emissiveIntensity: 0.8
    });
    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16), beaconMat);
    beacon.position.y = 1.0;
    group.add(beacon);

    // Glowing bright red laser beam material
    const beamGeo = new THREE.BoxGeometry(length, 0.22, 0.22);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xFF1E56 });

    // Palang 1 (Along local X axis)
    const beamMesh1 = new THREE.Mesh(beamGeo, beamMat);
    group.add(beamMesh1);

    // Palang 2 (Along local Z axis - bersilang 90 darjah)
    const beamMesh2 = new THREE.Mesh(beamGeo, beamMat);
    beamMesh2.rotation.y = Math.PI / 2;
    group.add(beamMesh2);

    // Center pivot collar ring for clean visual aesthetic
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      metalness: 0.9,
      roughness: 0.2
    });
    const centerCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.26, 16), ringMat);
    group.add(centerCollar);

    group.position.copy(pos);
    this.scene.add(group);

    this.rotatingLasers.push({
      group,
      centerPos: pos.clone(),
      speed,
      height: pos.y,
      length,
      station: 'SP 4.4.3'
    });
  }

  private createSafeWaitingPad(pos: THREE.Vector3) {
    const padGroup = new THREE.Group();
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 2.8, 0.1, 24),
      new THREE.MeshStandardMaterial({
        color: 0x059669,
        roughness: 0.3,
        emissive: new THREE.Color(0x047857),
        emissiveIntensity: 0.25
      })
    );
    padGroup.add(pad);

    // High-visibility glowing perimeter ring for safe zone
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.7, 24),
      new THREE.MeshBasicMaterial({ color: 0x34D399, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    padGroup.add(ring);

    padGroup.position.copy(pos);
    this.scene.add(padGroup);
  }

  private createFallingBlock(pos: THREE.Vector3, targetY: number) {
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x44403C, roughness: 0.8 });
    const block = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.2, 3.2), blockMat);
    block.position.copy(pos);
    this.scene.add(block);

    const box = new THREE.Box3().setFromObject(block);

    this.fallingBlocks.push({
      mesh: block,
      initialY: pos.y,
      targetY,
      state: 'WAITING',
      timer: 1.5 + Math.random() * 1.5,
      speed: 12.0,
      box,
      station: 'SP 4.4.4'
    });
  }

  /**
   * Check all active hazards against the player's bounding box.
   * Returns failure info if a hit occurs!
   */
  public checkHazardCollisions(playerBox: THREE.Box3): { type: string; station: 'SP 4.4.2' | 'SP 4.4.3' | 'SP 4.4.4' } | null {
    // 1. Station 2: Fireballs
    for (const fb of this.fireballs) {
      if (fb.box.intersectsBox(playerBox)) {
        return { type: 'FIREBALL', station: 'SP 4.4.2' };
      }
    }

    // 2. Station 3: Rotating Lasers (Pengesanan tepat 2 palang - pemain betul-betul kena palang baru dikira kena)
    for (const rl of this.rotatingLasers) {
      // Semak pelepasan ketinggian paksi Y:
      // Laser berada pada ketinggian rl.height dengan ketebalan 0.22 (separuh ketinggian = 0.11m)
      const beamHalfHeight = 0.12;
      const beamMinY = rl.height - beamHalfHeight;
      const beamMaxY = rl.height + beamHalfHeight;

      // Jika kaki pemain melompat melepasi palang (playerBox.min.y > beamMaxY),
      // pemain berjaya melepasi halangan tanpa terkena!
      if (playerBox.min.y > beamMaxY || playerBox.max.y < beamMinY) {
        continue;
      }

      // Titik tengah pemain dalam koordinat dunia XZ
      const playerCenterX = (playerBox.min.x + playerBox.max.x) * 0.5;
      const playerCenterZ = (playerBox.min.z + playerBox.max.z) * 0.5;

      const dx = playerCenterX - rl.centerPos.x;
      const dz = playerCenterZ - rl.centerPos.z;

      // Putar ke dalam sistem koordinat setempat (local space) palang
      const theta = rl.group.rotation.y;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const localX = dx * cosT + dz * sinT;
      const localZ = -dx * sinT + dz * cosT;

      const halfLen = rl.length * 0.5;
      // Sensor tepat dan adil: separuh ketebalan palang (0.11m) + radius badan pemain (0.19m) = 0.30m
      // Tidak terlampau sensitif - pemain perlu betul-betul menyentuh palang fizikal
      const hitTolerance = 0.30;

      // Palang 1 (sepanjang paksi X tempatan)
      const hitPalang1 =
        Math.abs(localX) <= halfLen + 0.05 && Math.abs(localZ) <= hitTolerance;

      // Palang 2 (sepanjang paksi Z tempatan)
      const hitPalang2 =
        Math.abs(localZ) <= halfLen + 0.05 && Math.abs(localX) <= hitTolerance;

      if (hitPalang1 || hitPalang2) {
        return { type: 'LASER', station: 'SP 4.4.3' };
      }
    }

    // 3. Station 4: Falling Blocks
    for (const fb of this.fallingBlocks) {
      if (fb.state === 'FALLING' || fb.state === 'WAITING') {
        if (fb.box.intersectsBox(playerBox)) {
          return { type: 'FALLING_BLOCK', station: 'SP 4.4.4' };
        }
      }
    }

    return null;
  }

  /**
   * Updates temporary crumbling tiles when player steps on them.
   */
  public updateTemporaryTiles(playerBox: THREE.Box3, delta: number) {
    for (const tile of this.temporaryTiles) {
      if (!tile.isFallen) {
        // Check if player is standing on this tile
        const isStanding = playerBox.intersectsBox(tile.collider.box);
        if (isStanding && !tile.steppedOn) {
          tile.steppedOn = true;
          soundManager.playWarning();
        }

        if (tile.steppedOn) {
          tile.stepTimer -= delta;

          // Noticeable shaking animation that intensifies quickly before collapse (0.8s reaction time)
          const maxT = tile.maxTime || 0.8;
          const elapsedRatio = Math.max(0, 1.0 - (tile.stepTimer / maxT));
          const shakeMag = 0.04 + elapsedRatio * 0.12;
          tile.mesh.position.x = tile.initialPos.x + (Math.random() - 0.5) * shakeMag;
          tile.mesh.position.z = tile.initialPos.z + (Math.random() - 0.5) * shakeMag;

          // Flash warning red during the final 0.35 seconds before collapse
          const mat = tile.mesh.material as THREE.MeshStandardMaterial;
          if (tile.stepTimer < 0.35) {
            const isFlash = Math.floor(tile.stepTimer * 16) % 2 === 0;
            mat.color.setHex(isFlash ? 0xEF4444 : (tile.originalColor !== undefined ? tile.originalColor : 0xF97316));
            mat.emissive?.setHex(isFlash ? 0xEF4444 : 0x000000);
            mat.emissiveIntensity = isFlash ? 0.7 : 0;
          }

          if (tile.stepTimer <= 0) {
            tile.isFallen = true;
            tile.fallSpeed = 4.0;
            // Disable ground collider immediately
            tile.collider.box.makeEmpty();
          }
        }
      } else {
        // Tile dropping into void / lava rapidly
        tile.fallSpeed += 30.0 * delta;
        tile.mesh.position.y -= tile.fallSpeed * delta;
        tile.mesh.rotation.x += delta * 2.5;
        tile.mesh.rotation.z += delta * 1.5;
      }
    }
  }

  public dropTile(qIndex: number, optIndex: number) {
    const tile = this.fallingTiles.find(t => t.qIndex === qIndex && t.optIndex === optIndex);
    if (tile && !tile.isFalling) {
      tile.isFalling = true;
      tile.fallSpeed = 0.5;
    }
  }

  public resetFallingTiles() {
    this.fallingTiles.forEach(t => {
      t.isFalling = false;
      t.fallSpeed = 0;
      t.mesh.position.y = t.initialY;
      t.mesh.rotation.set(0, 0, 0);
      t.collider.box.setFromObject(t.mesh);
    });
  }

  public resetTemporaryTiles(station?: string) {
    this.temporaryTiles.forEach(t => {
      if (!station || t.station === station) {
        t.steppedOn = false;
        t.stepTimer = t.maxTime || 0.8;
        t.isFallen = false;
        t.fallSpeed = 0;
        t.mesh.position.copy(t.initialPos);
        t.mesh.rotation.set(0, 0, 0);
        t.collider.box.setFromObject(t.mesh);
        const mat = t.mesh.material as THREE.MeshStandardMaterial;
        mat.color.setHex(t.originalColor !== undefined ? t.originalColor : 0xF59E0B);
        mat.emissive?.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    });
  }

  public highlightStation4Answer(
    qIndex: number,
    selectedOptIndex: number,
    correctOptIndex: number,
    isCorrect: boolean
  ) {
    const tilesForQ = this.station4Tiles.filter(t => t.qIndex === qIndex);
    tilesForQ.forEach(t => {
      if (t.optIndex === selectedOptIndex) {
        if (isCorrect) {
          // Selected correct tile turns glowing vibrant green
          const tex = createSurvivalTileTexture(t.letter, 'CORRECT');
          t.topMat.map = tex;
          t.topMat.needsUpdate = true;
          t.bbMat.map = tex;
          t.bbMat.needsUpdate = true;
          t.baseMat.emissive.setHex(0x10B981);
          t.baseMat.emissiveIntensity = 0.85;
        } else {
          // Selected wrong tile turns glowing red
          const tex = createSurvivalTileTexture(t.letter, 'WRONG');
          t.topMat.map = tex;
          t.topMat.needsUpdate = true;
          t.bbMat.map = tex;
          t.bbMat.needsUpdate = true;
          t.baseMat.emissive.setHex(0xEF4444);
          t.baseMat.emissiveIntensity = 0.85;
        }
      } else if (!isCorrect && t.optIndex === correctOptIndex) {
        // If wrong answer was chosen, clearly highlight the correct answer tile in glowing green
        const tex = createSurvivalTileTexture(t.letter, 'CORRECT');
        t.topMat.map = tex;
        t.topMat.needsUpdate = true;
        t.bbMat.map = tex;
        t.bbMat.needsUpdate = true;
        t.baseMat.emissive.setHex(0x10B981);
        t.baseMat.emissiveIntensity = 0.85;
      }
    });
  }

  public resetStation4Tiles(qIndex?: number) {
    const tilesToReset = qIndex !== undefined
      ? this.station4Tiles.filter(t => t.qIndex === qIndex)
      : this.station4Tiles;

    tilesToReset.forEach(t => {
      const tex = createSurvivalTileTexture(t.letter, 'NORMAL');
      t.topMat.map = tex;
      t.topMat.needsUpdate = true;
      const bbTex = createOptionDoorTexture(
        t.letter,
        t.letter === 'A' ? '#10B981' : t.letter === 'B' ? '#0EA5E9' : '#8B5CF6'
      );
      t.bbMat.map = bbTex;
      t.bbMat.needsUpdate = true;
      t.baseMat.emissive.setHex(0x000000);
      t.baseMat.emissiveIntensity = 0;
    });
  }

  public unlockStation4Bridge(qIndex: number) {
    const barrier = this.station4Barriers.find(b => b.qIndex === qIndex);
    if (barrier && !barrier.isUnlocked) {
      barrier.isUnlocked = true;
      barrier.mesh.position.y = -6.0;
      barrier.collider.box.makeEmpty();
      soundManager.playGateOpen();
      if (barrier.signMesh) {
        const signTex = createTextTexture('BUKA', 'JAMBATAN DIBUKA! LINTAS SEGERA!', '#052E16', '#22C55E');
        const mat = barrier.signMesh.material as THREE.MeshBasicMaterial;
        if (mat.map) mat.map.dispose();
        mat.map = signTex;
        mat.needsUpdate = true;
      }
    }
  }

  public resetStation4Barriers() {
    this.station4Barriers.forEach(b => {
      b.isUnlocked = false;
      b.mesh.position.y = 2.4;
      b.collider.box.setFromObject(b.mesh);
      if (b.signMesh) {
        const signTex = createTextTexture('KUNCI', 'SELESAIKAN SOALAN UNTUK BUKA', '#450A0A', '#EF4444');
        const mat = b.signMesh.material as THREE.MeshBasicMaterial;
        if (mat.map) mat.map.dispose();
        mat.map = signTex;
        mat.needsUpdate = true;
      }
    });
  }

  public resetStationObstacles(spCode: string) {
    if (spCode === 'SP 4.4.1') {
      this.resetTemporaryTiles('SP 4.4.1');
      this.movingPlatforms.forEach(p => {
        if (p.initialZ !== undefined) {
          p.mesh.position.z = p.initialZ;
          p.collider.box.setFromObject(p.mesh);
        }
      });
    } else if (spCode === 'SP 4.4.2') {
      this.fireballs.forEach(f => {
        f.group.position.copy(f.initialPos);
        f.box.setFromCenterAndSize(f.initialPos, new THREE.Vector3(2.2, 2.2, 2.2));
      });
    } else if (spCode === 'SP 4.4.3') {
      this.rotatingLasers.forEach(rl => {
        rl.group.rotation.y = 0;
      });
    } else if (spCode === 'SP 4.4.4') {
      this.resetFallingTiles();
      this.resetTemporaryTiles('SP 4.4.4');
      this.resetStation4Tiles();
      this.resetStation4Barriers();
      this.fallingBlocks.forEach(fb => {
        fb.mesh.position.y = fb.initialY;
        fb.state = 'WAITING';
        fb.timer = 1.5;
      });
    }
  }

  public resetGame() {
    if (this.confettiParticles) {
      this.confettiParticles.visible = false;
    }
    this.resetFallingTiles();
    this.resetTemporaryTiles();
    this.resetStation4Tiles();
    this.resetStation4Barriers();
    this.movingPlatforms.forEach(p => {
      if (p.initialZ !== undefined) {
        p.mesh.position.z = p.initialZ;
        p.collider.box.setFromObject(p.mesh);
      }
    });
    this.fireballs.forEach(f => {
      f.group.position.copy(f.initialPos);
      f.box.setFromCenterAndSize(f.initialPos, new THREE.Vector3(2.2, 2.2, 2.2));
    });
    this.rotatingLasers.forEach(rl => {
      rl.group.rotation.y = 0;
    });
    this.fallingBlocks.forEach(fb => {
      fb.mesh.position.y = fb.initialY;
      fb.state = 'WAITING';
      fb.timer = 1.5;
    });
  }

  // ===========================================================================
  // BUILDER HELPERS FOR ENVIRONMENT
  // ===========================================================================

  private createSpawnCircle(pos: THREE.Vector3, colorHex: number) {
    const circleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 2.8, 0.08, 24),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.3 })
    );
    circleMesh.position.set(pos.x, pos.y + 0.05, pos.z);
    this.scene.add(circleMesh);

    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 2.3, 24),
      new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide })
    );
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.set(pos.x, pos.y + 0.09, pos.z);
    this.scene.add(innerRing);
  }

  private createGrandEntranceArch(pos: THREE.Vector3, title: string) {
    const archGroup = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.4 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xFBBF24, metalness: 0.8, roughness: 0.2 });

    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7.5, 1.4), pillarMat);
    leftPillar.position.set(-6, 3.75, 0);
    archGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 7.5, 1.4), pillarMat);
    rightPillar.position.set(6, 3.75, 0);
    archGroup.add(rightPillar);

    const topLintel = new THREE.Mesh(new THREE.BoxGeometry(14.5, 1.4, 1.6), pillarMat);
    topLintel.position.set(0, 7.5, 0);
    archGroup.add(topLintel);

    const crown = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 1.8), goldMat);
    crown.position.set(0, 8.3, 0);
    archGroup.add(crown);

    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 128;
    const bCtx = bannerCanvas.getContext('2d')!;
    bCtx.fillStyle = '#0F172A';
    bCtx.fillRect(0, 0, 512, 128);
    bCtx.lineWidth = 8;
    bCtx.strokeStyle = '#38BDF8';
    bCtx.strokeRect(4, 4, 504, 120);

    bCtx.fillStyle = '#F8FAFC';
    bCtx.font = 'bold 36px Fredoka, sans-serif';
    bCtx.textAlign = 'center';
    bCtx.textBaseline = 'middle';
    bCtx.fillText(title, 256, 64);

    const bTex = new THREE.CanvasTexture(bannerCanvas);
    bTex.colorSpace = THREE.SRGBColorSpace;

    const bannerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 2.8),
      new THREE.MeshBasicMaterial({ map: bTex, side: THREE.DoubleSide })
    );
    bannerMesh.position.set(0, 6.5, 0);
    bannerMesh.rotation.y = Math.PI;
    archGroup.add(bannerMesh);

    archGroup.position.copy(pos);
    this.scene.add(archGroup);
  }

  private createArchway(pos: THREE.Vector3, title: string, colorHex: number) {
    const archGroup = new THREE.Group();
    const pillarMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 });

    const leftP = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6.5, 1.2), pillarMat);
    leftP.position.set(-5, 3.25, 0);
    archGroup.add(leftP);

    const rightP = new THREE.Mesh(new THREE.BoxGeometry(1.2, 6.5, 1.2), pillarMat);
    rightP.position.set(5, 3.25, 0);
    archGroup.add(rightP);

    const topBar = new THREE.Mesh(new THREE.BoxGeometry(12, 1.1, 1.3), pillarMat);
    topBar.position.set(0, 6.5, 0);
    archGroup.add(topBar);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.3, 1.5), trimMat);
    trim.position.set(0, 7.1, 0);
    archGroup.add(trim);

    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 128;
    const bCtx = bannerCanvas.getContext('2d')!;
    bCtx.fillStyle = '#0F172A';
    bCtx.fillRect(0, 0, 512, 128);
    bCtx.lineWidth = 6;
    bCtx.strokeStyle = '#FBBF24';
    bCtx.strokeRect(3, 3, 506, 122);

    bCtx.fillStyle = '#F8FAFC';
    bCtx.font = 'bold 28px Fredoka, sans-serif';
    bCtx.textAlign = 'center';
    bCtx.textBaseline = 'middle';
    bCtx.fillText(title, 256, 64);

    const bTex = new THREE.CanvasTexture(bannerCanvas);
    bTex.colorSpace = THREE.SRGBColorSpace;

    const bannerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 2.2),
      new THREE.MeshBasicMaterial({ map: bTex, side: THREE.DoubleSide })
    );
    bannerMesh.position.set(0, 5.6, 0);
    bannerMesh.rotation.y = Math.PI;
    archGroup.add(bannerMesh);

    archGroup.position.copy(pos);
    this.scene.add(archGroup);
  }

  private createPlatformSign(
    pos: THREE.Vector3,
    badge: string,
    qIndex: number,
    optIndex: number,
    parentMesh?: THREE.Mesh
  ) {
    const signTex = createTextTexture(badge, `Pilihan ${badge}`, '#0F172A', '#0EA5E9');
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.7), signMat);
    signMesh.rotation.y = Math.PI;

    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const postMesh = new THREE.Mesh(postGeo, postMat);
    postMesh.position.y = 0.6;

    signMesh.position.y = 1.35;

    const signGroup = new THREE.Group();
    signGroup.add(postMesh);
    signGroup.add(signMesh);

    const key = `Q${qIndex}_OPT${optIndex}`;
    this.signs[key] = { mesh: signMesh, badge, qIndex, optIndex };

    if (parentMesh) {
      signGroup.position.set(0, 1.0, -0.6);
      parentMesh.add(signGroup);
    } else {
      signGroup.position.copy(pos);
      this.scene.add(signGroup);
    }
  }

  private createSideFences(startZ: number, length: number, width: number) {
    const railMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.4 });
    const postMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });

    [-width / 2 + 0.3, width / 2 - 0.3].forEach(x => {
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, length), railMat);
      topRail.position.set(x, 0.9, startZ + length / 2);
      this.scene.add(topRail);

      const midRail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, length), railMat);
      midRail.position.set(x, 0.45, startZ + length / 2);
      this.scene.add(midRail);

      const numPosts = Math.max(3, Math.floor(length / 4));
      for (let p = 0; p <= numPosts; p++) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 8), postMat);
        post.position.set(x, 0.5, startZ + (p / numPosts) * length);
        this.scene.add(post);
      }
    });
  }

  private createFlagPole(pos: THREE.Vector3, text: string, colorHex: number) {
    const flagGroup = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.09, 0.09, 4.8, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.8 });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.y = 2.4;
    flagGroup.add(poleMesh);

    const flagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.1),
      new THREE.MeshStandardMaterial({ color: colorHex, side: THREE.DoubleSide, roughness: 0.4 })
    );
    flagMesh.position.set(0.9, 4.2, 0);
    flagMesh.rotation.y = Math.PI;
    flagGroup.add(flagMesh);

    flagGroup.position.copy(pos);
    this.scene.add(flagGroup);
  }

  private createVictoryTrophy(pos: THREE.Vector3) {
    const trophy = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xFBBF24,
      metalness: 0.9,
      roughness: 0.15
    });

    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.6, 16), goldMat);
    plinth.position.y = 0.3;
    trophy.add(plinth);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 1.2, 16), goldMat);
    stem.position.y = 1.1;
    trophy.add(stem);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 0.5, 1.6, 16), goldMat);
    cup.position.y = 2.3;
    trophy.add(cup);

    const handleGeo = new THREE.TorusGeometry(0.65, 0.12, 8, 16, Math.PI);
    const leftHandle = new THREE.Mesh(handleGeo, goldMat);
    leftHandle.rotation.z = Math.PI / 2;
    leftHandle.position.set(-1.3, 2.3, 0);
    trophy.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeo, goldMat);
    rightHandle.rotation.z = -Math.PI / 2;
    rightHandle.position.set(1.3, 2.3, 0);
    trophy.add(rightHandle);

    trophy.position.copy(pos);
    this.scene.add(trophy);
    this.trophyMesh = trophy;
  }

  private createConfettiParticles(pos: THREE.Vector3) {
    const count = 350;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      [1, 0.2, 0.4],
      [0.2, 0.8, 1],
      [1, 0.8, 0.1],
      [0.2, 1, 0.4],
      [0.8, 0.2, 1]
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;

      const col = palette[i % palette.length];
      colors[i * 3] = col[0];
      colors[i * 3 + 1] = col[1];
      colors[i * 3 + 2] = col[2];
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });

    this.confettiParticles = new THREE.Points(geo, mat);
    this.confettiParticles.position.copy(pos);
    this.confettiParticles.visible = false;
    this.scene.add(this.confettiParticles);
  }

  private createEmberParticles(pos: THREE.Vector3) {
    const count = 120;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;

      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.5;
      colors[i * 3 + 2] = 0.05;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geo, mat);
    particles.position.copy(pos);
    this.scene.add(particles);
    this.emberParticles = particles;
  }

  public updateQuestionSigns(questions: Question[]) {
    questions.forEach((q, qIndex) => {
      if (q.spCode === 'SP 4.4.4') {
        // Station 4 answer tiles display strictly clean A, B, C letter badges
        return;
      }
      const spColors = {
        'SP 4.4.1': '#10B981',
        'SP 4.4.2': '#0EA5E9',
        'SP 4.4.3': '#F59E0B',
        'SP 4.4.4': '#8B5CF6'
      };
      const accent = spColors[q.spCode] || '#3B82F6';
      const badges = ['A', 'B', 'C'];

      for (let opt = 0; opt < 3; opt++) {
        const key = `Q${qIndex}_OPT${opt}`;
        const sign = this.signs[key];
        if (sign) {
          const optText = q.options[opt] || '';
          const newTex = createTextTexture(badges[opt], optText, '#0F172A', accent);
          const mat = sign.mesh.material as THREE.MeshBasicMaterial;
          if (mat.map) mat.map.dispose();
          mat.map = newTex;
          mat.needsUpdate = true;
        }
      }
    });
  }

  public showVictory() {
    if (this.confettiParticles) {
      this.confettiParticles.visible = true;
    }
  }

  public update(delta: number, time: number) {
    // 1. Station 2: Rolling Fireballs animation and boundary bouncing
    for (const fb of this.fireballs) {
      fb.group.position.x += fb.direction * fb.speed * delta;
      // Rotation simulation
      fb.group.rotation.z -= fb.direction * fb.speed * delta * 1.5;

      if (fb.group.position.x >= fb.maxX) {
        fb.group.position.x = fb.maxX;
        fb.direction = -1;
      } else if (fb.group.position.x <= fb.minX) {
        fb.group.position.x = fb.minX;
        fb.direction = 1;
      }

      fb.box.setFromCenterAndSize(
        fb.group.position,
        new THREE.Vector3(fb.radius * 1.8, fb.radius * 1.8, fb.radius * 1.8)
      );
    }

    // 2. Station 3: Rotating Lasers update
    for (const rl of this.rotatingLasers) {
      rl.group.rotation.y += rl.speed * delta;
    }

    // 3. Station 4: Falling Blocks update
    for (const fb of this.fallingBlocks) {
      if (fb.state === 'WAITING') {
        fb.timer -= delta;
        if (fb.timer <= 0) {
          fb.state = 'FALLING';
        }
      } else if (fb.state === 'FALLING') {
        fb.mesh.position.y -= fb.speed * delta;
        if (fb.mesh.position.y <= fb.targetY) {
          fb.mesh.position.y = fb.targetY;
          fb.state = 'RISING';
          fb.timer = 1.0; // stays on ground 1s
        }
      } else if (fb.state === 'RISING') {
        fb.timer -= delta;
        if (fb.timer <= 0) {
          fb.mesh.position.y += 4.0 * delta;
          if (fb.mesh.position.y >= fb.initialY) {
            fb.mesh.position.y = fb.initialY;
            fb.state = 'WAITING';
            fb.timer = 1.5 + Math.random() * 2.0;
          }
        }
      }
      fb.box.setFromObject(fb.mesh);
    }

    // 4. Moving platforms in Station 1 (Slow, predictable movement in ONE direction only)
    this.movingPlatforms.forEach(p => {
      if (p.axis === 'z_forward') {
        p.mesh.position.z += p.speed * delta;
        if (p.maxZ !== undefined && p.minZ !== undefined && p.mesh.position.z >= p.maxZ) {
          p.mesh.position.z = p.minZ;
        }
      } else if (p.axis === 'y') {
        const t = time * p.speed + p.offset;
        p.mesh.position.y = p.initialY + Math.sin(t) * p.amplitude;
      } else {
        p.mesh.position.x = p.initialX;
      }

      p.mesh.updateMatrixWorld(true);
      p.collider.box.setFromObject(p.mesh);

      if (p.trigger) {
        p.trigger.box.copy(p.collider.box);
        p.trigger.box.min.y += 0.8;
        p.trigger.box.max.y += 2.0;
      }
    });

    // 5. Falling Tiles (SP 4.4.4 answers)
    this.fallingTiles.forEach(tile => {
      if (tile.isFalling) {
        tile.fallSpeed += 18.0 * delta;
        tile.mesh.position.y -= tile.fallSpeed * delta;
        tile.mesh.rotation.x += delta * 1.5;
        tile.mesh.rotation.z += delta * 0.8;
        tile.collider.box.setFromObject(tile.mesh);
      }
    });

    // 6. Lava texture flow
    if (this.lavaMesh) {
      const mat = this.lavaMesh.material as THREE.MeshStandardMaterial;
      if (mat.map) {
        mat.map.offset.y += delta * 0.04;
        mat.map.offset.x += delta * 0.02;
      }
    }

    // 7. Ember particles
    if (this.emberParticles) {
      const posAttr = this.emberParticles.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) + delta * 3.5;
        if (y > 20) y = 0;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    // 8. Trophy & Confetti
    if (this.trophyMesh) {
      this.trophyMesh.rotation.y += delta * 1.2;
    }

    if (this.confettiParticles && this.confettiParticles.visible) {
      const posAttr = this.confettiParticles.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        let y = posAttr.getY(i) - delta * 4.5;
        if (y < -3) y = 14;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
    }

    // 9. Warning beacons
    this.warningBeacons.forEach(b => {
      b.rotation.y += delta * 4.0;
    });
  }

  public dispose() {
    this.groundColliders = [];
    this.triggerZones = [];
    this.movingPlatforms = [];
    this.fallingTiles = [];
    this.fireballs = [];
    this.rotatingLasers = [];
    this.fallingBlocks = [];
    this.temporaryTiles = [];
    this.station4Tiles = [];
    this.station4Barriers = [];
    this.signs = {};
  }
}
