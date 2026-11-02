import React from 'react';
import { ViewTab } from '../types';
import { Play, Square, Gauge, Smartphone, Sliders, HardDrive } from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isRunning: boolean;
  webGpuSupported: boolean;
  onToggleGame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isRunning,
  webGpuSupported,
  onToggleGame,
}) => {
  return (
    <header className="header-container">
      {/* Brand & Title - NFSMW 2005 Inspired */}
      <div className="header-brand" onClick={() => onSelectTab('dashboard')}>
        <div className="brand-badge">
          <span style={{ fontWeight: 900, fontSize: '15px', color: '#000', letterSpacing: '-0.05em' }}>MW</span>
        </div>
        <div>
          <div className="brand-title">
            NEED FOR SPEED <span style={{ color: '#f59e0b' }}>MOST WANTED</span>
            <span className="brand-tag">2005 REBORN</span>
          </div>
          <div className="brand-subtitle">
            <span className="status-dot"></span>
            120 Hz Physics • WebGPU {webGpuSupported ? 'Active' : 'Metal / Vulkan'}
          </div>
        </div>
      </div>

      {/* Simplified, Clean Navigation Tabs */}
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
          onClick={() => onSelectTab('controls')}
          className={`nav-tab-btn ${currentTab === 'controls' ? 'active' : ''}`}
          title="Mobile Touch Controls & Gyroscope Steering"
        >
          <Smartphone size={15} color={currentTab === 'controls' ? '#f59e0b' : 'currentColor'} />
          <span>Mobile & Controls</span>
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
          title="Game Files & OPFS Cache Storage"
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
