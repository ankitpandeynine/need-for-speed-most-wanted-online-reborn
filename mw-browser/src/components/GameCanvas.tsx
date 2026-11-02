import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameSettings, ModItem, VehicleTelemetry, LobbyRoom, EATraxSong } from '../types';
import { Square, Pause, Play, Monitor, Zap, Eye, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { MultiplayerService } from '../services/multiplayer';
import { EATraxService } from '../services/eaTrax';
import { NFSMWScene, CameraViewMode } from '../engine/graphics/NFSMWScene';
import { VehiclePhysics, VehicleInput } from '../engine/physics/VehiclePhysics';
import { NFSMWSoundEngine } from '../engine/audio/NFSMWSoundEngine';
import { NFSMWHUD } from './NFSMWHUD';
import { VEHICLE_CATALOG } from '../engine/graphics/CarModelBuilder';

interface GameCanvasProps {
  settings: GameSettings;
  mods: ModItem[];
  onStopGame: () => void;
  webGpuAdapterName?: string;
  initialVehicle?: string;
  initialEventTitle?: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  settings: _settings,
  mods,
  onStopGame,
  webGpuAdapterName,
  initialVehicle,
  initialEventTitle,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportContainerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Active View: 'game-3d' (Authentic 3D NFS MW Experience) or 'recomp-wasm' (Low-level recompiled binary debugger)
  const [activeView, setActiveView] = useState<'game-3d' | 'recomp-wasm'>('game-3d');
  const [cameraView, setCameraView] = useState<CameraViewMode>('chase-far');
  const [selectedVehicle, setSelectedVehicle] = useState<string>(initialVehicle || 'bmw-m3-gtr');

  // EA Trax State
  const [currentTrack, setCurrentTrack] = useState<EATraxSong | null>(null);
  const [showTraxBanner, setShowTraxBanner] = useState<boolean>(false);

  const [fps, setFps] = useState(120);
  const [isPaused, setIsPaused] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Vehicle Telemetry State for HUD
  const [speedMph, setSpeedMph] = useState(0);
  const [rpm, setRpm] = useState(900);
  const [gear, setGear] = useState(1);
  const [nosLevel, setNosLevel] = useState(100);
  const [isNosActive, setIsNosActive] = useState(false);
  const [speedbreakerLevel, setSpeedbreakerLevel] = useState(100);
  const [isSpeedbreakerActive, setIsSpeedbreakerActive] = useState(false);
  const [pursuitStatus, setPursuitStatus] = useState(new VehiclePhysics().pursuit);

  // Multiplayer Room State
  const [currentRoom, setCurrentRoom] = useState<LobbyRoom | null>(MultiplayerService.getCurrentRoom());
  const [remoteRivals, setRemoteRivals] = useState<VehicleTelemetry[]>([]);

  // Engine Instances
  const sceneRef = useRef<NFSMWScene | null>(null);
  const physicsRef = useRef<VehiclePhysics>(new VehiclePhysics());
  const soundRef = useRef<NFSMWSoundEngine>(new NFSMWSoundEngine());

  // Input State
  const inputRef = useRef<VehicleInput>({
    throttle: false,
    brake: false,
    steerLeft: false,
    steerRight: false,
    handbrake: false,
    nitrous: false,
    speedbreaker: false,
  });

  // Track Fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (viewportContainerRef.current?.requestFullscreen) {
        viewportContainerRef.current.requestFullscreen().catch((err) => {
          console.error('Error enabling fullscreen:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error('Error exiting fullscreen:', err);
        });
      }
    }
  }, []);

  // Subscribe to multiplayer telemetry
  useEffect(() => {
    const unsubRoom = MultiplayerService.subscribeRoom(setCurrentRoom);
    const unsubTelemetry = MultiplayerService.subscribeTelemetry(setRemoteRivals);
    return () => {
      unsubRoom();
      unsubTelemetry();
    };
  }, []);

  // Subscribe to EA Trax track changes
  useEffect(() => {
    const trax = EATraxService.getInstance();
    let bannerTimer: ReturnType<typeof setTimeout> | null = null;
    const unsub = trax.subscribe((song) => {
      setCurrentTrack(song);
      setShowTraxBanner(true);
      if (bannerTimer) clearTimeout(bannerTimer);
      bannerTimer = setTimeout(() => setShowTraxBanner(false), 5500);
    });
    const cur = trax.getCurrentTrack();
    if (cur) {
      setCurrentTrack(cur);
      setShowTraxBanner(true);
      bannerTimer = setTimeout(() => setShowTraxBanner(false), 5500);
    }
    return () => {
      unsub();
      if (bannerTimer) clearTimeout(bannerTimer);
    };
  }, []);

  // Camera Cycle
  const cycleCamera = useCallback(() => {
    setCameraView((prev) => {
      const nextView: CameraViewMode =
        prev === 'chase-far'
          ? 'chase-close'
          : prev === 'chase-close'
          ? 'hood'
          : prev === 'hood'
          ? 'cockpit'
          : 'chase-far';
      sceneRef.current?.setCameraView(nextView);
      return nextView;
    });
  }, []);

  // Reset Vehicle
  const resetVehicle = useCallback(() => {
    physicsRef.current.resetVehicle();
  }, []);

  // Toggle Audio Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundRef.current.setMuted(next);
      return next;
    });
  }, []);

  // 1. Initialize 3D Scene and Start Game Loop
  useEffect(() => {
    if (activeView !== 'game-3d') return;
    const container = containerRef.current;
    if (!container) return;

    // Initialize Three.js 3D Scene
    const scene = new NFSMWScene(container);
    sceneRef.current = scene;
    scene.setCameraView(cameraView);
    if (selectedVehicle && selectedVehicle !== 'bmw-m3-gtr') {
      scene.changeVehicle(selectedVehicle);
    }

    // Initialize Web Audio Synth and EA Trax OST on first click/key
    const initAudio = () => {
      soundRef.current.init();
      EATraxService.getInstance().play();
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('click', initAudio);
    };
    window.addEventListener('keydown', initAudio);
    window.addEventListener('click', initAudio);

    // Keyboard Input Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          inputRef.current.throttle = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          inputRef.current.brake = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          inputRef.current.steerLeft = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          inputRef.current.steerRight = true;
          break;
        case 'Space':
          inputRef.current.handbrake = true;
          e.preventDefault();
          break;
        case 'KeyX':
        case 'ShiftLeft':
        case 'ShiftRight':
          if (!inputRef.current.nitrous) {
            soundRef.current.playNosPurge();
          }
          inputRef.current.nitrous = true;
          break;
        case 'KeyG':
          inputRef.current.speedbreaker = true;
          break;
        case 'KeyC':
          cycleCamera();
          break;
        case 'KeyT':
          EATraxService.getInstance().nextTrack();
          break;
        case 'KeyR':
          resetVehicle();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          inputRef.current.throttle = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          inputRef.current.brake = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          inputRef.current.steerLeft = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          inputRef.current.steerRight = false;
          break;
        case 'Space':
          inputRef.current.handbrake = false;
          break;
        case 'KeyX':
        case 'ShiftLeft':
        case 'ShiftRight':
          inputRef.current.nitrous = false;
          break;
        case 'KeyG':
          inputRef.current.speedbreaker = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 2. Main 120 Hz Simulation Loop
    let animId: number;
    let lastTime = performance.now();
    let frameCounter = 0;
    let lastFpsUpdate = lastTime;
    let telemetryBroadcastTimer = 0;

    const gameLoop = (currentTime: number) => {
      animId = requestAnimationFrame(gameLoop);

      const dtMs = currentTime - lastTime;
      lastTime = currentTime;
      const dtSec = Math.min(0.05, Math.max(0.001, dtMs / 1000));

      // Calculate FPS
      frameCounter++;
      if (currentTime - lastFpsUpdate >= 500) {
        setFps(Math.round((frameCounter * 1000) / (currentTime - lastFpsUpdate)));
        frameCounter = 0;
        lastFpsUpdate = currentTime;
      }

      if (isPaused) return;

      const physics = physicsRef.current;
      const sound = soundRef.current;
      const inputs = inputRef.current;

      const prevGear = physics.currentGear;

      // Step Physics Simulation
      physics.update(inputs, dtSec);

      // Play gear shift pop
      if (physics.currentGear !== prevGear && physics.currentGear > 1) {
        sound.playGearShift();
      }

      // Update Sound Engine
      sound.update({
        rpm: physics.rpm,
        speedMph: Math.abs(physics.speedMph),
        isNitrousActive: physics.isNosActive,
        isDrifting: inputs.handbrake && Math.abs(physics.speedMph) > 25,
        isPoliceNear: physics.pursuit.policeDistance < 80,
        policeDistance: physics.pursuit.policeDistance,
        isSpeedbreaker: physics.isSpeedbreakerActive,
      });

      // Update 3D Scene (Three.js rendering)
      scene.update(physics, inputs.brake);

      // Sync React state for HUD
      setSpeedMph(physics.speedMph);
      setRpm(physics.rpm);
      setGear(physics.currentGear);
      setNosLevel(physics.nosLevel);
      setIsNosActive(physics.isNosActive);
      setSpeedbreakerLevel(physics.speedbreakerLevel);
      setIsSpeedbreakerActive(physics.isSpeedbreakerActive);
      setPursuitStatus({ ...physics.pursuit });

      // Broadcast Multiplayer Telemetry at 30 Hz
      telemetryBroadcastTimer += dtSec;
      if (telemetryBroadcastTimer >= 0.033) {
        telemetryBroadcastTimer = 0;
        MultiplayerService.sendTelemetry({
          position: { x: physics.posX, y: 0, z: physics.posZ },
          speedMph: physics.speedMph,
          gear: physics.currentGear,
          rpm: physics.rpm,
          nitroActive: physics.isNosActive,
          carModel: 'BMW M3 GTR (E46)',
        });
      }
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('click', initAudio);
      scene.destroy();
      soundRef.current.destroy();
    };
  }, [activeView, isPaused, cycleCamera, resetVehicle, toggleMute, toggleFullscreen]);

  return (
    <div className="nfsmw-game-container">
      {/* Top Game Controls Toolbar */}
      <div className="nfsmw-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            NFSMW 2005 3D ENGINE
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Car:
            <select
              value={selectedVehicle}
              onChange={(e) => {
                const vid = e.target.value;
                setSelectedVehicle(vid);
                sceneRef.current?.changeVehicle(vid);
              }}
              style={{
                background: '#0e1118',
                color: '#f59e0b',
                border: '1px solid #333d4d',
                borderRadius: '6px',
                padding: '2px 8px',
                fontWeight: 800,
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {VEHICLE_CATALOG.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            FPS: <span style={{ color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>{fps}</span> / 120
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Sim: <span style={{ color: '#10b981', fontWeight: 800 }}>120 Hz Fixed</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* View Mode Toggle: 3D Game vs Recomp WASM Debug */}
          <button
            onClick={() => setActiveView('game-3d')}
            className="nfsmw-hud-btn"
            style={{
              background: activeView === 'game-3d' ? '#f59e0b' : 'rgba(24, 28, 38, 0.85)',
              color: activeView === 'game-3d' ? '#000' : '#cbd5e1',
              borderColor: activeView === 'game-3d' ? '#f59e0b' : '#333d4d',
            }}
          >
            <Sparkles size={14} />
            3D NEED FOR SPEED
          </button>

          <button
            onClick={() => setActiveView('recomp-wasm')}
            className="nfsmw-hud-btn"
            style={{
              background: activeView === 'recomp-wasm' ? '#f59e0b' : 'rgba(24, 28, 38, 0.85)',
              color: activeView === 'recomp-wasm' ? '#000' : '#cbd5e1',
              borderColor: activeView === 'recomp-wasm' ? '#f59e0b' : '#333d4d',
            }}
          >
            <Monitor size={14} />
            RECOMP WASM DEBUG
          </button>

          <button onClick={() => setShowTelemetry(!showTelemetry)} className="nfsmw-hud-btn">
            <Eye size={14} />
            {showTelemetry ? 'Hide Telemetry' : 'Show Telemetry'}
          </button>

          <button onClick={() => setIsPaused(!isPaused)} className="nfsmw-hud-btn">
            {isPaused ? <Play size={14} color="#10b981" /> : <Pause size={14} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button onClick={toggleFullscreen} className="nfsmw-hud-btn" title="Toggle Fullscreen (F)">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            Fullscreen
          </button>

          <button
            onClick={onStopGame}
            className="nfsmw-hud-btn"
            style={{ background: 'rgba(153, 27, 27, 0.5)', borderColor: '#dc2626', color: '#fecaca' }}
          >
            <Square size={14} />
            Quit Game
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div ref={viewportContainerRef} className="nfsmw-viewport">
        {activeView === 'game-3d' ? (
          <>
            {/* 3D Three.js WebGL / WebGPU Viewport */}
            <div
              ref={containerRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'block',
              }}
            />

            {/* High-Speed Radial Motion Blur & Speed Lines */}
            {speedMph > 120 && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: `radial-gradient(ellipse at center, transparent 40%, rgba(245, 158, 11, ${Math.min(0.28, (speedMph - 120) / 380)}) 85%, rgba(255, 255, 255, ${Math.min(0.22, (speedMph - 120) / 450)}) 100%)`,
                  mixBlendMode: 'screen',
                  zIndex: 22,
                }}
              />
            )}

            {/* Nitrous Blue Warp Glow */}
            {isNosActive && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'radial-gradient(ellipse at center, transparent 35%, rgba(6, 182, 212, 0.22) 85%, rgba(14, 165, 233, 0.35) 100%)',
                  mixBlendMode: 'screen',
                  zIndex: 23,
                }}
              />
            )}

            {/* Authentic Need for Speed Most Wanted 2005 HUD */}
            <NFSMWHUD
              speedMph={speedMph}
              rpm={rpm}
              gear={gear}
              nosLevel={nosLevel}
              isNosActive={isNosActive}
              speedbreakerLevel={speedbreakerLevel}
              isSpeedbreakerActive={isSpeedbreakerActive}
              pursuit={pursuitStatus}
              cameraView={cameraView}
              onCycleCamera={cycleCamera}
              onResetVehicle={resetVehicle}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />

            {/* Mission / Race Event Header Pill */}
            {initialEventTitle && (
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(12, 16, 24, 0.92)',
                  border: '1px solid #f59e0b',
                  borderRadius: '20px',
                  padding: '6px 20px',
                  color: '#f59e0b',
                  fontWeight: 800,
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  zIndex: 35,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
                <span>🏁 {initialEventTitle}</span>
              </div>
            )}

            {/* Authentic EA TRAX Slide-In Banner */}
            {showTraxBanner && currentTrack && (
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '20px',
                  zIndex: 45,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  background: 'linear-gradient(135deg, rgba(14, 18, 26, 0.96) 0%, rgba(22, 28, 42, 0.98) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  borderLeft: '5px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.8), 0 0 20px rgba(245, 158, 11, 0.25)',
                  pointerEvents: 'none',
                  maxWidth: '380px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '6px',
                    background: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '10px',
                    color: '#000',
                    lineHeight: 1.1,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  EA
                  <br />
                  TRAX
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    EA TRAX™ • [T] NEXT TRACK
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentTrack.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentTrack.artist} • <span style={{ color: '#94a3b8' }}>{currentTrack.album}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Recompiled WASM Iframe View */
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <iframe
              ref={iframeRef}
              src="/runtime.html?game=nfsmw"
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="cross-origin-isolated; autoplay; fullscreen"
            />
          </div>
        )}

        {/* Telemetry Overlay Panel */}
        {showTelemetry && (
          <div className="nfsmw-telemetry-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #232b3c' }}>
              <Zap size={14} />
              <span>VEHICLE & GRAPHICS TELEMETRY</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Vehicle:</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>BMW M3 GTR (E46)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Graphics Engine:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>WebGL / WebGPU PBR</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Adapter:</span>
                <span style={{ color: '#cbd5e1', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {webGpuAdapterName || 'Apple M-Series Metal'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Visual Treatment:</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>Autumn Golden-Hour</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pursuit Status:</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>Heat 5 (Cross Interceptors)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Multiplayer:</span>
                <span style={{ color: '#60a5fa' }}>
                  {currentRoom ? `${currentRoom.name} (${remoteRivals.length + 1} Racers)` : 'Offline Solo Drive'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Mods:</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{mods.filter((m) => m.enabled).length} Injected</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
