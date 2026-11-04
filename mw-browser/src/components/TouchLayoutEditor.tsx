import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IndividualTouchPositions, IndividualButtonPosition } from '../types';
import {
  Check,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Flame,
  CircleDot,
  Camera,
  Menu,
  Play,
  Maximize2,
} from 'lucide-react';

interface TouchLayoutEditorProps {
  initialPositions?: IndividualTouchPositions;
  onSave: (positions: IndividualTouchPositions) => void;
  onCancel: () => void;
  scale?: number;
  opacity?: number;
}

interface ButtonDef {
  id: keyof IndividualTouchPositions;
  name: string;
  icon: React.ReactNode;
  defaultPos: IndividualButtonPosition;
  color: string;
  bgColor: string;
  borderColor: string;
  width: number;
  height: number;
  label: string;
}

export const DEFAULT_POSITIONS: Record<keyof IndividualTouchPositions, IndividualButtonPosition> = {
  steerLeft: { x: 7, y: 80 },
  steerRight: { x: 18, y: 80 },
  accelerate: { x: 92, y: 74 },
  brake: { x: 81, y: 80 },
  nitrous: { x: 73, y: 64 },
  handbrake: { x: 82, y: 63 },
  speedbreaker: { x: 91, y: 22 },
  reset: { x: 14, y: 14 },
  camera: { x: 83, y: 14 },
  pause: { x: 5, y: 14 },
  enter: { x: 50, y: 14 },
};

