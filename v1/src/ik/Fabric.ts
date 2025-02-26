import { Point } from '../core/Point';
import { Vector2D } from '../utils/Vector';

export class Target {
  public position: Vector2D;
  
  constructor(x: number, y: number) {
    this.position = new Vector2D(x, y);
  }
  
  move(x: number, y: number): void {
    this.position.set(x, y);
  }
}

export interface Joint {
  point1: Point;
  point2: Point;
  length: number;
}

export interface TargetConstraint {
  point: Point;
  target: Target;
  strength: number;
}

export class Fabric {
  public points: Point[];
  public joints: Joint[];
  public targets: TargetConstraint[];
  
  constructor() {
    this.points = [];
    this.joints = [];
    this.targets = [];
  }
  
  addPoint(point: Point): Point {
    this.points.push(point);
    return point;
  }
  
  connectPoints(point1: Point, point2: Point, length?: number): void {
    const distance = length || point1.position.distance(point2.position);
    this.joints.push({ point1, point2, length: distance });
  }
  
  setTarget(point: Point, targetX: number, targetY: number, strength: number = 1): Target {
    const target = new Target(targetX, targetY);
    this.targets.push({ point, target, strength });
    return target;
  }
  
  solve(iterations: number = 10): void {
    // First, apply targets
    for (const { point, target, strength } of this.targets) {
      if (!point.fixed) {
        const dx = (target.position.x - point.position.x) * strength;
        const dy = (target.position.y - point.position.y) * strength;
        point.position.x += dx;
        point.position.y += dy;
      }
    }
    
    // Then solve joint constraints
    for (let i = 0; i < iterations; i++) {
      for (const joint of this.joints) {
        const { point1, point2, length } = joint;
        
        const dx = point2.position.x - point1.position.x;
        const dy = point2.position.y - point1.position.y;
        const currentLength = Math.sqrt(dx * dx + dy * dy);
        
        if (currentLength === 0) continue;
        
        const diff = (length - currentLength) / currentLength;
        const offsetX = dx * diff * 0.5;
        const offsetY = dy * diff * 0.5;
        
        // Apply constraints based on whether points are fixed
        if (!point1.fixed && !point2.fixed) {
          point1.position.x -= offsetX;
          point1.position.y -= offsetY;
          point2.position.x += offsetX;
          point2.position.y += offsetY;
        } else if (!point1.fixed) {
          point1.position.x -= offsetX * 2;
          point1.position.y -= offsetY * 2;
        } else if (!point2.fixed) {
          point2.position.x += offsetX * 2;
          point2.position.y += offsetY * 2;
        }
      }
    }
  }
  
  createLeg(x: number, y: number, segments: number[], fixStart: boolean = true): Target {
    let lastPoint: Point | null = null;
    let startPoint: Point | null = null;
    
    // Create chain of points
    for (let i = 0; i < segments.length; i++) {
      const segmentLength = segments[i];
      const isFirst = i === 0;
      const isLast = i === segments.length - 1;
      
      // Calculate position based on previous point
      let pointX = x;
      let pointY = y;
      
      if (lastPoint) {
        pointX = lastPoint.position.x + segmentLength;
        pointY = lastPoint.position.y;
      }
      
      // Create point
      const point = new Point(pointX, pointY, {
        fixed: isFirst && fixStart,
        bodySize: isLast ? 4 : 2
      });
      
      // Add point to system
      this.addPoint(point);
      
      // Connect to previous point
      if (lastPoint) {
        this.connectPoints(lastPoint, point, segmentLength);
      }
      
      if (isFirst) {
        startPoint = point;
      }
      
      lastPoint = point;
    }
    
    // Create target for the last joint
    if (lastPoint && lastPoint !== startPoint) {
      const footX = lastPoint.position.x;
      const footY = lastPoint.position.y + 20; // Default foot position below last segment
      return this.setTarget(lastPoint, footX, footY, 0.5);
    }
    
    // Fallback
    return new Target(x, y);
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    // Draw joints
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    
    for (const joint of this.joints) {
      ctx.beginPath();
      ctx.moveTo(joint.point1.position.x, joint.point1.position.y);
      ctx.lineTo(joint.point2.position.x, joint.point2.position.y);
      ctx.stroke();
    }
    
    // Draw points
    for (const point of this.points) {
      point.render(ctx);
    }
    
    // Draw targets
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    for (const { target } of this.targets) {
      ctx.beginPath();
      ctx.arc(target.position.x, target.position.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
} 