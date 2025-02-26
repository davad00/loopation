import { useRef, useState, useEffect } from 'react';
import { Chain } from '../core/Chain';
import { Vector2D } from '../utils/Vector';
import { useAnimationFrame } from './useAnimationFrame';

export interface ChainOptions {
  gravity?: { x: number, y: number };
  iterations?: number;
  fps?: number;
  autoStart?: boolean;
}

/**
 * Hook for using Chain physics in React components
 */
export const useChain = (options: ChainOptions = {}) => {
  const {
    gravity = { x: 0, y: 9.8 },
    iterations = 5,
    fps = 60,
    autoStart = true
  } = options;
  
  const chainRef = useRef<Chain | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize chain on first render
  useEffect(() => {
    const gravityVector = new Vector2D(gravity.x, gravity.y);
    chainRef.current = new Chain(gravityVector);
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Animation controls
  const animationControls = useAnimationFrame((deltaTime) => {
    if (chainRef.current) {
      chainRef.current.update(deltaTime, iterations);
    }
  }, { fps, paused: !autoStart });
  
  const renderToCanvas = (ctx: CanvasRenderingContext2D) => {
    if (chainRef.current) {
      chainRef.current.render(ctx);
    }
  };
  
  // Return the chain interface and animation controls
  return {
    chain: chainRef.current,
    isInitialized,
    renderToCanvas,
    ...animationControls
  };
}; 