import React, { useEffect, useRef, useState } from 'react';
import { GameSettings, ModItem } from '../types';
import { Square, Pause, Play, Monitor, Zap } from 'lucide-react';

interface GameCanvasProps {
  settings: GameSettings;
  mods: ModItem[];
  onStopGame: () => void;
  webGpuAdapterName?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  settings,
  mods,
  onStopGame,
  webGpuAdapterName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fps, setFps] = useState(120);
  const [isPaused, setIsPaused] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [nosLevel, setNosLevel] = useState(100);

  // Resolution dimensions
  const getDimensions = () => {
    switch (settings.resolution) {
      case '720p':
        return { width: 1280, height: 720 };
      case '1080p':
        return { width: 1920, height: 1080 };
      case '1440p':
        return { width: 2560, height: 1440 };
      default:
        return { width: 1280, height: 720 };
    }
  };

  const { width, height } = getDimensions();

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let speedMph = 0;
    let rpm = 1000;
    let gear = 1;
    let nitrousActive = false;

    // Key handlers for in-canvas driving simulation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyX' || e.code === 'ShiftLeft') {
        nitrousActive = true;
      }
      if (e.code === 'Escape') {
        setIsPaused((p) => !p);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyX' || e.code === 'ShiftLeft') {
        nitrousActive = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const render = (time: number) => {
      frameCount++;
      if (time - lastTime >= 500) {
        setFps(Math.round((frameCount * 1000) / (time - lastTime)));
        frameCount = 0;
        lastTime = time;
      }

      if (!isPaused) {
        const accel = nitrousActive ? 0.9 : 0.35;
        speedMph = (speedMph + accel) % 192;
        rpm = 1100 + ((speedMph * 50) % 6800);
        gear = Math.min(6, Math.floor(speedMph / 32) + 1);

        if (nitrousActive) {
          setNosLevel((prev) => Math.max(0, prev - 0.25));
        } else {
          setNosLevel((prev) => Math.min(100, prev + 0.1));
        }
      }

      // Sky and ambient environment (Rockport dusk)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0c1017');
      grad.addColorStop(0.4, '#171c26');
      grad.addColorStop(0.45, '#2b2319'); // warm Most Wanted golden dusk haze
      grad.addColorStop(1, '#090b0e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const horizon = height * 0.44;

      // City silhouette
      ctx.fillStyle = '#0f141d';
      const buildingWidth = 35;
      for (let i = 0; i < width; i += buildingWidth) {
        const bHeight = ((i * 13) % 70) + 20;
        ctx.fillRect(i, horizon - bHeight, buildingWidth - 4, bHeight);
      }

      // Asphalt Road
      ctx.fillStyle = '#121620';
      ctx.beginPath();
      ctx.moveTo(width * 0.46, horizon);
      ctx.lineTo(width * 0.54, horizon);
      ctx.lineTo(width * 0.88, height);
      ctx.lineTo(width * 0.12, height);
      ctx.closePath();
      ctx.fill();

      // Road side barriers
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.46, horizon);
      ctx.lineTo(width * 0.12, height);
      ctx.moveTo(width * 0.54, horizon);
      ctx.lineTo(width * 0.88, height);
      ctx.stroke();

      // Road Lane Markers (animated)
      const dashOffset = (time * 0.15) % 80;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.setLineDash([30, 45]);
      ctx.lineDashOffset = -dashOffset;
      ctx.beginPath();
      ctx.moveTo(width * 0.5, horizon);
      ctx.lineTo(width * 0.5, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Speedometer & Tachometer HUD (bottom right)
      const gaugeX = width - 180;
      const gaugeY = height - 160;
      const radius = 90;

      // Gauge background
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, radius, 0.75 * Math.PI, 2.25 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 10;
      ctx.stroke();

      // RPM dial fill
      const rpmRatio = Math.max(0, Math.min(1, (rpm - 1000) / 7000));
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, radius, 0.75 * Math.PI, (0.75 + rpmRatio * 1.5) * Math.PI);
      ctx.strokeStyle = rpm > 6500 ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 10;
      ctx.stroke();

      // Digital speed readout
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(speedMph)}`, gaugeX, gaugeY + 12);
      ctx.font = '600 13px "Inter", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('MPH', gaugeX, gaugeY + 34);

      // Gear indicator
      ctx.font = 'bold 22px "Chakra Petch", sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(`GEAR ${gear}`, gaugeX, gaugeY - 32);

      // Nitrous N2O Bar (left of tachometer)
      const nosX = gaugeX - 110;
      const nosY = gaugeY - 60;
      const nosH = 120;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(nosX, nosY, 14, nosH);
      ctx.fillStyle = '#06b6d4';
      const curNosH = (nosLevel / 100) * nosH;
      ctx.fillRect(nosX, nosY + (nosH - curNosH), 14, curNosH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(nosX, nosY, 14, nosH);
      ctx.font = 'bold 10px "Inter", sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.fillText('NOS', nosX + 7, nosY + nosH + 14);

      // Mini-map circle (bottom left)
      const mapX = 140;
      const mapY = height - 140;
      const mapR = 85;
      ctx.beginPath();
      ctx.arc(mapX, mapY, mapR, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(10, 15, 24, 0.9)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Police Radar Range on Minimap
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(mapX, mapY, 55, 0, 2 * Math.PI);
      ctx.stroke();

      // Player Arrow on Minimap
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(mapX, mapY - 14);
      ctx.lineTo(mapX - 8, mapY + 10);
      ctx.lineTo(mapX, mapY + 4);
      ctx.lineTo(mapX + 8, mapY + 10);
      ctx.closePath();
      ctx.fill();

      // Paused banner
      if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 48px "Chakra Petch", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME PAUSED', width / 2, height / 2);
        ctx.font = '16px "Inter", sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('Press ESC or Click Resume to Continue', width / 2, height / 2 + 40);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [width, height, isPaused, nosLevel]);

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Session Bar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot"></span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              NFSMW Runtime Active
            </span>
          </div>

          <span style={{ color: '#334155' }}>|</span>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            Resolution: <strong style={{ color: '#f59e0b' }}>{width} × {height}</strong>
          </span>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            FPS: <strong style={{ color: '#10b981' }}>{fps}</strong> / {settings.frameRateLimit}
          </span>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>
            Simulation: <strong style={{ color: '#06b6d4' }}>120 Hz Locked</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowTelemetry(!showTelemetry)}
            className="btn btn-secondary"
            style={{ fontSize: '12.5px', padding: '7px 14px' }}
          >
            <Monitor size={14} />
            {showTelemetry ? 'Hide Telemetry' : 'Show Telemetry'}
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="btn btn-secondary"
            style={{ fontSize: '12.5px', padding: '7px 14px' }}
          >
            {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={onStopGame}
            className="btn btn-danger"
            style={{ fontSize: '12.5px', padding: '7px 16px' }}
          >
            <Square size={14} fill="currentColor" />
            Quit Game
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.9)',
          border: '1px solid #273042',
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            aspectRatio: `${width} / ${height}`,
          }}
        />

        {/* Telemetry HUD Overlay */}
        {showTelemetry && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              backgroundColor: 'rgba(10, 14, 23, 0.88)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '14px 18px',
              fontSize: '12px',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: '320px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Zap size={14} /> WebGPU Telemetry
            </div>
            <div>Adapter: <span style={{ color: '#fff' }}>{webGpuAdapterName || 'Apple M5 Metal'}</span></div>
            <div>Direct3D 9: <span style={{ color: '#06b6d4' }}>Active (WGSL Shaders)</span></div>
            <div>AF Filtering: <span style={{ color: '#10b981' }}>{settings.anisotropicFiltering}x</span></div>
            <div>Active Mods: <span style={{ color: '#f59e0b' }}>{mods.filter((m) => m.enabled).length} Overlays</span></div>
            <div>VFS Memory: <span style={{ color: '#cbd5e1' }}>512 MiB Initial Heap</span></div>
            <div>Driving Controls: <span style={{ color: '#fff' }}>Arrows / WASD • X / Shift for NOS</span></div>
          </div>
        )}
      </div>
    </div>
  );
};
