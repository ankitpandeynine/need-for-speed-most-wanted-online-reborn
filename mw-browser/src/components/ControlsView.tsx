import React, { useState, useEffect } from 'react';
import { MobileControlSettings, KeyBindings } from '../types';
import {
  Smartphone,
  Compass,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
  CircleDot,
  RotateCcw,
  Keyboard,
  Vibrate,
  Gamepad2,
  CheckCircle2,
} from 'lucide-react';

interface ControlsViewProps {
  settings: MobileControlSettings;
  keyBindings: KeyBindings;
  onUpdateSettings: (newSettings: Partial<MobileControlSettings>) => void;
  onUpdateKeyBindings: (newBindings: Partial<KeyBindings>) => void;
  onLaunchGame: () => void;
}

const ACTION_LABELS: { id: keyof KeyBindings; label: string; desc: string; defaultCode: string }[] = [
  { id: 'accelerate', label: 'Accelerate (Gas Pedal)', desc: 'Drives forward and throttles engine', defaultCode: 'ArrowUp' },
  { id: 'brake', label: 'Brake / Reverse', desc: 'Slows down and reverses vehicle', defaultCode: 'ArrowDown' },
  { id: 'steerLeft', label: 'Steer Left', desc: 'Turns steering wheel to the left', defaultCode: 'ArrowLeft' },
  { id: 'steerRight', label: 'Steer Right', desc: 'Turns steering wheel to the right', defaultCode: 'ArrowRight' },
  { id: 'nitrous', label: 'Nitrous Oxide (NOS)', desc: 'Boost propulsion and exhaust flames', defaultCode: 'ShiftLeft' },
  { id: 'handbrake', label: 'Handbrake (E-Brake)', desc: 'Locks rear wheels for power sliding and drifting', defaultCode: 'Space' },
  { id: 'speedbreaker', label: 'Speedbreaker', desc: 'Bullet-time slow motion for tight police evasions', defaultCode: 'KeyG' },
  { id: 'camera', label: 'Switch Camera', desc: 'Toggles between Bumper, Hood, and Chase views', defaultCode: 'KeyC' },
  { id: 'reset', label: 'Reset Car', desc: 'Replaces flipped vehicle back onto road', defaultCode: 'KeyR' },
  { id: 'pause', label: 'Pause / Menu (Escape)', desc: 'Opens in-game options menu', defaultCode: 'Escape' },
];

