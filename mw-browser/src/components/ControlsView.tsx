import React, { useState, useEffect, useRef } from 'react';
import {
  MobileControlSettings,
  KeyBindings,
  ControllerBindings,
  IndividualTouchPositions,
} from '../types';
import {
  Smartphone,
  Gamepad2,
  Keyboard,
  Move,
  CheckCircle2,
  RotateCcw,
  Download,
  Upload,
  Vibrate,
  Maximize2,
  FileCode,
} from 'lucide-react';
import { TouchLayoutEditor } from './TouchLayoutEditor';
import { ProfileSyncService } from '../services/profileSync';

interface ControlsViewProps {
  settings: MobileControlSettings;
  keyBindings: KeyBindings;
  controllerBindings: ControllerBindings;
  onUpdateSettings: (newSettings: Partial<MobileControlSettings>) => void;
  onUpdateKeyBindings: (newBindings: Partial<KeyBindings>) => void;
  onUpdateControllerBindings: (newBindings: Partial<ControllerBindings>) => void;
  onReloadAll?: () => void;
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

interface ControllerActionDef {
  id: keyof ControllerBindings;
  name: string;
  desc: string;
  defaultLabel: string;
}

const CONTROLLER_ACTIONS: ControllerActionDef[] = [
  { id: 'accelerate', name: 'Accelerate (Gas Pedal)', desc: 'Right Trigger analog throttle', defaultLabel: 'RT / R2 (Trigger)' },
  { id: 'brake', name: 'Brake / Reverse', desc: 'Left Trigger analog footbrake', defaultLabel: 'LT / L2 (Trigger)' },
  { id: 'steerLeft', name: 'Steer Left', desc: 'Left Analog Stick or D-Pad Left', defaultLabel: 'Left Stick ◀ / D-Pad' },
  { id: 'steerRight', name: 'Steer Right', desc: 'Left Analog Stick or D-Pad Right', defaultLabel: 'Left Stick ▶ / D-Pad' },
  { id: 'nitrous', name: 'Nitrous Oxide (NOS)', desc: 'Bottom Face Button for boost', defaultLabel: 'A / Cross Button (0)' },
  { id: 'handbrake', name: 'Handbrake (E-Brake)', desc: 'Left Face Button for power slide', defaultLabel: 'X / Square Button (2)' },
  { id: 'speedbreaker', name: 'Speedbreaker', desc: 'Right Face Button for slow-mo evasion', defaultLabel: 'B / Circle Button (1)' },
  { id: 'camera', name: 'Switch Camera', desc: 'Top Face Button to cycle view angles', defaultLabel: 'Y / Triangle Button (3)' },
  { id: 'pause', name: 'Pause / In-Game Menu', desc: 'Menu options and restart race', defaultLabel: 'Start / Options (9)' },
  { id: 'reset', name: 'Reset Car', desc: 'Place car back onto road', defaultLabel: 'Back / Share / Select (8)' },
  { id: 'lookBack', name: 'Look Back (Rear View)', desc: 'Rear mirror rearview mirror look', defaultLabel: 'Right Stick / R3 (11)' },
];

const BUTTON_NAME_MAP: Record<number, string> = {
  0: 'A / Cross (Btn 0)',
  1: 'B / Circle (Btn 1)',
  2: 'X / Square (Btn 2)',
  3: 'Y / Triangle (Btn 3)',
  4: 'LB / L1 (Btn 4)',
  5: 'RB / R1 (Btn 5)',
  6: 'LT / L2 (Btn 6)',
  7: 'RT / R2 (Btn 7)',
  8: 'Back / Share (Btn 8)',
  9: 'Start / Options (Btn 9)',
  10: 'L3 / Left Stick (Btn 10)',
  11: 'R3 / Right Stick (Btn 11)',
  12: 'D-Pad Up (Btn 12)',
  13: 'D-Pad Down (Btn 13)',
  14: 'D-Pad Left (Btn 14)',
  15: 'D-Pad Right (Btn 15)',
};

export const ControlsView: React.FC<ControlsViewProps> = ({
  settings,
  keyBindings,
  controllerBindings,
  onUpdateSettings,
  onUpdateKeyBindings,
  onUpdateControllerBindings,
  onReloadAll,
  onLaunchGame,
}) => {
  // Touch HUD Editor modal state
  const [showTouchEditor, setShowTouchEditor] = useState(false);
  const [screenMetrics, setScreenMetrics] = useState({ width: 1280, height: 720, aspect: '16:9' });

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keyboard rebinding state
  const [rebindingKeyAction, setRebindingKeyAction] = useState<keyof KeyBindings | null>(null);

  // Controller state
  const [connectedGamepad, setConnectedGamepad] = useState<Gamepad | null>(null);
  const [activeGamepadButton, setActiveGamepadButton] = useState<number | null>(null);
  const [rebindingControllerAction, setRebindingControllerAction] = useState<keyof ControllerBindings | null>(null);

  // Gyro test state
  const [gyroTestedAngle, setGyroTestedAngle] = useState<number>(0);
  const [gyroActiveDirection, setGyroActiveDirection] = useState<'center' | 'left' | 'right'>('center');

  // Backup sync state
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isImportingBackup, setIsImportingBackup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Measure display on mount and resize
  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = (w / h).toFixed(2);
      setScreenMetrics({ width: w, height: h, aspect: `${aspect}:1` });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Poll Gamepad Connection & Live Button Monitor
  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      setConnectedGamepad(e.gamepad);
      showToast(`🎮 Gamepad Detected: ${e.gamepad.id.slice(0, 32)}`);
    };

