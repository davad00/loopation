import React, { useRef, useEffect } from 'react';
import { useChain } from '../hooks/useChain';
import { Point } from '../core/Point';
import { Chain } from '../core/Chain';

export interface ChainCanvasProps {
  width?: number;
  height?: number;
  gravity?: { x: number, y: number };
  iterations?: number;
  fps?: number;
  autoStart?: boolean;
  chainSetup?: (chain: Chain) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ChainCanvas: React.FC<ChainCanvasProps> = ({
  width = 400,
  height = 400,
  gravity,
  iterations,
  fps,
  autoStart,
  chainSetup,
  className,
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { chain, isInitialized, renderToCanvas, pause, resume, isPaused } = useChain({
    gravity,
    iterations,
    fps,
    autoStart
  });
  
  // Set up chain once it's initialized
  useEffect(() => {
    if (isInitialized && chain && chainSetup) {
      chainSetup(chain);
    }
  }, [isInitialized, chain, chainSetup]);
  
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