import * as THREE from 'three';

/**
 * Creates a procedural crisp canvas texture for 3D signs, gates, and platforms.
 */
export function createTextTexture(
  badge: string,
  text: string,
  bgColor: string = '#1E293B',
  accentColor: string = '#3B82F6',
  width: number = 512,
  height: number = 256
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Border & Accent Header
  ctx.lineWidth = 12;
  ctx.strokeStyle = accentColor;
  ctx.strokeRect(6, 6, width - 12, height - 12);

  // Badge pill (e.g. "A", "B", "C")
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.roundRect(width / 2 - 45, 20, 90, 55, 14);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px Fredoka, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge, width / 2, 48);

  // Main Option Text (wrapped if needed)
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 32px Fredoka, sans-serif';

  // Simple auto-fit font size if text is long
  if (text.length > 25) {
    ctx.font = 'bold 24px Fredoka, sans-serif';
  }

  // Multi-line wrap
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    if (ctx.measureText(testLine).width > width - 40 && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const startY = height / 2 + 30 - ((lines.length - 1) * 36) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * 36);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a bold, crisp procedural texture displaying ONLY the option label (A, B, or C)
 * for the answer-choice doors/portals without mathematics or full answer text.
 */
export function createOptionDoorTexture(
  badge: string,
  accentColor: string = '#0EA5E9',
  bgColor: string = '#0F172A',
  width: number = 512,
  height: number = 512
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Dark sleek background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Outer glowing neon border
  ctx.lineWidth = 18;
  ctx.strokeStyle = accentColor;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Inner accent border
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#FFFFFF';
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // High-visibility badge circular backdrop
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 160, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 12;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  // ONLY THE OPTION LETTER: A, B, or C (no math expressions or option text)
  // Huge, bold, un-mirrored readable letter
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 240px Fredoka, "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge, width / 2, height / 2 + 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates high-visibility procedural textures for Station 4 answer tiles (A, B, C).
 * Displays ONLY the large bold letter (no math equations or full answer text).
 * Supports states: 'NORMAL', 'CORRECT' (glowing green), and 'WRONG' (glowing red).
 */
export function createSurvivalTileTexture(
  badge: 'A' | 'B' | 'C',
  state: 'NORMAL' | 'CORRECT' | 'WRONG' = 'NORMAL'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const badgeColors: Record<string, string> = {
    'A': '#10B981', // Emerald Green
    'B': '#0EA5E9', // Sky Blue
    'C': '#8B5CF6'  // Electric Purple
  };

  let primaryColor = badgeColors[badge] || '#3B82F6';
  let bgColor = '#0F172A'; // Obsidian slate
  let titleBadge = `JUBIN ${badge}`;

  if (state === 'CORRECT') {
    primaryColor = '#22C55E'; // Vibrant Green
    bgColor = '#052E16';
    titleBadge = `BETUL ✓ (${badge})`;
  } else if (state === 'WRONG') {
    primaryColor = '#EF4444'; // Bright Red
    bgColor = '#450A0A';
    titleBadge = `SALAH ✗ (${badge})`;
  }

  // 1. Dark obsidian background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 512);

  // 2. Thick glowing neon outer border
  ctx.lineWidth = state === 'NORMAL' ? 16 : 24;
  ctx.strokeStyle = primaryColor;
  ctx.strokeRect(12, 12, 512 - 24, 512 - 24);

  // 3. Inner border
  ctx.lineWidth = 4;
  ctx.strokeStyle = state === 'NORMAL' ? 'rgba(255, 255, 255, 0.4)' : '#FFFFFF';
  ctx.strokeRect(32, 32, 512 - 64, 512 - 64);

  // 4. Large glowing circular emblem in center
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.arc(256, 256, 155, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 10;
  ctx.strokeStyle = '#FFFFFF';
  ctx.stroke();

  // 5. Huge bold letter: ONLY A, B, or C (no math or option text)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 240px Fredoka, "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 16;
  ctx.fillText(badge, 256, 264);
  ctx.shadowBlur = 0;

  // 6. Top status badge header
  ctx.fillStyle = primaryColor;
  ctx.beginPath();
  ctx.roundRect(146, 40, 220, 50, 14);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px Fredoka, sans-serif';
  ctx.fillText(titleBadge, 256, 68);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates checkerboard / grid texture for obby platforms
 */
export function createPlatformTexture(color1: string, color2: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = color2;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillRect(64, 64, 64, 64);

  // Border bevel
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 124, 124);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Industrial Caution Hazard Stripes (Yellow & Black diagonal 45° angle)
 */
export function createHazardStripeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#EAB308'; // Safety yellow
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#18181B'; // Dark charcoal
  const stripeW = 24;
  ctx.beginPath();
  for (let x = -128; x < 256; x += stripeW * 2) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeW, 0);
    ctx.lineTo(x + stripeW + 128, 128);
    ctx.lineTo(x + 128, 128);
    ctx.closePath();
  }
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Station 1: Futuristic Security Facility dark metallic panel texture with glowing cyan circuit lines
 */
export function createSecurityFacilityTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark gunmetal base
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, 256, 256);

  // Hexagonal / grid plating
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 120, 120);
  ctx.strokeRect(132, 4, 120, 120);
  ctx.strokeRect(4, 132, 120, 120);
  ctx.strokeRect(132, 132, 120, 120);

  // Cyan glowing circuit traces
  ctx.strokeStyle = '#06B6D4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 64);
  ctx.lineTo(80, 64);
  ctx.lineTo(100, 84);
  ctx.lineTo(100, 110);

  ctx.moveTo(150, 150);
  ctx.lineTo(180, 180);
  ctx.lineTo(230, 180);
  ctx.stroke();

  // Corner rivets
  ctx.fillStyle = '#38BDF8';
  [
    [10, 10], [118, 10], [10, 118], [118, 118],
    [138, 10], [246, 10], [138, 118], [246, 118],
    [10, 138], [118, 138], [10, 246], [118, 246],
    [138, 138], [246, 138], [138, 246], [246, 246]
  ].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Station 1: Laser Barrier grid texture (vertical energy beams & scanner lines)
 */
