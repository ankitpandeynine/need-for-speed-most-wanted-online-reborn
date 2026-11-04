import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MobileControlSettings } from '../types';
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
  CircleDot,
  RotateCcw,
  Camera,
  Menu,
  Sliders,
  Check,
  Compass,
  X,
  Play,
} from 'lucide-react';

interface TouchControlsProps {
  onVirtualKey: (key: string, code: string, keyCode: number, action: 'down' | 'up') => void;
  settings: MobileControlSettings;
  onUpdateSettings: (newSettings: Partial<MobileControlSettings>) => void;
  isPortrait?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onVirtualKey,
  settings,
  onUpdateSettings,
  isPortrait = false,
}) => {
  const [showTweakDrawer, setShowTweakDrawer] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [gyroZeroOffset, setGyroZeroOffset] = useState<number>(0);
  const [gyroRawAngle, setGyroRawAngle] = useState<number>(0);
  const [gyroSteerDirection, setGyroSteerDirection] = useState<'left' | 'right' | 'center'>('center');
  const [hasGyroPermission, setHasGyroPermission] = useState<boolean>(true);

  const activeKeysRef = useRef<Set<string>>(new Set());
  const gyroSteerRef = useRef<'left' | 'right' | 'center'>('center');

  // Trigger key down with haptic feedback
  const handlePress = useCallback(
    (key: string, code: string, keyCode: number) => {
      if (settings.haptics && navigator.vibrate) {
        try {
          navigator.vibrate(15);
        } catch {
          // Ignore vibrate restrictions
        }
      }
      activeKeysRef.current.add(code);
      setActiveKeys(new Set(activeKeysRef.current));
      onVirtualKey(key, code, keyCode, 'down');
    },
    [onVirtualKey, settings.haptics]
  );

  // Trigger key up
  const handleRelease = useCallback(
    (key: string, code: string, keyCode: number) => {
      activeKeysRef.current.delete(code);
      setActiveKeys(new Set(activeKeysRef.current));
      onVirtualKey(key, code, keyCode, 'up');
    },
    [onVirtualKey]
  );

  // Helper to bind touch events to a virtual button
  const touchProps = (key: string, code: string, keyCode: number) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      handlePress(key, code, keyCode);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      handleRelease(key, code, keyCode);
    },
    onTouchCancel: (e: React.TouchEvent) => {
      e.preventDefault();
      handleRelease(key, code, keyCode);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      handlePress(key, code, keyCode);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      handleRelease(key, code, keyCode);
    },
    onMouseLeave: () => {
      if (activeKeysRef.current.has(code)) {
        handleRelease(key, code, keyCode);
      }
    },
  });

  // Gyroscope tilt steering
  useEffect(() => {
    if (!settings.gyroEnabled) {
      if (gyroSteerRef.current !== 'center') {
        onVirtualKey('ArrowLeft', 'ArrowLeft', 37, 'up');
        onVirtualKey('ArrowRight', 'ArrowRight', 39, 'up');
        gyroSteerRef.current = 'center';
        setGyroSteerDirection('center');
      }
      return;
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      let raw = 0;
      // In landscape, beta or gamma depending on orientation angle
      const screenAngle = (window.screen.orientation?.angle ?? 0);
      if (screenAngle === 90) {
        raw = -(e.beta || 0);
      } else if (screenAngle === 270 || screenAngle === -90) {
        raw = e.beta || 0;
      } else {
        // Portrait or unspecified
        raw = e.gamma || 0;
      }

      setGyroRawAngle(Math.round(raw));
      const adjusted = (raw - gyroZeroOffset) * settings.gyroSensitivity;
      const deadzone = settings.gyroDeadzone || 3;

      if (adjusted < -deadzone) {
        // Steer Left
        if (gyroSteerRef.current !== 'left') {
          onVirtualKey('ArrowRight', 'ArrowRight', 39, 'up');
          onVirtualKey('ArrowLeft', 'ArrowLeft', 37, 'down');
          gyroSteerRef.current = 'left';
          setGyroSteerDirection('left');
        }
      } else if (adjusted > deadzone) {
        // Steer Right
        if (gyroSteerRef.current !== 'right') {
          onVirtualKey('ArrowLeft', 'ArrowLeft', 37, 'up');
          onVirtualKey('ArrowRight', 'ArrowRight', 39, 'down');
          gyroSteerRef.current = 'right';
          setGyroSteerDirection('right');
        }
      } else {
        // Centered within deadzone
        if (gyroSteerRef.current !== 'center') {
          onVirtualKey('ArrowLeft', 'ArrowLeft', 37, 'up');
          onVirtualKey('ArrowRight', 'ArrowRight', 39, 'up');
          gyroSteerRef.current = 'center';
          setGyroSteerDirection('center');
        }
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      if (gyroSteerRef.current !== 'center') {
        onVirtualKey('ArrowLeft', 'ArrowLeft', 37, 'up');
        onVirtualKey('ArrowRight', 'ArrowRight', 39, 'up');
        gyroSteerRef.current = 'center';
      }
    };
  }, [settings.gyroEnabled, settings.gyroSensitivity, settings.gyroDeadzone, gyroZeroOffset, onVirtualKey]);

  // Request iOS gyro permission
  const requestGyroPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission ===
        'function'
    ) {
      try {
        const response = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission();
        if (response === 'granted') {
          setHasGyroPermission(true);
          onUpdateSettings({ gyroEnabled: true });
        } else {
          setHasGyroPermission(false);
          alert('Gyroscope motion permission was denied. You can still steer using the on-screen buttons.');
        }
      } catch (err) {
        console.error('Error requesting gyro permission:', err);
      }
    } else {
      onUpdateSettings({ gyroEnabled: !settings.gyroEnabled });
    }
  };

  const calibrateGyro = () => {
    setGyroZeroOffset(gyroRawAngle);
    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
  };

  const scale = settings.buttonScale || 1.0;
  const opacity = settings.opacity || 0.85;

  const defaultIndividualPos = {
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

  const indPos = settings.individualPositions
    ? {
        ...defaultIndividualPos,
        ...settings.individualPositions,
      }
    : null;

  return (
    <div
      className="nfsmw-touch-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        opacity: opacity,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* Top Utility Bar (only rendered in default cluster mode, or gear button) */}
      {!settings.individualPositions && (
        <div
          style={{
            position: 'absolute',
            top: isPortrait ? '10px' : '14px',
            left: '14px',
            right: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'auto',
            zIndex: 60,
          }}
        >
          {/* Top-Left Utility Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              {...touchProps('Escape', 'Escape', 27)}
              className="nfsmw-touch-btn util-btn"
              title="Pause / Menu (Esc)"
            >
              <Menu size={16} />
              <span style={{ fontSize: '10px', fontWeight: 800 }}>ESC</span>
            </button>

            <button
              {...touchProps('r', 'KeyR', 82)}
              className="nfsmw-touch-btn util-btn"
              title="Reset Car (R)"
            >
              <RotateCcw size={15} />
              <span style={{ fontSize: '10px', fontWeight: 800 }}>RESET</span>
            </button>
          </div>

          {/* Center Quick Skip Intro / Continue Button */}
          <button
            {...touchProps('Enter', 'Enter', 13)}
            className="nfsmw-touch-btn util-btn center-enter-btn"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.95) 100%)',
              color: '#000',
              borderColor: '#f59e0b',
              padding: '6px 14px',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
            }}
            title="Press Enter / Space (Skip Intros / Continue)"
          >
            <Play size={14} fill="#000" />
            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.04em' }}>ENTER / SKIP</span>
          </button>

          {/* Top-Right Utility Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              {...touchProps('c', 'KeyC', 67)}
              className="nfsmw-touch-btn util-btn"
              title="Change Camera (C)"
            >
              <Camera size={15} />
              <span style={{ fontSize: '10px', fontWeight: 800 }}>CAM</span>
            </button>

            <button
              {...touchProps('g', 'KeyG', 71)}
              className={`nfsmw-touch-btn util-btn ${activeKeys.has('KeyG') ? 'active-speedbreaker' : ''}`}
              title="Speedbreaker (G)"
              style={{
                borderColor: '#eab308',
                color: '#eab308',
              }}
            >
              <CircleDot size={15} />
              <span style={{ fontSize: '10px', fontWeight: 800 }}>SPEEDB</span>
            </button>

            <button
              onClick={() => setShowTweakDrawer(!showTweakDrawer)}
              className="nfsmw-touch-btn util-btn settings-gear"
              title="Adjust Mobile Touch Controls"
              style={{
                background: showTweakDrawer ? '#f59e0b' : 'rgba(18, 22, 32, 0.85)',
                color: showTweakDrawer ? '#000' : '#cbd5e1',
              }}
            >
              <Sliders size={15} />
            </button>
          </div>
        </div>
      )}

      {/* When individual positions is active, keep gear icon at top right */}
      {settings.individualPositions && (
        <div style={{ position: 'absolute', top: '14px', right: '14px', pointerEvents: 'auto', zIndex: 60 }}>
          <button
            onClick={() => setShowTweakDrawer(!showTweakDrawer)}
            className="nfsmw-touch-btn util-btn settings-gear"
            title="Adjust Mobile Touch Controls"
            style={{
              background: showTweakDrawer ? '#f59e0b' : 'rgba(18, 22, 32, 0.85)',
              color: showTweakDrawer ? '#000' : '#cbd5e1',
            }}
          >
            <Sliders size={15} />
          </button>
        </div>
      )}

      {/* Gyro HUD Indicator (when Gyro Steering is active) */}
      {settings.gyroEnabled && (
        <div
          style={{
            position: 'absolute',
            top: isPortrait ? '56px' : '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(10, 14, 22, 0.88)',
            border: '1px solid #f59e0b',
            borderRadius: '20px',
            padding: '4px 14px',
            pointerEvents: 'auto',
          }}
        >
          <Compass size={14} color="#f59e0b" className={gyroSteerDirection !== 'center' ? 'spin-anim' : ''} />
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b' }}>
            GYRO TILT: {gyroSteerDirection.toUpperCase()} ({gyroRawAngle}°)
          </span>
          <button
            onClick={calibrateGyro}
            style={{
              background: '#273042',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Zero-out current phone angle"
          >
            CALIBRATE
          </button>
        </div>
      )}

      {/* Main Touch Controls Layout */}
      {indPos ? (
        <div
          className="nfsmw-custom-touch-layout"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          {/* Steer Left */}
          {!settings.gyroEnabled && (
            <button
              {...touchProps('ArrowLeft', 'ArrowLeft', 37)}
              className={`nfsmw-touch-pad-btn steer-btn ${activeKeys.has('ArrowLeft') ? 'pressed' : ''}`}
              style={{
                position: 'absolute',
                left: `${indPos.steerLeft.x}%`,
                top: `${indPos.steerLeft.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${76 * scale}px`,
                height: `${76 * scale}px`,
                pointerEvents: 'auto',
              }}
              aria-label="Steer Left"
            >
              <ArrowLeft size={32 * scale} />
              <span className="btn-label">LEFT</span>
            </button>
          )}

          {/* Steer Right */}
          {!settings.gyroEnabled && (
            <button
              {...touchProps('ArrowRight', 'ArrowRight', 39)}
              className={`nfsmw-touch-pad-btn steer-btn ${activeKeys.has('ArrowRight') ? 'pressed' : ''}`}
              style={{
                position: 'absolute',
                left: `${indPos.steerRight.x}%`,
                top: `${indPos.steerRight.y}%`,
                transform: 'translate(-50%, -50%)',
                width: `${76 * scale}px`,
                height: `${76 * scale}px`,
                pointerEvents: 'auto',
              }}
              aria-label="Steer Right"
            >
              <ArrowRight size={32 * scale} />
              <span className="btn-label">RIGHT</span>
            </button>
          )}

          {/* Gas / Accelerate */}
          <button
            {...touchProps('ArrowUp', 'ArrowUp', 38)}
            className={`nfsmw-touch-pad-btn gas-pedal-btn ${activeKeys.has('ArrowUp') ? 'pressed' : ''}`}
            style={{
              position: 'absolute',
              left: `${indPos.accelerate.x}%`,
              top: `${indPos.accelerate.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${82 * scale}px`,
              height: `${96 * scale}px`,
              pointerEvents: 'auto',
            }}
            aria-label="Accelerate"
          >
            <ArrowUp size={34 * scale} color="#10b981" />
            <span className="btn-label" style={{ color: '#10b981', fontWeight: 900 }}>GAS</span>
          </button>

          {/* Brake / Reverse */}
          <button
            {...touchProps('ArrowDown', 'ArrowDown', 40)}
            className={`nfsmw-touch-pad-btn brake-pedal-btn ${activeKeys.has('ArrowDown') ? 'pressed' : ''}`}
            style={{
              position: 'absolute',
              left: `${indPos.brake.x}%`,
              top: `${indPos.brake.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${76 * scale}px`,
              height: `${76 * scale}px`,
              pointerEvents: 'auto',
            }}
            aria-label="Brake"
          >
            <ArrowDown size={30 * scale} color="#ef4444" />
            <span className="btn-label" style={{ color: '#ef4444', fontWeight: 900 }}>BRAKE</span>
          </button>

          {/* Nitrous (NOS) */}
          <button
            {...touchProps('Shift', 'ShiftLeft', 16)}
            className={`nfsmw-touch-pad-btn nos-btn ${activeKeys.has('ShiftLeft') ? 'pressed' : ''}`}
            style={{
              position: 'absolute',
              left: `${indPos.nitrous.x}%`,
              top: `${indPos.nitrous.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${74 * scale}px`,
              height: `${64 * scale}px`,
              pointerEvents: 'auto',
            }}
            aria-label="Nitrous Boost"
          >
            <Flame size={26 * scale} color="#06b6d4" />
            <span className="btn-label" style={{ color: '#06b6d4' }}>NOS</span>
          </button>

          {/* Handbrake / Drift */}
          <button
            {...touchProps(' ', 'Space', 32)}
            className={`nfsmw-touch-pad-btn handbrake-btn ${activeKeys.has('Space') ? 'pressed' : ''}`}
            style={{
              position: 'absolute',
              left: `${indPos.handbrake.x}%`,
              top: `${indPos.handbrake.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${78 * scale}px`,
              height: `${64 * scale}px`,
              pointerEvents: 'auto',
            }}
            aria-label="Handbrake"
          >
            <RotateCcw size={20 * scale} />
            <span className="btn-label">E-BRAKE</span>
          </button>

          {/* Speedbreaker */}
          <button
            {...touchProps('g', 'KeyG', 71)}
            className={`nfsmw-touch-btn util-btn ${activeKeys.has('KeyG') ? 'active-speedbreaker' : ''}`}
            style={{
              position: 'absolute',
              left: `${indPos.speedbreaker.x}%`,
              top: `${indPos.speedbreaker.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${68 * scale}px`,
              height: `${48 * scale}px`,
              borderColor: '#eab308',
              color: '#eab308',
              pointerEvents: 'auto',
            }}
            aria-label="Speedbreaker"
          >
            <CircleDot size={20 * scale} />
            <span style={{ fontSize: '10px', fontWeight: 800 }}>SPEEDB</span>
          </button>

          {/* Reset Car */}
          <button
            {...touchProps('r', 'KeyR', 82)}
            className="nfsmw-touch-btn util-btn"
            style={{
              position: 'absolute',
              left: `${indPos.reset.x}%`,
              top: `${indPos.reset.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${64 * scale}px`,
              height: `${40 * scale}px`,
              pointerEvents: 'auto',
            }}
            aria-label="Reset Car"
          >
            <RotateCcw size={15 * scale} />
            <span style={{ fontSize: '10px', fontWeight: 800 }}>RESET</span>
          </button>

          {/* Switch Camera */}
          <button
            {...touchProps('c', 'KeyC', 67)}
            className="nfsmw-touch-btn util-btn"
            style={{
              position: 'absolute',
              left: `${indPos.camera.x}%`,
              top: `${indPos.camera.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${64 * scale}px`,
              height: `${40 * scale}px`,
              pointerEvents: 'auto',
            }}
            aria-label="Camera"
          >
            <Camera size={15 * scale} />
            <span style={{ fontSize: '10px', fontWeight: 800 }}>CAM</span>
          </button>

          {/* Pause / Escape */}
          <button
            {...touchProps('Escape', 'Escape', 27)}
            className="nfsmw-touch-btn util-btn"
            style={{
              position: 'absolute',
              left: `${indPos.pause.x}%`,
              top: `${indPos.pause.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${64 * scale}px`,
              height: `${40 * scale}px`,
              borderColor: '#f59e0b',
              color: '#f59e0b',
              pointerEvents: 'auto',
            }}
            aria-label="Pause"
          >
            <Menu size={16 * scale} />
            <span style={{ fontSize: '10px', fontWeight: 800 }}>ESC</span>
          </button>

          {/* Enter / Skip */}
          <button
            {...touchProps('Enter', 'Enter', 13)}
            className="nfsmw-touch-btn util-btn center-enter-btn"
            style={{
              position: 'absolute',
              left: `${indPos.enter.x}%`,
              top: `${indPos.enter.y}%`,
              transform: 'translate(-50%, -50%)',
              width: `${96 * scale}px`,
              height: `${40 * scale}px`,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.98) 100%)',
              color: '#000',
              borderColor: '#f59e0b',
              pointerEvents: 'auto',
            }}
            aria-label="Enter"
          >
            <Play size={13 * scale} fill="#000" />
            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.04em' }}>ENTER</span>
          </button>
        </div>
      ) : (
        /* Default Clustered Touch Controls Layout */
        <div
          style={{
            position: 'absolute',
            bottom: isPortrait ? '16px' : '20px',
            left: isPortrait ? '12px' : '24px',
            right: isPortrait ? '12px' : '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexDirection: settings.swapHands ? 'row-reverse' : 'row',
            pointerEvents: 'none',
          }}
        >
          {/* Steering Cluster (Left side by default) */}
          {!settings.gyroEnabled ? (
            <div
              className="steering-cluster"
              style={{
                display: 'flex',
                gap: `${14 * scale}px`,
                pointerEvents: 'auto',
                transform: `translate(${settings.customPositions?.steerCluster?.x || 0}px, ${settings.customPositions?.steerCluster?.y || 0}px)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              {/* Steer Left */}
              <button
                {...touchProps('ArrowLeft', 'ArrowLeft', 37)}
                className={`nfsmw-touch-pad-btn steer-btn ${activeKeys.has('ArrowLeft') ? 'pressed' : ''}`}
                style={{
                  width: `${76 * scale}px`,
                  height: `${76 * scale}px`,
                }}
                aria-label="Steer Left"
              >
                <ArrowLeft size={34 * scale} />
                <span className="btn-label">LEFT</span>
              </button>

              {/* Steer Right */}
              <button
                {...touchProps('ArrowRight', 'ArrowRight', 39)}
                className={`nfsmw-touch-pad-btn steer-btn ${activeKeys.has('ArrowRight') ? 'pressed' : ''}`}
                style={{
                  width: `${76 * scale}px`,
                  height: `${76 * scale}px`,
                }}
                aria-label="Steer Right"
              >
                <ArrowRight size={34 * scale} />
                <span className="btn-label">RIGHT</span>
              </button>
            </div>
          ) : (
            /* Gyro Active placeholder with Handbrake */
            <div
              style={{
                pointerEvents: 'auto',
                transform: `translate(${settings.customPositions?.steerCluster?.x || 0}px, ${settings.customPositions?.steerCluster?.y || 0}px)`,
              }}
            >
              <button
                {...touchProps(' ', 'Space', 32)}
                className={`nfsmw-touch-pad-btn handbrake-btn ${activeKeys.has('Space') ? 'pressed' : ''}`}
                style={{
                  width: `${84 * scale}px`,
                  height: `${68 * scale}px`,
                }}
                aria-label="Handbrake Drift"
              >
                <RotateCcw size={22 * scale} />
                <span className="btn-label">DRIFT / E-BRAKE</span>
              </button>
            </div>
          )}

          {/* Action & Pedals Cluster (Right side by default) */}
          <div
            className="pedals-cluster"
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: `${14 * scale}px`,
              pointerEvents: 'auto',
              transform: `translate(${settings.customPositions?.pedalsCluster?.x || 0}px, ${settings.customPositions?.pedalsCluster?.y || 0}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {/* Nitrous (NOS) & Handbrake Vertical Stack */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${10 * scale}px`,
                transform: `translate(${settings.customPositions?.nitroHandbrakeCluster?.x || 0}px, ${settings.customPositions?.nitroHandbrakeCluster?.y || 0}px)`,
              }}
            >
              {/* Nitrous Button (Cyan Glow) */}
              <button
                {...touchProps('Shift', 'ShiftLeft', 16)}
                className={`nfsmw-touch-pad-btn nos-btn ${activeKeys.has('ShiftLeft') ? 'pressed' : ''}`}
                style={{
                  width: `${74 * scale}px`,
                  height: `${64 * scale}px`,
                }}
                aria-label="Nitrous Boost"
              >
                <Flame size={26 * scale} color="#06b6d4" />
                <span className="btn-label" style={{ color: '#06b6d4' }}>NOS</span>
              </button>

              {/* Handbrake Button (if not gyro mode) */}
              {!settings.gyroEnabled && (
                <button
                  {...touchProps(' ', 'Space', 32)}
                  className={`nfsmw-touch-pad-btn handbrake-btn ${activeKeys.has('Space') ? 'pressed' : ''}`}
                  style={{
                    width: `${74 * scale}px`,
                    height: `${56 * scale}px`,
                  }}
                  aria-label="Handbrake"
                >
                  <span className="btn-label">BRAKE</span>
                </button>
              )}
            </div>

            {/* Primary Drive Pedals (Brake / Reverse & Gas / Front Key) */}
            <div style={{ display: 'flex', gap: `${12 * scale}px` }}>
              {/* Back Key / Footbrake / Reverse */}
              <button
                {...touchProps('ArrowDown', 'ArrowDown', 40)}
                className={`nfsmw-touch-pad-btn brake-pedal-btn ${activeKeys.has('ArrowDown') ? 'pressed' : ''}`}
                style={{
                  width: `${76 * scale}px`,
                  height: `${96 * scale}px`,
                }}
                aria-label="Brake and Reverse"
              >
                <ArrowDown size={32 * scale} color="#ef4444" />
                <span className="btn-label" style={{ color: '#ef4444' }}>BRAKE / REV</span>
              </button>

              {/* Front Key / Accelerate / Gas Pedal */}
              <button
                {...touchProps('ArrowUp', 'ArrowUp', 38)}
                className={`nfsmw-touch-pad-btn gas-pedal-btn ${activeKeys.has('ArrowUp') ? 'pressed' : ''}`}
                style={{
                  width: `${86 * scale}px`,
                  height: `${110 * scale}px`,
                }}
                aria-label="Accelerate (Front Key)"
              >
                <ArrowUp size={36 * scale} color="#10b981" />
                <span className="btn-label" style={{ color: '#10b981', fontWeight: 900 }}>GAS / DRIVE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating On-Screen Controls Customizer Drawer */}
      {showTweakDrawer && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            top: '64px',
            right: '16px',
            width: 'min(360px, calc(100vw - 32px))',
            padding: '20px',
            background: 'rgba(14, 18, 26, 0.98)',
            border: '1px solid #f59e0b',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9), 0 0 20px rgba(245, 158, 11, 0.2)',
            pointerEvents: 'auto',
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #232b3c', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '13px' }}>
              <Sliders size={16} />
              <span>TOUCH & GYRO CONTROLS</span>
            </div>
            <button
              onClick={() => setShowTweakDrawer(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
            {/* Button Scale */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#cbd5e1' }}>Button Size:</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={scale}
                onChange={(e) => onUpdateSettings({ buttonScale: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Button Opacity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: '#cbd5e1' }}>Opacity:</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => onUpdateSettings({ opacity: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Gyro Tilt Steering Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #232b3c' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700 }}>Gyroscope Tilt Steering</div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Tilt your phone to turn car</div>
              </div>
              <button
                onClick={requestGyroPermission}
                className="btn"
                style={{
                  background: settings.gyroEnabled ? '#10b981' : '#273042',
                  color: settings.gyroEnabled ? '#000' : '#cbd5e1',
                  fontWeight: 800,
                  fontSize: '11px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                }}
              >
                {!hasGyroPermission ? 'DENIED' : settings.gyroEnabled ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            {settings.gyroEnabled && (
              <>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#cbd5e1' }}>Gyro Sensitivity:</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>{settings.gyroSensitivity}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={settings.gyroSensitivity}
                    onChange={(e) => onUpdateSettings({ gyroSensitivity: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: '#10b981' }}
                  />
                </div>

                <button
                  onClick={calibrateGyro}
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '8px', fontSize: '11px', fontWeight: 700 }}
                >
                  <Compass size={14} color="#f59e0b" />
                  Calibrate Level Angle (Currently: {gyroRawAngle}°)
                </button>
              </>
            )}

            {/* Left-Handed Swap */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid #232b3c' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700 }}>Left-Handed Mode</div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Swaps steering and pedals</div>
              </div>
              <button
                onClick={() => onUpdateSettings({ swapHands: !settings.swapHands })}
                className="btn"
                style={{
                  background: settings.swapHands ? '#f59e0b' : '#273042',
                  color: settings.swapHands ? '#000' : '#cbd5e1',
                  fontWeight: 800,
                  fontSize: '11px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                }}
              >
                {settings.swapHands ? 'SWAPPED' : 'STANDARD'}
              </button>
            </div>

            {/* Haptics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 700 }}>Vibration Haptics</div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Haptic click on touch</div>
              </div>
              <button
                onClick={() => onUpdateSettings({ haptics: !settings.haptics })}
                className="btn"
                style={{
                  background: settings.haptics ? '#10b981' : '#273042',
                  color: settings.haptics ? '#000' : '#cbd5e1',
                  fontWeight: 800,
                  fontSize: '11px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                }}
              >
                {settings.haptics ? 'ON' : 'OFF'}
              </button>
            </div>

            <button
              onClick={() => setShowTweakDrawer(false)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '6px', padding: '8px', fontSize: '12px' }}
            >
              <Check size={14} />
              Done Adjusting
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
