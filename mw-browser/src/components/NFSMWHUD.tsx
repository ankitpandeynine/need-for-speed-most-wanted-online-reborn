import React from 'react';
import { CameraViewMode } from '../engine/graphics/NFSMWScene';
import { PursuitStatus } from '../engine/physics/VehiclePhysics';
import { Flame, Radio, Volume2, VolumeX, Camera, Maximize, Minimize, RotateCcw } from 'lucide-react';

interface NFSMWHUDProps {
  speedMph: number;
  rpm: number;
  gear: number;
  nosLevel: number;
  isNosActive: boolean;
  speedbreakerLevel: number;
  isSpeedbreakerActive: boolean;
  pursuit: PursuitStatus;
  cameraView: CameraViewMode;
  onCycleCamera: () => void;
  onResetVehicle: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const NFSMWHUD: React.FC<NFSMWHUDProps> = ({
  speedMph,
  rpm,
  gear,
  nosLevel,
  isNosActive,
  speedbreakerLevel,
  isSpeedbreakerActive,
  pursuit,
  cameraView,
  onCycleCamera,
  onResetVehicle,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const rpmClamped = Math.max(0, Math.min(9000, rpm));
  const needleAngle = -130 + (rpmClamped / 9000) * 260;

  const formatMoney = (val: number) => {
    return '$' + Math.floor(val).toLocaleString();
  };

  const getCameraLabel = (view: CameraViewMode) => {
    switch (view) {
      case 'chase-far':
        return 'CHASE (FAR)';
      case 'chase-close':
        return 'CHASE (CLOSE)';
      case 'hood':
        return 'HOOD CAM';
      case 'cockpit':
        return 'COCKPIT';
    }
  };

  return (
    <div className="nfsmw-hud-root">
      {/* 1. TOP PURSUIT STATUS HEADER */}
      <div className="nfsmw-hud-pursuit-header">
        <div className="nfsmw-hud-heat-pill">
          <Flame size={16} color="#ef4444" fill="#ef4444" />
          <span>HEAT {pursuit.heatLevel}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '240px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              fontWeight: 800,
              marginBottom: '4px',
            }}
          >
            <span style={{ color: pursuit.isEvading ? '#10b981' : '#ef4444' }}>
              {pursuit.isEvading ? 'EVADING (COOLDOWN)' : 'ENGAGED WITH POLICE'}
            </span>
            <span style={{ color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}>
              {Math.round(pursuit.policeDistance)}m DISTANCE
            </span>
          </div>

          <div
            style={{
              height: '8px',
              width: '100%',
              background: '#090d14',
              borderRadius: '999px',
              overflow: 'hidden',
              border: '1px solid #333d4d',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pursuit.isEvading ? pursuit.cooldownPercent : 100}%`,
                background: pursuit.isEvading
                  ? 'linear-gradient(90deg, #10b981, #34d399)'
                  : 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)',
                borderRadius: '999px',
                transition: 'width 0.15s ease',
                boxShadow: pursuit.isEvading ? '0 0 10px #10b981' : '0 0 10px #ef4444',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: '12px', borderLeft: '1px solid #333d4d' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.08em' }}>BOUNTY</div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
              {formatMoney(pursuit.bounty)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.08em' }}>COST TO STATE</div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
              {formatMoney(pursuit.costToState)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOP RIGHT TOOLBAR */}
      <div className="nfsmw-hud-top-right">
        <button onClick={onCycleCamera} className="nfsmw-hud-btn" title="Switch Camera View (C)">
          <Camera size={14} color="#f59e0b" />
          <span>{getCameraLabel(cameraView)} (C)</span>
        </button>

        <button onClick={onToggleMute} className="nfsmw-hud-btn" title="Toggle Engine Audio (M)">
          {isMuted ? <VolumeX size={14} color="#ef4444" /> : <Volume2 size={14} color="#10b981" />}
        </button>

        <button onClick={onResetVehicle} className="nfsmw-hud-btn" title="Reset Vehicle to Track (R)">
          <RotateCcw size={14} color="#e2e8f0" />
        </button>

        <button onClick={onToggleFullscreen} className="nfsmw-hud-btn" title="Toggle Fullscreen (F)">
          {isFullscreen ? <Minimize size={14} color="#e2e8f0" /> : <Maximize size={14} color="#e2e8f0" />}
        </button>
      </div>

      {/* 3. BOTTOM LEFT: POLICE SCANNER & MINIMAP */}
      <div className="nfsmw-hud-bottom-left">
        {/* Police Scanner Chatter Banner */}
        <div className="nfsmw-hud-scanner">
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Radio size={16} color="#60a5fa" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 800, letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>RPD DISPATCH SCANNER</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
            </div>
            <div style={{ fontSize: '12px', color: '#f1f5f9', fontWeight: 500, fontStyle: 'italic', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              "{pursuit.dispatchMessage}"
            </div>
          </div>
        </div>

        {/* Circular GPS Minimap Radar */}
        <div className="nfsmw-hud-radar">
          <div
            style={{
              position: 'absolute',
              inset: '8px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '28px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          />
          {/* Highway Lanes on Radar */}
          <div
            style={{
              position: 'absolute',
              width: '28px',
              height: '100%',
              background: 'rgba(255, 255, 255, 0.04)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
              borderRight: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          />
          {/* Player Marker (Golden Arrow) */}
          <div
            style={{
              position: 'absolute',
              width: '12px',
              height: '12px',
              background: '#f59e0b',
              transform: 'rotate(45deg)',
              border: '2px solid #fff',
              boxShadow: '0 0 10px #f59e0b',
              zIndex: 5,
            }}
          />
          {/* Police Cruiser Marker */}
          <div
            style={{
              position: 'absolute',
              width: '10px',
              height: '10px',
              background: '#ef4444',
              borderRadius: '50%',
              border: '1.5px solid #fff',
              boxShadow: '0 0 8px #ef4444',
              transform: `translate(${Math.sin(0.4) * 22}px, ${Math.min(48, Math.max(-48, pursuit.policeDistance * 0.7))}px)`,
              zIndex: 4,
            }}
          />
          <div style={{ position: 'absolute', top: '4px', fontSize: '9px', fontWeight: 900, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
            N
          </div>
        </div>
      </div>

      {/* 4. SPEEDBREAKER BULLET TIME OVERLAY */}
      {isSpeedbreakerActive && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(245, 158, 11, 0.12)',
            mixBlendMode: 'color',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 5. BOTTOM RIGHT: AUTHENTIC NFSMW 2005 TACHOMETER */}
      <div className="nfsmw-hud-bottom-right">
        {/* Speedbreaker Gauge (SB) */}
        <div className="nfsmw-vertical-bar">
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>SB</div>
          <div className="nfsmw-bar-track" style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}>
            <div
              style={{
                width: '100%',
                height: `${speedbreakerLevel}%`,
                background: 'linear-gradient(to top, #b45309, #f59e0b)',
                borderRadius: '999px',
                transition: 'height 0.1s ease',
                boxShadow: '0 0 8px #f59e0b',
              }}
            />
          </div>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8' }}>G</div>
        </div>

        {/* Circular Gauge Cluster */}
        <div className="nfsmw-tacho-cluster">
          <div
            style={{
              position: 'absolute',
              inset: '12px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          />

          {/* RPM Ticks */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => {
            const tickAngle = -130 + (val / 9) * 260;
            const isRedline = val >= 7;
            return (
              <div
                key={val}
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  transform: `rotate(${tickAngle}deg)`,
                }}
              >
                <div
                  style={{
                    width: '2px',
                    height: val % 2 === 0 ? '12px' : '8px',
                    marginTop: '8px',
                    background: isRedline ? '#ef4444' : '#94a3b8',
                    boxShadow: isRedline ? '0 0 6px #ef4444' : 'none',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    marginTop: '22px',
                    fontSize: '11px',
                    fontWeight: 900,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: isRedline ? '#ef4444' : '#cbd5e1',
                    transform: `rotate(${-tickAngle}deg)`,
                  }}
                >
                  {val}
                </span>
              </div>
            );
          })}

          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '24px',
              fontSize: '9px',
              fontWeight: 900,
              color: 'rgba(239, 68, 68, 0.85)',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            x1000 RPM
          </div>

          {/* Center Digital Speed & Gear Display */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, marginTop: '20px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 900,
                color: '#f59e0b',
                fontFamily: 'Chakra Petch, sans-serif',
                letterSpacing: '0.08em',
              }}
            >
              {gear === -1 ? 'REVERSE' : `GEAR ${gear}`}
            </div>
            <div
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: '#fff',
                fontFamily: 'Chakra Petch, sans-serif',
                lineHeight: 1,
                textShadow: '0 2px 14px rgba(255, 255, 255, 0.45)',
              }}
            >
              {Math.round(speedMph)}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em' }}>
              MPH
            </div>
          </div>

          {/* Sweeping Analog Needle */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `rotate(${needleAngle}deg)`,
              transition: 'transform 0.06s linear',
            }}
          >
            <div
              style={{
                width: '4px',
                height: '84px',
                background: 'linear-gradient(to top, #ea580c, #f59e0b, #fef08a)',
                borderRadius: '999px',
                transformOrigin: 'bottom center',
                transform: 'translateY(-42px)',
                boxShadow: '0 0 12px #f59e0b',
              }}
            />
          </div>

          {/* Center Pin */}
          <div
            style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #333d4d, #11151c)',
              border: '2px solid #64748b',
              boxShadow: '0 2px 8px rgba(0,0,0,0.8)',
              zIndex: 20,
            }}
          />
        </div>

        {/* Nitrous Oxide Gauge (NOS) */}
        <div className="nfsmw-vertical-bar">
          <div style={{ fontSize: '10px', fontWeight: 900, color: '#06b6d4', fontFamily: 'JetBrains Mono, monospace' }}>NOS</div>
          <div className="nfsmw-bar-track" style={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}>
            <div
              style={{
                width: '100%',
                height: `${nosLevel}%`,
                background: isNosActive
                  ? 'linear-gradient(to top, #0891b2, #22d3ee, #ffffff)'
                  : 'linear-gradient(to top, #0891b2, #06b6d4)',
                borderRadius: '999px',
                transition: 'height 0.1s ease',
                boxShadow: isNosActive ? '0 0 12px #06b6d4' : '0 0 6px #06b6d4',
              }}
            />
          </div>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8' }}>X / SHIFT</div>
        </div>
      </div>

      {/* 6. BOTTOM CENTER CONTROLS CHEATSHEET HINT */}
      <div className="nfsmw-controls-hint">
        <span>W / ↑ Throttle</span>
        <span style={{ margin: '0 8px', color: '#64748b' }}>•</span>
        <span>S / ↓ Brake</span>
        <span style={{ margin: '0 8px', color: '#64748b' }}>•</span>
        <span>A / D Steer</span>
        <span style={{ margin: '0 8px', color: '#64748b' }}>•</span>
        <span>Space Drift</span>
        <span style={{ margin: '0 8px', color: '#64748b' }}>•</span>
        <span>X / Shift NOS</span>
        <span style={{ margin: '0 8px', color: '#64748b' }}>•</span>
        <span>G Speedbreaker</span>
        <span style={{ margin: '0 8px', color: '#64748b' }}>•</span>
        <span>C Camera</span>
      </div>
    </div>
  );
};
