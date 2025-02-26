export class Vector2D {
  public x: number;
  public y: number;
  
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  
  set(x: number, y: number): Vector2D {
    this.x = x;
    this.y = y;
    return this;
  }
  
  copy(v: Vector2D): Vector2D {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
  
  clone(): Vector2D {
    return new Vector2D(this.x, this.y);
  }
  
  add(v: Vector2D): Vector2D {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  
  subtract(v: Vector2D): Vector2D {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  
  multiplyScalar(scalar: number): Vector2D {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  
  divideScalar(scalar: number): Vector2D {
    if (scalar !== 0) {
      this.x /= scalar;
      this.y /= scalar;
    } else {
      this.x = 0;
      this.y = 0;
    }
    return this;
  }
  
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  normalize(): Vector2D {
    return this.divideScalar(this.length() || 1);
  }
  
  distance(v: Vector2D): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  dot(v: Vector2D): number {
    return this.x * v.x + this.y * v.y;
  }
  
  angle(): number {
    return Math.atan2(this.y, this.x);
  }
  
  angleTo(v: Vector2D): number {
    const theta = this.dot(v) / (this.length() * v.length());
    return Math.acos(Math.min(Math.max(theta, -1), 1));
  }
  
  rotate(angle: number): Vector2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }
} 