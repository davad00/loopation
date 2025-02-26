import React, { useState, useRef, useEffect } from 'react';
import { FabricCanvas, Point, Vector2D } from '../src';

interface FabricDemoProps {
  width?: number;
  height?: number;
}

// Define an extended Point type to handle additional properties
interface EnhancedPoint extends Point {
  color?: string;
  radius?: number;
  isLegTip?: boolean;
}

export const FabricDemo: React.FC<FabricDemoProps> = ({
  width = 800,
  height = 600
}) => {
  const [iterations, setIterations] = useState(20);
  const [segments, setSegments] = useState(7);
  const [legCount, setLegCount] = useState(6);
  const [segmentLength, setSegmentLength] = useState(25);
  const [bodySize, setBodySize] = useState(15);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showDebug, setShowDebug] = useState(false);
  const [theme, setTheme] = useState('spider');
  
  const targetRef = useRef<EnhancedPoint | null>(null);
  const fabricRef = useRef<any>(null);
  const legTipsRef = useRef<EnhancedPoint[]>([]);
  
  const [autoFollow, setAutoFollow] = useState(true);
  const [autoAnimate, setAutoAnimate] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: width / 2, y: height / 2 });
  const [showControls, setShowControls] = useState(true);
  const [showCodeExport, setShowCodeExport] = useState(false);
  
  // For automated movement
  useEffect(() => {
    let animationFrame: number;
    let time = 0;
    
    const animate = () => {
      if (autoAnimate && !autoFollow && targetRef.current) {
        // Create a complex movement pattern for the target
        time += 0.01 * animationSpeed;
        const radius = Math.min(width, height) * 0.35;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Figure-8 pattern
        const x = centerX + Math.sin(time) * Math.cos(time * 0.3) * radius;
        const y = centerY + Math.cos(time) * radius * 0.5;
        
        targetRef.current.position.x = x;
        targetRef.current.position.y = y;
      }
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [autoAnimate, autoFollow, width, height, animationSpeed]);
  
  // Initialize the fabric with the legs
  const handleFabricInit = (params: any) => {
    const { fabric, createLeg } = params;
    fabricRef.current = fabric;
    
    // Clear any existing points
    fabric.points = [];
    fabric.joints = [];
    legTipsRef.current = [];
    
    // Create a central body
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create a more complex body with multiple segments for realism
    createCreatureBody(fabric, centerX, centerY);
    
    // Create legs
    const angleStep = 360 / legCount;
    for (let i = 0; i < legCount; i++) {
      createLegSegments(fabric, centerX, centerY, i * angleStep, segments);
    }
    
    // Create a target point for IK
    const targetPoint = new Point(centerX + 100, centerY + 100) as EnhancedPoint;
    targetPoint.color = theme === 'spider' ? '#ff5252' : '#60d394'; 
    targetPoint.radius = 8;        
    fabric.addPoint(targetPoint);
    targetRef.current = targetPoint;
  };
  
  // Create a more elaborate body
  const createCreatureBody = (fabric: any, centerX: number, centerY: number) => {
    // Main body
    const bodyPoint = new Point(centerX, centerY, { fixed: true }) as EnhancedPoint;
    bodyPoint.color = theme === 'spider' ? '#4a6fa5' : '#5b8c85';
    bodyPoint.radius = bodySize;
    const bodyIndex = fabric.addPoint(bodyPoint);
    
    // Create additional body segments for more realistic appearance
    const bodySegments = 3;
    const segmentSpacing = bodySize * 0.8;
    
    let lastBodyPoint = bodyPoint;
    
    for (let i = 0; i < bodySegments; i++) {
      // Create body segment slightly behind the main body
      const segmentPoint = new Point(
        centerX, 
        centerY - ((i + 1) * segmentSpacing),
        { fixed: i === 0 }
      ) as EnhancedPoint;
      
      // Gradient color from body color to slightly darker
      segmentPoint.color = theme === 'spider' 
        ? `rgba(${74 - i*10}, ${111 - i*10}, ${165 - i*10}, 1)` 
        : `rgba(${91 - i*10}, ${140 - i*10}, ${133 - i*10}, 1)`;
      segmentPoint.radius = bodySize * (1 - (i * 0.15));
      fabric.addPoint(segmentPoint);
      
      // Connect with previous segment
      fabric.connectPoints(lastBodyPoint, segmentPoint, segmentSpacing);
      
      // Note: We can't use angle constraints in Fabric as it doesn't have that method
      // Body alignment will still look ok with just distance constraints
      
      lastBodyPoint = segmentPoint;
    }
  };
  
  // Create segments forming a leg
  const createLegSegments = (fabric: any, centerX: number, centerY: number, angle: number, numSegments: number) => {
    // Start leg from the body's location
    let lastPoint = fabric.points[0];
    const segmentPoints: EnhancedPoint[] = [lastPoint];
    
    // First segment starts at an angle from the body
    const radians = (angle * Math.PI) / 180;
    const legBaseX = centerX + Math.cos(radians) * bodySize * 1.2;
    const legBaseY = centerY + Math.sin(radians) * bodySize * 1.2;
    
    // Create leg base that's fixed relative to the body
    const legBase = new Point(legBaseX, legBaseY) as EnhancedPoint;
    legBase.color = theme === 'spider' ? '#395b8c' : '#4b7d74';
    legBase.radius = 6;
    const legBaseIndex = fabric.addPoint(legBase);
    fabric.connectPoints(lastPoint, legBase, bodySize * 1.2);
    
    lastPoint = legBase;
    segmentPoints.push(lastPoint);
    
    // Initial leg direction - sloping downward for realistic arthropod stance
    let segmentAngle = angle;
    if (angle < 180) {
      segmentAngle += 30; // Front legs go forward more
    } else {
      segmentAngle -= 30; // Back legs go backward more
    }
    
    let cumulativeLength = 0;
    
    for (let i = 0; i < numSegments; i++) {
      const segmentRad = (segmentAngle * Math.PI) / 180;
      
      // Determine segment length - longer in middle for realistic leg shape
      let currentSegmentLength = segmentLength;
      if (i < numSegments / 3) {
        currentSegmentLength *= 1.2; // Longer segments near body
      } else if (i > numSegments * 2 / 3) {
        currentSegmentLength *= 0.8; // Shorter segments near tip
      }
      
      cumulativeLength += currentSegmentLength;
      
      // Position based on angle and current segment length
      const x = lastPoint.position.x + Math.cos(segmentRad) * currentSegmentLength;
      const y = lastPoint.position.y + Math.sin(segmentRad) * currentSegmentLength;
      
      const newPoint = new Point(x, y) as EnhancedPoint;
      
      // Thematic coloring
      if (theme === 'spider') {
        // Gradient color from blue to green for spider
        const blueComponent = Math.max(0, 140 - (i * 15));
        const greenComponent = Math.min(170, 50 + (i * 15));
        newPoint.color = `rgb(50, ${greenComponent}, ${blueComponent})`;
      } else {
        // Gradient color for alien/insect theme
        const greenVal = Math.min(255, 109 + (i * 10));
        const blueVal = Math.max(0, 130 - (i * 15));
        newPoint.color = `rgb(75, ${greenVal}, ${blueVal})`;
      }
      
      // Legs get thinner toward the tip
      newPoint.radius = Math.max(2, 5 - (i * 0.4));
      
      // Mark the last segment as a leg tip
      if (i === numSegments - 1) {
        newPoint.isLegTip = true;
        legTipsRef.current.push(newPoint);
      }
      
      fabric.addPoint(newPoint);
      
      // Add a joint constraint between the points
      fabric.connectPoints(lastPoint, newPoint, currentSegmentLength);
      
      // Add angle constraints for natural leg bending
      // The further along the leg, the more we restrict bending
      if (i > 0) {
        // Note: We can't use angle constraints in Fabric as it doesn't have that method
        // Instead, we'll add additional distance constraints between non-adjacent points
        // to simulate some resistance to bending
        
        if (i > 1) {
          // Connect to point before previous to add some triangulation
          const pointA = segmentPoints[segmentPoints.length - 2];
          fabric.connectPoints(pointA, newPoint, currentSegmentLength * 1.8);
        }
      }
      
      lastPoint = newPoint;
      segmentPoints.push(lastPoint);
      
      // After creating a few segments, change the angle to create a more natural-looking joint
      if (i === 2) {
        // This emulates the knee joint - front legs bend backward, back legs bend forward
        if (angle < 180) {
          segmentAngle += 40;
        } else {
          segmentAngle -= 40;
        }
      }
    }
    
    // Connect the last point to the target with IK
    if (targetRef.current) {
      // IK constraint with a relaxed distance
      fabric.connectPoints(lastPoint, targetRef.current, 0);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
    
    if (autoFollow && targetRef.current) {
      targetRef.current.position.x = x;
      targetRef.current.position.y = y;
      
      // Disable auto-animation when user is interacting
      setAutoAnimate(false);
    }
  };
  
  const handleToggleAutoFollow = () => {
    const newValue = !autoFollow;
    setAutoFollow(newValue);
    
    // If turning off auto-follow, enable auto-animation
    if (!newValue) {
      setAutoAnimate(true);
    }
  };
  
  const handleToggleAutoAnimate = () => {
    setAutoAnimate(!autoAnimate);
  };
  
  const handleMoveTarget = () => {
    if (targetRef.current) {
      targetRef.current.position.x = mousePosition.x;
      targetRef.current.position.y = mousePosition.y;
      setAutoAnimate(false);
    }
  };
  
  const toggleControlsVisibility = () => {
    setShowControls(!showControls);
  };
  
  const toggleCodeExport = () => {
    setShowCodeExport(!showCodeExport);
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'spider' ? 'alien' : 'spider');
  };

  const resetCreature = () => {
    if (fabricRef.current) {
      // Recreating the creature will reset it
      handleFabricInit({ fabric: fabricRef.current });
    }
  };

  const generateCode = () => {
    return `import React, { useRef } from 'react';
import { FabricCanvas } from 'loopation';

const InverseKinematicsExample = () => {
  const targetRef = useRef(null);

  const handleInit = ({ fabric, createLeg }) => {
    // Create a ${theme} creature with ${legCount} legs
    
    // Create a central body
    const centerX = 400;
    const centerY = 300;
    
    // Create a body point
    const bodyPoint = new Point(centerX, centerY, { fixed: true });
    bodyPoint.bodySize = ${bodySize};
    fabric.addPoint(bodyPoint);
    
    // Create legs
    const angleStep = 360 / ${legCount};
    for (let i = 0; i < ${legCount}; i++) {
      // Create leg segments
      const angle = i * angleStep;
      const segments = [];
      for (let j = 0; j < ${segments}; j++) {
        segments.push(${segmentLength});
      }
      
      // Create the leg and get its target
      const target = createLeg(centerX, centerY, segments, true);
      
      // Position the target in a circle around the body
      const radians = (angle * Math.PI) / 180;
      const targetX = centerX + Math.cos(radians) * 150;
      const targetY = centerY + Math.sin(radians) * 150;
      target.move(targetX, targetY);
    }
  };

  // Optional: Add mouse interaction
  const handleMouseMove = (e) => {
    if (targetRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetRef.current.move(x, y);
    }
  };

  return (
    <div>
      <FabricCanvas
        width={800}
        height={600}
        onInit={handleInit}
        iterations={${iterations}}
      />
    </div>
  );
};

export default InverseKinematicsExample;`;
  };

  const styles = {
    fabricDemo: {
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
    label: {
      display: 'flex',
      flexDirection: 'column' as const,
      marginBottom: '10px'
    },
    labelText: {
      fontWeight: 500,
      marginBottom: '5px',
      color: '#495057'
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
      transition: 'transform 0.1s, box-shadow 0.2s',
      boxShadow: '0 2px 4px rgba(0, 123, 255, 0.2)',
      marginBottom: '10px',
      width: '100%'
    },
    activeButton: {
      background: 'linear-gradient(135deg, #28a745, #218838)'
    },
    themeButton: {
      background: theme === 'spider' ? 'linear-gradient(135deg, #343a40, #212529)' : 'linear-gradient(135deg, #20c997, #0ca678)'
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 123, 255, 0.3)'
    },
    canvasContainer: {
      position: 'relative' as const,
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: theme === 'spider' ? '#f8f9fa' : '#f0f7f4'
    },
    canvas: {
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      background: theme === 'spider' 
        ? 'linear-gradient(145deg, #f8f9fa, #ffffff)'
        : 'linear-gradient(145deg, #e6f7f2, #f0f7f4)'
    },
    mouseIndicator: {
      position: 'absolute' as const,
      width: '16px',
      height: '16px',
      backgroundColor: theme === 'spider' ? 'rgba(255, 82, 82, 0.7)' : 'rgba(96, 211, 148, 0.7)',
      border: '2px solid rgba(255, 255, 255, 0.7)',
      borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none' as const,
      boxShadow: theme === 'spider' 
        ? '0 0 10px rgba(255, 82, 82, 0.5)'
        : '0 0 10px rgba(96, 211, 148, 0.5)'
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
    buttonRow: {
      display: 'flex',
      gap: '10px'
    },
    followingObjectsLayer: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none'
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
    }
  };
  
  return (
    <div style={styles.fabricDemo}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          {theme === 'spider' ? 'Spider Creature IK Demo' : 'Alien Creature IK Demo'}
        </h2>
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
              <label style={styles.label}>
                <span style={styles.labelText}>Solver Iterations:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={iterations} 
                    onChange={(e) => setIterations(parseInt(e.target.value, 10))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{iterations}</span>
                </div>
              </label>
              
              <label style={styles.label}>
                <span style={styles.labelText}>Leg Segments:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="3" 
                    max="12" 
                    value={segments} 
                    onChange={(e) => setSegments(parseInt(e.target.value, 10))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{segments}</span>
                </div>
              </label>
            </div>
            
            <div style={styles.controlGroup}>
              <label style={styles.label}>
                <span style={styles.labelText}>Number of Legs:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="2" 
                    max="8" 
                    value={legCount} 
                    onChange={(e) => setLegCount(parseInt(e.target.value, 10))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{legCount}</span>
                </div>
              </label>
              
              <label style={styles.label}>
                <span style={styles.labelText}>Segment Length:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="15" 
                    max="40" 
                    value={segmentLength} 
                    onChange={(e) => setSegmentLength(parseInt(e.target.value, 10))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{segmentLength}</span>
                </div>
              </label>
            </div>
            
            <div style={styles.controlGroup}>
              <label style={styles.label}>
                <span style={styles.labelText}>Body Size:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="5" 
                    max="25" 
                    value={bodySize} 
                    onChange={(e) => setBodySize(parseInt(e.target.value, 10))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{bodySize}</span>
                </div>
              </label>
              
              <label style={styles.label}>
                <span style={styles.labelText}>Animation Speed:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="3" 
                    step="0.1" 
                    value={animationSpeed} 
                    onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{animationSpeed}x</span>
                </div>
              </label>
              
              <button 
                onClick={toggleTheme} 
                style={{
                  ...styles.button,
                  ...styles.themeButton
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
                Switch to {theme === 'spider' ? 'Alien' : 'Spider'} Theme
              </button>
              
              <button 
                onClick={resetCreature}
                style={styles.button}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                Reset Creature
              </button>
              
              <button 
                onClick={toggleCodeExport}
                style={styles.button}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {showCodeExport ? 'Hide Code' : 'Export Code'}
              </button>
              
              <div style={styles.buttonRow}>
                <button 
                  onClick={handleToggleAutoFollow} 
                  style={{
                    ...styles.button,
                    ...(autoFollow ? styles.activeButton : {}),
                    width: '48%'
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
                  {autoFollow ? 'Follow: ON' : 'Follow: OFF'}
                </button>
                
                <button 
                  onClick={handleToggleAutoAnimate} 
                  style={{
                    ...styles.button,
                    ...(autoAnimate && !autoFollow ? styles.activeButton : {}),
                    width: '48%'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                  disabled={autoFollow}
                >
                  {!autoFollow && autoAnimate ? 'Animation: ON' : 'Animation: OFF'}
                </button>
              </div>
              
              {!autoFollow && !autoAnimate && (
                <button 
                  onClick={handleMoveTarget}
                  style={styles.button}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 123, 255, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = '';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  Move Target to Cursor
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div 
        style={styles.canvasContainer}
        onMouseMove={handleMouseMove}
      >
        <FabricCanvas
          width={width}
          height={height}
          iterations={iterations}
          onInit={handleFabricInit}
          fps={60}
          autoStart={true}
          style={styles.canvas}
        />
        
        {!autoFollow && !autoAnimate && (
          <div 
            style={{
              ...styles.mouseIndicator,
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`
            }}
          />
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
        <p>This demo showcases inverse kinematics using a constraint-based system. The {theme === 'spider' ? 'spider' : 'alien'}-like creature's legs automatically adjust to reach the target point.</p>
        <ul>
          <li><strong>Iterations:</strong> Higher values result in more accurate leg positioning (20-30 is recommended).</li>
          <li><strong>Leg Segments:</strong> Adjust the number of joints in each leg for more natural movement.</li>
          <li><strong>Number of Legs:</strong> Change how many legs the creature has (6-8 for spider, 4-6 for alien).</li>
          <li><strong>Follow Mode:</strong> When enabled, legs will automatically try to reach your cursor position.</li>
          <li><strong>Animation Mode:</strong> When enabled (and Follow is off), the creature will follow a predefined movement pattern.</li>
          <li><strong>Try it!</strong> Move your cursor around the canvas to see the legs respond in real-time.</li>
        </ul>
        <p>The creature uses both joint constraints and angle constraints to create natural-looking movement.</p>
      </div>
    </div>
  );
}; 