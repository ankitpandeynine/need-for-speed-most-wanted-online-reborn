import React from 'react';
import { ViewTab } from '../types';
import { Gauge, Sliders, HardDrive, Layers, Play, Square, Car, Users, Trophy, Map, Warehouse, Disc } from 'lucide-react';

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
            <span className="brand-tag">ONLINE REBORN</span>
          </div>
          <div className="brand-subtitle">
            <span className="status-dot"></span>
            120 Hz Simulation • WebGPU {webGpuSupported ? 'Active' : 'Metal / Vulkan'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="header-nav" style={{ overflowX: 'auto', maxWidth: 'calc(100vw - 420px)' }}>
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`nav-tab-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
        >
          <Gauge size={15} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('blacklist')}
          className={`nav-tab-btn ${currentTab === 'blacklist' ? 'active' : ''}`}
        >
          <Trophy size={15} color={currentTab === 'blacklist' ? '#f59e0b' : 'currentColor'} />
          <span>Blacklist 15</span>
        </button>

        <button
          onClick={() => onSelectTab('map')}
          className={`nav-tab-btn ${currentTab === 'map' ? 'active' : ''}`}
        >
          <Map size={15} />
          <span>Rockport Map</span>
        </button>

        <button
          onClick={() => onSelectTab('garage')}
          className={`nav-tab-btn ${currentTab === 'garage' ? 'active' : ''}`}
        >
          <Warehouse size={15} />
          <span>Garage</span>
        </button>

        <button
          onClick={() => onSelectTab('eatrax')}
          className={`nav-tab-btn ${currentTab === 'eatrax' ? 'active' : ''}`}
        >
          <Disc size={15} />
          <span>EA Trax</span>
        </button>

        <button
          onClick={() => onSelectTab('multiplayer')}
          className={`nav-tab-btn ${currentTab === 'multiplayer' ? 'active' : ''}`}
        >
          <Users size={15} />
          <span>Multiplayer</span>
          <span className="live-pill">LIVE</span>
        </button>

        <button
          onClick={() => onSelectTab('mods')}
          className={`nav-tab-btn ${currentTab === 'mods' ? 'active' : ''}`}
        >
          <Layers size={15} />
          <span>Mods</span>
        </button>

        <button
          onClick={() => onSelectTab('storage')}
          className={`nav-tab-btn ${currentTab === 'storage' ? 'active' : ''}`}
        >
          <HardDrive size={15} />
          <span>Storage</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`nav-tab-btn ${currentTab === 'settings' ? 'active' : ''}`}
        >
          <Sliders size={15} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Action Button */}
      <div className="header-actions">
        {isRunning ? (
          <button onClick={onToggleGame} className="btn btn-danger">
            <Square size={16} fill="currentColor" />
            <span>Stop Session</span>
          </button>
        ) : (
          <button onClick={onToggleGame} className="btn btn-primary">
            <Play size={16} fill="#000" />
            <span>Start Game</span>
          </button>
        )}
      </div>
    </header>
  );
};
