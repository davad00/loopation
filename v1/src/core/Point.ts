import { Vector2D } from '../utils/Vector';

export interface PointOptions {
  bodySize?: number;
  fixed?: boolean;
  mass?: number;
}

export class Point {
  public position: Vector2D;
  public prevPosition: Vector2D;
  public velocity: Vector2D;
  public bodySize: number;
  public fixed: boolean;
  public mass: number;

  constructor(x: number, y: number, options: PointOptions = {}) {
    this.position = new Vector2D(x, y);
    this.prevPosition = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.bodySize = options.bodySize || 1;
    this.fixed = options.fixed || false;
    this.mass = options.mass || 1;
  }

  update(dt: number, gravity: Vector2D): void {
    if (this.fixed) return;

    // Store current position as previous
    this.prevPosition.set(this.position.x, this.position.y);

    // Apply forces
    this.velocity.add(gravity.clone().multiplyScalar(dt));
    
    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(dt));
  }

  applyConstraint(newPosition: Vector2D): void {
    if (this.fixed) return;
    this.position.set(newPosition.x, newPosition.y);
  }

  render(ctx: CanvasRenderingContext2D, color: string = '#333'): void {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.bodySize, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
} 