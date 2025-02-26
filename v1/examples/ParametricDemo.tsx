import React, { useState, useEffect } from 'react';
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
  
  // Add additional state for drawing progress
  const [progress, setProgress] = useState(100);
  
  // Update the useEffect to control animation progress
  useEffect(() => {
    let animationFrame: number;
    
    if (animating) {
      // Start with 0% progress and move to 100%
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
    } else {
      // When not animating, show the full curve
      setProgress(100);
      setTimeFactor(1);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [animating]);
  
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
    setAnimating(!animating);
  };
  
  const toggleControlsVisibility = () => {
    setShowControls(!showControls);
  };
  
  const currentEquation = parametricEquations[curve];
  
  // Function to render at specific time
  const drawParametricCurve = (t: number) => {
    // When animating, use the current timeFactor to adjust where we are in the curve
    // This creates a "drawing" effect for the curve
    const animatedT = animating 
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
              
              {animating && (
                <label style={styles.label}>
                  <span style={styles.labelText}>
                    Animation Progress:
                    <span style={styles.value}>{Math.round(timeFactor * 100)}%</span>
                  </span>
                  <div style={styles.sliderContainer}>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={timeFactor} 
                      onChange={(e) => setTimeFactor(parseFloat(e.target.value))} 
                      style={styles.inputRange}
                    />
                  </div>
                </label>
              )}
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
          pointCount={animating ? Math.floor(currentEquation.steps * (progress/100)) : currentEquation.steps}
          lineWidth={strokeWidth}
          lineColor={strokeColor}
          style={styles.canvas}
          showPoints={animating && progress < 100} 
          pointColor="#ff0000"
          pointSize={6}
        />
      </div>
      
      <div style={styles.instructions}>
        <h3 style={styles.instructionsTitle}>How It Works:</h3>
        <p>This demo visualizes various parametric curves. Each point on the curve is calculated using a function of parameter t.</p>
        <ul>
          <li><strong>Choose a Curve:</strong> Select from different mathematical patterns like circles, spirals, and more complex forms.</li>
          <li><strong>Adjust Parameters:</strong> Change the specific values that control the shape's appearance.</li>
          <li><strong>Animate:</strong> Watch the curve being drawn progressively from start to finish.</li>
          <li><strong>Visual Settings:</strong> Customize the color and stroke width of the curves.</li>
        </ul>
        <p>Parametric equations are a powerful way to create complex and beautiful mathematical art!</p>
      </div>
    </div>
  );
}; 