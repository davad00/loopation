import { Vector2D } from '../utils/Vector';

export class ParametricCurve {
  // Function type for parametric equations
  public xFunction: (t: number) => number;
  public yFunction: (t: number) => number;
  
  constructor(
    xFunction: (t: number) => number,
    yFunction: (t: number) => number
  ) {
    this.xFunction = xFunction;
    this.yFunction = yFunction;
  }
  
  getPointAt(t: number): Vector2D {
    return new Vector2D(
      this.xFunction(t),
      this.yFunction(t)
    );
  }
  
  // Get a number of points along the curve
  getPoints(count: number, tStart: number = 0, tEnd: number = 1): Vector2D[] {
    const points: Vector2D[] = [];
    
    for (let i = 0; i < count; i++) {
      const t = tStart + (tEnd - tStart) * (i / (count - 1));
      points.push(this.getPointAt(t));
    }
    
    return points;
  }
}

export class Equations {
  // Common parametric equations
  
  static circle(centerX: number, centerY: number, radius: number): ParametricCurve {
    return new ParametricCurve(
      (t) => centerX + radius * Math.cos(t * Math.PI * 2),
      (t) => centerY + radius * Math.sin(t * Math.PI * 2)
    );
  }
  
  static ellipse(centerX: number, centerY: number, radiusX: number, radiusY: number): ParametricCurve {
    return new ParametricCurve(
      (t) => centerX + radiusX * Math.cos(t * Math.PI * 2),
      (t) => centerY + radiusY * Math.sin(t * Math.PI * 2)
    );
  }
  
  static lissajous(centerX: number, centerY: number, aX: number, aY: number, freqX: number, freqY: number, phase: number = 0): ParametricCurve {
    return new ParametricCurve(
      (t) => centerX + aX * Math.sin(freqX * t * Math.PI * 2 + phase),
      (t) => centerY + aY * Math.sin(freqY * t * Math.PI * 2)
    );
  }
  
  static spiral(centerX: number, centerY: number, a: number, b: number): ParametricCurve {
    return new ParametricCurve(
      (t) => centerX + a * t * Math.cos(b * t * Math.PI * 2),
      (t) => centerY + a * t * Math.sin(b * t * Math.PI * 2)
    );
  }
  
  static wave(startX: number, startY: number, width: number, amplitude: number, frequency: number): ParametricCurve {
    return new ParametricCurve(
      (t) => startX + width * t,
      (t) => startY + amplitude * Math.sin(frequency * t * Math.PI * 2)
    );
  }
} 