import type { Vector2D } from './types'

export abstract class BaseProjectile {
  id: string
  x: number
  y: number
  velocity: Vector2D
  createdAt: number

  constructor(x: number, y: number, velocity: Vector2D) {
    this.id = crypto.randomUUID()
    this.x = x
    this.y = y
    this.velocity = velocity
    this.createdAt = Date.now()
  }

  update(deltaTime: number, worldWidth: number, worldHeight: number): void {
    // Update position
    this.x += this.velocity.x * deltaTime
    this.y += this.velocity.y * deltaTime

    // Optional: Constrain to world bounds (if you want projectiles to stop at edges)
    // this.x = Math.max(0, Math.min(worldWidth, this.x))
    // this.y = Math.max(0, Math.min(worldHeight, this.y))
  }

  abstract draw(ctx: CanvasRenderingContext2D): void
}

export class Missile extends BaseProjectile {
  private pulsePhase: number = 0

  constructor(x: number, y: number, velocity: Vector2D) {
    super(x, y, velocity)
  }
  update(deltaTime: number, canvasWidth: number, canvasHeight: number): void {
    super.update(deltaTime, canvasWidth, canvasHeight)
    this.pulsePhase = (this.pulsePhase + deltaTime * 10) % (Math.PI * 2)
  }
  draw(ctx: CanvasRenderingContext2D): void {
    const pulseSize = 2 + Math.sin(this.pulsePhase)
    ctx.fillStyle = '#00ffff'
    ctx.beginPath()
    ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2)
    ctx.fill()
  }
}

interface OrbitalBall {
  offset: Vector2D // Offset from center
  size: number // Current size
  baseSize: number // Base size for pulsing
  speed: number // Individual rotation speed
  phase: number // For independent pulsing
  color: string
  trail: Array<{ x: number; y: number; size: number; color: string }>
}

export class ColorMissile extends BaseProjectile {
  private balls: OrbitalBall[] = []
  private trailLength: number = 15
  private time: number = 0

  constructor(x: number, y: number, velocity: Vector2D) {
    super(x, y, velocity)
    this.initializeBalls()
  }

  private initializeBalls() {
    const colors = [
      'rgb(191, 46, 240)',
      'rgb(237, 62, 247)',
      'rgb(254, 236, 179)',
      'rgb(255, 246, 234)',
    ]

    // Create main surrounding balls
    for (let i = 0; i < 6; i++) {
      this.balls.push({
        offset: {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8,
        },
        size: 5 + Math.random() * 3,
        baseSize: 5 + Math.random() * 3,
        speed: (Math.random() - 0.5) * 2,
        phase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: [],
      })
    }

    for (let i = 0; i < 4; i++) {
      this.balls.push({
        offset: {
          x: (Math.random() - 0.5) * 4, // Closer to center
          y: (Math.random() - 0.5) * 4,
        },
        size: 3 + Math.random() * 2, // Smaller size
        baseSize: 3 + Math.random() * 2,
        speed: (Math.random() - 0.5) * 3, // Faster movement
        phase: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: [],
      })
    }
  }

  update(deltaTime: number, worldWidth: number, worldHeight: number): void {
    // Update base position
    super.update(deltaTime, worldWidth, worldHeight)

    // Update time
    this.time += deltaTime

    this.balls.forEach((ball) => {
      // Update ball's offset with circular motion
      const angle = this.time * ball.speed
      const radius = Math.sqrt(ball.offset.x ** 2 + ball.offset.y ** 2)
      ball.offset.x = Math.cos(angle) * radius
      ball.offset.y = Math.sin(angle) * radius

      // Update ball's size with pulsing effect
      ball.phase += deltaTime * 3
      const pulseFactor = 0.3 * Math.sin(ball.phase) + 1
      ball.size = ball.baseSize * pulseFactor

      // Add current position to trail
      ball.trail.unshift({
        x: this.x + ball.offset.x,
        y: this.y + ball.offset.y,
        size: ball.size,
        color: ball.color,
      })

      // Limit trail length
      if (ball.trail.length > this.trailLength) {
        ball.trail.pop()
      }
    })
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // Draw trails first
    this.balls.forEach((ball) => {
      if (ball.trail.length > 1) {
        ball.trail.forEach((point, index) => {
          // Fix color string manipulation by properly parsing the rgba values

          ctx.beginPath()
          ctx.fillStyle = point.color
          ctx.arc(point.x, point.y, point.size * (1 - index / this.trailLength), 0, Math.PI * 2)
          ctx.fill()
        })
      }
    })

    // Draw core missile
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 6)
    gradient.addColorStop(0, 'rgba(255,255,255,0.8)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.beginPath()
    ctx.fillStyle = gradient
    ctx.arc(this.x, this.y, 6, 0, Math.PI * 2)
    ctx.fill()

    // Draw current balls
    this.balls.forEach((ball) => {
      const x = this.x + ball.offset.x
      const y = this.y + ball.offset.y

      // Fix color string manipulation for gradient
      const baseColor = ball.color
      const transparentColor = ball.color.replace(/[\d.]+\)$/, '0)')

      ctx.beginPath()
      ctx.fillStyle = ball.color
      ctx.arc(x, y, ball.size, 0, Math.PI * 2)
      ctx.fill()
    })
  }
}
