import React, { useState, useEffect, useRef } from 'react';
import { ParametricCanvas, Vector2D } from '../src';

interface ParametricDemoProps {
  width?: number;
  height?: number;
}

// Union type for all parameter types
type CurveParams = CircleParams | LissajousParams | SpiralParams | RoseParams | ButterflyParams;

// Define specific interfaces for each curve type
interface CircleParams {
  radius: number;
  [key: string]: number;
}

interface LissajousParams {
  freqX: number;
  freqY: number;
  phase: number;
  radius: number;
  [key: string]: number;
}

interface SpiralParams {
  growth: number;
  coils: number;
  scale: number;
  [key: string]: number;
}

interface RoseParams {
  n: number;
  d: number;
  radius: number;
  [key: string]: number;
}

interface ButterflyParams {
  scale: number;
  [key: string]: number;
}

// Easing functions
type EasingType = 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad' | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic' | 'easeInElastic' | 'easeOutElastic' | 'easeInOutElastic';

// Animation direction
type AnimationDirection = 'forward' | 'backward' | 'alternate';

// Following object interface
interface FollowingObject {
  id: string;
  color: string;
  size: number;
  offset: number; // 0 to 1, position along the curve
  visible: boolean;
}

// Type for our parametric equations
interface ParametricEquation<T extends CurveParams> {
  name: string;
  description: string;
  function: (t: number, params: T) => Vector2D;
  params: T;
  minT: number;
  maxT: number;
  steps: number;
}

// Easing functions implementation
const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInElastic: (t: number) => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI),
  easeOutElastic: (t: number) => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1,
  easeInOutElastic: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) {
      return -0.5 * Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * 2 * Math.PI / 4.5);
    }
    return Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * 2 * Math.PI / 4.5) * 0.5 + 1;
  }
};

// Predefined parametric equations
const parametricEquations: Record<string, ParametricEquation<any>> = {
  circle: {
    name: 'Circle',
    description: 'A simple circle',
    function: (t: number, params: CircleParams) => {
      const radius = params.radius || 100;
      return new Vector2D(
        Math.cos(t * 2 * Math.PI) * radius,
        Math.sin(t * 2 * Math.PI) * radius
      );
    },
    params: { radius: 100 },
    minT: 0,
    maxT: 1,
    steps: 100
  },
  lissajous: {
    name: 'Lissajous Curve',
    description: 'A technical curve with frequency and phase parameters',
    function: (t: number, params: LissajousParams) => {
      const freqX = params.freqX || 3;
      const freqY = params.freqY || 2;
      const phase = params.phase || Math.PI / 2;
      const radius = params.radius || 100;
      
      return new Vector2D(
        Math.sin(t * 2 * Math.PI * freqX + phase) * radius,
        Math.sin(t * 2 * Math.PI * freqY) * radius
      );
    },
    params: { freqX: 3, freqY: 2, phase: Math.PI / 2, radius: 100 },
    minT: 0,
    maxT: 1,
    steps: 300
  },
  spiral: {
    name: 'Logarithmic Spiral',
    description: 'An elegant natural spiral pattern',
    function: (t: number, params: SpiralParams) => {
      const growth = params.growth || 0.1;
      const coils = params.coils || 3;
      const scale = params.scale || 10;
      
      const r = Math.exp(growth * t * coils) * scale;
      const theta = t * 2 * Math.PI * coils;
      
      return new Vector2D(
        r * Math.cos(theta),
        r * Math.sin(theta)
      );
    },
    params: { growth: 0.1, coils: 3, scale: 10 },
    minT: 0,
    maxT: 1,
    steps: 300
  },
  rose: {
    name: 'Rose Curve',
    description: 'A floral pattern based on sinusoids',
    function: (t: number, params: RoseParams) => {
      const n = params.n || 3; // pedals
      const d = params.d || 1;
      const radius = params.radius || 100;
      
      const k = n / d;
      const theta = t * 2 * Math.PI;
      
      return new Vector2D(
        radius * Math.cos(k * theta) * Math.cos(theta),
        radius * Math.cos(k * theta) * Math.sin(theta)
      );
    },
    params: { n: 3, d: 1, radius: 100 },
    minT: 0,
    maxT: 1,
    steps: 300
  },
  butterfly: {
    name: 'Butterfly Curve',
    description: 'A curve resembling butterfly wings',
    function: (t: number, params: ButterflyParams) => {
      const scale = params.scale || 3;
      const theta = t * 2 * Math.PI;
      const r = Math.exp(Math.cos(theta)) - 2 * Math.cos(4 * theta) + Math.pow(Math.sin(theta / 12), 5);
      
      return new Vector2D(
        scale * r * Math.sin(theta) * 20,
        scale * r * Math.cos(theta) * 20
      );
    },
    params: { scale: 3 },
    minT: 0,
    maxT: 2 * Math.PI,
    steps: 500
  }
};

