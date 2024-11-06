import { GAME_CONSTANTS } from './constants'
import { EventEmitter } from './events'
import { ColorMissile } from './projectile'
import type { GameState, Vector2D, Star } from './types'
import { Camera } from './camera'
import { Ship } from './ship'

const {
  MAX_BOOST_FUEL,
  PROJECTILE_SPEED,
  PROJECTILE_COOLDOWN,
  PROJECTILE_LIFETIME,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} = GAME_CONSTANTS

export class SpaceGame extends EventEmitter {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private gameState: GameState
  private stars: Star[]
  private keys: Set<string>
  private playerId: string
  private animationFrameId?: number
  private active: boolean = true
  private lastTimestamp: number = 0
  private camera: Camera

  constructor(canvasElement: HTMLCanvasElement) {
    super()
    this.canvas = canvasElement
    this.ctx = canvasElement.getContext('2d')!
    this.keys = new Set()
    this.playerId = crypto.randomUUID()

    this.camera = new Camera(this.canvas.width, this.canvas.height, WORLD_WIDTH, WORLD_HEIGHT)

    this.stars = this.generateStars()

    this.gameState = {
      ships: new Map([[this.playerId, new Ship(this.playerId, WORLD_WIDTH, WORLD_HEIGHT)]]),
      projectiles: [],
    }

    this.setupEventListeners()
    this.lastTimestamp = performance.now()
    this.gameLoop()
  }

  private generateStars(): Star[] {
    const NUM_STARS = Math.floor((WORLD_WIDTH * WORLD_HEIGHT) / 10000)
    const stars: Star[] = []

    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        brightness: 0.5 + Math.random() * 0.5,
        size: Math.random() < 0.9 ? 1 : 2,
      })
    }

    return stars
  }

  private setupEventListeners(): void {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!this.active) return
      this.keys.add(e.key.toLowerCase())
      if (e.key === ' ') e.preventDefault()
    }

    const handleKeyup = (e: KeyboardEvent) => {
      if (!this.active) return
      this.keys.delete(e.key.toLowerCase())
    }

    const handleBlur = () => {
      this.keys.clear()
    }

    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)
    window.addEventListener('blur', handleBlur)

    this._cleanupListeners = () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyup)
      window.removeEventListener('blur', handleBlur)
    }
  }

  private gameLoop(timestamp: number = 0): void {
    if (!this.active) return

    const deltaTime = (timestamp - this.lastTimestamp) / 1000
    this.lastTimestamp = timestamp

    this.update(deltaTime)
    this.render()

    this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts))
  }

  private update(deltaTime: number): void {
    const ship = this.gameState.ships.get(this.playerId)
    if (ship) ship.update(this.keys, deltaTime)
    this.camera.follow(ship!.x, ship!.y)

    const now = Date.now()
    this.gameState.projectiles = this.gameState.projectiles
      .filter((p) => {
        return (
          now - p.createdAt < PROJECTILE_LIFETIME &&
          p.x >= 0 &&
          p.x <= WORLD_WIDTH &&
          p.y >= 0 &&
          p.y <= WORLD_HEIGHT
        )
      })
      .map((p) => {
        p.update(deltaTime, WORLD_WIDTH, WORLD_HEIGHT)
        return p
      })

    this.emit('boostUpdate', (ship!.boostFuel / MAX_BOOST_FUEL) * 100)
  }

  private render(): void {
    this.ctx.fillStyle = '#000000'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.save()
    this.camera.applyToContext(this.ctx)

    this.stars.forEach((star) => {
      const alpha = star.brightness
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
      this.ctx.beginPath()
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
      this.ctx.fill()
    })

    this.gameState.ships.forEach((ship) => {
      this.ctx.save()
      ship.draw(this.ctx, this.keys)

      this.ctx.restore()
    })

    this.gameState.projectiles.forEach((projectile) => {
      projectile.draw(this.ctx)
    })

    this.ctx.restore()
  }

  public handleClick(): void {
    if (!this.active) return
    const ship = this.gameState.ships.get(this.playerId)
    if (!ship) return

    const now = Date.now()
    if (now - ship.lastShot < PROJECTILE_COOLDOWN) return

    const shipTipX = ship.x + Math.cos(ship.rotation) * 20
    const shipTipY = ship.y + Math.sin(ship.rotation) * 20

    const projectileVelocity = {
      x: Math.cos(ship.rotation) * PROJECTILE_SPEED,
      y: Math.sin(ship.rotation) * PROJECTILE_SPEED,
    }

    const projectile = new ColorMissile(shipTipX, shipTipY, projectileVelocity)
    this.gameState.projectiles.push(projectile)

    ship.lastShot = now
  }

  public destroy(): void {
    this.active = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    this._cleanupListeners?.()
  }

  private _cleanupListeners?: () => void
}
