import { Point } from './Point';
import { DistanceConstraint } from '../constraints/DistanceConstraint';
import { AngleConstraint } from '../constraints/AngleConstraint';
import { Vector2D } from '../utils/Vector';

export class Chain {
  public points: Point[];
  public distanceConstraints: DistanceConstraint[];
  public angleConstraints: AngleConstraint[];
  private gravity: Vector2D;
  
  constructor(gravity: Vector2D = new Vector2D(0, 9.8)) {
    this.points = [];
    this.distanceConstraints = [];
    this.angleConstraints = [];
    this.gravity = gravity;
  }

  addPoint(point: Point): number {
    this.points.push(point);
    return this.points.length - 1;
  }

  addDistanceConstraint(p1Index: number, p2Index: number, distance?: number): void {
    const point1 = this.points[p1Index];
    const point2 = this.points[p2Index];
    
    if (!point1 || !point2) {
      throw new Error(`Invalid point indices: ${p1Index}, ${p2Index}`);
    }
    
    const targetDistance = distance || point1.position.distance(point2.position);
    this.distanceConstraints.push(new DistanceConstraint(point1, point2, targetDistance));
  }
  
  addAngleConstraint(p1Index: number, p2Index: number, p3Index: number, minAngle?: number, maxAngle?: number): void {
    const point1 = this.points[p1Index];
    const point2 = this.points[p2Index];
    const point3 = this.points[p3Index];
    
    if (!point1 || !point2 || !point3) {
      throw new Error(`Invalid point indices: ${p1Index}, ${p2Index}, ${p3Index}`);
    }
    
    this.angleConstraints.push(new AngleConstraint(point1, point2, point3, minAngle, maxAngle));
  }
  
  createChain(startX: number, startY: number, count: number, segmentLength: number, bodySize?: number): void {
    // Create first point (fixed)
    const firstPoint = new Point(startX, startY, { fixed: true, bodySize: bodySize });
    this.addPoint(firstPoint);
    
    // Create rest of the chain
    for (let i = 1; i < count; i++) {
      const point = new Point(
        startX + i * segmentLength,
        startY,
        { bodySize: bodySize }
      );
      this.addPoint(point);
      this.addDistanceConstraint(i - 1, i, segmentLength);
      
      // Add angle constraint for every three consecutive points
      if (i >= 2) {
        this.addAngleConstraint(i - 2, i - 1, i, Math.PI / 8, Math.PI - Math.PI / 8);
      }
    }
  }
  
  update(dt: number, iterations: number = 5): void {
    // Update physics for all points
    for (const point of this.points) {
      point.update(dt, this.gravity);
    }
    
    // Solve constraints multiple times for better stability
    for (let i = 0; i < iterations; i++) {
      // Solve distance constraints
      for (const constraint of this.distanceConstraints) {
        constraint.solve();
      }
      
      // Solve angle constraints
      for (const constraint of this.angleConstraints) {
        constraint.solve();
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Draw connections between points
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    
    for (const constraint of this.distanceConstraints) {
      ctx.beginPath();
      ctx.moveTo(constraint.point1.position.x, constraint.point1.position.y);
      ctx.lineTo(constraint.point2.position.x, constraint.point2.position.y);
      ctx.stroke();
    }
    
    // Draw points
    for (const point of this.points) {
      point.render(ctx);
    }
  }
} 