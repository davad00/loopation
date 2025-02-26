import { Point } from '../core/Point';

export class AngleConstraint {
  public point1: Point;
  public point2: Point;
  public point3: Point;
  public minAngle: number;
  public maxAngle: number;
  public stiffness: number;

  constructor(
    point1: Point, 
    point2: Point, 
    point3: Point, 
    minAngle: number = 0, 
    maxAngle: number = Math.PI, 
    stiffness: number = 0.5
  ) {
    this.point1 = point1;
    this.point2 = point2;
    this.point3 = point3;
    this.minAngle = minAngle;
    this.maxAngle = maxAngle;
    this.stiffness = stiffness;
  }

  solve(): void {
    // Calculate current angle
    const angle = this.calculateAngle();
    
    // If the angle is within limits, no adjustment needed
    if (angle >= this.minAngle && angle <= this.maxAngle) {
      return;
    }
    
    // Determine target angle
    const targetAngle = angle < this.minAngle ? this.minAngle : this.maxAngle;
    
    // Calculate vectors from middle point to end points
    const v1x = this.point1.position.x - this.point2.position.x;
    const v1y = this.point1.position.y - this.point2.position.y;
    const v2x = this.point3.position.x - this.point2.position.x;
    const v2y = this.point3.position.y - this.point2.position.y;
    
    // Normalize vectors
    const len1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const len2 = Math.sqrt(v2x * v2x + v2y * v2y);
    
    if (len1 === 0 || len2 === 0) return; // Avoid division by zero
    
    const n1x = v1x / len1;
    const n1y = v1y / len1;
    const n2x = v2x / len2;
    const n2y = v2y / len2;
    
    // Calculate rotation
    const cosTarget = Math.cos(targetAngle);
    const currentCos = (n1x * n2x + n1y * n2y);
    
    // No need to adjust if already at target
    if (Math.abs(currentCos - cosTarget) < 0.001) return;
    
    // Calculate new position for point3
    if (!this.point3.fixed) {
      const rotationAmount = (targetAngle - angle) * this.stiffness;
      
      // Rotate vector v2 around point2
      const cosRot = Math.cos(rotationAmount);
      const sinRot = Math.sin(rotationAmount);
      
      const rotatedX = v2x * cosRot - v2y * sinRot;
      const rotatedY = v2x * sinRot + v2y * cosRot;
      
      this.point3.position.x = this.point2.position.x + rotatedX;
      this.point3.position.y = this.point2.position.y + rotatedY;
    }
  }

  private calculateAngle(): number {
    const ax = this.point1.position.x - this.point2.position.x;
    const ay = this.point1.position.y - this.point2.position.y;
    const bx = this.point3.position.x - this.point2.position.x;
    const by = this.point3.position.y - this.point2.position.y;
    
    const magA = Math.sqrt(ax * ax + ay * ay);
    const magB = Math.sqrt(bx * bx + by * by);
    
    if (magA === 0 || magB === 0) return 0; // Avoid division by zero
    
    const dotProduct = ax * bx + ay * by;
    const cosAngle = dotProduct / (magA * magB);
    
    // Clamp cosAngle to avoid Math.acos domain errors
    const clampedCosAngle = Math.max(-1, Math.min(1, cosAngle));
    
    return Math.acos(clampedCosAngle);
  }
} 