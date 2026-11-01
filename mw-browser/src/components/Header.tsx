import React from 'react';
import { ViewTab } from '../types';
import { Gauge, Sliders, HardDrive, Layers, Play, Square } from 'lucide-react';

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
    <header className="border-b border-[#273042] bg-[#0d1017]/90 backdrop-blur sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#f59e0b] to-[#fbbf24] flex items-center justify-center font-bold text-black text-xl shadow-lg shadow-amber-500/20">
            MW
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider brand-font text-white flex items-center gap-2">
              NFS MOST WANTED
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                BROWSER EDITION
              </span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              120 Hz Recomp Engine
              <span className="text-slate-600">•</span>
              <span className={webGpuSupported ? 'text-cyan-400' : 'text-amber-400'}>
                WebGPU {webGpuSupported ? 'Ready' : 'Checking...'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#161b26] p-1 rounded-lg border border-[#273042]">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition ${
              currentTab === 'dashboard'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Gauge size={16} />
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('mods')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition ${
              currentTab === 'mods'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Layers size={16} />
            Mod Manager
          </button>
          <button
            onClick={() => onSelectTab('storage')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition ${
              currentTab === 'storage'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <HardDrive size={16} />
            Game Storage
          </button>
          <button
            onClick={() => onSelectTab('settings')}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition ${
              currentTab === 'settings'
                ? 'bg-amber-500 text-black shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sliders size={16} />
            Settings
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {isRunning ? (
          <button onClick={onToggleGame} className="btn btn-danger text-sm py-2 px-4 flex items-center gap-2">
            <Square size={16} className="fill-current" />
            Stop Session
          </button>
        ) : (
          <button onClick={onToggleGame} className="btn btn-primary text-sm py-2 px-5 flex items-center gap-2">
            <Play size={16} className="fill-current" />
            Start Game
          </button>
        )}
      </div>
    </header>
  );
};
