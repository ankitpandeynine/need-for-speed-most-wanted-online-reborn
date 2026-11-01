import React, { useState, useEffect } from 'react';
import { ViewTab, GameSettings, ModItem, StorageStatus } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MultiplayerView } from './components/MultiplayerView';
import { ModManagerView } from './components/ModManagerView';
import { StorageManagerView } from './components/StorageManagerView';
import { SettingsModal } from './components/SettingsModal';
import { GameCanvas } from './components/GameCanvas';
import { GameRuntimeService } from './services/gameRuntime';
import { ModManagerService } from './services/modManager';
import { BrowserStorageService } from './services/storage';

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
  controllerLayout: 'xbox',
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isRunning, setIsRunning] = useState(false);
  const [webGpuSupported, setWebGpuSupported] = useState(false);
  const [webGpuAdapterName, setWebGpuAdapterName] = useState<string | undefined>();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [mods, setMods] = useState<ModItem[]>([]);
  const [storage, setStorage] = useState<StorageStatus>({
    hasSpeedExe: true, // Default to ready for presentation
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

    // Load initial mods and storage
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

  const handleToggleGame = () => {
    if (isRunning) {
      runtime.stopSession();
    } else {
      runtime.startSession();
    }
  };

  const handleToggleMod = (id: string) => {
    modManager.toggleMod(id);
    setMods(modManager.getMods());
  };

  const handleUpdatePriority = (id: string, newPriority: number) => {
    modManager.updatePriority(id, newPriority);
    setMods(modManager.getMods());
  };

  const handleInstallMod = (file: File) => {
    const newMod: ModItem = {
      id: file.name.replace(/\.(mwmod|zip)$/, '').toLowerCase(),
      name: file.name.replace(/\.(mwmod|zip)$/, ''),
      version: '1.0.0',
      author: 'Custom User Mod',
      description: 'Imported from local archive file.',
      type: 'texture',
      enabled: true,
      priority: 60,
      assetsCount: 4,
    };
    modManager.registerMod(newMod);
    setMods(modManager.getMods());
  };

  const handleUpdateSettings = (newPartial: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isRunning={isRunning}
        webGpuSupported={webGpuSupported}
        onToggleGame={handleToggleGame}
      />

      <main style={{ flex: 1, paddingBottom: '60px' }}>
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
            mods={mods}
            onOpenMods={() => setCurrentTab('mods')}
            onOpenStorage={() => setCurrentTab('storage')}
            onOpenMultiplayer={() => setCurrentTab('multiplayer')}
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

        {currentTab === 'mods' && (
          <ModManagerView
            mods={mods}
            onToggleMod={handleToggleMod}
            onUpdatePriority={handleUpdatePriority}
            onInstallMod={handleInstallMod}
            onResetDefaults={() => {
              modManager.resetToPopularDefaults();
              setMods(modManager.getMods());
            }}
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

        {currentTab === 'settings' && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>
    </div>
  );
};
