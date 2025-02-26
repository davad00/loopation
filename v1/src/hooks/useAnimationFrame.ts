import { useRef, useEffect, useState } from 'react';

export interface AnimationFrameOptions {
  fps?: number;
  paused?: boolean;
}

/**
 * Hook for handling animation frames in React
 * @param callback Function to be called on each animation frame
 * @param options Configuration options
 */
export const useAnimationFrame = (
  callback: (deltaTime: number) => void,
  options: AnimationFrameOptions = {}
) => {
  const { fps = 60, paused = false } = options;
  
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const accumulatedTimeRef = useRef<number>(0);
  const frameIntervalRef = useRef<number>(1000 / fps);
  
  // For allowing external pausing
  const [isPaused, setIsPaused] = useState(paused);
  
  useEffect(() => {
    frameIntervalRef.current = 1000 / fps;
  }, [fps]);
  
  useEffect(() => {
    setIsPaused(paused);
  }, [paused]);
  
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = Math.min((time - previousTimeRef.current) / 1000, 0.1);
      
      if (!isPaused) {
        accumulatedTimeRef.current += deltaTime * 1000;
        
        while (accumulatedTimeRef.current >= frameIntervalRef.current) {
          callback(frameIntervalRef.current / 1000);
          accumulatedTimeRef.current -= frameIntervalRef.current;
        }
      }
    }
    
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);
  
  // Return controls
  return {
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false),
    isPaused,
    setFps: (newFps: number) => {
      frameIntervalRef.current = 1000 / newFps;
    }
  };
}; 