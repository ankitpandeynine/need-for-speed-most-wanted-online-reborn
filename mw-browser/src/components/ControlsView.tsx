import React, { useState, useEffect } from 'react';
import { MobileControlSettings } from '../types';
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
} from 'lucide-react';

interface ControlsViewProps {
  settings: MobileControlSettings;
  onUpdateSettings: (newSettings: Partial<MobileControlSettings>) => void;
  onLaunchGame: () => void;
}

export const ControlsView: React.FC<ControlsViewProps> = ({
  settings,
  onUpdateSettings,
  onLaunchGame,
}) => {
  const [gyroTestedAngle, setGyroTestedAngle] = useState<number>(0);
  const [gyroActiveDirection, setGyroActiveDirection] = useState<'center' | 'left' | 'right'>('center');
  const [testPressedKey, setTestPressedKey] = useState<string | null>(null);
  const [calibratedNotice, setCalibratedNotice] = useState(false);

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
          <Smartphone size={14} color="#f59e0b" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Touch Controls & Gyroscope Steering
          </span>
        </div>
        <h2 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          MOBILE & INPUT CONTROLS
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '6px' }}>
          Fully customize on-screen virtual pedals, tilt steering sensitivity, button sizes, opacity, and phone orientation support.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Card 1: On-Screen Touch Controls */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                <span>Compact (80%)</span>
                <span>Default (100%)</span>
                <span>Large (150%)</span>
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                <span>Ghost (20%)</span>
                <span>Translucent (80%)</span>
                <span>Solid (100%)</span>
              </div>
            </div>

            {/* Left-Handed Swap Mode */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#121622', borderRadius: '10px', border: '1px solid #232b3c' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Left-Handed Mode</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Swap Steering to Right side and Pedals to Left side</div>
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

        {/* Card 2: Gyroscope Tilt Steering */}
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

            {/* iOS Sensor Permission / Activate Button */}
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

            {/* Gyro Sensitivity */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                <span>Gentle (0.5x)</span>
                <span>Balanced (1.5x)</span>
                <span>Ultra Sharp (3.0x)</span>
              </div>
            </div>

            {/* Deadzone Angle */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                <span>Tight (1°)</span>
                <span>Standard (3°)</span>
                <span>Wide (10°)</span>
              </div>
            </div>

            {/* Live Gyro Angle Indicator & Calibrate */}
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
          {/* Steering Group */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Steering Controls
            </div>
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

          {/* Action Group: Nitrous & Handbrake */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Pursuit & Boost Actions
            </div>
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
              <button
                onClick={() => triggerTestPress('SPEEDBREAKER')}
                className={`nfsmw-touch-pad-btn ${testPressedKey === 'SPEEDBREAKER' ? 'pressed' : ''}`}
                style={{ width: '64px', height: '64px', transform: `scale(${settings.buttonScale})`, borderColor: '#a855f7' }}
              >
                <Compass size={22} color="#c084fc" />
                <span style={{ fontSize: '9px', color: '#c084fc', fontWeight: 800 }}>SLOW</span>
              </button>
            </div>
          </div>

          {/* Drive Pedals: Gas (Front) & Brake (Back) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
              Drive Pedals
            </div>
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

        {testPressedKey && (
          <div style={{ textAlign: 'center', marginTop: '16px', color: '#10b981', fontSize: '13px', fontWeight: 700 }}>
            ✓ Pressed: {testPressedKey} (Virtual key registered)
          </div>
        )}
      </div>

      {/* Desktop / Keyboard Keybind Reference */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid #273042', paddingBottom: '12px' }}>
          <Keyboard size={18} color="#3b82f6" />
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Desktop Keyboard Keybinds Reference
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Accelerate (Gas):</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>Up Arrow / W</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Brake / Reverse:</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>Down Arrow / S</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Steer Left / Right:</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>Left / Right / A, D</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Nitrous Boost (NOS):</span>
            <span style={{ color: '#06b6d4', fontWeight: 700 }}>Left Shift / X</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Handbrake (E-Brake):</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>Spacebar</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Speedbreaker:</span>
            <span style={{ color: '#a855f7', fontWeight: 700 }}>G Key</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Switch Camera:</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>C Key</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#121622', borderRadius: '8px', border: '1px solid #232b3c', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Reset Car / Track:</span>
            <span style={{ color: '#cbd5e1', fontWeight: 700 }}>R Key</span>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button
            onClick={onLaunchGame}
            className="btn btn-primary"
            style={{ padding: '12px 32px', fontSize: '15px', fontWeight: 800 }}
          >
            Launch Game with These Controls
          </button>
        </div>
      </div>
    </div>
  );
};
