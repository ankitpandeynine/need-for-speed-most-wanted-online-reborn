import React, { useState, useEffect } from 'react';
import { ViewTab, GameSettings, ModItem, StorageStatus, MobileControlSettings, KeyBindings } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ControlsView } from './components/ControlsView';
import { MultiplayerView } from './components/MultiplayerView';
import { StorageManagerView } from './components/StorageManagerView';
import { SettingsModal } from './components/SettingsModal';
import { GameCanvas } from './components/GameCanvas';
import { GameRuntimeService } from './services/gameRuntime';
import { ModManagerService } from './services/modManager';
import { BrowserStorageService } from './services/storage';

const DEFAULT_MOBILE_SETTINGS: MobileControlSettings = {
  enabled: true,
  layout: 'split',
  buttonScale: 1.0,
  opacity: 0.85,
  swapHands: false,
  haptics: true,
  gyroEnabled: false,
  gyroSensitivity: 1.5,
  gyroDeadzone: 3,
};

const DEFAULT_KEY_BINDINGS: KeyBindings = {
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

const DEFAULT_SETTINGS: GameSettings = {
  resolution: '720p',
  frameRateLimit: 120,
  simulationHz: 120,
  widescreenFix: true,
  fovMode: 'xbox360',
  anisotropicFiltering: 8,
  textureQuality: 'high',
  shadows: 'medium',
  reflections: 'high',
  audioVolume: 80,
  musicVolume: 75,
  controllerLayout: 'keyboard_arrows',
  mobileControls: DEFAULT_MOBILE_SETTINGS,
  keyBindings: DEFAULT_KEY_BINDINGS,
  offlinePreload: false,
  backgroundDownloading: true,
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isRunning, setIsRunning] = useState(false);
  const [webGpuSupported, setWebGpuSupported] = useState(false);
  const [webGpuAdapterName, setWebGpuAdapterName] = useState<string | undefined>();
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const savedBinds = localStorage.getItem('nfsmw_keybindings');
      if (savedBinds) {
        return {
          ...DEFAULT_SETTINGS,
          keyBindings: JSON.parse(savedBinds),
        };
      }
    } catch {}
    return DEFAULT_SETTINGS;
  });
  const [mods, setMods] = useState<ModItem[]>([]);
  const [storage, setStorage] = useState<StorageStatus>({
    hasSpeedExe: true,
    speedExeValid: true,
    totalGameFiles: 1406,
    storageQuotaBytes: 100 * 1024 * 1024 * 1024,
    storageUsedBytes: 2.8 * 1024 * 1024 * 1024,
    isPersistent: true,
  });

  const runtime = GameRuntimeService.getInstance();
  const modManager = ModManagerService.getInstance();
  const storageService = BrowserStorageService.getInstance();

  useEffect(() => {
    // Probe WebGPU
    runtime.probeWebGPU().then((res) => {
      setWebGpuSupported(res.supported);
      setWebGpuAdapterName(res.adapterName);
    });

    // Load initial storage & mods
    setMods(modManager.getMods());
    storageService.getStorageStatus().then(setStorage);

    const unsub = runtime.onSessionChange((running) => {
      setIsRunning(running);
      if (running) {
        setCurrentTab('game');
      } else {
        setCurrentTab('dashboard');
      }
    });

    return unsub;
  }, []);

  const handleToggleGame = (offlinePreload?: boolean) => {
    if (isRunning) {
      runtime.stopSession();
    } else {
      if (typeof offlinePreload === 'boolean') {
        setSettings((prev) => ({ ...prev, offlinePreload }));
      }
      runtime.startSession();
    }
  };

  const handleUpdateSettings = (newPartial: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  const handleUpdateMobileSettings = (newPartial: Partial<MobileControlSettings>) => {
    setSettings((prev) => ({
      ...prev,
      mobileControls: {
        ...prev.mobileControls,
        ...newPartial,
      },
    }));
  };

  const handleUpdateKeyBindings = (newPartial: Partial<KeyBindings>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        keyBindings: {
          ...prev.keyBindings,
          ...newPartial,
        },
      };
      try {
        localStorage.setItem('nfsmw_keybindings', JSON.stringify(updated.keyBindings));
      } catch {}
      return updated;
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isRunning={isRunning}
        webGpuSupported={webGpuSupported}
        onToggleGame={() => handleToggleGame()}
      />

      <main
        style={{
          flex: 1,
          paddingBottom: currentTab === 'game' ? '0px' : '60px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {currentTab === 'game' && isRunning && (
          <GameCanvas
            settings={settings}
            mods={mods}
            onStopGame={() => runtime.stopSession()}
            webGpuAdapterName={webGpuAdapterName}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            onStartGame={handleToggleGame}
            settings={settings}
            storage={storage}
            onOpenControls={() => setCurrentTab('controls')}
            onOpenMultiplayer={() => setCurrentTab('multiplayer')}
            onOpenSettings={() => setCurrentTab('settings')}
            onOpenStorage={() => setCurrentTab('storage')}
            webGpuName={webGpuAdapterName}
          />
        )}

        {currentTab === 'multiplayer' && (
          <MultiplayerView
            onStartOnlineRace={() => {
              runtime.startSession();
              setCurrentTab('game');
            }}
          />
        )}

        {currentTab === 'controls' && (
          <ControlsView
            settings={settings.mobileControls}
            keyBindings={settings.keyBindings}
            onUpdateSettings={handleUpdateMobileSettings}
            onUpdateKeyBindings={handleUpdateKeyBindings}
            onLaunchGame={() => handleToggleGame()}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {currentTab === 'storage' && (
          <StorageManagerView
            storage={storage}
            onRequestPersistence={async () => {
              const res = await storageService.requestPersistence();
              setStorage((s) => ({ ...s, isPersistent: res }));
              return res;
            }}
            onClearStorage={() => {
              storageService.clearGameData();
              setStorage((s) => ({ ...s, hasSpeedExe: false, totalGameFiles: 0 }));
            }}
            onImportComplete={(count) => {
              storageService.markInstalled(count);
              setStorage((s) => ({ ...s, hasSpeedExe: true, speedExeValid: true, totalGameFiles: count }));
            }}
          />
        )}
      </main>
    </div>
  );
};
