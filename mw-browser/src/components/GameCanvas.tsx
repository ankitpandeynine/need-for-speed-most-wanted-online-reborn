import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameSettings, ModItem, MobileControlSettings } from '../types';
import { Square, Zap, Eye, Maximize2, Minimize2, ExternalLink, Smartphone } from 'lucide-react';
import { TouchControls } from './TouchControls';

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

  // Mobile detection & Touch Controls State
  const isTouchDevice =
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 1024);

  const [showTouchControls, setShowTouchControls] = useState<boolean>(isTouchDevice);
  const [isPortrait, setIsPortrait] = useState<boolean>(
    typeof window !== 'undefined' && window.innerHeight > window.innerWidth
  );

  const [mobileSettings, setMobileSettings] = useState<MobileControlSettings>(() => {
    try {
      const saved = localStorage.getItem('nfsmw_mobile_controls');
      if (saved) return JSON.parse(saved);
    } catch {}
    return (
      _settings?.mobileControls || {
        enabled: true,
        layout: 'split',
        buttonScale: 1.0,
        opacity: 0.85,
        swapHands: false,
        haptics: true,
        gyroEnabled: false,
        gyroSensitivity: 1.5,
        gyroDeadzone: 3,
      }
    );
  });

  const handleUpdateMobileSettings = (newSettings: Partial<MobileControlSettings>) => {
    setMobileSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('nfsmw_mobile_controls', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Track window resize & orientation
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

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

  // Keyboard shortcut: F for fullscreen
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

  // Dispatch virtual key press to the iframe runtime
  const handleVirtualKey = useCallback(
    (key: string, code: string, keyCode: number, action: 'down' | 'up') => {
      if (!iframeRef.current) return;
      // 1. Post message to the iframe worker/window
      iframeRef.current.contentWindow?.postMessage(
        {
          type: 'recomp-virtual-key',
          key,
          code,
          keyCode,
          action,
        },
        '*'
      );

      // 2. Direct DOM event dispatch if accessible
      try {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          const canvas = doc.getElementById('canvas');
          const evt = new KeyboardEvent(action === 'up' ? 'keyup' : 'keydown', {
            key,
            code,
            keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true,
          });
          canvas?.dispatchEvent(evt);
          doc.dispatchEvent(evt);
        }
      } catch {
        // PostMessage handles isolated cases
      }
    },
    []
  );

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
          [
            'Enter',
            'Space',
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'KeyW',
            'KeyA',
            'KeyS',
            'KeyD',
            'ShiftLeft',
            'ControlLeft',
            'Escape',
          ].includes(e.code)
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
    <div className={`nfsmw-game-container ${isPortrait ? 'portrait-mode' : 'landscape-mode'}`}>
      {/* Top Game Controls Toolbar */}
      <div className="nfsmw-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            REAL NFS MOST WANTED (2005) PC WEBGPU
          </span>
          <span style={{ color: '#475569' }} className="hide-on-mobile">|</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }} className="hide-on-mobile">
            Resolution: <span style={{ color: '#f59e0b', fontWeight: 800 }}>1280×720</span>
          </span>
          <span style={{ color: '#475569' }} className="hide-on-mobile">|</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }} className="hide-on-mobile">
            Simulation: <span style={{ color: '#10b981', fontWeight: 800 }}>120 Hz Fixed</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Touch Controls Toggle Button */}
          <button
            onClick={() => setShowTouchControls(!showTouchControls)}
            className="nfsmw-hud-btn"
            title="Toggle On-Screen Mobile Touch Controls"
            style={{
              color: showTouchControls ? '#f59e0b' : '#94a3b8',
              borderColor: showTouchControls ? '#f59e0b' : '#273042',
              background: showTouchControls ? 'rgba(245, 158, 11, 0.15)' : 'rgba(18, 22, 32, 0.85)',
            }}
          >
            <Smartphone size={14} color={showTouchControls ? '#f59e0b' : 'currentColor'} />
            <span style={{ fontSize: '11px', fontWeight: 700 }}>Touch Controls</span>
          </button>

          <button
            onClick={openDedicatedTab}
            className="nfsmw-hud-btn hide-on-mobile"
            title="Open real Need for Speed: Most Wanted in a full dedicated browser window"
            style={{ color: '#60a5fa', borderColor: '#2563eb' }}
          >
            <ExternalLink size={14} color="#60a5fa" />
            Dedicated Tab
          </button>

          <button onClick={() => setShowTelemetry(!showTelemetry)} className="nfsmw-hud-btn hide-on-mobile">
            <Eye size={14} />
            {showTelemetry ? 'Hide Telemetry' : 'Show Telemetry'}
          </button>

          <button onClick={toggleFullscreen} className="nfsmw-hud-btn" title="Toggle Fullscreen (F)">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>

          <button
            onClick={onStopGame}
            className="nfsmw-hud-btn"
            style={{ background: 'rgba(153, 27, 27, 0.5)', borderColor: '#dc2626', color: '#fecaca' }}
          >
            <Square size={14} />
            Quit
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

        {/* Mobile On-Screen Touch Controls Overlay */}
        {showTouchControls && mobileSettings.enabled && (
          <TouchControls
            onVirtualKey={handleVirtualKey}
            settings={mobileSettings}
            onUpdateSettings={handleUpdateMobileSettings}
            isPortrait={isPortrait}
          />
        )}

        {/* Quick Help Banner Overlay */}
        {showHelpBanner && !isTouchDevice && (
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

        {/* Portrait Mode Hint for Mobile */}
        {isPortrait && isTouchDevice && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid rgba(245, 158, 11, 0.6)',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '11px',
              color: '#f59e0b',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
              zIndex: 35,
              whiteSpace: 'nowrap',
            }}
          >
            <span>📱 Tip: Rotate to Landscape for Full-Screen Driving</span>
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
                <span style={{ color: '#cbd5e1' }}>Keyboard / Gamepad / Touch Gyro</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
