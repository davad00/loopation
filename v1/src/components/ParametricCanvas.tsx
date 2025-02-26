import React, { useRef, useEffect, useState } from 'react';
import { Vector2D } from '../utils/Vector';

interface ParametricCanvasProps {
  // Canvas dimensions
  width?: number;
  height?: number;
  
  // Parametric function that takes a parameter t and returns a Vector2D
  curve: (t: number) => Vector2D;
  
  // Number of points to calculate along the curve
  pointCount?: number;
  
  // Range of the t parameter
  tStart?: number;
  tEnd?: number;
  
  // Visual options
  showPoints?: boolean;
  pointSize?: number;
  lineWidth?: number;
  lineColor?: string;
  pointColor?: string;
  
  // Additional styling
  className?: string;
  style?: React.CSSProperties;
}

export const ParametricCanvas: React.FC<ParametricCanvasProps> = ({
  width = 500,
  height = 500,
  curve,
  pointCount = 100,
  tStart = 0,
  tEnd = 2 * Math.PI,
  showPoints = true,
  pointSize = 3,
  lineWidth = 2,
  lineColor = '#000000',
  pointColor = '#ff0000',
  className = '',
  style = {}
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [points, setPoints] = useState<Vector2D[]>([]);
  
  // Calculate the points on the curve
  useEffect(() => {
    const newPoints: Vector2D[] = [];
    const tStep = (tEnd - tStart) / (pointCount - 1);
    
    for (let i = 0; i < pointCount; i++) {
      const t = tStart + i * tStep;
      const point = curve(t);
      
      // Adjust point to be centered in the canvas
      const centeredPoint = new Vector2D(
        point.x + width / 2,
        point.y + height / 2
      );
      
      newPoints.push(centeredPoint);
    }
    
    setPoints(newPoints);
  }, [curve, pointCount, tStart, tEnd, width, height]);
  
  // Draw the curve on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the line connecting the points
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // Draw the points
    if (showPoints) {
      ctx.fillStyle = pointColor;
      
      for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }, [points, showPoints, pointSize, lineWidth, lineColor, pointColor]);
  
  const containerStyle = {
    display: 'inline-block',
    ...style
  };
  
  return (
    <div style={containerStyle} className={className}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
      />
    </div>
  );
}; 