    const handleGamepadDisconnected = () => {
      setConnectedGamepad(null);
      showToast('Gamepad Disconnected');
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Initial check
    if (navigator.getGamepads) {
      const gps = navigator.getGamepads();
      const active = Array.from(gps).find((g) => g !== null);
      if (active) setConnectedGamepad(active);
    }

    let animId: number;
    const pollButtons = () => {
      if (navigator.getGamepads) {
        const gps = navigator.getGamepads();
        const gp = Array.from(gps).find((g) => g !== null);
        if (gp) {
          setConnectedGamepad(gp);
          // Check if any button is pressed
          let pressedBtn: number | null = null;
          for (let i = 0; i < gp.buttons.length; i++) {
            if (gp.buttons[i]?.pressed || (gp.buttons[i]?.value || 0) > 0.3) {
              pressedBtn = i;
              break;
            }
          }
          setActiveGamepadButton(pressedBtn);

          // If in controller rebinding mode and a button is pressed
          if (rebindingControllerAction && pressedBtn !== null) {
            onUpdateControllerBindings({ [rebindingControllerAction]: pressedBtn });
            showToast(`✓ Bound ${CONTROLLER_ACTIONS.find((a) => a.id === rebindingControllerAction)?.name} to ${BUTTON_NAME_MAP[pressedBtn] || `Button ${pressedBtn}`}`);
            setRebindingControllerAction(null);
          }
        } else {
          setActiveGamepadButton(null);
        }
      }
      animId = requestAnimationFrame(pollButtons);
    };

    animId = requestAnimationFrame(pollButtons);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [rebindingControllerAction, onUpdateControllerBindings]);

