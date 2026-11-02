import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RobloxCharacter } from './character';
import { WorldManager } from './world';
import { Question } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface GameCanvasProps {
  questions: Question[];
  currentQuestionIndex: number;
  isPaused: boolean;
  raceStarted?: boolean;
  teleportTarget: THREE.Vector3 | null;
  isShocking?: boolean;
  externalBoost?: boolean;
  externalJump?: boolean;
  onStartGatePassed: () => void;
  onSpIslandReached?: (spCode: string) => void;
  onAnswerSelected: (optionIndex: number) => void;
  onFinishReached: () => void;
  onFallRespawn: () => void;
  onHazardCollision?: (hazardType: string, station: string) => void;
  onBridgeCompleted?: (qIndex: number) => void;
  touchInput?: { x: number; y: number; jump: boolean; boost: boolean };
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  questions,
  currentQuestionIndex,
  isPaused,
  raceStarted = false,
  teleportTarget,
  isShocking = false,
  externalBoost = false,
  externalJump = false,
  onStartGatePassed,
  onSpIslandReached,
  onAnswerSelected,
  onFinishReached,
  onFallRespawn,
  onHazardCollision,
  onBridgeCompleted,
  touchInput
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const questionsRef = useRef<Question[]>(questions);
  questionsRef.current = questions;

  const currentQIndexRef = useRef<number>(currentQuestionIndex);
  currentQIndexRef.current = currentQuestionIndex;

  const isPausedRef = useRef<boolean>(isPaused);
  isPausedRef.current = isPaused;

  const onStartGateRef = useRef(onStartGatePassed);
  onStartGateRef.current = onStartGatePassed;

  const onSpIslandRef = useRef(onSpIslandReached);
  onSpIslandRef.current = onSpIslandReached;

  const onAnswerRef = useRef(onAnswerSelected);
  onAnswerRef.current = onAnswerSelected;

  const onFinishRef = useRef(onFinishReached);
  onFinishRef.current = onFinishReached;

  const onBridgeCompletedRef = useRef(onBridgeCompleted);
  onBridgeCompletedRef.current = onBridgeCompleted;

  const onFallRef = useRef(onFallRespawn);
  onFallRef.current = onFallRespawn;

  const onHazardRef = useRef(onHazardCollision);
  onHazardRef.current = onHazardCollision;

  const touchInputRef = useRef(touchInput);
  touchInputRef.current = touchInput;

  const externalBoostRef = useRef(externalBoost);
  externalBoostRef.current = externalBoost;

  const externalJumpRef = useRef(externalJump);
  externalJumpRef.current = externalJump;

  const worldManagerRef = useRef<WorldManager | null>(null);
  const characterRef = useRef<RobloxCharacter | null>(null);

  // Spawn position directly at runway facing Question 1 (Z = 6)
  const playerPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 6));
  const playerVelYRef = useRef<number>(0);
  const isGroundedRef = useRef<boolean>(true);
  const isAnsweringLockRef = useRef<boolean>(false);
  const prevBoostRef = useRef<boolean>(false);
  const startGatePassedOnceRef = useRef<boolean>(raceStarted);

  useEffect(() => {
    if (!raceStarted) {
      startGatePassedOnceRef.current = false;
      isAnsweringLockRef.current = false;
      if (worldManagerRef.current) {
        worldManagerRef.current.resetGame();
      }
    }
  }, [raceStarted]);

  useEffect(() => {
    // Reset answering lock whenever question index changes
    isAnsweringLockRef.current = false;
  }, [currentQuestionIndex]);

  useEffect(() => {
    // When fresh questions are provided (new session), reset world & locks
    isAnsweringLockRef.current = false;
    if (worldManagerRef.current) {
      worldManagerRef.current.resetGame();
      worldManagerRef.current.updateQuestionSigns(questions);
    }
  }, [questions]);

  // Teleport listener
  useEffect(() => {
    if (teleportTarget) {
      playerPosRef.current.copy(teleportTarget);
      playerVelYRef.current = 0;
      isGroundedRef.current = true;
      isAnsweringLockRef.current = false;
      if (worldManagerRef.current) {
        worldManagerRef.current.resetGame();
      }
    }
  }, [teleportTarget]);

  // Electric shock trigger
  useEffect(() => {
    if (isShocking && characterRef.current) {
      characterRef.current.triggerShock(1.4);
      soundManager.playShock();
    }
  }, [isShocking]);

  // Setup Three.js scene once on mount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Scene & Camera setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      600
    );
    camera.position.set(0, 5, -24);

    // 4. Procedural RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. World Manager
    const worldManager = new WorldManager(scene);
    worldManagerRef.current = worldManager;
    worldManager.updateQuestionSigns(questionsRef.current);

    // 6. Character
    const character = new RobloxCharacter();
    character.group.position.copy(playerPosRef.current);
    scene.add(character.group);
    characterRef.current = character;

    // 7. Input listeners
    const keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      boost: false
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.forward = true;
      if (code === 'KeyS' || code === 'ArrowDown') keys.backward = true;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') keys.right = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyB' || code === 'KeyE') {
        if (!keys.boost) {
          soundManager.playBoost();
        }
        keys.boost = true;
      }
      if (code === 'Space') {
        if (!keys.jump && isGroundedRef.current) {
          playerVelYRef.current = keys.boost ? 11.2 : 10.0;
          isGroundedRef.current = false;
          soundManager.playJump();
        }
        keys.jump = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') keys.forward = false;
      if (code === 'KeyS' || code === 'ArrowDown') keys.backward = false;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') keys.right = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyB' || code === 'KeyE') keys.boost = false;
      if (code === 'Space') keys.jump = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 8. Animation Loop
    let lastTime = performance.now();
    let frameId = 0;
    const playerBox = new THREE.Box3();
    const cameraTarget = new THREE.Vector3();
    const cameraIdealOffset = new THREE.Vector3();

    function tick() {
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const delta = Math.min(rawDt, 0.05);

      if (!isPausedRef.current) {
        const touch = touchInputRef.current;
        let moveX = 0;
        let moveZ = 0;

        if (keys.forward) moveZ += 1;
        if (keys.backward) moveZ -= 1;
        // Direction fix: looking along +Z, +X is screen LEFT, -X is screen RIGHT!
        if (keys.left) moveX += 1;
        if (keys.right) moveX -= 1;

        const isBoosted = keys.boost || !!touch?.boost || !!externalBoostRef.current;

        // Sound trigger for touch / external boost
        if ((touch?.boost || externalBoostRef.current) && !prevBoostRef.current) {
          soundManager.playBoost();
        }
        prevBoostRef.current = !!touch?.boost || !!externalBoostRef.current;

        // External jump or touch jump
        const isJumpingInput = keys.jump || !!touch?.jump || !!externalJumpRef.current;
        if (isJumpingInput && isGroundedRef.current && !keys.jump) {
          playerVelYRef.current = isBoosted ? 11.2 : 10.0;
          isGroundedRef.current = false;
          soundManager.playJump();
        }

        if (touch) {
          if (Math.abs(touch.x) > 0.1) moveX += -touch.x;
          if (Math.abs(touch.y) > 0.1) moveZ += -touch.y;
        }

        const isMoving = Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05;
        const speed = isBoosted ? 17.5 : 10.5;

        // Dynamic FOV for speed sensation
        const targetFov = isBoosted && isMoving ? 68 : 60;
        camera.fov = THREE.MathUtils.damp(camera.fov, targetFov, 8, delta);
        camera.updateProjectionMatrix();

        if (isMoving) {
          const moveDir = new THREE.Vector2(moveX, moveZ).normalize();
          playerPosRef.current.x += moveDir.x * speed * delta;
          playerPosRef.current.z += moveDir.y * speed * delta;

          const targetAngle = Math.atan2(moveDir.x, moveDir.y);
          character.group.rotation.y = THREE.MathUtils.damp(
            character.group.rotation.y,
            targetAngle,
            16,
            delta
          );
        }

        // Apply Gravity
        const gravity = -24.0;
        playerVelYRef.current += gravity * delta;
        playerPosRef.current.y += playerVelYRef.current * delta;

        // Ground Collision
        playerBox.min.set(
          playerPosRef.current.x - 0.45,
          playerPosRef.current.y,
          playerPosRef.current.z - 0.35
        );
        playerBox.max.set(
          playerPosRef.current.x + 0.45,
          playerPosRef.current.y + 2.2,
          playerPosRef.current.z + 0.35
        );

        let groundedThisFrame = false;
        for (const col of worldManager.groundColliders) {
          if (playerBox.intersectsBox(col.box)) {
            const topY = col.box.max.y;
            if (playerPosRef.current.y >= topY - 0.45 && playerVelYRef.current <= 0) {
              playerPosRef.current.y = topY;
              playerVelYRef.current = 0;
              groundedThisFrame = true;
              break;
            } else if (playerPosRef.current.y < topY - 0.45) {
              const center = new THREE.Vector3();
              col.box.getCenter(center);
              if (playerPosRef.current.z < center.z) {
                playerPosRef.current.z = col.box.min.z - 0.4;
              } else {
                playerPosRef.current.z = col.box.max.z + 0.4;
              }
            }
          }
        }
        isGroundedRef.current = groundedThisFrame;

        // Physical Fall Detection: Respawn to the current SP starting checkpoint
        // If falling into molten lava in Station 4 (Z >= 700, Y < -5.5), respawn immediately
        const isLavaFall = playerPosRef.current.z >= 700 && playerPosRef.current.y < -5.5;
        if (playerPosRef.current.y < -14.0 || isLavaFall) {
          const qIdx = currentQIndexRef.current;
          let spCode = 'SP 4.4.1';
          let cp = worldManager.spCheckpoints['SP 4.4.1'] || new THREE.Vector3(0, 1.2, 6);
          if (qIdx >= 12 || playerPosRef.current.z >= 720) {
            spCode = 'SP 4.4.4';
            cp = worldManager.spCheckpoints['SP 4.4.4'] || new THREE.Vector3(0, 1.2, 730);
          } else if (qIdx >= 8 || playerPosRef.current.z >= 470) {
            spCode = 'SP 4.4.3';
            cp = worldManager.spCheckpoints['SP 4.4.3'] || new THREE.Vector3(0, 1.2, 482);
          } else if (qIdx >= 4 || playerPosRef.current.z >= 230) {
            spCode = 'SP 4.4.2';
            cp = worldManager.spCheckpoints['SP 4.4.2'] || new THREE.Vector3(0, 1.2, 242);
          }
          playerPosRef.current.set(cp.x, cp.y + 0.5, cp.z);
          playerVelYRef.current = 0;
          isGroundedRef.current = true;
          worldManager.resetStationObstacles(spCode);
          onFallRef.current();
        }

        character.group.position.copy(playerPosRef.current);
        character.updateAnimation(delta * (isBoosted ? 1.4 : 1.0), isMoving, !isGroundedRef.current);

        worldManager.update(delta, now / 1000);
        worldManager.updateTemporaryTiles(playerBox, delta);

        // Physical Hazard Collisions (Fireballs, Lasers, Falling Ceiling Blocks)
        const hitHazard = worldManager.checkHazardCollisions(playerBox);
        if (hitHazard && onHazardRef.current) {
          onHazardRef.current(hitHazard.type, hitHazard.station);
        }

        // Position-based safety fallback for SP islands
        const curZ = playerPosRef.current.z;
        const qIdx = currentQIndexRef.current;
        if (qIdx >= 4 && qIdx < 8 && curZ >= 235) {
          onSpIslandRef.current?.('SP 4.4.2');
        } else if (qIdx >= 8 && qIdx < 12 && curZ >= 470) {
          onSpIslandRef.current?.('SP 4.4.3');
        } else if (qIdx >= 12 && curZ >= 720) {
          onSpIslandRef.current?.('SP 4.4.4');
        }

        // Check Triggers
        for (const trigger of worldManager.triggerZones) {
          if (trigger.box.intersectsBox(playerBox)) {
            // Check Start Gate
            if (trigger.label === 'START_GATE') {
              if (!startGatePassedOnceRef.current) {
                startGatePassedOnceRef.current = true;
                onStartGateRef.current();
              }
              break;
            }

            // Check SP Island Checkpoints (SP 2, SP 3, SP 4 start islands)
            if (trigger.label.startsWith('SP_START_')) {
              if (onSpIslandRef.current) {
                onSpIslandRef.current(trigger.spCode);
              }
              break;
            }

            // Check Finish Line
            if (trigger.type === 'FINISH') {
              if (currentQIndexRef.current >= 15) {
                isAnsweringLockRef.current = true;
                worldManager.showVictory();
                onFinishRef.current();
              }
              break;
            }

            // Check Landing Island across Crumbling Bridge in Station 4
            if (trigger.label.startsWith('STATION4_LANDING_')) {
              if (onBridgeCompletedRef.current) {
                onBridgeCompletedRef.current(trigger.questionGlobalIndex);
              }
              break;
            }

            // Ignore any other checkpoints for answer processing
            if (trigger.type === 'CHECKPOINT') {
              break;
            }

            // Answer trigger for current question (Gate in SP 1, Floor Tile in SP 2/3/4)
            if (
              !isAnsweringLockRef.current &&
              (trigger.type === 'GATE' || trigger.type === 'FLOOR') &&
              trigger.questionGlobalIndex === currentQIndexRef.current
            ) {
              // Reliable Station 4 answer detection: triggers immediately when player lands/steps on the tile
              if (trigger.spCode === 'SP 4.4.4') {
                if (playerPosRef.current.y < -0.3) {
                  continue;
                }
              } else if (trigger.type === 'FLOOR' && !isGroundedRef.current) {
                continue;
              }

              // Lock selection immediately until feedback concludes
              isAnsweringLockRef.current = true;
              const currentQ = questionsRef.current[trigger.questionGlobalIndex];
              if (currentQ) {
                const isCorrect = trigger.optionIndex === currentQ.correctIndex;
                if (trigger.spCode === 'SP 4.4.4') {
                  worldManager.highlightStation4Answer(
                    trigger.questionGlobalIndex,
                    trigger.optionIndex,
                    currentQ.correctIndex,
                    isCorrect
                  );
                  if (isCorrect) {
                    worldManager.unlockStation4Bridge(trigger.questionGlobalIndex);
                  }
                }
              }
              onAnswerRef.current(trigger.optionIndex);
              break;
            }
          }
        }

        // Camera Follow with smooth exponential damping
        cameraIdealOffset.set(
          playerPosRef.current.x,
          playerPosRef.current.y + 4.2,
          playerPosRef.current.z - 6.5
        );
        camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraIdealOffset.x, 10, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraIdealOffset.y, 10, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraIdealOffset.z, 10, delta);

        cameraTarget.set(
          playerPosRef.current.x,
          playerPosRef.current.y + 1.8,
          playerPosRef.current.z + 4.0
        );
        camera.lookAt(cameraTarget);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      character.dispose();
      worldManager.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update signage whenever questions array updates
  useEffect(() => {
    if (worldManagerRef.current && questions.length > 0) {
      worldManagerRef.current.updateQuestionSigns(questions);
    }
  }, [questions]);


  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none bg-sky-300"
      tabIndex={0}
    />
  );
};