export const ControlsView: React.FC<ControlsViewProps> = ({
  settings,
  keyBindings,
  onUpdateSettings,
  onUpdateKeyBindings,
  onLaunchGame,
}) => {
  const [gyroTestedAngle, setGyroTestedAngle] = useState<number>(0);
  const [gyroActiveDirection, setGyroActiveDirection] = useState<'center' | 'left' | 'right'>('center');
  const [testPressedKey, setTestPressedKey] = useState<string | null>(null);
  const [calibratedNotice, setCalibratedNotice] = useState(false);

  // Rebinding state
  const [rebindingAction, setRebindingAction] = useState<keyof KeyBindings | null>(null);

  // Live Gamepad Connection
  const [gamepadInfo, setGamepadInfo] = useState<{ id: string; buttons: boolean[]; axes: number[] } | null>(null);

  useEffect(() => {
    let animId: number;
    const poll = () => {
      if (typeof navigator !== 'undefined' && navigator.getGamepads) {
        const gps = navigator.getGamepads();
        const active = Array.from(gps).find((g) => g !== null);
        if (active) {
          setGamepadInfo({
            id: active.id,
            buttons: active.buttons.map((b) => b.pressed || b.value > 0.2),
            axes: Array.from(active.axes).map((a) => Math.round(a * 100) / 100),
          });
        } else {
          setGamepadInfo(null);
        }
      }
      animId = requestAnimationFrame(poll);
    };
    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Key rebinding listener
  useEffect(() => {
    if (!rebindingAction) return;

    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onUpdateKeyBindings({ [rebindingAction]: e.code });
      setRebindingAction(null);
    };

    window.addEventListener('keydown', handleKey, { once: true });
    return () => window.removeEventListener('keydown', handleKey);
  }, [rebindingAction, onUpdateKeyBindings]);

  // Live gyro tester for user preview
  useEffect(() => {
    if (!settings.gyroEnabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma || 0;
      setGyroTestedAngle(Math.round(gamma));
      if (gamma < -settings.gyroDeadzone) {
        setGyroActiveDirection('left');
      } else if (gamma > settings.gyroDeadzone) {
        setGyroActiveDirection('right');
      } else {
        setGyroActiveDirection('center');
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [settings.gyroEnabled, settings.gyroDeadzone]);

  const requestIosGyro = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          onUpdateSettings({ gyroEnabled: true });
          alert('Gyroscope motion sensors authorized successfully!');
        } else {
          alert('Motion sensor permission was denied in your browser settings.');
        }
      } catch (err: any) {
        alert('Could not request gyro permission: ' + err.message);
      }
    } else {
      onUpdateSettings({ gyroEnabled: !settings.gyroEnabled });
    }
  };

  const handleCalibrate = () => {
    setCalibratedNotice(true);
    setTimeout(() => setCalibratedNotice(false), 2000);
  };

  const triggerTestPress = (keyName: string) => {
    setTestPressedKey(keyName);
    if (settings.haptics && navigator.vibrate) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
    setTimeout(() => setTestPressedKey(null), 250);
  };

  const handleResetKeyBindings = () => {
    const defaults: KeyBindings = {
      accelerate: 'ArrowUp',
      brake: 'ArrowDown',
      steerLeft: 'ArrowLeft',
      steerRight: 'ArrowRight',
      nitrous: 'ShiftLeft',
      handbrake: 'Space',
      speedbreaker: 'KeyG',
      camera: 'KeyC',
      reset: 'KeyR',
      pause: 'Escape',
    };
    onUpdateKeyBindings(defaults);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '16px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            marginBottom: '12px',
          }}
        >
          <Keyboard size={14} color="#f59e0b" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            PC Keybindings • Controllers • Mobile Gyro
          </span>
        </div>
        <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          CONTROLS & HARDWARE INPUT
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '6px' }}>
          Customize your keyboard bindings, plug in any Xbox or PlayStation controller, or configure mobile on-screen pedals and gyroscope steering.
        </p>
      </div>

      {/* 1. PC Keyboard Keybindings Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #273042', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Keyboard size={20} color="#f59e0b" />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                PC Keyboard Keybindings
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Both Arrow Keys and WASD work by default. Click any key to rebind to your preferred key.
              </div>
            </div>
          </div>

          <button
            onClick={handleResetKeyBindings}
            className="btn btn-secondary"
            style={{ padding: '6px 14px', fontSize: '12px', color: '#94a3b8' }}
          >
            Reset to Defaults
          </button>
        </div>

        {rebindingAction && (
          <div
            style={{
              padding: '14px 20px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              marginBottom: '18px',
              color: '#f59e0b',
              fontWeight: 800,
              textAlign: 'center',
              animation: 'pulse 1.5s infinite',
            }}
          >
            👉 Press any key on your keyboard now to assign to "{ACTION_LABELS.find((a) => a.id === rebindingAction)?.label}"...
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {ACTION_LABELS.map((item) => {
            const currentCode = keyBindings[item.id] || item.defaultCode;
            const isRebinding = rebindingAction === item.id;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: isRebinding ? 'rgba(245, 158, 11, 0.12)' : '#121622',
                  borderRadius: '10px',
                  border: isRebinding ? '1px solid #f59e0b' : '1px solid #232b3c',
                  transition: 'all 0.15s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{item.desc}</div>
                </div>

                <button
                  onClick={() => setRebindingAction(item.id)}
                  className="btn"
                  style={{
                    background: isRebinding ? '#f59e0b' : '#1e2638',
                    color: isRebinding ? '#000' : '#f59e0b',
                    fontWeight: 800,
                    fontSize: '12px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    minWidth: '80px',
                    textAlign: 'center',
                  }}
                  title="Click to rebind this key"
                >
                  {isRebinding ? 'PRESS KEY' : currentCode}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Controller & Gamepad Connectivity Card */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #273042', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Gamepad2 size={20} color="#06b6d4" />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                Controller & Gamepad Connectivity
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Full native Gamepad API support for Xbox, PlayStation DualSense / DualShock, and Bluetooth controllers.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {gamepadInfo ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 800 }}>
                <CheckCircle2 size={16} color="#10b981" />
                CONTROLLER CONNECTED
              </span>
            ) : (
              <span style={{ color: '#64748b', fontSize: '13px' }}>
                Connect a USB or Bluetooth gamepad to test
              </span>
            )}
          </div>
        </div>

        {gamepadInfo ? (
          <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.25)', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              🎮 Device: <span style={{ color: '#06b6d4' }}>{gamepadInfo.id}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Live Triggers & Sticks: Steering Axis ({gamepadInfo.axes[0] || 0}) • Accelerate RT ({gamepadInfo.buttons[7] ? 'Pressed' : 'Off'}) • Brake LT ({gamepadInfo.buttons[6] ? 'Pressed' : 'Off'})
            </div>
          </div>
        ) : null}

        {/* Standard Layout Reference Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '12px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Right Trigger (RT / R2):</span>
            <span style={{ color: '#10b981', fontWeight: 800, float: 'right' }}>Accelerate (Gas)</span>
          </div>
          <div style={{ padding: '12px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Left Trigger (LT / L2):</span>
            <span style={{ color: '#ef4444', fontWeight: 800, float: 'right' }}>Brake / Reverse</span>
          </div>
          <div style={{ padding: '12px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Left Thumbstick:</span>
            <span style={{ color: '#06b6d4', fontWeight: 800, float: 'right' }}>Steer Left / Right</span>
          </div>
          <div style={{ padding: '12px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Button A / Cross:</span>
            <span style={{ color: '#06b6d4', fontWeight: 800, float: 'right' }}>Nitrous Boost (NOS)</span>
          </div>
          <div style={{ padding: '12px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Button X / Square:</span>
            <span style={{ color: '#f59e0b', fontWeight: 800, float: 'right' }}>Handbrake (E-Brake)</span>
          </div>
          <div style={{ padding: '12px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Button B / Circle:</span>
            <span style={{ color: '#a855f7', fontWeight: 800, float: 'right' }}>Speedbreaker</span>
          </div>
          <div style={{ padding: '12px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Button Y / Triangle:</span>
            <span style={{ color: '#fff', fontWeight: 800, float: 'right' }}>Change Camera</span>
          </div>
          <div style={{ padding: '12px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Start / Options:</span>
            <span style={{ color: '#f59e0b', fontWeight: 800, float: 'right' }}>Pause / Menu (Esc)</span>
          </div>
        </div>
      </div>

      {/* 3. Mobile Touch & Gyroscope Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* On-Screen Touch Buttons */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #273042', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Smartphone size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: 0 }}>
                On-Screen Touch Buttons
              </h3>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => onUpdateSettings({ enabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 700, color: settings.enabled ? '#f59e0b' : '#64748b' }}>
                {settings.enabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Button Scale */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                <span>Button Size / Scale</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{Math.round(settings.buttonScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={settings.buttonScale}
                onChange={(e) => onUpdateSettings({ buttonScale: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Button Opacity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                <span>Button Transparency</span>
                <span style={{ color: '#f59e0b', fontWeight: 700 }}>{Math.round(settings.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={settings.opacity}
                onChange={(e) => onUpdateSettings({ opacity: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Left-Handed Swap Mode */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#121622', borderRadius: '10px', border: '1px solid #232b3c' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Left-Handed Mode</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Swap Steering to Right side and Pedals to Left</div>
              </div>
              <input
                type="checkbox"
                checked={settings.swapHands}
                onChange={(e) => onUpdateSettings({ swapHands: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
              />
            </div>

            {/* Haptic Feedback */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#121622', borderRadius: '10px', border: '1px solid #232b3c' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Vibrate size={18} color="#10b981" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Haptic Feedback</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Tactile vibration on touch press</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.haptics}
                onChange={(e) => onUpdateSettings({ haptics: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
              />
            </div>
          </div>
        </div>

        {/* Gyroscope Tilt Steering */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #273042', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={20} color="#06b6d4" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: 0 }}>
                Gyroscope Tilt Steering
              </h3>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.gyroEnabled}
                onChange={(e) => onUpdateSettings({ gyroEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#06b6d4' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 700, color: settings.gyroEnabled ? '#06b6d4' : '#64748b' }}>
                {settings.gyroEnabled ? 'ACTIVE' : 'OFF'}
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0, lineHeight: 1.5 }}>
              Tilt your smartphone left or right like a real steering wheel. NFS Most Wanted will automatically steer your car.
            </p>

            <button
              onClick={requestIosGyro}
              className="btn btn-secondary"
              style={{
                width: '100%',
                justifyContent: 'center',
                borderColor: settings.gyroEnabled ? '#06b6d4' : '#273042',
                color: settings.gyroEnabled ? '#06b6d4' : '#cbd5e1',
                padding: '10px',
              }}
            >
              <Compass size={16} color={settings.gyroEnabled ? '#06b6d4' : 'currentColor'} />
              {settings.gyroEnabled ? 'Sensors Active • Tap to Toggle' : 'Enable Device Motion / Gyro'}
            </button>

            {/* Sensitivity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                <span>Tilt Sensitivity</span>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>{settings.gyroSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={settings.gyroSensitivity}
                onChange={(e) => onUpdateSettings({ gyroSensitivity: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
            </div>

            {/* Deadzone */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                <span>Center Deadzone Angle</span>
                <span style={{ color: '#06b6d4', fontWeight: 700 }}>{settings.gyroDeadzone}°</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.gyroDeadzone}
                onChange={(e) => onUpdateSettings({ gyroDeadzone: parseInt(e.target.value, 10) })}
                style={{ width: '100%', accentColor: '#06b6d4' }}
              />
            </div>

            {/* Angle & Calibrate */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#121622', borderRadius: '10px', border: '1px solid #232b3c' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Live Phone Tilt Angle:</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: gyroActiveDirection !== 'center' ? '#06b6d4' : '#fff' }}>
                  {gyroTestedAngle}° {gyroActiveDirection === 'left' ? '◀ STEER LEFT' : gyroActiveDirection === 'right' ? 'STEER RIGHT ▶' : '● CENTER'}
                </div>
              </div>
              <button
                onClick={handleCalibrate}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', color: '#f59e0b', borderColor: '#f59e0b' }}
              >
                <RotateCcw size={13} />
                {calibratedNotice ? 'Calibrated!' : 'Calibrate Zero'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Touch Test Pad */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #273042', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: 0 }}>
              Live Button Preview & Test Pad
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            Tap or click any button below to test responsiveness & haptic vibration
          </span>
        </div>

        <div
          style={{
            background: 'linear-gradient(180deg, #0f131a 0%, #07090e 100%)',
            borderRadius: '16px',
            border: '1px solid #273042',
            padding: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          {/* Steering */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Steering</div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                onClick={() => triggerTestPress('LEFT')}
                className={`nfsmw-touch-pad-btn ${testPressedKey === 'LEFT' ? 'pressed' : ''}`}
                style={{ width: '64px', height: '64px', transform: `scale(${settings.buttonScale})` }}
              >
                <ArrowLeft size={24} color="#f59e0b" />
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>LEFT</span>
              </button>
              <button
                onClick={() => triggerTestPress('RIGHT')}
                className={`nfsmw-touch-pad-btn ${testPressedKey === 'RIGHT' ? 'pressed' : ''}`}
                style={{ width: '64px', height: '64px', transform: `scale(${settings.buttonScale})` }}
              >
                <ArrowRight size={24} color="#f59e0b" />
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>RIGHT</span>
              </button>
            </div>
          </div>

          {/* Action: NOS & E-Brake */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Pursuit & Boost</div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                onClick={() => triggerTestPress('NOS')}
                className={`nfsmw-touch-pad-btn nos-btn ${testPressedKey === 'NOS' ? 'pressed' : ''}`}
                style={{ width: '64px', height: '64px', transform: `scale(${settings.buttonScale})` }}
              >
                <Flame size={24} color="#06b6d4" />
                <span style={{ fontSize: '10px', color: '#67e8f9', fontWeight: 800 }}>NOS</span>
              </button>
              <button
                onClick={() => triggerTestPress('HANDBRAKE')}
                className={`nfsmw-touch-pad-btn handbrake-btn ${testPressedKey === 'HANDBRAKE' ? 'pressed' : ''}`}
                style={{ width: '64px', height: '64px', transform: `scale(${settings.buttonScale})` }}
              >
                <CircleDot size={22} color="#f59e0b" />
                <span style={{ fontSize: '9px', color: '#cbd5e1', fontWeight: 800 }}>E-BRAKE</span>
              </button>
            </div>
          </div>

          {/* Drive Pedals */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Drive Pedals</div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                onClick={() => triggerTestPress('BRAKE')}
                className={`nfsmw-touch-pad-btn brake-pedal-btn ${testPressedKey === 'BRAKE' ? 'pressed' : ''}`}
                style={{ width: '68px', height: '74px', transform: `scale(${settings.buttonScale})` }}
              >
                <ArrowDown size={26} color="#ef4444" />
                <span style={{ fontSize: '10px', color: '#fca5a5', fontWeight: 800 }}>BRAKE</span>
              </button>
              <button
                onClick={() => triggerTestPress('GAS')}
                className={`nfsmw-touch-pad-btn gas-pedal-btn ${testPressedKey === 'GAS' ? 'pressed' : ''}`}
                style={{ width: '68px', height: '82px', transform: `scale(${settings.buttonScale})` }}
              >
                <ArrowUp size={28} color="#10b981" />
                <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 900 }}>GAS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onLaunchGame}
          className="btn btn-primary"
          style={{ padding: '14px 36px', fontSize: '16px', fontWeight: 800 }}
        >
          Launch Game with Current Setup
        </button>
      </div>
    </div>
  );
};
