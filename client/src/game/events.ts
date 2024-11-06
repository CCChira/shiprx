// src/game/events.ts
export type GameEventType = 'boostUpdate' | 'playerJoin' | 'playerLeave' | 'hit'

export interface GameEventEmitter {
  on(event: GameEventType, callback: (data: unknown) => void): void
  off(event: GameEventType, callback: (data: unknown) => void): void
  emit(event: GameEventType, data: unknown): void
}

export class EventEmitter implements GameEventEmitter {
  private events: Map<GameEventType, Set<(data: unknown) => void>>

  constructor() {
    this.events = new Map()
  }

  on(event: GameEventType, callback: (data: unknown) => void): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)?.add(callback)
  }

  off(event: GameEventType, callback: (data: unknown) => void): void {
    this.events.get(event)?.delete(callback)
  }

  emit(event: GameEventType, data: unknown): void {
    this.events.get(event)?.forEach((callback) => callback(data))
  }
}