  // Keyboard rebinding listener
  useEffect(() => {
    if (!rebindingKeyAction) return;

    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onUpdateKeyBindings({ [rebindingKeyAction]: e.code });
      showToast(`✓ Rebound ${rebindingKeyAction} to ${e.code.replace('Key', '').replace('Arrow', '')}`);
      setRebindingKeyAction(null);
    };

    window.addEventListener('keydown', handleKey, { once: true });
    return () => window.removeEventListener('keydown', handleKey);
  }, [rebindingKeyAction, onUpdateKeyBindings]);

  // Live Gyro Tester
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

  // Handle Save from TouchLayoutEditor
  const handleSaveTouchLayout = (newPositions: IndividualTouchPositions) => {
    onUpdateSettings({ individualPositions: newPositions });
    setShowTouchEditor(false);
    showToast('✓ Custom Touch Layout Saved & Applied to Game HUD!');
  };

  // Reset Touch Layout
  const handleResetTouchLayout = () => {
    onUpdateSettings({ individualPositions: undefined });
    showToast('Touch button layout reset to default');
  };

  // Test Controller Vibration
  const handleTestControllerRumble = async () => {
    if (!connectedGamepad) {
      alert('Please connect a gamepad first to test vibration.');
      return;
    }
    const actuator = (connectedGamepad as any).vibrationActuator;
    if (actuator && typeof actuator.playEffect === 'function') {
      try {
        await actuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: 400,
          weakMagnitude: 0.8,
          strongMagnitude: 1.0,
        });
        showToast('✓ Controller Vibration Pulse Sent!');
      } catch (err) {
        console.warn('Vibration effect error:', err);
      }
    } else {
      alert('Vibration / Rumble is not supported by this browser or controller.');
    }
  };

  // Reset Keybindings
  const handleResetKeyBindings = () => {
    onUpdateKeyBindings({
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
    });
    showToast('PC Keybindings reset to defaults');
  };

  // Reset Controller Bindings
  const handleResetControllerBindings = () => {
    onUpdateControllerBindings({
      accelerate: 7,
      brake: 6,
      steerLeft: 'axis0_neg',
      steerRight: 'axis0_pos',
      nitrous: 0,
      handbrake: 2,
      speedbreaker: 1,
      camera: 3,
      pause: 9,
      reset: 8,
      lookBack: 11,
      rumbleEnabled: true,
      deadzone: 0.15,
    });
    showToast('Gamepad bindings reset to NFSMW console defaults');
  };

  // Export Full Universal Backup
  const handleExportBackup = async () => {
    setIsExportingBackup(true);
    try {
      const sync = ProfileSyncService.getInstance();
      const res = await sync.exportBackup();
      sync.downloadFile(res.blob, res.filename);
      showToast(`✓ Universal Backup exported! (${res.filename})`);
    } catch (err: any) {
      alert('Error exporting backup: ' + err.message);
    } finally {
      setIsExportingBackup(false);
    }
  };

  // Import Universal Backup
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingBackup(true);
    try {
      const sync = ProfileSyncService.getInstance();
      const res = await sync.importBackup(file);
      showToast(`✓ ${res.summary}`);
      if (onReloadAll) onReloadAll();
    } catch (err: any) {
      alert('Error restoring backup: ' + err.message);
    } finally {
      setIsImportingBackup(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="page-responsive-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.5)',
            fontSize: '13.5px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

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
            Touch HUD Customizer • Gamepads & Controllers • Keybindings • Universal Backup
          </span>
        </div>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
          CONTROLS & HARDWARE INPUT
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '15px', marginTop: '6px' }}>
          Individually reposition on-screen touch buttons with live display measurement, configure console gamepads, rebind PC keys, or export your universal settings backup.
        </p>
      </div>

      {/* 1. SINGLE OPTION: TOUCH SCREEN CONTROLS & HUD CUSTOMIZER */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          background: 'linear-gradient(135deg, rgba(20, 26, 38, 0.95) 0%, rgba(13, 17, 26, 0.98) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            borderBottom: '1px solid #273042',
            paddingBottom: '14px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
              }}
            >
              <Smartphone size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  On-Screen Touch Controls & Custom HUD Placement
                </h3>
                <span
                  style={{
                    background: settings.individualPositions ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    border: `1px solid ${settings.individualPositions ? '#10b981' : '#f59e0b'}`,
                    color: settings.individualPositions ? '#10b981' : '#f59e0b',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {settings.individualPositions ? '11 Keys Customized' : 'Default HUD Active'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>
                Measure your exact display size and customize the position of every single button individually by tapping and dragging it across an authentic NFSMW racing view.
              </div>
            </div>
          </div>

          {/* Measured Screen Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#121622',
              border: '1px solid #334155',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#cbd5e1',
            }}
          >
            <Maximize2 size={13} color="#f59e0b" />
            <span>Display: <strong style={{ color: '#fff' }}>{screenMetrics.width} × {screenMetrics.height}</strong> ({screenMetrics.aspect})</span>
          </div>
        </div>

        {/* Action Showcase: Single Large Button to Launch Fullscreen Drag-and-Drop HUD Customizer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '2px dashed rgba(245, 158, 11, 0.4)',
            borderRadius: '14px',
            padding: '24px',
            flexWrap: 'wrap',
            gap: '18px',
            marginBottom: '20px',
          }}
        >
          <div style={{ flex: '1 1 360px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              🎮 Visual Touch HUD Editor with NFSMW Racing Wallpaper
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
              Opens a full-screen interactive racing cockpit view showing the authentic Need for Speed: Most Wanted BMW M3 GTR.
              Tap and freely move <strong>Steer Left, Steer Right, Gas, Brake, NOS, E-Brake, Speedbreaker, Reset, Cam, ESC, and Enter</strong> anywhere.
              Press the prominent green tick button at center top when done to save!
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowTouchEditor(true)}
              className="btn btn-primary"
              style={{
                padding: '14px 28px',
                fontSize: '14.5px',
                fontWeight: 900,
                letterSpacing: '0.03em',
                boxShadow: '0 0 25px rgba(245, 158, 11, 0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Move size={18} />
              <span>CUSTOMIZE ON-SCREEN TOUCH CONTROLS</span>
            </button>

            {settings.individualPositions && (
              <button
                onClick={handleResetTouchLayout}
                className="btn btn-secondary"
                style={{ padding: '12px 18px', fontSize: '12.5px', color: '#cbd5e1' }}
                title="Reset all touch buttons to default placement"
              >
                <RotateCcw size={14} />
                <span>Reset Layout</span>
              </button>
            )}
          </div>
        </div>

        {/* Compact Quick Tuning (Scale, Opacity, Gyro, Haptics) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* Button Size */}
          <div style={{ padding: '14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
              <span>Button Size / Scale</span>
              <span style={{ color: '#f59e0b' }}>{Math.round(settings.buttonScale * 100)}%</span>
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

          {/* Button Transparency */}
          <div style={{ padding: '14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
              <span>Button Transparency</span>
              <span style={{ color: '#f59e0b' }}>{Math.round(settings.opacity * 100)}%</span>
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

          {/* Gyroscope Tilt Toggle */}
          <div style={{ padding: '14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>Gyro Tilt Steering</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Turn car by tilting device ({gyroTestedAngle}° {gyroActiveDirection !== 'center' ? `[${gyroActiveDirection.toUpperCase()}]` : ''})
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.gyroEnabled}
              onChange={(e) => onUpdateSettings({ gyroEnabled: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#06b6d4' }}
            />
          </div>

          {/* Haptic Vibration Feedback */}
          <div style={{ padding: '14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>Haptic Feedback</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Tactile vibration on touch press</div>
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

      {/* 2. DEDICATED GAME CONTROLLER (GAMEPAD) SECTION — NFSMW IN-GAME STYLE */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid rgba(6, 182, 212, 0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            borderBottom: '1px solid #273042',
            paddingBottom: '14px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid #06b6d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4',
              }}
            >
              <Gamepad2 size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Game Controller (Gamepad) Setup & Rebinding
                </h3>
                {connectedGamepad ? (
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10b981',
                      color: '#10b981',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
                    {connectedGamepad.id.slice(0, 36)}
                  </span>
                ) : (
                  <span
                    style={{
                      background: 'rgba(100, 116, 139, 0.15)',
                      border: '1px solid #475569',
                      color: '#94a3b8',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '12px',
                    }}
                  >
                    No Gamepad Detected (Plug in USB or Bluetooth Xbox/PlayStation Controller)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>
                Full in-game console configuration: rebind triggers, face buttons, d-pad, and stick deadzones with real-time vibration testing.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleTestControllerRumble}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '12px', color: '#06b6d4', borderColor: '#06b6d4' }}
              title="Trigger physical controller rumble pulse"
            >
              <Vibrate size={14} />
              <span>Test Vibration Pulse</span>
            </button>

            <button
              onClick={handleResetControllerBindings}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '12px', color: '#94a3b8' }}
              title="Reset gamepad bindings to standard Xbox/PlayStation layout"
            >
              <RotateCcw size={14} />
              <span>Reset Gamepad Defaults</span>
            </button>
          </div>
        </div>

        {/* Live Controller Button Monitor */}
        {connectedGamepad && (
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              borderRadius: '8px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12.5px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gamepad2 size={16} color="#06b6d4" />
              <span style={{ color: '#cbd5e1' }}>Live Hardware Input Monitor:</span>
              <strong style={{ color: activeGamepadButton !== null ? '#10b981' : '#94a3b8' }}>
                {activeGamepadButton !== null ? `Button ${activeGamepadButton} (${BUTTON_NAME_MAP[activeGamepadButton] || 'Active'})` : 'Awaiting input...'}
              </strong>
            </div>

            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Axes: X: {(connectedGamepad.axes[0] || 0).toFixed(2)} | Y: {(connectedGamepad.axes[1] || 0).toFixed(2)}
            </div>
          </div>
        )}

        {/* Controller Listening Prompt */}
        {rebindingControllerAction && (
          <div
            style={{
              padding: '14px 20px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '2px solid #06b6d4',
              borderRadius: '10px',
              marginBottom: '18px',
              color: '#06b6d4',
              fontWeight: 800,
              textAlign: 'center',
              fontSize: '14px',
              animation: 'pulse 1.5s infinite',
            }}
          >
            🎮 PRESS ANY BUTTON ON YOUR CONTROLLER NOW TO ASSIGN TO "
            {CONTROLLER_ACTIONS.find((a) => a.id === rebindingControllerAction)?.name}"... (Or click cancel)
            <button
              onClick={() => setRebindingControllerAction(null)}
              style={{
                marginLeft: '14px',
                padding: '4px 10px',
                background: '#1e293b',
                border: '1px solid #475569',
                color: '#fff',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Rebinding Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {CONTROLLER_ACTIONS.map((item) => {
            const rawVal = controllerBindings[item.id];
            const isRebinding = rebindingControllerAction === item.id;
            let displayVal = item.defaultLabel;

            if (typeof rawVal === 'number') {
              displayVal = BUTTON_NAME_MAP[rawVal] || `Button ${rawVal}`;
            } else if (typeof rawVal === 'string') {
              displayVal = rawVal.replace('axis0_neg', 'Left Stick ◀').replace('axis0_pos', 'Left Stick ▶');
            }

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: isRebinding ? 'rgba(6, 182, 212, 0.15)' : '#121622',
                  border: `1px solid ${isRebinding ? '#06b6d4' : '#273042'}`,
                  borderRadius: '10px',
                }}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{item.desc}</div>
                </div>

                <button
                  onClick={() => setRebindingControllerAction(item.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isRebinding ? '#06b6d4' : '#334155',
                    background: isRebinding ? '#06b6d4' : '#1e2638',
                    color: isRebinding ? '#000' : '#38bdf8',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    minWidth: '90px',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  title="Click to remap this controller button"
                >
                  {isRebinding ? 'PRESS BTN' : displayVal}
                </button>
              </div>
            );
          })}
        </div>

        {/* Controller Hardware Tuning (Deadzone & Vibration) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Deadzone */}
          <div style={{ padding: '14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, color: '#cbd5e1', marginBottom: '8px' }}>
              <span>Analog Stick Deadzone</span>
              <span style={{ color: '#06b6d4' }}>{Math.round((controllerBindings.deadzone || 0.15) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.35"
              step="0.01"
              value={controllerBindings.deadzone || 0.15}
              onChange={(e) => onUpdateControllerBindings({ deadzone: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: '#06b6d4' }}
            />
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              Prevents car drift from worn analog stick sensors.
            </div>
          </div>

          {/* Force Feedback / Rumble */}
          <div style={{ padding: '14px', background: '#121622', borderRadius: '10px', border: '1px solid #273042', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>Controller Force Feedback</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Dual-motor rumble on collisions and tire spin</div>
            </div>
            <input
              type="checkbox"
              checked={controllerBindings.rumbleEnabled}
              onChange={(e) => onUpdateControllerBindings({ rumbleEnabled: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#06b6d4' }}
            />
          </div>
        </div>
      </div>

      {/* 3. PC KEYBOARD KEYBINDINGS */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid #273042', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Keyboard size={20} color="#f59e0b" />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                PC Keyboard Keybindings
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Both Arrow Keys and WASD work by default. Click any key to rebind.
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

        {rebindingKeyAction && (
          <div
            style={{
              padding: '12px 20px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              marginBottom: '18px',
              color: '#f59e0b',
              fontWeight: 800,
              textAlign: 'center',
            }}
          >
            👉 Press any key on your keyboard now to assign to "{ACTION_LABELS.find((a) => a.id === rebindingKeyAction)?.label}"...
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {ACTION_LABELS.map((item) => {
            const currentCode = keyBindings[item.id] || item.defaultCode;
            const isRebinding = rebindingKeyAction === item.id;

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
                  onClick={() => setRebindingKeyAction(item.id)}
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

      {/* 4. UNIVERSAL SETTINGS & PROGRESS BACKUP (.nfsmwcfg) */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '32px',
          border: '1px solid rgba(16, 185, 129, 0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            borderBottom: '1px solid #273042',
            paddingBottom: '14px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <FileCode size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#fff', margin: 0 }}>
                Universal Settings, Mods & Career Progress Backup (.nfsmwcfg)
              </h3>
              <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>
                Save your complete setup into a single portable config file: includes custom touch button coordinates, controller rebinds, active mods, and full career game saves from OPFS.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Export Button */}
            <button
              onClick={handleExportBackup}
              disabled={isExportingBackup}
              className="btn btn-primary"
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderColor: '#34d399',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              title="Download all settings and career progress as a .nfsmwcfg file"
            >
              <Download size={15} />
              <span>{isExportingBackup ? 'Exporting...' : 'Export Backup (.nfsmwcfg)'}</span>
            </button>

            {/* Import Button */}
            <label
              className="btn btn-secondary"
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: 800,
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              title="Import and restore a .nfsmwcfg file"
            >
              <Upload size={15} />
              <span>{isImportingBackup ? 'Restoring...' : 'Restore / Import Backup'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".nfsmwcfg,.json"
                onChange={handleImportBackup}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
          💡 <strong>Cross-Browser & Device Portability:</strong> Export this file on your PC or phone, open this site on any other device or browser, and click "Restore / Import Backup" to get back all your custom controls, settings, active mods, and career save files instantly.
        </div>
      </div>

      {/* Launch Game Button */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          onClick={onLaunchGame}
          className="btn btn-primary"
          style={{ padding: '16px 42px', fontSize: '16px', fontWeight: 900, letterSpacing: '0.03em' }}
        >
          🚀 LAUNCH NEED FOR SPEED WITH CURRENT CONTROLS
        </button>
      </div>

      {/* FULL-SCREEN INTERACTIVE TOUCH HUD EDITOR OVERLAY */}
      {showTouchEditor && (
        <TouchLayoutEditor
          initialPositions={settings.individualPositions}
          scale={settings.buttonScale || 1.0}
          opacity={settings.opacity || 0.9}
          onSave={handleSaveTouchLayout}
          onCancel={() => setShowTouchEditor(false)}
        />
      )}
    </div>
  );
};
