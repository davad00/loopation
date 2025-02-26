import React, { useRef, useEffect } from 'react';
import { useFabric } from '../hooks/useFabric';

export interface FabricCanvasProps {
  width?: number;
  height?: number;
  iterations?: number;
  fps?: number;
  autoStart?: boolean;
  onInit?: (fabric: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const FabricCanvas: React.FC<FabricCanvasProps> = ({
  width = 400,
  height = 400,
  iterations,
  fps,
  autoStart,
  onInit,
  className,
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { fabric, isInitialized, renderToCanvas, createLeg, pause, resume, isPaused } = useFabric({
    iterations,
    fps,
    autoStart
  });
  
  // Call onInit when fabric is initialized
  useEffect(() => {
    if (isInitialized && fabric && onInit) {
      onInit({
        fabric,
        createLeg
      });
    }
  }, [isInitialized, fabric, onInit, createLeg]);
  
  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderToCanvas(ctx);
      animationId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [renderToCanvas]);
  
  return (
    <div className={className} style={style}>
      <canvas 
        ref={canvasRef}
        width={width}
        height={height}
        style={{ 
          border: '1px solid #ccc',
          ...style
        }}
      />
      <div style={{ marginTop: 10 }}>
        <button onClick={isPaused ? resume : pause}>
          {isPaused ? 'Start' : 'Pause'}
        </button>
      </div>
    </div>
  );
}; 