/**
 * Game Runtime Service: Manages WebGPU device, Worker lifecycle, and engine session
 */

export interface WebGPUCapability {
  supported: boolean;
  adapterName?: string;
  vendor?: string;
  limits?: {
    maxTextureDimension2D: number;
    maxBufferSize: number;
  };
  error?: string;
}

export class GameRuntimeService {
  private static instance: GameRuntimeService;
  private isRunning: boolean = false;
  private sessionListeners: Array<(running: boolean) => void> = [];

  private constructor() {}

  public static getInstance(): GameRuntimeService {
    if (!GameRuntimeService.instance) {
      GameRuntimeService.instance = new GameRuntimeService();
    }
    return GameRuntimeService.instance;
  }

  /**
   * Check WebGPU browser support and retrieve hardware adapter details.
   */
  public async probeWebGPU(): Promise<WebGPUCapability> {
    const navGpu = (navigator as unknown as { gpu?: { requestAdapter: () => Promise<any> } }).gpu;
    if (!navGpu) {
      return {
        supported: false,
        error: 'WebGPU is not supported in this browser. Please use Chrome 113+, Edge 113+, or Safari with WebGPU enabled.',
      };
    }

    try {
      const adapter = await navGpu.requestAdapter();
      if (!adapter) {
        return {
          supported: false,
          error: 'No compatible GPU adapter found.',
        };
      }

      const info = (await adapter.requestAdapterInfo?.()) || {};
      return {
        supported: true,
        adapterName: info.description || info.device || 'WebGPU Metal/Direct3D Accelerator',
        vendor: info.vendor || 'Apple / Native',
        limits: {
          maxTextureDimension2D: adapter.limits?.maxTextureDimension2D || 8192,
          maxBufferSize: adapter.limits?.maxBufferSize || 268435456,
        },
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        supported: false,
        error: `Failed to request WebGPU adapter: ${errorMsg}`,
      };
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public startSession(): void {
    this.isRunning = true;
    this.notify();
  }

  public stopSession(): void {
    this.isRunning = false;
    this.notify();
  }

  public onSessionChange(cb: (running: boolean) => void): () => void {
    this.sessionListeners.push(cb);
    return () => {
      this.sessionListeners = this.sessionListeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    for (const cb of this.sessionListeners) cb(this.isRunning);
  }
}
