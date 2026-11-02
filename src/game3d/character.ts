import * as THREE from 'three';

/**
 * Roblox-style blocky character procedural model & animation controller.
 * Parts:
 * 1. Head (with procedural smiley face texture)
 * 2. Hair / Cap visor accent
 * 3. Torso (bright obby shirt)
 * 4. Left Arm (shoulder pivot)
 * 5. Right Arm (shoulder pivot)
 * 6. Left Leg (hip pivot)
 * 7. Right Leg (hip pivot)
 * 8. Contact shadow mesh
 */
export class RobloxCharacter {
  public group: THREE.Group;
  public headMesh: THREE.Mesh;
  public torsoMesh: THREE.Mesh;
  public leftArmPivot: THREE.Group;
  public rightArmPivot: THREE.Group;
  public leftLegPivot: THREE.Group;
  public rightLegPivot: THREE.Group;
  public shadowMesh: THREE.Mesh;

  // Animation state
  private walkTime: number = 0;
  public isMoving: boolean = false;
  public isJumping: boolean = false;
  public jumpStrength: number = 0;
  public isShocked: boolean = false;
  private shockTimer: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Procedural face texture (happy blocky smile & eyes)
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 128;
    faceCanvas.height = 128;
    const ctx = faceCanvas.getContext('2d')!;
    ctx.fillStyle = '#FED7AA'; // skin tone
    ctx.fillRect(0, 0, 128, 128);

    // Eyes
    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.roundRect(30, 40, 16, 24, 6);
    ctx.roundRect(82, 40, 16, 24, 6);
    ctx.fill();

