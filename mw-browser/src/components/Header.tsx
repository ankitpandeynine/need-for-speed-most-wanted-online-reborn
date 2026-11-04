import React from 'react';
import { ViewTab } from '../types';
import { Play, Square, Gauge, Smartphone, Sliders, HardDrive, Users, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isRunning: boolean;
  webGpuSupported: boolean;
  activeModsCount?: number;
  onToggleGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isRunning,
  webGpuSupported,
  activeModsCount = 0,
  onToggleGame,
}) => {
  return (
    <header className="header-container">
      {/* Brand & Title - NFSMW 2005 Authentic Cover Logo */}
      <div className="header-brand" onClick={() => onSelectTab('dashboard')}>
        <div
          className="brand-logo-wrapper"
          style={{
            position: 'relative',
            width: '44px',
            height: '44px',
            borderRadius: '9px',
            overflow: 'hidden',
            border: '2px solid #f59e0b',
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.5), 0 2px 6px rgba(0, 0, 0, 0.6)',
            flexShrink: 0,
            background: '#0d1117',
          }}
        >
          <img
            src="/logo.png"
            alt="Need for Speed: Most Wanted Official Cover Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 15%',
              display: 'block',
            }}
          />
        </div>
        <div>
          <div className="brand-title">
            NEED FOR SPEED <span style={{ color: '#f59e0b' }}>MOST WANTED</span>
            <span className="brand-tag">2005</span>
          </div>
          <div className="brand-subtitle">
            <span className="status-dot"></span>
            120 Hz Physics • WebGPU {webGpuSupported ? 'Active' : 'Metal / Vulkan'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="header-nav">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`nav-tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
          title="Game Launcher"
        >
          <Gauge size={15} />
          <span>Play</span>
        </button>

        <button
          onClick={() => onSelectTab('mods')}
          className={`nav-tab-btn ${currentTab === 'mods' ? 'active' : ''}`}
          title="In-Browser Community Mod Workshop"
        >
          <Sparkles size={15} color={currentTab === 'mods' ? '#f59e0b' : 'currentColor'} />
          <span>Mods</span>
          {activeModsCount > 0 && (
            <span
              style={{
                marginLeft: '4px',
                background: currentTab === 'mods' ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
                color: currentTab === 'mods' ? '#000' : '#f59e0b',
                fontSize: '10px',
                fontWeight: 900,
                padding: '1px 6px',
                borderRadius: '8px',
              }}
            >
              {activeModsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onSelectTab('multiplayer')}
          className={`nav-tab-btn ${currentTab === 'multiplayer' ? 'active' : ''}`}
          title="Online Multiplayer Rooms"
        >
          <Users size={15} color={currentTab === 'multiplayer' ? '#06b6d4' : 'currentColor'} />
          <span>Multiplayer</span>
          <span className="live-pill" style={{ marginLeft: '4px' }}>ROOMS</span>
        </button>

        <button
          onClick={() => onSelectTab('controls')}
          className={`nav-tab-btn ${currentTab === 'controls' ? 'active' : ''}`}
          title="PC Keybindings, Gamepads & Mobile Gyro"
        >
          <Smartphone size={15} color={currentTab === 'controls' ? '#f59e0b' : 'currentColor'} />
          <span>Controls & Hardware</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`nav-tab-btn ${currentTab === 'settings' ? 'active' : ''}`}
          title="Graphics, Resolution & Audio"
        >
          <Sliders size={15} />
          <span>Settings</span>
        </button>

        <button
          onClick={() => onSelectTab('storage')}
          className={`nav-tab-btn ${currentTab === 'storage' ? 'active' : ''}`}
          title="Game Files & OPFS Offline Cache Storage"
        >
          <HardDrive size={15} />
          <span>Game Assets</span>
        </button>
      </nav>

      {/* Essential Session Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onToggleGame}
          className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
          style={{
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: isRunning ? '0 0 16px rgba(239, 68, 68, 0.4)' : '0 0 16px rgba(245, 158, 11, 0.35)',
          }}
        >
          {isRunning ? (
            <>
              <Square size={14} fill="currentColor" />
              <span>Stop Session</span>
            </>
          ) : (
            <>
              <Play size={14} fill="#000" />
              <span>Start Game</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