export function createLaserBarrierTexture(color: string = '#EF4444'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, 128, 256);

  // Vertical laser beam lines
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  for (let x = 16; x < 128; x += 24) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }

  // Horizontal scan pulses
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.lineTo(128, 60);
  ctx.moveTo(0, 190);
  ctx.lineTo(128, 190);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Station 2: Construction Steel Beam & Concrete texture with rivets
 */
export function createConstructionSteelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Weathered industrial orange steel
  ctx.fillStyle = '#C2410C'; // Rust orange
  ctx.fillRect(0, 0, 256, 256);

  // Dark steel girder flanges
  ctx.fillStyle = '#9A3412';
  ctx.fillRect(0, 0, 32, 256);
  ctx.fillRect(224, 0, 32, 256);

  // Center structural panel
  ctx.fillStyle = '#EA580C';
  ctx.fillRect(40, 20, 176, 216);

  // Heavy steel bolt rivets
  ctx.fillStyle = '#292524';
  for (let y = 16; y < 256; y += 32) {
    ctx.beginPath();
    ctx.arc(16, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(240, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Station 3: Industrial Diamond Plate Steel floor texture
 */
export function createDiamondPlateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#334155'; // Slate metal
  ctx.fillRect(0, 0, 128, 128);

  // Embossed diamond treads
  ctx.fillStyle = '#64748B';
  const drawDiamond = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  for (let x = 16; x < 128; x += 32) {
    for (let y = 16; y < 128; y += 32) {
      drawDiamond(x, y, Math.PI / 4);
      drawDiamond(x + 16, y + 16, -Math.PI / 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Station 3: Moving Conveyor Belt texture with directional motion chevrons
 */
export function createConveyorBeltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Dark vulcanized rubber
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, 128, 128);

  // Steel safety rails on edges
  ctx.fillStyle = '#F59E0B'; // Amber hazard edge
  ctx.fillRect(0, 0, 10, 128);
  ctx.fillRect(118, 0, 10, 128);

  // Directional Chevrons pointing forward
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let y = 16; y < 128; y += 36) {
    ctx.beginPath();
    ctx.moveTo(34, y + 16);
    ctx.lineTo(64, y);
    ctx.lineTo(94, y + 16);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Station 4: Molten Magma / Lava Texture with fiery glowing cracks
 */
export function createLavaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Intense volcanic red-orange base
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, '#DC2626');
  grad.addColorStop(0.5, '#EA580C');
  grad.addColorStop(1, '#B91C1C');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Fiery yellow-hot glowing magma rivers & fractures
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 7;
  ctx.shadowColor = '#FBBF24';
  ctx.shadowBlur = 18;

  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.quadraticCurveTo(80, 100, 160, 60);
  ctx.quadraticCurveTo(220, 40, 256, 120);

  ctx.moveTo(60, 256);
  ctx.quadraticCurveTo(120, 180, 180, 220);
  ctx.quadraticCurveTo(210, 240, 256, 200);

  ctx.moveTo(110, 80);
  ctx.lineTo(130, 180);
  ctx.stroke();

  // Cooling black volcanic obsidian crust islands
  ctx.fillStyle = '#18181B';
  ctx.shadowBlur = 0;
  [
    [40, 40, 24], [180, 30, 28], [50, 190, 32],
    [210, 170, 30], [130, 130, 22], [90, 110, 18]
  ].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Station 4: Cracked Obsidian rock platform texture with glowing magma veins
 */
export function createCrackedObsidianTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark obsidian charcoal
  ctx.fillStyle = '#1C1917';
  ctx.fillRect(0, 0, 256, 256);

  // Basalt block borders
  ctx.strokeStyle = '#44403C';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 244, 244);
  ctx.strokeRect(12, 12, 110, 110);
  ctx.strokeRect(134, 12, 110, 110);
  ctx.strokeRect(12, 134, 110, 110);
  ctx.strokeRect(134, 134, 110, 110);

  // Glowing red-orange lava veins through cracks
  ctx.strokeStyle = '#F97316';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#EF4444';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(20, 20);
  ctx.lineTo(120, 120);
  ctx.lineTo(230, 80);
  ctx.moveTo(134, 140);
  ctx.lineTo(240, 240);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
