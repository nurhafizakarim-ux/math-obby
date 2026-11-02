import React, { useState, useRef, useEffect } from 'react';

interface MobileControlsProps {
  onUpdateInput: (input: { x: number; y: number; jump: boolean; boost: boolean }) => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ onUpdateInput }) => {
  const [joystickActive, setJoystickActive] = useState(false);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });

  const baseRef = useRef<HTMLDivElement>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const vectorRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!baseRef.current) return;
    const touch = e.touches[0];
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    originRef.current = { x: centerX, y: centerY };
    setJoystickActive(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!joystickActive && e.type !== 'touchstart') return;
    const touch = e.touches[0];
    const dx = touch.clientX - originRef.current.x;
    const dy = touch.clientY - originRef.current.y;
    const maxRadius = 45;
    const distance = Math.hypot(dx, dy);

    let clampedX = dx;
    let clampedY = dy;
    if (distance > maxRadius) {
      clampedX = (dx / distance) * maxRadius;
      clampedY = (dy / distance) * maxRadius;
    }

    setStickPos({ x: clampedX, y: clampedY });
    vectorRef.current = {
      x: clampedX / maxRadius,
      y: clampedY / maxRadius
    };
    onUpdateInput({
      x: vectorRef.current.x,
      y: vectorRef.current.y,
      jump: false,
      boost: false
    });
  };

  const handleTouchEnd = () => {
    setJoystickActive(false);
    setStickPos({ x: 0, y: 0 });
    vectorRef.current = { x: 0, y: 0 };
    onUpdateInput({
      x: 0,
      y: 0,
      jump: false,
      boost: false
    });
  };

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  if (!isTouchDevice) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden select-none">
      {/* Virtual Joystick on Bottom-Left for 360-degree Movement */}
      <div
        ref={baseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="absolute bottom-6 left-6 w-32 h-32 rounded-full bg-slate-900/75 border-2 border-slate-600/80 pointer-events-auto flex items-center justify-center touch-none backdrop-blur-none shadow-2xl"
      >
        <div
          className="w-14 h-14 rounded-full bg-indigo-500/90 border-2 border-indigo-200 shadow-md transform pointer-events-none"
          style={{
            transform: `translate(${stickPos.x}px, ${stickPos.y}px)`
          }}
        />
      </div>
    </div>
  );
};
