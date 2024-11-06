import type { Vector2D } from './types'
import { GAME_CONSTANTS } from './constants'
const {
  MAX_BOOST_FUEL,
  SHIP_ACCELERATION,
  BOOST_MULTIPLIER,
  BOOST_CONSUMPTION_RATE,
  BOOST_RECHARGE_RATE,
  DRAG,
  MAX_VELOCITY,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} = GAME_CONSTANTS
export class Ship {
  private _id: string
  private _x: number
  private _y: number
  private _rotation: number = 0
  private _velocity: Vector2D = { x: 0, y: 0 }
  private _boostFuel: number = MAX_BOOST_FUEL
  private _lastShot: number = 0
  private _acceleration: Vector2D = { x: 0, y: 0 }
  constructor(id: string, x: number, y: number) {
    this._id = id
    this._x = x / 2
    this._y = y / 2
  }

  public update(keysPressed: Set<string>, deltaTime: number): void {
    if (keysPressed.has('a')) this._rotation -= GAME_CONSTANTS.ROTATION_SPEED * deltaTime
    if (keysPressed.has('d')) this._rotation += GAME_CONSTANTS.ROTATION_SPEED * deltaTime

    this._acceleration = { x: 0, y: 0 }

    const direction = {
      x: Math.cos(this._rotation),
      y: Math.sin(this._rotation),
    }

    if (keysPressed.has('w')) {
      this._acceleration = {
        x: direction.x * SHIP_ACCELERATION,
        y: direction.y * SHIP_ACCELERATION,
      }
    } else if (keysPressed.has('s')) {
      this._acceleration = {
        x: -direction.x * SHIP_ACCELERATION * 0.5,
        y: -direction.y * SHIP_ACCELERATION * 0.5,
      }
    }

    const boostMultiplier = keysPressed.has(' ') && this._boostFuel > 0 ? BOOST_MULTIPLIER : 1
    if (boostMultiplier > 1) {
      this._boostFuel = Math.max(0, this._boostFuel - BOOST_CONSUMPTION_RATE * deltaTime)
    } else {
      this._boostFuel = Math.min(MAX_BOOST_FUEL, this._boostFuel + BOOST_RECHARGE_RATE * deltaTime)
    }

    this._velocity.x += this._acceleration.x * boostMultiplier * deltaTime
    this._velocity.y += this._acceleration.y * boostMultiplier * deltaTime

    this._velocity.x *= DRAG
    this._velocity.y *= DRAG

    const speed = Math.sqrt(this._velocity.x ** 2 + this._velocity.y ** 2)
    if (speed > MAX_VELOCITY) {
      const scale = MAX_VELOCITY / speed
      this._velocity.x *= scale
      this._velocity.y *= scale
    }

    this._x += this._velocity.x * deltaTime
    this._y += this._velocity.y * deltaTime

    this._x = Math.max(0, Math.min(WORLD_WIDTH, this._x))
    this._y = Math.max(0, Math.min(WORLD_HEIGHT, this._y))
  }

  public draw(ctx: CanvasRenderingContext2D, keysPressed: Set<string>) {
    ctx.translate(this._x, this._y)
    ctx.rotate(this._rotation)

    ctx.beginPath()
    ctx.moveTo(20, 0)
    ctx.lineTo(-10, -10)
    ctx.lineTo(-10, 10)
    ctx.closePath()
    ctx.strokeStyle = 'white'
    ctx.stroke()

    if (keysPressed.has(' ') && this._boostFuel > 0) {
      ctx.beginPath()
      ctx.moveTo(-10, 0)
      ctx.lineTo(-20, -5)
      ctx.lineTo(-25, 0)
      ctx.lineTo(-20, 5)
      ctx.closePath()
      ctx.fillStyle = '#ff6600'
      ctx.fill()
    }
  }

  get id() {
    return this._id
  }
  set x(val: number) {
    this._x = val
  }
  get x() {
    return this._x
  }

  set y(val: number) {
    this._y = val
  }
  get y() {
    return this._y
  }
  get rotation() {
    return this._rotation
  }
  set rotation(val: number) {
    this._rotation = val
  }
  get velocity() {
    return this._velocity
  }
  set velocity(val: Vector2D) {
    this._velocity = val
  }
  get boostFuel() {
    return this._boostFuel
  }
  set lastShot(val: number) {
    this._lastShot = val
  }
  get lastShot() {
    return this._lastShot
  }
  set acceleration(val: Vector2D) {
    this._acceleration = val
  }
  get acceleration() {
    return this._acceleration
  }
}
