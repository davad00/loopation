import { Point } from '../core/Point';

export class DistanceConstraint {
  public point1: Point;
  public point2: Point;
  public distance: number;
  public stiffness: number;

  constructor(point1: Point, point2: Point, distance?: number, stiffness: number = 1) {
    this.point1 = point1;
    this.point2 = point2;
    this.distance = distance || point1.position.distance(point2.position);
    this.stiffness = stiffness;
  }

  solve(): void {
    const dx = this.point2.position.x - this.point1.position.x;
    const dy = this.point2.position.y - this.point1.position.y;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);
    
    if (currentDistance === 0) return; // Avoid division by zero
    
    const difference = (this.distance - currentDistance) / currentDistance;
    const offsetX = dx * difference * 0.5 * this.stiffness;
    const offsetY = dy * difference * 0.5 * this.stiffness;
    
    // Apply constraints based on whether points are fixed
    if (!this.point1.fixed && !this.point2.fixed) {
      this.point1.position.x -= offsetX;
      this.point1.position.y -= offsetY;
      this.point2.position.x += offsetX;
      this.point2.position.y += offsetY;
    } else if (!this.point1.fixed) {
      this.point1.position.x -= offsetX * 2;
      this.point1.position.y -= offsetY * 2;
    } else if (!this.point2.fixed) {
      this.point2.position.x += offsetX * 2;
      this.point2.position.y += offsetY * 2;
    }
  }
} 