type CurveType = keyof typeof parametricEquations;

export const ParametricDemo: React.FC<ParametricDemoProps> = ({
  width = 800,
  height = 600
}) => {
  const [curve, setCurve] = useState<CurveType>('circle');
  const [params, setParams] = useState<CurveParams>(parametricEquations.circle.params);
  const [showControls, setShowControls] = useState(true);
  const [strokeColor, setStrokeColor] = useState('#4a6fa5');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [timeFactor, setTimeFactor] = useState(0); // For animation
  const [animating, setAnimating] = useState(false);
  
  // New state variables for enhanced animation features
  const [continuousAnimation, setContinuousAnimation] = useState(false);
  const [followingObjects, setFollowingObjects] = useState<FollowingObject[]>([
    { id: '1', color: '#ff5252', size: 12, offset: 0, visible: true },
    { id: '2', color: '#4caf50', size: 10, offset: 0.25, visible: true },
    { id: '3', color: '#2196f3', size: 8, offset: 0.5, visible: true },
    { id: '4', color: '#ff9800', size: 6, offset: 0.75, visible: true },
  ]);
  const [showFollowingObjects, setShowFollowingObjects] = useState(false);
  const [easingFunction, setEasingFunction] = useState<EasingType>('linear');
  const [animationDuration, setAnimationDuration] = useState(3000); // ms
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>('forward');
  const [showCodeExport, setShowCodeExport] = useState(false);
  
  // Animation refs
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const directionFactorRef = useRef<number>(1);
  
  // Add additional state for drawing progress
  const [progress, setProgress] = useState(100);
  
  // Update the useEffect to control animation progress
  useEffect(() => {
    let animationFrame: number;
    
    if (animating && !continuousAnimation) {
      // Start with 0% progress and move to 100% (one-time animation)
      setProgress(0);
      let animationProgress = 0;
      
      const animate = () => {
        animationProgress = Math.min(100, animationProgress + 1);
        setProgress(animationProgress);
        setTimeFactor(animationProgress / 100);
        
        if (animationProgress < 100) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      
      animationFrame = requestAnimationFrame(animate);
    } else if (!animating && !continuousAnimation) {
      // When not animating, show the full curve
      setProgress(100);
      setTimeFactor(1);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [animating, continuousAnimation]);
  
  // Continuous animation effect
  useEffect(() => {
    if (continuousAnimation) {
      startTimeRef.current = performance.now();
      
      const animateContinuously = (timestamp: number) => {
        const elapsed = timestamp - startTimeRef.current;
        let normalizedTime = (elapsed % animationDuration) / animationDuration;
        
        // Apply direction logic
        if (animationDirection === 'backward') {
          normalizedTime = 1 - normalizedTime;
        } else if (animationDirection === 'alternate') {
          const cycle = Math.floor(elapsed / animationDuration);
          if (cycle % 2 === 1) {
            normalizedTime = 1 - normalizedTime;
          }
        }
        
        // Apply easing function
        const easedTime = easingFunctions[easingFunction](normalizedTime);
        setTimeFactor(easedTime);
        
        animationRef.current = requestAnimationFrame(animateContinuously);
      };
      
      animationRef.current = requestAnimationFrame(animateContinuously);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [continuousAnimation, animationDuration, animationDirection, easingFunction]);
  
  const handleCurveChange = (newCurve: CurveType) => {
    setCurve(newCurve);
    setParams(parametricEquations[newCurve].params);
  };
  
  const handleParamChange = (paramName: string, value: number) => {
    setParams((prevParams) => ({
      ...prevParams,
      [paramName]: value
    }));
  };
  
  const toggleAnimation = () => {
    if (continuousAnimation) {
      // If continuous animation is on, toggle it off
      setContinuousAnimation(false);
    } else {
      // Otherwise toggle the one-time animation
      setAnimating(!animating);
    }
  };
  
  const toggleContinuousAnimation = () => {
    // Turn off one-time animation if it's on
    if (animating) {
      setAnimating(false);
    }
    setContinuousAnimation(!continuousAnimation);
  };
  
  const toggleFollowingObjects = () => {
    setShowFollowingObjects(!showFollowingObjects);
  };
  
  const handleEasingChange = (newEasing: EasingType) => {
    setEasingFunction(newEasing);
  };
  
  const handleAnimationDurationChange = (duration: number) => {
    setAnimationDuration(duration);
  };
  
  const handleDirectionChange = (direction: AnimationDirection) => {
    setAnimationDirection(direction);
  };
  
  const handleFollowingObjectChange = (id: string, property: keyof FollowingObject, value: any) => {
    setFollowingObjects(objects => 
      objects.map(obj => 
        obj.id === id ? { ...obj, [property]: value } : obj
      )
    );
  };
  
  const addFollowingObject = () => {
    const newId = (followingObjects.length + 1).toString();
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    
    setFollowingObjects([
      ...followingObjects,
      { 
        id: newId, 
        color: randomColor, 
        size: 8, 
        offset: Math.random(), 
        visible: true 
      }
    ]);
  };
  
  const removeFollowingObject = (id: string) => {
    setFollowingObjects(objects => objects.filter(obj => obj.id !== id));
  };
  
  const toggleControlsVisibility = () => {
    setShowControls(!showControls);
  };
  
  const toggleCodeExport = () => {
    setShowCodeExport(!showCodeExport);
  };
  
  const generateCode = () => {
    const currentEquation = parametricEquations[curve];
    const paramValues = Object.entries(params)
      .map(([key, value]) => `  ${key}: ${value},`)
      .join('\n');
    
    // Create a safer way to extract the function body
    const functionStr = currentEquation.function.toString();
    let functionBody = "";
    
    // Try to extract the function body in a safer way
    if (functionStr.includes('=>')) {
      // Arrow function
      const parts = functionStr.split('=>');
      if (parts.length > 1) {
        functionBody = parts[1].trim();
      } else {
        functionBody = functionStr;
      }
    } else if (functionStr.includes('return')) {
      // Regular function with return statement
      const match = functionStr.match(/\{([\s\S]*)\}/);
      if (match && match[1]) {
        functionBody = match[1].trim();
      } else {
        functionBody = functionStr;
      }
    } else {
      // Fallback
      functionBody = functionStr;
    }
    
    return `import { Equations, ParametricCanvas } from 'loopation';

// Create a ${currentEquation.name.toLowerCase()} parametric curve
const params = {
${paramValues}
};

// Create the parametric curve
const curve = (t) => {
  // This is the ${currentEquation.name} function
  ${functionStr}
  
  // You can customize this function as needed
  return new Vector2D(
    ${currentEquation.function(0.5, params).x.toFixed(2)}, // Example x value
    ${currentEquation.function(0.5, params).y.toFixed(2)}  // Example y value
  );
};

// In your React component:
return (
  <ParametricCanvas
    width={${width}}
    height={${height}}
    curve={curve}
    pointCount={${currentEquation.steps}}
    tStart={${currentEquation.minT}}
    tEnd={${currentEquation.maxT}}
    showPoints={${showFollowingObjects}}
    lineColor="${strokeColor}"
    lineWidth={${strokeWidth}}
  />
);`;
  };
  
  const currentEquation = parametricEquations[curve];
  
  // Function to render at specific time
  const drawParametricCurve = (t: number) => {
    // When animating, use the current timeFactor to adjust where we are in the curve
    // This creates a "drawing" effect for the curve
    const animatedT = animating || continuousAnimation
      ? currentEquation.minT + (t * timeFactor * (currentEquation.maxT - currentEquation.minT))
      : currentEquation.minT + (t * (currentEquation.maxT - currentEquation.minT));
    
    return currentEquation.function(animatedT, params as any);
  };
  
  const styles = {
    parametricDemo: {
      width: '100%',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 700,
      color: '#343a40',
      margin: 0
    },
    controlToggle: {
      padding: '8px 16px',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background 0.2s ease'
    },
    controlsContainer: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px',
      transition: 'all 0.3s ease',
      overflow: 'hidden'
    },
    hidden: {
      height: '0',
      padding: '0',
      marginBottom: '10px'
    },
    controls: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px'
    },
    controlGroup: {
      background: 'white',
      padding: '15px',
      borderRadius: '6px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    curveSelector: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px'
    },
    curveButton: {
      padding: '10px',
      background: '#e9ecef',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 500,
      fontSize: '14px',
      transition: 'all 0.2s ease'
    },
    activeCurve: {
      background: 'linear-gradient(135deg, #007bff, #0069d9)',
      color: 'white',
      boxShadow: '0 2px 4px rgba(0, 123, 255, 0.2)'
    },
    equationDescription: {
      fontSize: '14px',
      color: '#6c757d',
      margin: '10px 0 15px 0'
    },
    paramControls: {
      marginTop: '15px'
    },
    label: {
      display: 'flex',
      flexDirection: 'column' as const,
      marginBottom: '10px'
    },
    labelText: {
      fontWeight: 500,
      marginBottom: '5px',
      color: '#495057',
      display: 'flex',
      justifyContent: 'space-between'
    },
    sliderContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    inputRange: {
      flex: 1,
      margin: '5px 10px 5px 0'
    },
    value: {
      background: '#e9ecef',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '14px',
      color: '#495057',
      minWidth: '36px',
      textAlign: 'center' as const
    },
    button: {
      padding: '10px 16px',
      background: 'linear-gradient(135deg, #007bff, #0069d9)',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 500,
      marginTop: '10px',
      width: '100%',
      transition: 'transform 0.1s, box-shadow 0.2s',
      boxShadow: '0 2px 4px rgba(0, 123, 255, 0.2)'
    },
    activeButton: {
      background: 'linear-gradient(135deg, #28a745, #218838)'
    },
    colorInput: {
      width: '100%',
      padding: '5px',
      border: '1px solid #ced4da',
      borderRadius: '4px'
    },
    canvasContainer: {
      position: 'relative' as const,
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center'
    },
    canvas: {
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      background: 'linear-gradient(145deg, #f8f9fa, #ffffff)'
    },
    instructions: {
      marginTop: '20px',
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '8px',
      fontSize: '14px',
      lineHeight: 1.6
    },
    instructionsTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '10px',
      color: '#343a40'
    },
    followingObjectsContainer: {
      marginTop: '15px',
      border: '1px solid #e9ecef',
      borderRadius: '4px',
      padding: '10px'
    },
    followingObject: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '10px',
      padding: '8px',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px'
    },
    objectColor: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      marginRight: '10px'
    },
    objectControls: {
      display: 'flex',
      flex: 1,
      gap: '10px'
    },
    removeButton: {
      background: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '4px 8px',
      cursor: 'pointer'
    },
    addButton: {
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px',
      cursor: 'pointer',
      width: '100%',
      marginTop: '10px'
    },
    radioGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      marginBottom: '15px'
    },
    radioOption: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer'
    },
    radioLabel: {
      marginLeft: '8px',
      fontSize: '14px',
      color: '#495057'
    },
    codeExport: {
      marginTop: '20px',
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '8px'
    },
    codeBlock: {
      background: '#343a40',
      color: '#f8f9fa',
      padding: '15px',
      borderRadius: '4px',
      overflow: 'auto',
      fontSize: '14px',
      lineHeight: 1.5,
      fontFamily: 'monospace'
    },
    copyButton: {
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      cursor: 'pointer',
      marginTop: '10px'
    },
    followingObjectsLayer: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none' as const
    }
  };

  return (
    <div style={styles.parametricDemo}>
      <div style={styles.header}>
        <h2 style={styles.title}>Parametric Curves Demo</h2>
        <button 
          style={styles.controlToggle}
          onClick={toggleControlsVisibility}
        >
          {showControls ? 'Hide Controls' : 'Show Controls'}
        </button>
      </div>
      
      <div style={{
        ...styles.controlsContainer,
        ...(showControls ? {} : styles.hidden)
      }}>
        {showControls && (
          <div style={styles.controls}>
            <div style={styles.controlGroup}>
              <h3>Select Curve</h3>
              <div style={styles.curveSelector}>
                {Object.keys(parametricEquations).map((curveKey) => (
                  <button
                    key={curveKey}
                    onClick={() => handleCurveChange(curveKey as CurveType)}
                    style={{
                      ...styles.curveButton,
                      ...(curve === curveKey ? styles.activeCurve : {})
                    }}
                  >
                    {parametricEquations[curveKey as CurveType].name}
                  </button>
                ))}
              </div>
              <p style={styles.equationDescription}>
                {currentEquation.description}
              </p>
              <button 
                onClick={toggleAnimation}
                style={{
                  ...styles.button,
                  ...(animating ? styles.activeButton : {})
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {animating ? 'Stop Animation' : 'Start Animation'}
              </button>
            </div>
            
            <div style={styles.controlGroup}>
              <h3>Parameters</h3>
              <div style={styles.paramControls}>
                {Object.keys(params).map((paramName) => {
                  let min = 0;
                  let max = 200;
                  let step = 1;
                  
                  // Specific parameter ranges
                  if (paramName === 'freqX' || paramName === 'freqY' || paramName === 'n' || paramName === 'd') {
                    min = 1;
                    max = 10;
                    step = 1;
                  } else if (paramName === 'phase') {
                    min = 0;
                    max = 2 * Math.PI;
                    step = 0.1;
                  } else if (paramName === 'growth' || paramName === 'scale') {
                    min = 0.01;
                    max = 1;
                    step = 0.01;
                  } else if (paramName === 'coils') {
                    min = 1;
                    max = 10;
                    step = 0.5;
                  }
                  
                  return (
                    <label key={paramName} style={styles.label}>
                      <span style={styles.labelText}>
                        {paramName.charAt(0).toUpperCase() + paramName.slice(1)}:
                        <span style={styles.value}>
                          {params[paramName].toFixed(2)}
                        </span>
                      </span>
                      <div style={styles.sliderContainer}>
                        <input 
                          type="range" 
                          min={min} 
                          max={max} 
                          step={step} 
                          value={params[paramName]} 
                          onChange={(e) => handleParamChange(paramName, parseFloat(e.target.value))} 
                          style={styles.inputRange}
                        />
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            
            <div style={styles.controlGroup}>
              <h3>Animation Controls</h3>
              
              <button 
                onClick={toggleContinuousAnimation}
                style={{
                  ...styles.button,
                  ...(continuousAnimation ? styles.activeButton : {})
                }}
              >
                {continuousAnimation ? 'Stop Continuous Animation' : 'Start Continuous Animation'}
              </button>
              
              <div style={{ marginTop: '15px' }}>
                <h4>Animation Settings</h4>
                
                <label style={styles.label}>
                  <span style={styles.labelText}>
                    Animation Duration:
                    <span style={styles.value}>{(animationDuration / 1000).toFixed(1)}s</span>
                  </span>
                  <div style={styles.sliderContainer}>
                    <input 
                      type="range" 
                      min="500" 
                      max="10000" 
                      step="100" 
                      value={animationDuration} 
                      onChange={(e) => handleAnimationDurationChange(parseInt(e.target.value, 10))} 
                      style={styles.inputRange}
                    />
                  </div>
                </label>
                
                <h4>Easing Function</h4>
                <div style={styles.radioGroup}>
                  {Object.keys(easingFunctions).map((easing) => (
                    <label key={easing} style={styles.radioOption}>
                      <input 
                        type="radio" 
                        name="easing" 
                        checked={easingFunction === easing} 
                        onChange={() => handleEasingChange(easing as EasingType)} 
                      />
                      <span style={styles.radioLabel}>{easing}</span>
                    </label>
                  ))}
                </div>
                
                <h4>Animation Direction</h4>
                <div style={styles.radioGroup}>
                  <label style={styles.radioOption}>
                    <input 
                      type="radio" 
                      name="direction" 
                      checked={animationDirection === 'forward'} 
                      onChange={() => handleDirectionChange('forward')} 
                    />
                    <span style={styles.radioLabel}>Forward</span>
                  </label>
                  <label style={styles.radioOption}>
                    <input 
                      type="radio" 
                      name="direction" 
                      checked={animationDirection === 'backward'} 
                      onChange={() => handleDirectionChange('backward')} 
                    />
                    <span style={styles.radioLabel}>Backward</span>
                  </label>
                  <label style={styles.radioOption}>
                    <input 
                      type="radio" 
                      name="direction" 
                      checked={animationDirection === 'alternate'} 
                      onChange={() => handleDirectionChange('alternate')} 
                    />
                    <span style={styles.radioLabel}>Alternate</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div style={styles.controlGroup}>
              <h3>Following Objects</h3>
              <button 
                onClick={toggleFollowingObjects}
                style={{
                  ...styles.button,
                  ...(showFollowingObjects ? styles.activeButton : {})
                }}
              >
                {showFollowingObjects ? 'Hide Objects' : 'Show Objects'}
              </button>
              
              {showFollowingObjects && (
                <div style={styles.followingObjectsContainer}>
                  {followingObjects.map((obj) => (
                    <div key={obj.id} style={styles.followingObject}>
                      <div 
                        style={{
                          ...styles.objectColor,
                          backgroundColor: obj.color
                        }}
                      />
                      <div style={styles.objectControls}>
                        <label style={{ flex: 1 }}>
                          <span style={{ fontSize: '12px' }}>Offset</span>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={obj.offset} 
                            onChange={(e) => handleFollowingObjectChange(obj.id, 'offset', parseFloat(e.target.value))} 
                            style={{ width: '100%' }}
                          />
                        </label>
                        <label style={{ flex: 1 }}>
                          <span style={{ fontSize: '12px' }}>Size</span>
                          <input 
                            type="range" 
                            min="2" 
                            max="20" 
                            step="1" 
                            value={obj.size} 
                            onChange={(e) => handleFollowingObjectChange(obj.id, 'size', parseInt(e.target.value, 10))} 
                            style={{ width: '100%' }}
                          />
                        </label>
                        <button 
                          onClick={() => removeFollowingObject(obj.id)}
                          style={styles.removeButton}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={addFollowingObject}
                    style={styles.addButton}
                  >
                    Add Object
                  </button>
                </div>
              )}
            </div>
            
            <div style={styles.controlGroup}>
              <h3>Visual Settings</h3>
              <label style={styles.label}>
                <span style={styles.labelText}>Stroke Color:</span>
                <input 
                  type="color" 
                  value={strokeColor} 
                  onChange={(e) => setStrokeColor(e.target.value)}
                  style={styles.colorInput}
                />
              </label>
              
              <label style={styles.label}>
                <span style={styles.labelText}>
                  Stroke Width:
                  <span style={styles.value}>{strokeWidth}px</span>
                </span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={strokeWidth} 
                    onChange={(e) => setStrokeWidth(parseInt(e.target.value, 10))} 
                    style={styles.inputRange}
                  />
                </div>
              </label>
              
              <button 
                onClick={toggleCodeExport}
                style={styles.button}
              >
                {showCodeExport ? 'Hide Code' : 'Export Code'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div style={styles.canvasContainer}>
        <ParametricCanvas
          width={width}
          height={height}
          curve={drawParametricCurve}
          tStart={currentEquation.minT}
          tEnd={currentEquation.maxT}
          pointCount={animating && !continuousAnimation ? Math.floor(currentEquation.steps * (progress/100)) : currentEquation.steps}
          lineWidth={strokeWidth}
          lineColor={strokeColor}
          style={styles.canvas}
          showPoints={animating && progress < 100 && !continuousAnimation} 
          pointColor="#ff0000"
          pointSize={6}
        />
        
        {/* Following objects layer */}
        {showFollowingObjects && continuousAnimation && (
          <svg 
            style={styles.followingObjectsLayer}
            width={width}
            height={height}
          >
            {followingObjects.map((obj) => {
              if (!obj.visible) return null;
              
              // Calculate position based on offset and current time
              const t = (timeFactor + obj.offset) % 1;
              const normalizedT = currentEquation.minT + t * (currentEquation.maxT - currentEquation.minT);
              const position = currentEquation.function(normalizedT, params as any);
              
              // Adjust position to be centered in the canvas
              const x = position.x + width / 2;
              const y = position.y + height / 2;
              
              return (
                <circle
                  key={obj.id}
                  cx={x}
                  cy={y}
                  r={obj.size}
                  fill={obj.color}
                />
              );
            })}
          </svg>
        )}
      </div>
      
      {showCodeExport && (
        <div style={styles.codeExport}>
          <h3>Generated Code</h3>
          <pre style={styles.codeBlock}>
            {generateCode()}
          </pre>
          <button 
            style={styles.copyButton}
            onClick={() => {
              navigator.clipboard.writeText(generateCode());
              alert('Code copied to clipboard!');
            }}
          >
            Copy to Clipboard
          </button>
        </div>
      )}
      
      <div style={styles.instructions}>
        <h3 style={styles.instructionsTitle}>How It Works:</h3>
        <p>This demo visualizes various parametric curves and demonstrates looping animations. Each point on the curve is calculated using a function of parameter t.</p>
        <ul>
          <li><strong>Choose a Curve:</strong> Select from different mathematical patterns like circles, spirals, and more complex forms.</li>
          <li><strong>Adjust Parameters:</strong> Change the specific values that control the shape's appearance.</li>
          <li><strong>Animation Types:</strong>
            <ul>
              <li><strong>One-time Animation:</strong> Watch the curve being drawn progressively from start to finish.</li>
              <li><strong>Continuous Animation:</strong> See objects continuously move along the curve in a looping pattern.</li>
            </ul>
          </li>
          <li><strong>Following Objects:</strong> Add multiple objects that follow the curve with different offsets for choreographed motion.</li>
          <li><strong>Easing Functions:</strong> Control how objects accelerate and decelerate along the path.</li>
          <li><strong>Export Code:</strong> Generate ready-to-use code for your own projects.</li>
        </ul>
        <p>Parametric equations are a powerful way to create complex and beautiful looping animations!</p>
      </div>
    </div>
  );
}; 