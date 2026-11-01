import React from 'react';
import { ViewTab } from '../types';
import { Gauge, Sliders, HardDrive, Layers, Play, Square, Car } from 'lucide-react';

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
      {/* Brand & Title */}
      <div className="header-brand" onClick={() => onSelectTab('dashboard')}>
        <div className="brand-badge">
          <Car size={22} color="#000" />
        </div>
        <div>
          <div className="brand-title">
            NEED FOR SPEED <span style={{ color: '#f59e0b' }}>MOST WANTED</span>
            <span className="brand-tag">2005 BLACK EDITION</span>
          </div>
          <div className="brand-subtitle">
            <span className="status-dot"></span>
            120 Hz Simulation • WebGPU {webGpuSupported ? 'Ready' : 'Metal / Vulkan'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="header-nav">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`nav-tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
        >
          <Gauge size={16} />
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('mods')}
          className={`nav-tab-btn ${currentTab === 'mods' ? 'active' : ''}`}
        >
          <Layers size={16} />
          Mod Manager
        </button>
        <button
          onClick={() => onSelectTab('storage')}
          className={`nav-tab-btn ${currentTab === 'storage' ? 'active' : ''}`}
        >
          <HardDrive size={16} />
          Game Storage
        </button>
        <button
          onClick={() => onSelectTab('settings')}
          className={`nav-tab-btn ${currentTab === 'settings' ? 'active' : ''}`}
        >
          <Sliders size={16} />
          Settings
        </button>
      </nav>

      {/* Action Button */}
      <div className="header-actions">
        {isRunning ? (
          <button onClick={onToggleGame} className="btn btn-danger">
            <Square size={16} fill="currentColor" />
            Stop Session
          </button>
        ) : (
          <button onClick={onToggleGame} className="btn btn-primary">
            <Play size={16} fill="#000" />
            Start Game
          </button>
        )}
      </div>
    </header>
  );
};
