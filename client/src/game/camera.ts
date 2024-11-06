export class Camera {
  x: number = 0
  y: number = 0
  width: number
  height: number
  worldWidth: number
  worldHeight: number

  constructor(width: number, height: number, worldWidth: number, worldHeight: number) {
    this.width = width
    this.height = height
    this.worldWidth = worldWidth
    this.worldHeight = worldHeight
  }

  follow(targetX: number, targetY: number) {
    this.x = targetX - this.width / 2
    this.y = targetY - this.height / 2
  }

  applyToContext(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(-this.x, -this.y)
  }
}
