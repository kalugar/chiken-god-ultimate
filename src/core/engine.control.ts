export abstract class EngineControl {
  abstract pause(): void;
  abstract resume(): void;
  abstract setSpeed(value: number): void;
  abstract get isPaused(): boolean;
}