    // Eye catchlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(36, 46, 4, 0, Math.PI * 2);
    ctx.arc(88, 46, 4, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#1E293B';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(64, 76, 24, 0.2 * Math.PI, 0.8 * Math.PI, false);
    ctx.stroke();

    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xFED7AA,
      roughness: 0.6,
      metalness: 0.1
    });

    const faceMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.6,
      metalness: 0.1
    });

    // Materials for 6 faces of head box: [right, left, top, bottom, front, back]
    const headMaterials = [
      skinMat,
      skinMat,
      new THREE.MeshStandardMaterial({ color: 0x3B82F6, roughness: 0.5 }), // cap top
      skinMat,
      faceMat, // front face
      skinMat
    ];

    // 1. Head
    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    this.headMesh = new THREE.Mesh(headGeo, headMaterials);
    this.headMesh.position.y = 2.1;
    this.headMesh.castShadow = true;
    this.headMesh.receiveShadow = true;
    this.group.add(this.headMesh);

    // Cap Visor Accent
    const visorGeo = new THREE.BoxGeometry(0.84, 0.12, 0.35);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0x1D4ED8, roughness: 0.4 });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.28, 0.45);
    this.headMesh.add(visorMesh);

    // 2. Torso
    const torsoGeo = new THREE.BoxGeometry(1.0, 1.1, 0.55);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x2563EB, // bright blue shirt
      roughness: 0.5,
      metalness: 0.1
    });
    this.torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    this.torsoMesh.position.y = 1.25;
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;
    this.group.add(this.torsoMesh);

    // Torso math logo accent (golden badge)
    const badgeGeo = new THREE.BoxGeometry(0.4, 0.4, 0.05);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0xFBBF24,
      metalness: 0.8,
      roughness: 0.2
    });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.position.set(0, 0.1, 0.29);
    this.torsoMesh.add(badgeMesh);

    // 3. Arms with shoulder pivots
    const armGeo = new THREE.BoxGeometry(0.42, 1.0, 0.45);
    // Shift arm geometry down so pivot is at shoulder
    armGeo.translate(0, -0.45, 0);

    const armMat = new THREE.MeshStandardMaterial({
      color: 0x3B82F6,
      roughness: 0.6
    });

    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.73, 1.7, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, armMat);
    leftArmMesh.castShadow = true;
    this.leftArmPivot.add(leftArmMesh);
    this.group.add(this.leftArmPivot);

    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.73, 1.7, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, armMat);
    rightArmMesh.castShadow = true;
    this.rightArmPivot.add(rightArmMesh);
    this.group.add(this.rightArmPivot);

    // 4. Legs with hip pivots
    const legGeo = new THREE.BoxGeometry(0.46, 1.05, 0.48);
    // Shift leg geometry down so pivot is at hip
    legGeo.translate(0, -0.5, 0);

    const legMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B, // dark slate obby jeans
      roughness: 0.7
    });

    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.25, 0.95, 0);
    const leftLegMesh = new THREE.Mesh(legGeo, legMat);
    leftLegMesh.castShadow = true;
    this.leftLegPivot.add(leftLegMesh);
    this.group.add(this.leftLegPivot);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.25, 0.95, 0);
    const rightLegMesh = new THREE.Mesh(legGeo, legMat);
    rightLegMesh.castShadow = true;
    this.rightLegPivot.add(rightLegMesh);
    this.group.add(this.rightLegPivot);

    // 5. Contact shadow mesh (soft circular plane)
    const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.6
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.03;
    this.group.add(this.shadowMesh);
  }

  public triggerShock(duration: number = 1.3) {
    this.isShocked = true;
    this.shockTimer = duration;
  }

  public updateAnimation(delta: number, isMoving: boolean, inAir: boolean) {
    if (this.isShocked) {
      this.shockTimer -= delta;
      if (this.shockTimer <= 0) {
        this.isShocked = false;
        (this.torsoMesh.material as THREE.MeshStandardMaterial).emissive?.setHex(0x000000);
      } else {
        // Electric spasm shaking and lightning flash
        const flash = Math.sin(this.shockTimer * 45) > 0;
        (this.torsoMesh.material as THREE.MeshStandardMaterial).emissive?.setHex(flash ? 0xFACC15 : 0x000000);
        (this.torsoMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = flash ? 0.9 : 0;
        this.leftArmPivot.rotation.z = (Math.random() - 0.5) * 1.6;
        this.rightArmPivot.rotation.z = (Math.random() - 0.5) * 1.6;
        this.leftArmPivot.rotation.x = (Math.random() - 0.5) * 1.4;
        this.rightArmPivot.rotation.x = (Math.random() - 0.5) * 1.4;
        this.torsoMesh.position.x = (Math.random() - 0.5) * 0.15;
        this.headMesh.position.x = (Math.random() - 0.5) * 0.15;
        return;
      }
    } else {
      this.torsoMesh.position.x = 0;
      this.headMesh.position.x = 0;
      this.leftArmPivot.rotation.z = 0;
      this.rightArmPivot.rotation.z = 0;
    }

    if (inAir) {
      // Jumping pose: arms raised slightly upward and forward, legs trailing back
      this.leftArmPivot.rotation.x = THREE.MathUtils.damp(this.leftArmPivot.rotation.x, -2.4, 12, delta);
      this.rightArmPivot.rotation.x = THREE.MathUtils.damp(this.rightArmPivot.rotation.x, -2.4, 12, delta);
      this.leftLegPivot.rotation.x = THREE.MathUtils.damp(this.leftLegPivot.rotation.x, 0.4, 12, delta);
      this.rightLegPivot.rotation.x = THREE.MathUtils.damp(this.rightLegPivot.rotation.x, -0.3, 12, delta);
      this.torsoMesh.rotation.x = THREE.MathUtils.damp(this.torsoMesh.rotation.x, 0.15, 10, delta);
      this.headMesh.rotation.x = THREE.MathUtils.damp(this.headMesh.rotation.x, -0.2, 10, delta);
      return;
    }

    if (isMoving) {
      this.walkTime += delta * 12;
      const swing = Math.sin(this.walkTime);

      this.leftArmPivot.rotation.x = swing * 0.9;
      this.rightArmPivot.rotation.x = -swing * 0.9;
      this.leftLegPivot.rotation.x = -swing * 0.9;
      this.rightLegPivot.rotation.x = swing * 0.9;

      // Subtle torso bob & lean
      this.torsoMesh.position.y = 1.25 + Math.abs(Math.sin(this.walkTime * 2)) * 0.06;
      this.torsoMesh.rotation.y = swing * 0.08;
      this.torsoMesh.rotation.x = 0.1; // slight forward run lean
      this.headMesh.position.y = 2.1 + Math.abs(Math.sin(this.walkTime * 2)) * 0.06;
      this.headMesh.rotation.x = 0;
    } else {
      // Idle breathing
      this.walkTime += delta * 2;
      const breathe = Math.sin(this.walkTime) * 0.03;

      this.leftArmPivot.rotation.x = THREE.MathUtils.damp(this.leftArmPivot.rotation.x, 0.05, 8, delta);
      this.rightArmPivot.rotation.x = THREE.MathUtils.damp(this.rightArmPivot.rotation.x, 0.05, 8, delta);
      this.leftLegPivot.rotation.x = THREE.MathUtils.damp(this.leftLegPivot.rotation.x, 0, 8, delta);
      this.rightLegPivot.rotation.x = THREE.MathUtils.damp(this.rightLegPivot.rotation.x, 0, 8, delta);

      this.torsoMesh.position.y = 1.25 + breathe;
      this.torsoMesh.rotation.x = 0;
      this.torsoMesh.rotation.y = 0;
      this.headMesh.position.y = 2.1 + breathe;
      this.headMesh.rotation.x = 0;
    }
  }

  public dispose() {
    // Dispose materials and geometries
    this.group.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m: THREE.Material) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  }
}
