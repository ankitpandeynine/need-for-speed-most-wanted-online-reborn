import React, { useState, useEffect } from 'react';
import { ViewTab, GameSettings, ModItem, StorageStatus, MobileControlSettings, KeyBindings, ControllerBindings } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ModManagerView } from './components/ModManagerView';
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

export const DEFAULT_CONTROLLER_BINDINGS: ControllerBindings = {
  accelerate: 7, // RT
  brake: 6, // LT
  steerLeft: 'axis0_neg',
  steerRight: 'axis0_pos',
  nitrous: 0, // A / Cross
  handbrake: 2, // X / Square
  speedbreaker: 1, // B / Circle
  camera: 3, // Y / Triangle
  pause: 9, // Start / Options
  reset: 8, // Back / Share
  lookBack: 11, // R3 / Right Stick
  rumbleEnabled: true,
  deadzone: 0.15,
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
  controllerLayout: 'xbox',
  mobileControls: DEFAULT_MOBILE_SETTINGS,
  keyBindings: DEFAULT_KEY_BINDINGS,
  controllerBindings: DEFAULT_CONTROLLER_BINDINGS,
  offlinePreload: false,
  backgroundDownloading: true,
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isRunning, setIsRunning] = useState(false);
  const [webGpuSupported, setWebGpuSupported] = useState(false);
  const [webGpuAdapterName, setWebGpuAdapterName] = useState<string | undefined>();
  const [settings, setSettings] = useState<GameSettings>(() => {
    let initialKey = DEFAULT_KEY_BINDINGS;
    try {
      const savedBinds = localStorage.getItem('nfsmw_keybindings');
      if (savedBinds) initialKey = JSON.parse(savedBinds);
    } catch {}

    let initialCtrl = DEFAULT_CONTROLLER_BINDINGS;
    try {
      const savedCtrl = localStorage.getItem('nfsmw_controller_bindings');
      if (savedCtrl) initialCtrl = JSON.parse(savedCtrl);
    } catch {}

    let initialMobile = DEFAULT_MOBILE_SETTINGS;
    try {
      const savedMobile = localStorage.getItem('nfsmw_mobile_controls');
      if (savedMobile) initialMobile = JSON.parse(savedMobile);
    } catch {}

    return {
      ...DEFAULT_SETTINGS,
      keyBindings: initialKey,
      controllerBindings: initialCtrl,
      mobileControls: initialMobile,
    };
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

  const handleToggleGame = async (offlinePreload?: boolean) => {
    if (isRunning) {
      runtime.stopSession();
    } else {
      if (typeof offlinePreload === 'boolean') {
        setSettings((prev) => ({ ...prev, offlinePreload }));
      }
      try {
        // Auto-merge all enabled mods into OPFS before starting game session
        await modManager.autoMergeEnabledModsToOPFS();
      } catch (err) {
        console.warn('[OPFS Mod Engine] Auto-merge on launch warning:', err);
      }
      runtime.startSession();
    }
  };

  const handleToggleMod = async (id: string) => {
    await modManager.toggleMod(id);
    setMods(modManager.getMods());
  };

  const handleUpdateModPriority = (id: string, newPriority: number) => {
    modManager.updatePriority(id, newPriority);
    setMods(modManager.getMods());
  };

  const handleInstallMod = async (file: File) => {
    try {
      await modManager.installAndApplyFromBlob(file, undefined, file.name.replace(/\.(mwmod|zip|bin)$/i, ''));
      setMods(modManager.getMods());
    } catch (err: any) {
      console.error('[ModManager] Error installing mod archive:', err);
      throw err;
    }
  };

  const handleInstallFolder = async (files: { path: string; file: File }[], folderName: string) => {
    try {
      await modManager.installFromFolder(files, folderName);
      setMods(modManager.getMods());
    } catch (err: any) {
      console.error('[ModManager] Error installing mod folder:', err);
      throw err;
    }
  };

  const handleEnableAllRecommended = async () => {
    await modManager.enableAllRecommended();
    setMods(modManager.getMods());
  };

  const handleRemoveMod = async (id: string) => {
    await modManager.removeMod(id);
    setMods(modManager.getMods());
  };

  const handleApplyProfile = async (profileId: string) => {
    await modManager.applyProfile(profileId);
    setMods(modManager.getMods());
  };

  const handleCreateCustomMod = async (options: {
    name: string;
    category: string;
    author: string;
    description: string;
    priority: number;
    targetPath: string;
    file: File | Blob;
  }) => {
    await modManager.createCustomMod(options);
    setMods(modManager.getMods());
  };

  const handleResetModDefaults = () => {
    modManager.resetToPopularDefaults();
    setMods(modManager.getMods());
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

  const handleUpdateControllerBindings = (newPartial: Partial<ControllerBindings>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        controllerBindings: {
          ...(prev.controllerBindings || DEFAULT_CONTROLLER_BINDINGS),
          ...newPartial,
        },
      };
      try {
        localStorage.setItem('nfsmw_controller_bindings', JSON.stringify(updated.controllerBindings));
      } catch {}
      return updated;
    });
  };

  const handleReloadSettingsFromStorage = () => {
    try {
      const savedKey = localStorage.getItem('nfsmw_keybindings');
      const savedCtrl = localStorage.getItem('nfsmw_controller_bindings');
      const savedMobile = localStorage.getItem('nfsmw_mobile_controls');
      const savedSettings = localStorage.getItem('nfsmw_settings');

      setSettings((prev) => ({
        ...prev,
        ...(savedSettings ? JSON.parse(savedSettings) : {}),
        keyBindings: savedKey ? JSON.parse(savedKey) : prev.keyBindings,
        controllerBindings: savedCtrl ? JSON.parse(savedCtrl) : prev.controllerBindings,
        mobileControls: savedMobile ? JSON.parse(savedMobile) : prev.mobileControls,
      }));
      setMods(modManager.getMods());
    } catch (e) {
      console.warn('Failed reloading settings after backup import:', e);
    }
  };

  const activeModsCount = mods.filter((m) => m.enabled).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isRunning={isRunning}
        webGpuSupported={webGpuSupported}
        activeModsCount={activeModsCount}
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
            activeModsCount={activeModsCount}
            onOpenMods={() => setCurrentTab('mods')}
            onOpenControls={() => setCurrentTab('controls')}
            onOpenMultiplayer={() => setCurrentTab('multiplayer')}
            onOpenSettings={() => setCurrentTab('settings')}
            onOpenStorage={() => setCurrentTab('storage')}
            webGpuName={webGpuAdapterName}
          />
        )}

        {currentTab === 'mods' && (
          <ModManagerView
            mods={mods}
            onToggleMod={handleToggleMod}
            onUpdatePriority={handleUpdateModPriority}
            onInstallMod={handleInstallMod}
            onInstallFolder={handleInstallFolder}
            onEnableAllRecommended={handleEnableAllRecommended}
            onResetDefaults={handleResetModDefaults}
            onRemoveMod={handleRemoveMod}
            onApplyProfile={handleApplyProfile}
            onCreateCustomMod={handleCreateCustomMod}
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
            controllerBindings={settings.controllerBindings || DEFAULT_CONTROLLER_BINDINGS}
            onUpdateSettings={handleUpdateMobileSettings}
            onUpdateKeyBindings={handleUpdateKeyBindings}
            onUpdateControllerBindings={handleUpdateControllerBindings}
            onReloadAll={handleReloadSettingsFromStorage}
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
