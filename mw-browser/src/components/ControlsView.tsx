import React, { useState, useEffect } from 'react';
import { MobileControlSettings, KeyBindings, TouchCustomPositions } from '../types';
import {
  Smartphone,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
  CircleDot,
  RotateCcw,
  Keyboard,
  Vibrate,
  CheckCircle2,
  Move,
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
  const [calibratedNotice, setCalibratedNotice] = useState(false);
  const [positionsSavedNotice, setPositionsSavedNotice] = useState(false);

  // Rebinding state
  const [rebindingAction, setRebindingAction] = useState<keyof KeyBindings | null>(null);

  // Custom Placement state
  const customPos = settings.customPositions || {
    steerCluster: { x: 0, y: 0 },
    pedalsCluster: { x: 0, y: 0 },
    nitroHandbrakeCluster: { x: 0, y: 0 },
  };

  const updateClusterPos = (
    cluster: 'steerCluster' | 'pedalsCluster' | 'nitroHandbrakeCluster',
    axis: 'x' | 'y',
    val: number
  ) => {
    const updated: TouchCustomPositions = {
      ...customPos,
      [cluster]: {
        ...(customPos[cluster] || { x: 0, y: 0 }),
        [axis]: val,
      },
    };
    onUpdateSettings({ customPositions: updated });
    setPositionsSavedNotice(true);
    setTimeout(() => setPositionsSavedNotice(false), 2000);
  };

  const resetClusterPositions = () => {
    onUpdateSettings({
      customPositions: {
        steerCluster: { x: 0, y: 0 },
        pedalsCluster: { x: 0, y: 0 },
        nitroHandbrakeCluster: { x: 0, y: 0 },
      },
    });
  };

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
    <div className="page-responsive-container">
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
            PC Keybindings • Controllers • Mobile Gyro & Touch Customizer
          </span>
        </div>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          CONTROLS & HARDWARE INPUT
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '6px' }}>
          Rebind PC keys, connect Xbox / PlayStation gamepads, or customize mobile touch button placements with drag & offset controls.
        </p>
      </div>

      {/* 1. Mobile Touch Screen Placement Customizer */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #273042', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Move size={20} color="#f59e0b" />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Touch Screen Controls & Custom Placement
              </h3>
              <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                Adjust the on-screen button positions and offsets to fit your phone, tablet, or foldable screen.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {positionsSavedNotice && (
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Saved Live
              </span>
            )}
            <button
              onClick={resetClusterPositions}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Reset Positions
            </button>
          </div>
        </div>

        {/* Interactive Virtual Device Screen Mockup */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            background: 'radial-gradient(ellipse at center, #171d2b 0%, #0a0c12 100%)',
            border: '2px solid #273042',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Faint road perspective in background */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, #334155, #334155 1px, transparent 1px, transparent 40px)' }} />

          <div style={{ position: 'absolute', top: '12px', left: '16px', fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
            LIVE SCREEN PREVIEW (LANDSCAPE)
          </div>

          {/* Steer Cluster Preview */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: `${20 + (customPos.steerCluster?.x || 0)}px`,
              transform: `translateY(${-(customPos.steerCluster?.y || 0)}px)`,
              display: 'flex',
              gap: '8px',
              padding: '6px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px dashed #f59e0b',
              borderRadius: '12px',
              transition: 'all 0.1s ease-out',
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#1c2333', border: '1px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <ArrowLeft size={18} />
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#1c2333', border: '1px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <ArrowRight size={18} />
            </div>
          </div>

          {/* Nitro & Handbrake Preview */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: `${120 - (customPos.nitroHandbrakeCluster?.x || 0)}px`,
              transform: `translateY(${-(customPos.nitroHandbrakeCluster?.y || 0)}px)`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '6px',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px dashed #06b6d4',
              borderRadius: '10px',
              transition: 'all 0.1s ease-out',
            }}
          >
            <div style={{ width: '38px', height: '32px', borderRadius: '8px', background: '#1c2333', border: '1px solid #06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
              <Flame size={14} />
            </div>
            <div style={{ width: '38px', height: '28px', borderRadius: '8px', background: '#1c2333', border: '1px solid #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
              <CircleDot size={12} />
            </div>
          </div>

          {/* Pedals Cluster Preview */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: `${20 - (customPos.pedalsCluster?.x || 0)}px`,
              transform: `translateY(${-(customPos.pedalsCluster?.y || 0)}px)`,
              display: 'flex',
              gap: '8px',
              padding: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px dashed #10b981',
              borderRadius: '12px',
              transition: 'all 0.1s ease-out',
            }}
          >
            <div style={{ width: '38px', height: '46px', borderRadius: '10px', background: '#1c2333', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <ArrowDown size={18} />
            </div>
            <div style={{ width: '38px', height: '52px', borderRadius: '10px', background: '#1c2333', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <ArrowUp size={20} />
            </div>
          </div>
        </div>

        {/* Position Offset Sliders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Steering Position */}
          <div style={{ padding: '14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Steering Cluster (Left/Right)</span>
              <span>X: {customPos.steerCluster?.x || 0}px | Y: {customPos.steerCluster?.y || 0}px</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Horizontal Offset (X)</span>
                <input
                  type="range"
                  min="-60"
                  max="80"
                  value={customPos.steerCluster?.x || 0}
                  onChange={(e) => updateClusterPos('steerCluster', 'x', parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Vertical Offset (Y)</span>
                <input
                  type="range"
                  min="-40"
                  max="60"
                  value={customPos.steerCluster?.y || 0}
                  onChange={(e) => updateClusterPos('steerCluster', 'y', parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#f59e0b' }}
                />
              </div>
            </div>
          </div>

          {/* Pedals Position */}
          <div style={{ padding: '14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#10b981', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Drive Pedals (Gas & Brake)</span>
              <span>X: {customPos.pedalsCluster?.x || 0}px | Y: {customPos.pedalsCluster?.y || 0}px</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Horizontal Offset (X)</span>
                <input
                  type="range"
                  min="-80"
                  max="60"
                  value={customPos.pedalsCluster?.x || 0}
                  onChange={(e) => updateClusterPos('pedalsCluster', 'x', parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Vertical Offset (Y)</span>
                <input
                  type="range"
                  min="-40"
                  max="60"
                  value={customPos.pedalsCluster?.y || 0}
                  onChange={(e) => updateClusterPos('pedalsCluster', 'y', parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>
            </div>
          </div>

          {/* Nitro & Handbrake Position */}
          <div style={{ padding: '14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#06b6d4', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Action Cluster (NOS & E-Brake)</span>
              <span>X: {customPos.nitroHandbrakeCluster?.x || 0}px | Y: {customPos.nitroHandbrakeCluster?.y || 0}px</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Horizontal Offset (X)</span>
                <input
                  type="range"
                  min="-80"
                  max="60"
                  value={customPos.nitroHandbrakeCluster?.x || 0}
                  onChange={(e) => updateClusterPos('nitroHandbrakeCluster', 'x', parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#06b6d4' }}
                />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Vertical Offset (Y)</span>
                <input
                  type="range"
                  min="-40"
                  max="60"
                  value={customPos.nitroHandbrakeCluster?.y || 0}
                  onChange={(e) => updateClusterPos('nitroHandbrakeCluster', 'y', parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#06b6d4' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PC Keyboard Keybindings Card */}
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
                  padding: '12px 14px',
                  background: isRebinding ? 'rgba(245, 158, 11, 0.12)' : '#121622',
                  border: `1px solid ${isRebinding ? '#f59e0b' : '#273042'}`,
                  borderRadius: '10px',
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{item.desc}</div>
                </div>

                <button
                  onClick={() => setRebindingAction(item.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: isRebinding ? '#f59e0b' : '#334155',
                    background: isRebinding ? '#f59e0b' : '#1e2638',
                    color: isRebinding ? '#000' : '#f8fafc',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: '70px',
                    textAlign: 'center',
                  }}
                  title="Click to rebind"
                >
                  {isRebinding ? 'PRESS KEY' : currentCode.replace('Key', '').replace('Arrow', '')}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Gamepad & Mobile Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* On-Screen Touch Settings */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #273042', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Smartphone size={20} color="#f59e0b" />
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: 0 }}>
                Touch Settings
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042' }}>
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
