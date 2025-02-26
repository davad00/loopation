import { useRef, useState, useEffect } from 'react';
import { Fabric, Target } from '../ik/Fabric';
import { useAnimationFrame } from './useAnimationFrame';

export interface FabricOptions {
  iterations?: number;
  fps?: number;
  autoStart?: boolean;
}

/**
 * Hook for using Fabric (IK) system in React components
 */
export const useFabric = (options: FabricOptions = {}) => {
  const {
    iterations = 10,
    fps = 60,
    autoStart = true
  } = options;
  
  const fabricRef = useRef<Fabric | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize fabric on first render
  useEffect(() => {
    fabricRef.current = new Fabric();
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Animation controls
  const animationControls = useAnimationFrame(() => {
    if (fabricRef.current) {
      fabricRef.current.solve(iterations);
    }
  }, { fps, paused: !autoStart });
  
  const renderToCanvas = (ctx: CanvasRenderingContext2D) => {
    if (fabricRef.current) {
      fabricRef.current.render(ctx);
    }
  };
  
  // Helper for creating legs
  const createLeg = (x: number, y: number, segments: number[], fixStart: boolean = true): Target | null => {
    if (fabricRef.current) {
      return fabricRef.current.createLeg(x, y, segments, fixStart);
    }
    return null;
  };
  
  // Return the fabric interface and animation controls
  return {
    fabric: fabricRef.current,
    isInitialized,
    renderToCanvas,
    createLeg,
    ...animationControls
  };
}; 