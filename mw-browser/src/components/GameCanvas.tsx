import React, { useEffect, useRef, useState } from 'react';
import { GameSettings, ModItem, VehicleTelemetry, LobbyRoom } from '../types';
import { Square, Pause, Play, Monitor, Zap, Eye } from 'lucide-react';
import { MultiplayerService } from '../services/multiplayer';

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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [activeView, setActiveView] = useState<'engine' | 'cockpit'>('engine');
  const [fps, setFps] = useState(120);
  const [isPaused, setIsPaused] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [nosLevel, setNosLevel] = useState(100);
  const [currentRoom, setCurrentRoom] = useState<LobbyRoom | null>(MultiplayerService.getCurrentRoom());
  const [remoteRivals, setRemoteRivals] = useState<VehicleTelemetry[]>([]);

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

  // Subscribe to multiplayer telemetry
  useEffect(() => {
    const unsubRoom = MultiplayerService.subscribeRoom(setCurrentRoom);
    const unsubTelemetry = MultiplayerService.subscribeTelemetry(setRemoteRivals);
    return () => {
      unsubRoom();
      unsubTelemetry();
    };
  }, []);

  // Cockpit simulator loop when in cockpit view
  useEffect(() => {
    if (activeView !== 'cockpit') return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let speedMph = 85;
    let rpm = 3200;
    let gear = 4;
    let nitrousActive = false;
    let roadCurve = 0;
    let steerX = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyX' || e.code === 'ShiftLeft') nitrousActive = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') steerX = -1;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') steerX = 1;
      if (e.code === 'Escape') setIsPaused((p) => !p);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyX' || e.code === 'ShiftLeft') nitrousActive = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft' || e.code === 'KeyD' || e.code === 'ArrowRight') steerX = 0;
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
        const accel = nitrousActive ? 0.95 : 0.35;
        speedMph = Math.min(206, speedMph + accel * (speedMph < 190 ? 1 : 0.2));
        rpm = 2500 + ((speedMph * 48) % 5500);
        gear = Math.min(6, Math.floor(speedMph / 32) + 1);

        if (nitrousActive) setNosLevel((p) => Math.max(0, p - 0.25));
        else setNosLevel((p) => Math.min(100, p + 0.12));

        roadCurve = Math.sin(time * 0.001) * 60;

        // Broadcast local telemetry to multiplayer peers
        MultiplayerService.sendTelemetry({
          speedMph: Math.round(speedMph),
          rpm: Math.round(rpm),
          gear,
          nitroActive: nitrousActive,
          position: { x: steerX * 30, y: 0, z: time * 0.1 },
        });
      }

      // Sky and ambient environment (Rockport dusk)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#0c1017');
      grad.addColorStop(0.4, '#171c26');
      grad.addColorStop(0.45, '#2b2319');
      grad.addColorStop(1, '#090b0e');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const horizon = height * 0.44;

      // City skyline silhouette
      ctx.fillStyle = '#0f141d';
      for (let i = 0; i < width; i += 60) {
        const h = 40 + Math.sin(i * 0.05) * 35;
        ctx.fillRect(i, horizon - h, 50, h);
      }

      // Ground (Rockport highway asphalt)
      ctx.fillStyle = '#14171f';
      ctx.fillRect(0, horizon, width, height - horizon);

      // Road perspective trapezoid
      const roadTopW = 120;
      const roadBotW = width * 0.92;
      const roadCenterX = width * 0.5 + roadCurve;

      ctx.fillStyle = '#1e2430';
      ctx.beginPath();
      ctx.moveTo(roadCenterX - roadTopW / 2, horizon);
      ctx.lineTo(roadCenterX + roadTopW / 2, horizon);
      ctx.lineTo(width * 0.5 + roadBotW / 2, height);
      ctx.lineTo(width * 0.5 - roadBotW / 2, height);
      ctx.closePath();
      ctx.fill();

      // Road borders & curbs
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(roadCenterX - roadTopW / 2, horizon);
      ctx.lineTo(width * 0.5 - roadBotW / 2, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(roadCenterX + roadTopW / 2, horizon);
      ctx.lineTo(width * 0.5 + roadBotW / 2, height);
      ctx.stroke();

      // Moving road dashed center lines
      const dashOffset = (time * (speedMph * 0.05)) % 60;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.setLineDash([30, 45]);
      ctx.lineDashOffset = -dashOffset;
      ctx.beginPath();
      ctx.moveTo(roadCenterX, horizon);
      ctx.lineTo(width * 0.5, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // --- RENDER REMOTE MULTIPLAYER RIVALS ON ROAD ---
      remoteRivals.forEach((rival, idx) => {
        // Perspective distance calculation
        const rivalDistance = 180 + idx * 120 - ((time * 0.02) % 100);
        const scale = Math.max(0.15, Math.min(1.0, 300 / rivalDistance));
        const rx = width * 0.5 + (rival.position.x || 0) * scale * 12 + (idx % 2 === 0 ? -120 : 110) * scale;
        const ry = horizon + (height - horizon) * (1 - scale * 0.85);

        if (ry > horizon && ry < height - 60) {
          const carW = 140 * scale;
          const carH = 50 * scale;

          // Rival Car Body Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.beginPath();
          ctx.ellipse(rx, ry + carH * 0.9, carW * 0.7, carH * 0.25, 0, 0, Math.PI * 2);
          ctx.fill();

          // Rival Car Body
          ctx.fillStyle = rival.paintColor || '#38bdf8';
          ctx.fillRect(rx - carW / 2, ry, carW, carH);

          // Rear Window & Roof
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(rx - carW * 0.35, ry - carH * 0.45, carW * 0.7, carH * 0.45);

          // Taillights
          ctx.fillStyle = rival.nitroActive ? '#38bdf8' : '#ef4444';
          ctx.shadowColor = rival.nitroActive ? '#06b6d4' : '#ef4444';
          ctx.shadowBlur = rival.nitroActive ? 18 : 10;
          ctx.fillRect(rx - carW * 0.45, ry + carH * 0.2, carW * 0.25, carH * 0.3);
          ctx.fillRect(rx + carW * 0.2, ry + carH * 0.2, carW * 0.25, carH * 0.3);
          ctx.shadowBlur = 0;

          // Rival Callsign Tag Floating Above
          ctx.font = `bold ${Math.max(10, Math.round(13 * scale))}px "Chakra Petch", sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(`${rival.callsign} [${rival.speedMph} MPH]`, rx, ry - carH * 0.65);
        }
      });

      // --- MULTIPLAYER RACE POSITION HUD (TOP CENTER) ---
      if (currentRoom) {
        ctx.fillStyle = 'rgba(10, 14, 23, 0.85)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        const hudW = 420;
        const hudH = 48;
        const hudX = width * 0.5 - hudW / 2;
        const hudY = 20;

        ctx.beginPath();
        ctx.roundRect(hudX, hudY, hudW, hudH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 16px "Chakra Petch", sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.textAlign = 'left';
        ctx.fillText(`POS 1 / ${currentRoom.players.length || 4}`, hudX + 18, hudY + 30);

        ctx.font = '600 13px "Inter", sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${currentRoom.trackName}`, hudX + 110, hudY + 30);

        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'right';
        ctx.fillText('-0.42s GAP', hudX + hudW - 18, hudY + 30);
      }

      // --- SPEEDOMETER & TACHOMETER HUD ---
      const gaugeX = width - 180;
      const gaugeY = height - 160;
      const radius = 90;

      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, radius, 0.75 * Math.PI, 2.25 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 10;
      ctx.stroke();

      const rpmRatio = Math.max(0, Math.min(1, (rpm - 1000) / 7000));
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, radius, 0.75 * Math.PI, (0.75 + rpmRatio * 1.5) * Math.PI);
      ctx.strokeStyle = rpm > 6500 ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 10;
      ctx.stroke();

      // Digital speed
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.floor(speedMph)}`, gaugeX, gaugeY + 12);
      ctx.font = '600 13px "Inter", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('MPH', gaugeX, gaugeY + 34);

      // Gear indicator
      ctx.font = 'bold 22px "Chakra Petch", sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(`GEAR ${gear}`, gaugeX, gaugeY - 32);

      // Nitrous N2O Bar
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

      // Mini-map circle & Rivals
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

      // Player Blip (Amber arrow)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(mapX, mapY - 14);
      ctx.lineTo(mapX - 8, mapY + 10);
      ctx.lineTo(mapX, mapY + 4);
      ctx.lineTo(mapX + 8, mapY + 10);
      ctx.closePath();
      ctx.fill();

      // Rival Blips on minimap
      remoteRivals.forEach((rival, idx) => {
        const offsetAng = (idx + 1) * 0.9 + time * 0.001;
        const bx = mapX + Math.sin(offsetAng) * 45;
        const by = mapY + Math.cos(offsetAng) * 45;
        ctx.fillStyle = rival.paintColor || '#06b6d4';
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 48px "Chakra Petch", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME PAUSED', width / 2, height / 2);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeView, height, width, isPaused, nosLevel, remoteRivals, currentRoom]);

  return (
    <div
      style={{
        padding: '16px 28px',
        maxWidth: '1600px',
        margin: '0 auto',
      }}
    >
      {/* Session Toolbar */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot"></span>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>
              NFSMW RUNTIME ACTIVE
            </span>
          </div>

          <div style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', gap: '14px' }}>
            <span>
              Resolution: <strong style={{ color: '#fff' }}>{width}×{height}</strong>
            </span>
            <span>
              FPS: <strong style={{ color: '#10b981' }}>{fps}</strong> / {settings.frameRateLimit}
            </span>
            <span>
              Simulation: <strong style={{ color: '#06b6d4' }}>120 Hz Fixed</strong>
            </span>
            {currentRoom && (
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                🏁 Online Grid: {currentRoom.players.length} Racers
              </span>
            )}
          </div>
        </div>

        {/* View Switcher & Session Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setActiveView('engine')}
              className={`btn ${activeView === 'engine' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              <Monitor size={14} /> WebGPU Engine
            </button>
            <button
              onClick={() => setActiveView('cockpit')}
              className={`btn ${activeView === 'cockpit' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              <Zap size={14} /> Cockpit Simulator
            </button>
          </div>

          <button
            onClick={() => setShowTelemetry((v) => !v)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Eye size={14} /> {showTelemetry ? 'Hide Telemetry' : 'Show Telemetry'}
          </button>

          <button
            onClick={() => setIsPaused((p) => !p)}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button
            onClick={onStopGame}
            className="btn btn-danger"
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            <Square size={14} fill="currentColor" /> Quit Game
          </button>
        </div>
      </div>

      {/* Main Game Viewport */}
      <div
        style={{
          position: 'relative',
          backgroundColor: '#000',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.9)',
          border: '1px solid #273042',
          minHeight: '640px',
          height: '75vh',
        }}
      >
        {activeView === 'engine' ? (
          <iframe
            ref={iframeRef}
            src="/nfsmw/runtime.html"
            title="Need for Speed Most Wanted WebGPU Engine"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
              backgroundColor: '#000',
            }}
            allow="cross-origin-isolated; autoplay; gamepad; fullscreen"
          />
        ) : (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        )}

        {/* Telemetry HUD Overlay */}
        {showTelemetry && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              backgroundColor: 'rgba(10, 14, 23, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '14px 18px',
              fontSize: '12px',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: '320px',
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Zap size={14} /> WebGPU Telemetry
            </div>
            <div>Adapter: <span style={{ color: '#fff' }}>{webGpuAdapterName || 'Apple M5 Metal'}</span></div>
            <div>Direct3D 9: <span style={{ color: '#06b6d4' }}>Active (WGSL Shaders)</span></div>
            <div>AF Filtering: <span style={{ color: '#10b981' }}>{settings.anisotropicFiltering}x</span></div>
            <div>Active Mods: <span style={{ color: '#f59e0b' }}>{mods.filter((m) => m.enabled).length} Overlays</span></div>
            <div>Multiplayer: <span style={{ color: currentRoom ? '#10b981' : '#94a3b8' }}>{currentRoom ? `Active (${currentRoom.players.length} Racers)` : 'Offline Solo'}</span></div>
            <div>Controls: <span style={{ color: '#fff' }}>Arrows / WASD • X / Shift for NOS</span></div>
          </div>
        )}
      </div>
    </div>
  );
};
