import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameSettings, ModItem, MobileControlSettings } from '../types';
import { Square, Eye, Maximize2, Minimize2, ExternalLink, Smartphone, Gamepad2, Pause, DownloadCloud, CheckCircle2 } from 'lucide-react';
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
  mods: _mods,
  onStopGame,
  webGpuAdapterName: _webGpuAdapterName,
  initialVehicle: _initialVehicle,
  initialEventTitle: _initialEventTitle,
}) => {
  const viewportContainerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [showTelemetry, setShowTelemetry] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectedGamepadName, setConnectedGamepadName] = useState<string | null>(null);

  // Background download status
  const [downloadProgress, setDownloadProgress] = useState<{
    bytesDone: number;
    bytesTotal: number;
    percent: number;
    isBackground: boolean;
  } | null>(null);
  const [downloadCompleted, setDownloadCompleted] = useState<boolean>(false);

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

  // Sync mobile settings if updated by parent
  useEffect(() => {
    if (_settings?.mobileControls) {
      setMobileSettings((prev) => ({ ...prev, ..._settings.mobileControls }));
    }
  }, [_settings?.mobileControls]);

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

  // Track Fullscreen state and manage Keyboard Lock
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      const nav = navigator as any;
      if (isNowFullscreen) {
        if (nav.keyboard && typeof nav.keyboard.lock === 'function') {
          try {
            await nav.keyboard.lock(['Escape']);
            console.log('[NFSMW] Keyboard Lock active: Escape key mapped to in-game menu');
          } catch (e) {
            console.warn('[NFSMW] Keyboard Lock not permitted:', e);
          }
        }
      } else {
        if (nav.keyboard && typeof nav.keyboard.unlock === 'function') {
          try {
            nav.keyboard.unlock();
          } catch {}
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const nav = navigator as any;
    if (!document.fullscreenElement) {
      if (viewportContainerRef.current?.requestFullscreen) {
        try {
          await viewportContainerRef.current.requestFullscreen();
          if (nav.keyboard && typeof nav.keyboard.lock === 'function') {
            await nav.keyboard.lock(['Escape']).catch(() => {});
          }
        } catch (err) {
          console.error('Error enabling fullscreen:', err);
        }
      }
    } else {
      if (nav.keyboard && typeof nav.keyboard.unlock === 'function') {
        try {
          nav.keyboard.unlock();
        } catch {}
      }
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error('Error exiting fullscreen:', err);
        });
      }
    }
  }, []);

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
        // Cross-origin isolated fallback handled by postMessage
      }
    },
    []
  );

  // Trigger in-game Pause (Escape)
  const triggerPause = useCallback(() => {
    handleVirtualKey('Escape', 'Escape', 27, 'down');
    setTimeout(() => {
      handleVirtualKey('Escape', 'Escape', 27, 'up');
    }, 120);
  }, [handleVirtualKey]);

  // Listen to background asset download progress
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'recomp-background-download-progress' || e.data?.type === 'recomp-initial-progress') {
        const p = e.data.progress;
        if (p) {
          const percent = p.bytesTotal ? Math.floor((p.bytesDone / p.bytesTotal) * 100) : 0;
          setDownloadProgress({
            bytesDone: p.bytesDone,
            bytesTotal: p.bytesTotal,
            percent,
            isBackground: e.data.type === 'recomp-background-download-progress',
          });
        }
      } else if (e.data?.type === 'recomp-background-download-complete') {
        setDownloadCompleted(true);
        setDownloadProgress(null);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  // Gamepad API Polling
  const prevGamepadButtonsRef = useRef<{ [key: number]: boolean }>({});
  const prevGamepadAxesRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const onGamepadConnected = (e: GamepadEvent) => {
      setConnectedGamepadName(e.gamepad.id);
    };
    const onGamepadDisconnected = () => {
      const gps = navigator.getGamepads ? navigator.getGamepads() : [];
      const active = Array.from(gps).find((g) => g !== null);
      setConnectedGamepadName(active ? active.id : null);
    };
    window.addEventListener('gamepadconnected', onGamepadConnected);
    window.addEventListener('gamepaddisconnected', onGamepadDisconnected);

    // Initial check for connected gamepads
    if (navigator.getGamepads) {
      const gps = navigator.getGamepads();
      const active = Array.from(gps).find((g) => g !== null);
      if (active) setConnectedGamepadName(active.id);
    }

    let animId: number;
    const pollGamepad = () => {
      if (navigator.getGamepads) {
        const gamepads = navigator.getGamepads();
        for (const gp of gamepads) {
          if (!gp) continue;

          const checkButton = (btnIndex: number, key: string, code: string, keyCode: number) => {
            const isDown = gp.buttons[btnIndex]?.pressed || (gp.buttons[btnIndex]?.value || 0) > 0.2;
            const wasDown = !!prevGamepadButtonsRef.current[btnIndex];
            if (isDown && !wasDown) {
              handleVirtualKey(key, code, keyCode, 'down');
              prevGamepadButtonsRef.current[btnIndex] = true;
            } else if (!isDown && wasDown) {
              handleVirtualKey(key, code, keyCode, 'up');
              prevGamepadButtonsRef.current[btnIndex] = false;
            }
          };

          // Throttle / RT (Button 7): Gas
          checkButton(7, 'ArrowUp', 'ArrowUp', 38);
          // Brake / LT (Button 6): Brake
          checkButton(6, 'ArrowDown', 'ArrowDown', 40);
          // A / Cross (Button 0): Nitrous (NOS)
          checkButton(0, 'ShiftLeft', 'ShiftLeft', 16);
          // X / Square (Button 2): Handbrake
          checkButton(2, 'Space', 'Space', 32);
          // B / Circle (Button 1): Speedbreaker
          checkButton(1, 'KeyG', 'KeyG', 71);
          // Y / Triangle (Button 3): Camera
          checkButton(3, 'KeyC', 'KeyC', 67);
          // Start / Options (Button 9): Pause / Menu
          checkButton(9, 'Escape', 'Escape', 27);
          // Back / Share (Button 8): Reset Car
          checkButton(8, 'KeyR', 'KeyR', 82);
          // D-Pad
          checkButton(12, 'ArrowUp', 'ArrowUp', 38);
          checkButton(13, 'ArrowDown', 'ArrowDown', 40);
          checkButton(14, 'ArrowLeft', 'ArrowLeft', 37);
          checkButton(15, 'ArrowRight', 'ArrowRight', 39);

          // Left Stick Steering (Axis 0)
          const axisX = gp.axes[0] || 0;
          const steerLeft = axisX < -0.25;
          const steerRight = axisX > 0.25;

          if (steerLeft && !prevGamepadAxesRef.current['left']) {
            handleVirtualKey('ArrowLeft', 'ArrowLeft', 37, 'down');
            prevGamepadAxesRef.current['left'] = true;
          } else if (!steerLeft && prevGamepadAxesRef.current['left']) {
            handleVirtualKey('ArrowLeft', 'ArrowLeft', 37, 'up');
            prevGamepadAxesRef.current['left'] = false;
          }

          if (steerRight && !prevGamepadAxesRef.current['right']) {
            handleVirtualKey('ArrowRight', 'ArrowRight', 39, 'down');
            prevGamepadAxesRef.current['right'] = true;
          } else if (!steerRight && prevGamepadAxesRef.current['right']) {
            handleVirtualKey('ArrowRight', 'ArrowRight', 39, 'up');
            prevGamepadAxesRef.current['right'] = false;
          }
        }
      }
      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('gamepadconnected', onGamepadConnected);
      window.removeEventListener('gamepaddisconnected', onGamepadDisconnected);
    };
  }, [handleVirtualKey]);

  // PC Keyboard Shortcuts & Custom Keybindings Handler
  useEffect(() => {
    const customBinds = _settings.keyBindings;

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      // Escape key handler: Forward to game, prevent fullscreen exit when permitted
      if (e.key === 'Escape' || e.code === 'Escape') {
        triggerPause();
        if (document.fullscreenElement) {
          e.preventDefault();
        }
        return;
      }

      // 'P' as universal pause key
      if (e.key === 'p' || e.key === 'P') {
        triggerPause();
        return;
      }

      // 'F' for fullscreen toggle
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
        return;
      }

      // Check against custom keybindings
      if (customBinds) {
        if (e.code === customBinds.accelerate) handleVirtualKey('ArrowUp', 'ArrowUp', 38, 'down');
        if (e.code === customBinds.brake) handleVirtualKey('ArrowDown', 'ArrowDown', 40, 'down');
        if (e.code === customBinds.steerLeft) handleVirtualKey('ArrowLeft', 'ArrowLeft', 37, 'down');
        if (e.code === customBinds.steerRight) handleVirtualKey('ArrowRight', 'ArrowRight', 39, 'down');
        if (e.code === customBinds.nitrous) handleVirtualKey('ShiftLeft', 'ShiftLeft', 16, 'down');
        if (e.code === customBinds.handbrake) handleVirtualKey('Space', 'Space', 32, 'down');
        if (e.code === customBinds.speedbreaker) handleVirtualKey('KeyG', 'KeyG', 71, 'down');
        if (e.code === customBinds.camera) handleVirtualKey('KeyC', 'KeyC', 67, 'down');
        if (e.code === customBinds.reset) handleVirtualKey('KeyR', 'KeyR', 82, 'down');
        if (e.code === customBinds.pause) triggerPause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (customBinds) {
        if (e.code === customBinds.accelerate) handleVirtualKey('ArrowUp', 'ArrowUp', 38, 'up');
        if (e.code === customBinds.brake) handleVirtualKey('ArrowDown', 'ArrowDown', 40, 'up');
        if (e.code === customBinds.steerLeft) handleVirtualKey('ArrowLeft', 'ArrowLeft', 37, 'up');
        if (e.code === customBinds.steerRight) handleVirtualKey('ArrowRight', 'ArrowRight', 39, 'up');
        if (e.code === customBinds.nitrous) handleVirtualKey('ShiftLeft', 'ShiftLeft', 16, 'up');
        if (e.code === customBinds.handbrake) handleVirtualKey('Space', 'Space', 32, 'up');
        if (e.code === customBinds.speedbreaker) handleVirtualKey('KeyG', 'KeyG', 71, 'up');
        if (e.code === customBinds.camera) handleVirtualKey('KeyC', 'KeyC', 67, 'up');
        if (e.code === customBinds.reset) handleVirtualKey('KeyR', 'KeyR', 82, 'up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [toggleFullscreen, triggerPause, handleVirtualKey, _settings.keyBindings]);

  // Focus iframe on load
  useEffect(() => {
    const focusIframe = () => {
      if (iframeRef.current) {
        iframeRef.current.focus();
        iframeRef.current.contentWindow?.focus();
      }
    };
    focusIframe();
    const t1 = setTimeout(focusIframe, 300);
    const t2 = setTimeout(focusIframe, 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const openDedicatedTab = () => {
    const offlineParam = _settings.offlinePreload ? '&offline=1' : '';
    window.open(`/nfsmw/runtime.html?game=nfsmw&res=1280x720${offlineParam}`, '_blank');
  };

  const iframeSrc = `/nfsmw/runtime.html?game=nfsmw&res=1280x720${_settings.offlinePreload ? '&offline=1' : ''}`;

  return (
    <div className={`nfsmw-game-container ${isPortrait ? 'portrait-mode' : 'landscape-mode'}`}>
      {/* Top Game Controls Toolbar */}
      <div className="nfsmw-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, color: '#10b981' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            REAL NFS MOST WANTED (2005) WEBGPU
          </span>

          <span style={{ color: '#475569' }} className="hide-on-mobile">|</span>

          {/* Gamepad Status Badge */}
          {connectedGamepadName && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#67e8f9',
                background: 'rgba(6, 182, 212, 0.15)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
              title={connectedGamepadName}
            >
              <Gamepad2 size={13} color="#06b6d4" />
              <span>Controller Active</span>
            </span>
          )}

          {/* Background Download Progress Indicator */}
          {downloadProgress && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#f59e0b',
                background: 'rgba(245, 158, 11, 0.12)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              <DownloadCloud size={13} color="#f59e0b" />
              <span>Caching in background: {downloadProgress.percent}% ({(downloadProgress.bytesDone / 1024 ** 2).toFixed(0)} MB)</span>
            </span>
          )}

          {downloadCompleted && !downloadProgress && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircle2 size={13} color="#10b981" />
              <span>100% Offline Ready (0 Lag)</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Direct Pause / Menu Trigger Button */}
          <button
            onClick={triggerPause}
            className="nfsmw-hud-btn"
            title="In-Game Pause Menu (Esc or P)"
            style={{ color: '#f59e0b', borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)' }}
          >
            <Pause size={13} color="#f59e0b" />
            <span style={{ fontSize: '11px', fontWeight: 800 }}>Menu (Esc)</span>
          </button>

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

          <button
            onClick={toggleFullscreen}
            className="nfsmw-hud-btn"
            title="Toggle Fullscreen (F) • Press Esc for In-Game Menu"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
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
            src={iframeSrc}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="cross-origin-isolated; autoplay; fullscreen; keyboard-map *"
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
      </div>
    </div>
  );
};
