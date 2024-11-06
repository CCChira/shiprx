import type { BaseProjectile } from './projectile'
import type { Ship } from './ship'

export interface Vector2D {
  x: number
  y: number
}

export interface Star {
  x: number
  y: number
  brightness: number
  size: number
}

export interface GameState {
  ships: Map<string, Ship>
  projectiles: BaseProjectile[]
}
