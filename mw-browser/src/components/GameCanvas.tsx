import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameSettings, ModItem } from '../types';
import { Square, Zap, Eye, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

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
  initialVehicle: _initialVehicle,
  initialEventTitle: _initialEventTitle,
}) => {
  const viewportContainerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [showHelpBanner, setShowHelpBanner] = useState<boolean>(true);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Keyboard shortcut: F for fullscreen, Escape to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          toggleFullscreen();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  // Automatically focus the real game iframe on load and on click
  useEffect(() => {
    const focusIframe = () => {
      if (iframeRef.current) {
        iframeRef.current.focus();
        iframeRef.current.contentWindow?.focus();
      }
    };
    focusIframe();
    const timer1 = setTimeout(focusIframe, 300);
    const timer2 = setTimeout(focusIframe, 1000);
    const timer3 = setTimeout(focusIframe, 3000);

    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        if (
          ['Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ControlLeft', 'Escape'].includes(
            e.code
          )
        ) {
          iframeRef.current.focus();
          iframeRef.current.contentWindow.focus();
        }
      }
    };
    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, []);

  const openDedicatedTab = () => {
    window.open('/nfsmw/runtime.html?game=nfsmw&res=1280x720', '_blank');
  };

  return (
    <div className="nfsmw-game-container">
      {/* Top Game Controls Toolbar */}
      <div className="nfsmw-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            REAL NFS MOST WANTED (2005) PC WEBGPU
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Resolution: <span style={{ color: '#f59e0b', fontWeight: 800 }}>1280×720</span>
          </span>
          <span style={{ color: '#475569' }}>|</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Simulation: <span style={{ color: '#10b981', fontWeight: 800 }}>120 Hz Fixed</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={openDedicatedTab}
            className="nfsmw-hud-btn"
            title="Open real Need for Speed: Most Wanted in a full dedicated browser window"
            style={{ color: '#60a5fa', borderColor: '#2563eb' }}
          >
            <ExternalLink size={14} color="#60a5fa" />
            Dedicated Tab
          </button>

          <button onClick={() => setShowTelemetry(!showTelemetry)} className="nfsmw-hud-btn">
            <Eye size={14} />
            {showTelemetry ? 'Hide Telemetry' : 'Show Telemetry'}
          </button>

          <button onClick={toggleFullscreen} className="nfsmw-hud-btn" title="Toggle Fullscreen (F)">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
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
      <div
        ref={viewportContainerRef}
        className="nfsmw-viewport"
        onClick={() => {
          iframeRef.current?.focus();
          iframeRef.current?.contentWindow?.focus();
        }}
      >
        {/* Real Recompiled WASM + WebGPU Iframe View */}
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
          <iframe
            ref={iframeRef}
            src="/nfsmw/runtime.html?game=nfsmw&res=1280x720"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="cross-origin-isolated; autoplay; fullscreen"
          />
        </div>

        {/* Quick Help Banner Overlay */}
        {showHelpBanner && (
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 35,
              background: 'rgba(10, 14, 22, 0.94)',
              border: '1px solid rgba(245, 158, 11, 0.8)',
              borderRadius: '8px',
              padding: '8px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 15px rgba(245, 158, 11, 0.2)',
              pointerEvents: 'auto',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>
              🎮 Click game screen & Press{' '}
              <kbd style={{ background: '#222', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555', color: '#fff' }}>ENTER</kbd> or{' '}
              <kbd style={{ background: '#222', padding: '2px 6px', borderRadius: '4px', border: '1px solid #555', color: '#fff' }}>SPACE</kbd> to skip intros & enter Title Screen!
            </span>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>• Arrows / WASD to Drive • Shift for NOS • [F] for Fullscreen</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowHelpBanner(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 800,
                padding: '0 4px',
              }}
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Telemetry Overlay Panel */}
        {showTelemetry && (
          <div className="nfsmw-telemetry-box">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#f59e0b',
                fontWeight: 800,
                marginBottom: '8px',
                paddingBottom: '6px',
                borderBottom: '1px solid #232b3c',
              }}
            >
              <Zap size={14} />
              <span>AUTHENTIC NFSMW (2005) TELEMETRY</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Executable:</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>speed.exe (AOT Recompiled)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Graphics Engine:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Direct3D 9 on WebGPU Metal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Adapter:</span>
                <span style={{ color: '#cbd5e1', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {webGpuAdapterName || 'Apple M-Series Metal'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Resolution:</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>1280×720 (Widescreen)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Physics:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>120 Hz Fixed Step</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Audio Engine:</span>
                <span style={{ color: '#60a5fa' }}>AudioWorklet PCM (48 kHz Stereo)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Mods:</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{mods.filter((m) => m.enabled).length} Injected</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Controls:</span>
                <span style={{ color: '#cbd5e1' }}>Keyboard / Gamepad (Native)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