export const TouchLayoutEditor: React.FC<TouchLayoutEditorProps> = ({
  initialPositions,
  onSave,
  onCancel,
  scale = 1.0,
  opacity = 0.9,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Screen measurement state
  const [displaySize, setDisplaySize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
    aspect: '16:9',
  });

  const [positions, setPositions] = useState<IndividualTouchPositions>(() => {
    return {
      ...DEFAULT_POSITIONS,
      ...(initialPositions || {}),
    };
  });

  const [activeDragId, setActiveDragId] = useState<keyof IndividualTouchPositions | null>(null);

  // Measure display on mount and resize
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspectVal = (w / h).toFixed(2);
      setDisplaySize({
        width: w,
        height: h,
        aspect: `${aspectVal}:1`,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const buttonDefs: ButtonDef[] = [
    {
      id: 'steerLeft',
      name: 'Steer Left',
      icon: <ArrowLeft size={30 * scale} />,
      defaultPos: DEFAULT_POSITIONS.steerLeft,
      color: '#fff',
      bgColor: 'rgba(25, 32, 48, 0.85)',
      borderColor: '#f59e0b',
      width: 76 * scale,
      height: 76 * scale,
      label: 'LEFT',
    },
    {
      id: 'steerRight',
      name: 'Steer Right',
      icon: <ArrowRight size={30 * scale} />,
      defaultPos: DEFAULT_POSITIONS.steerRight,
      color: '#fff',
      bgColor: 'rgba(25, 32, 48, 0.85)',
      borderColor: '#f59e0b',
      width: 76 * scale,
      height: 76 * scale,
      label: 'RIGHT',
    },
    {
      id: 'accelerate',
      name: 'Accelerate (Gas)',
      icon: <ArrowUp size={34 * scale} />,
      defaultPos: DEFAULT_POSITIONS.accelerate,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.22)',
      borderColor: '#10b981',
      width: 82 * scale,
      height: 96 * scale,
      label: 'GAS',
    },
    {
      id: 'brake',
      name: 'Brake / Reverse',
      icon: <ArrowDown size={30 * scale} />,
      defaultPos: DEFAULT_POSITIONS.brake,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.22)',
      borderColor: '#ef4444',
      width: 76 * scale,
      height: 76 * scale,
      label: 'BRAKE',
    },
    {
      id: 'nitrous',
      name: 'Nitrous (NOS)',
      icon: <Flame size={26 * scale} />,
      defaultPos: DEFAULT_POSITIONS.nitrous,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.22)',
      borderColor: '#06b6d4',
      width: 74 * scale,
      height: 64 * scale,
      label: 'NOS',
    },
    {
      id: 'handbrake',
      name: 'E-Brake / Drift',
      icon: <RotateCcw size={22 * scale} />,
      defaultPos: DEFAULT_POSITIONS.handbrake,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.2)',
      borderColor: '#f59e0b',
      width: 78 * scale,
      height: 64 * scale,
      label: 'E-BRAKE',
    },
    {
      id: 'speedbreaker',
      name: 'Speedbreaker',
      icon: <CircleDot size={20 * scale} />,
      defaultPos: DEFAULT_POSITIONS.speedbreaker,
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.2)',
      borderColor: '#eab308',
      width: 68 * scale,
      height: 48 * scale,
      label: 'SPEEDB',
    },
    {
      id: 'reset',
      name: 'Reset Car',
      icon: <RotateCcw size={15 * scale} />,
      defaultPos: DEFAULT_POSITIONS.reset,
      color: '#cbd5e1',
      bgColor: 'rgba(30, 41, 59, 0.85)',
      borderColor: '#475569',
      width: 64 * scale,
      height: 40 * scale,
      label: 'RESET',
    },
    {
      id: 'camera',
      name: 'Switch Camera',
      icon: <Camera size={15 * scale} />,
      defaultPos: DEFAULT_POSITIONS.camera,
      color: '#cbd5e1',
      bgColor: 'rgba(30, 41, 59, 0.85)',
      borderColor: '#475569',
      width: 64 * scale,
      height: 40 * scale,
      label: 'CAM',
    },
    {
      id: 'pause',
      name: 'Pause / Menu',
      icon: <Menu size={16 * scale} />,
      defaultPos: DEFAULT_POSITIONS.pause,
      color: '#f59e0b',
      bgColor: 'rgba(30, 41, 59, 0.85)',
      borderColor: '#f59e0b',
      width: 64 * scale,
      height: 40 * scale,
      label: 'ESC',
    },
    {
      id: 'enter',
      name: 'Enter / Skip',
      icon: <Play size={13 * scale} fill="#000" />,
      defaultPos: DEFAULT_POSITIONS.enter,
      color: '#000',
      bgColor: '#f59e0b',
      borderColor: '#fbbf24',
      width: 96 * scale,
      height: 40 * scale,
      label: 'ENTER',
    },
  ];

  // Drag handling
  const updatePosition = useCallback((id: keyof IndividualTouchPositions, clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Convert to percentage (clamped between 3% and 97%)
    const xPercent = Math.max(3, Math.min(97, Math.round((relX / rect.width) * 100)));
    const yPercent = Math.max(4, Math.min(96, Math.round((relY / rect.height) * 100)));

    setPositions((prev) => ({
      ...prev,
      [id]: { x: xPercent, y: yPercent },
    }));
  }, []);

  const handlePointerDown = (id: keyof IndividualTouchPositions, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDragId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragId) return;
    e.preventDefault();
    updatePosition(activeDragId, e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!activeDragId) return;
    e.preventDefault();
    setActiveDragId(null);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all button positions back to standard layout?')) {
      setPositions({ ...DEFAULT_POSITIONS });
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.35)), url('/images/nfsmw-racing-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar Header */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          right: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'auto',
          zIndex: 1000,
        }}
      >
        {/* Left: Measured Screen Dimensions Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(10, 14, 23, 0.9)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '24px',
            padding: '6px 16px',
            color: '#cbd5e1',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
          }}
        >
          <Maximize2 size={14} color="#f59e0b" />
          <span>
            Measured Display: <strong style={{ color: '#fff' }}>{displaySize.width} × {displaySize.height}</strong> ({displaySize.aspect}) • Drag any key to reposition
          </span>
        </div>

        {/* Center Top: Prominent Green Save Tick Button */}
        <button
          onClick={() => onSave(positions)}
          style={{
            position: 'absolute',
            left: '50%',
            top: '0',
            transform: 'translateX(-50%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: '2px solid #34d399',
            borderRadius: '28px',
            padding: '10px 28px',
            fontSize: '14px',
            fontWeight: 900,
            letterSpacing: '0.04em',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Save custom touch controls layout and return to controls page"
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={16} color="#059669" strokeWidth={3.5} />
          </div>
          <span>SAVE & APPLY LAYOUT</span>
        </button>

        {/* Right: Actions (Reset & Cancel) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleResetDefaults}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid #334155',
              borderRadius: '20px',
              padding: '6px 14px',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Reset all buttons to standard layout"
          >
            <RotateCcw size={13} />
            <span>Reset Layout</span>
          </button>

          <button
            onClick={onCancel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              borderRadius: '20px',
              padding: '6px 14px',
              color: '#fca5a5',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Center Instructional Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '72px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          color: 'rgba(255, 255, 255, 0.65)',
          fontSize: '12.5px',
          fontWeight: 600,
          textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px 16px',
          borderRadius: '12px',
          backdropFilter: 'blur(4px)',
        }}
      >
        👆 Tap and freely drag any button to your preferred location on screen. Press the green tick button at center top when finished.
      </div>

      {/* Render Every Single Individually Draggable Button */}
      {buttonDefs.map((btn) => {
        const pos = positions[btn.id] || btn.defaultPos;
        const isDragging = activeDragId === btn.id;

        return (
          <div
            key={btn.id}
            onPointerDown={(e) => handlePointerDown(btn.id, e)}
            style={{
              position: 'absolute',
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${btn.width}px`,
              height: `${btn.height}px`,
              background: btn.bgColor,
              border: `2px solid ${isDragging ? '#f59e0b' : btn.borderColor}`,
              borderRadius: '14px',
              color: btn.color,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              zIndex: isDragging ? 500 : 200,
              opacity: isDragging ? 1.0 : opacity,
              boxShadow: isDragging
                ? '0 0 24px rgba(245, 158, 11, 0.8), 0 8px 20px rgba(0, 0, 0, 0.8)'
                : '0 4px 12px rgba(0, 0, 0, 0.5)',
              transition: isDragging ? 'none' : 'box-shadow 0.15s ease',
            }}
          >
            {btn.icon}
            <span
              style={{
                fontSize: `${Math.max(9, 10 * scale)}px`,
                fontWeight: 900,
                marginTop: '2px',
                letterSpacing: '0.04em',
              }}
            >
              {btn.label}
            </span>

            {/* Live Coordinate Pill while dragging */}
            {isDragging && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-28px',
                  background: '#f59e0b',
                  color: '#000',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '10.5px',
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                }}
              >
                {btn.name}: {pos.x}%, {pos.y}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
