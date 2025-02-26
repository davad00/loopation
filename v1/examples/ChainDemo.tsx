import React, { useState, useEffect, useRef } from 'react';
import { ChainCanvas } from '../src';
import { Point } from '../src/core/Point';
import { Vector2D } from '../src/utils/Vector';
import { Chain } from '../src/core/Chain';

interface ChainDemoProps {
  width?: number;
  height?: number;
}

export const ChainDemo: React.FC<ChainDemoProps> = ({
  width = 800,
  height = 600
}) => {
  const [showControls, setShowControls] = useState(true);
  const [links, setLinks] = useState(20);
  const [gravity, setGravity] = useState({ x: 0, y: 0.5 });
  const [stiffness, setStiffness] = useState(0.2);
  const [linkLength, setLinkLength] = useState(15);
  const [dampening, setDampening] = useState(0.97);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [chainType, setChainType] = useState<'hanging' | 'pendulum' | 'bridge'>('hanging');
  const [showEffects, setShowEffects] = useState(true);
  
  const chainRef = useRef<Chain | null>(null);
  const draggedPointRef = useRef<number | null>(null);
  
  const toggleControlsVisibility = () => {
    setShowControls(!showControls);
  };

  const resetSimulation = () => {
    // This function will be called by the reset button
    // The ChainCanvas will automatically reset when props change
    const newLinks = links;
    setLinks(0);
    setTimeout(() => setLinks(newLinks), 50);
  };

  const handleGravityChange = (value: number) => {
    setGravity({ x: 0, y: value });
  };
  
  const handleChainTypeChange = (type: 'hanging' | 'pendulum' | 'bridge') => {
    setChainType(type);
    
    // Adjust settings based on chain type
    switch (type) {
      case 'hanging':
        setGravity({ x: 0, y: 0.5 });
        setDampening(0.97);
        break;
      case 'pendulum':
        setGravity({ x: 0, y: 0.3 });
        setDampening(0.995); // Less damping for pendulum
        break;
      case 'bridge':
        setGravity({ x: 0, y: 0.2 });
        setDampening(0.98);
        break;
    }
  };
  
  // Setup for various chain configurations
  const chainSetup = (chain: Chain) => {
    // Store reference to the chain
    chainRef.current = chain;
    
    // Clear existing points
    chain.points = [];
    chain.distanceConstraints = [];
    chain.angleConstraints = [];
    
    if (links <= 0) return;
    
    switch (chainType) {
      case 'hanging':
        setupHangingChain(chain);
        break;
      case 'pendulum':
        setupPendulumChain(chain);
        break;
      case 'bridge':
        setupBridgeChain(chain);
        break;
    }
  };
  
  const setupHangingChain = (chain: Chain) => {
    // Create the anchor point
    const anchorPoint = new Point(width / 2, 50, { fixed: true });
    const anchorIndex = chain.addPoint(anchorPoint);
    
    // Create chain links
    let prevIndex = anchorIndex;
    for (let i = 0; i < links; i++) {
      const point = new Point(
        width / 2, 
        50 + (i + 1) * linkLength
      );
      const pointIndex = chain.addPoint(point);
      
      // Add distance constraint between points
      chain.addDistanceConstraint(prevIndex, pointIndex, linkLength);
      
      // Add angle constraints for more stability
      if (i > 0) {
        // Allow angles between PI/4 and 3*PI/4 for natural hanging motion
        chain.addAngleConstraint(
          i - 1 + anchorIndex, 
          i + anchorIndex, 
          i + 1 + anchorIndex,
          Math.PI / 4,    // minAngle - allow some bending but not too much
          3 * Math.PI / 4 // maxAngle - prevent bending backward too much
        );
      }
      
      prevIndex = pointIndex;
    }
  };
  
  const setupPendulumChain = (chain: Chain) => {
    // Create the anchor point
    const anchorPoint = new Point(width / 2, 50, { fixed: true });
    const anchorIndex = chain.addPoint(anchorPoint);
    
    // Create chain links
    let prevIndex = anchorIndex;
    for (let i = 0; i < links; i++) {
      // For pendulum, add some initial offset to create motion
      const offset = i === 0 ? 50 : 0; // First link has offset to start pendulum
      const point = new Point(
        width / 2 + offset, 
        50 + (i + 1) * linkLength
      );
      const pointIndex = chain.addPoint(point);
      
      // Add distance constraint between points
      chain.addDistanceConstraint(prevIndex, pointIndex, linkLength);
      
      prevIndex = pointIndex;
    }
    
    // Add weight to the end
    const lastPoint = chain.points[chain.points.length - 1];
    lastPoint.mass = 2; // More mass at the end creates better pendulum movement
  };
  
  const setupBridgeChain = (chain: Chain) => {
    // Create fixed endpoints for the bridge
    const leftAnchor = new Point(width / 4, height / 3, { fixed: true });
    const leftIndex = chain.addPoint(leftAnchor);
    
    const rightAnchor = new Point(3 * width / 4, height / 3, { fixed: true });
    const rightIndex = chain.addPoint(rightAnchor);
    
    // Calculate link spacing
    const bridgeWidth = rightAnchor.position.x - leftAnchor.position.x;
    const segmentLength = bridgeWidth / (links + 1);
    
    // Create bridge segments
    const bridgePoints = [];
    for (let i = 1; i <= links; i++) {
      // Add a slight arc to the initial bridge position
      const arcHeight = Math.sin((i / (links + 1)) * Math.PI) * 20;
      
      const point = new Point(
        leftAnchor.position.x + i * segmentLength,
        leftAnchor.position.y + arcHeight
      );
      const pointIndex = chain.addPoint(point);
      bridgePoints.push(pointIndex);
    }
    
    // Connect all points with distance constraints
    chain.addDistanceConstraint(leftIndex, bridgePoints[0], segmentLength);
    
    for (let i = 0; i < bridgePoints.length - 1; i++) {
      chain.addDistanceConstraint(
        bridgePoints[i],
        bridgePoints[i + 1],
        segmentLength
      );
    }
    
    chain.addDistanceConstraint(
      bridgePoints[bridgePoints.length - 1],
      rightIndex,
      segmentLength
    );
    
    // Add angle constraints for stability
    for (let i = 0; i < bridgePoints.length - 1; i++) {
      const pointA = i === 0 ? leftIndex : bridgePoints[i - 1];
      const pointB = bridgePoints[i];
      const pointC = bridgePoints[i + 1];
      
      chain.addAngleConstraint(
        pointA, 
        pointB, 
        pointC,
        Math.PI / 2,     // minAngle - prevent too much sagging
        3 * Math.PI / 2  // maxAngle - prevent points from flipping upward
      );
    }
    
    // Final angle constraint
    const lastIdx = bridgePoints.length - 1;
    chain.addAngleConstraint(
      bridgePoints[lastIdx - 1],
      bridgePoints[lastIdx],
      rightIndex,
      Math.PI / 2,     // minAngle
      3 * Math.PI / 2  // maxAngle
    );
  };
  
  // Mouse interaction handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chainRef.current || chainRef.current.points.length === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Find closest point within a certain radius
    const points = chainRef.current.points;
    const INTERACTION_RADIUS = 20; // pixels
    let closestIdx = -1;
    let closestDist = INTERACTION_RADIUS;
    
    for (let i = 0; i < points.length; i++) {
      // Skip fixed points
      if (points[i].fixed) continue;
      
      const dx = points[i].position.x - mouseX;
      const dy = points[i].position.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }
    
    // If found a point, start dragging it
    if (closestIdx !== -1) {
      draggedPointRef.current = closestIdx;
      
      // Optionally, make the point fixed while dragging
      // points[closestIdx].fixed = true;
    }
  };
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedPointRef.current === null || !chainRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Update the position of the dragged point
    const point = chainRef.current.points[draggedPointRef.current];
    point.position.x = mouseX;
    point.position.y = mouseY;
    
    // Prevent velocity from accumulating during drag
    point.velocity.x = 0;
    point.velocity.y = 0;
  };
  
  const handleCanvasMouseUp = () => {
    if (draggedPointRef.current !== null && chainRef.current) {
      // Release point
      // chainRef.current.points[draggedPointRef.current].fixed = false;
      draggedPointRef.current = null;
    }
  };

  const styles = {
    chainDemo: {
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
    chainTypeSelector: {
      display: 'flex',
      gap: '8px',
      marginBottom: '15px'
    },
    chainTypeButton: {
      flex: 1,
      padding: '8px 0',
      background: '#e9ecef',
      color: '#495057',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 500 as const,
      transition: 'all 0.2s ease'
    },
    activeChainType: {
      background: 'linear-gradient(135deg, #007bff, #0069d9)',
      color: 'white',
      boxShadow: '0 2px 4px rgba(0, 123, 255, 0.3)'
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
      marginTop: '10px',
      width: '100%',
      transition: 'transform 0.1s, box-shadow 0.2s',
      boxShadow: '0 2px 4px rgba(0, 123, 255, 0.2)'
    },
    toggleButton: {
      padding: '8px 16px',
      background: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background 0.2s ease',
      marginTop: '10px'
    },
    activeButton: {
      background: 'linear-gradient(135deg, #28a745, #218838)',
    },
    canvasContainer: {
      position: 'relative' as const,
      borderRadius: '8px',
      overflow: 'hidden',
      cursor: 'grab'
    },
    canvasContainerDragging: {
      cursor: 'grabbing'
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
    <div style={styles.chainDemo}>
      <div style={styles.header}>
        <h2 style={styles.title}>Chain Physics Demo</h2>
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
              <h3>Chain Type</h3>
              <div style={styles.chainTypeSelector}>
                <button 
                  style={{
                    ...styles.chainTypeButton,
                    ...(chainType === 'hanging' ? styles.activeChainType : {})
                  }}
                  onClick={() => handleChainTypeChange('hanging')}
                >
                  Hanging
                </button>
                <button 
                  style={{
                    ...styles.chainTypeButton,
                    ...(chainType === 'pendulum' ? styles.activeChainType : {})
                  }}
                  onClick={() => handleChainTypeChange('pendulum')}
                >
                  Pendulum
                </button>
                <button 
                  style={{
                    ...styles.chainTypeButton,
                    ...(chainType === 'bridge' ? styles.activeChainType : {})
                  }}
                  onClick={() => handleChainTypeChange('bridge')}
                >
                  Bridge
                </button>
              </div>
            
              <label style={styles.label}>
                <span style={styles.labelText}>Chain Links:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="5" 
                    max="50" 
                    value={links} 
                    onChange={(e) => setLinks(parseInt(e.target.value, 10))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{links}</span>
                </div>
              </label>
              
              <label style={styles.label}>
                <span style={styles.labelText}>Link Length:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="5" 
                    max="30" 
                    value={linkLength} 
                    onChange={(e) => setLinkLength(parseInt(e.target.value, 10))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{linkLength}</span>
                </div>
              </label>
              
              <button 
                onClick={() => setShowEffects(!showEffects)}
                style={{
                  ...styles.toggleButton,
                  ...(showEffects ? styles.activeButton : {})
                }}
              >
                Visual Effects: {showEffects ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div style={styles.controlGroup}>
              <label style={styles.label}>
                <span style={styles.labelText}>Gravity:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="0" 
                    max="2" 
                    step="0.1" 
                    value={gravity.y} 
                    onChange={(e) => handleGravityChange(parseFloat(e.target.value))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{gravity.y}</span>
                </div>
              </label>
              
              <label style={styles.label}>
                <span style={styles.labelText}>Stiffness:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={stiffness} 
                    onChange={(e) => setStiffness(parseFloat(e.target.value))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{stiffness}</span>
                </div>
              </label>
              
              <label style={styles.label}>
                <span style={styles.labelText}>Dampening:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="0.8" 
                    max="0.999" 
                    step="0.001" 
                    value={dampening} 
                    onChange={(e) => setDampening(parseFloat(e.target.value))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{dampening.toFixed(3)}</span>
                </div>
              </label>
            </div>
            
            <div style={styles.controlGroup}>
              <label style={styles.label}>
                <span style={styles.labelText}>Simulation Speed:</span>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="3" 
                    step="0.1" 
                    value={simulationSpeed} 
                    onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))} 
                    style={styles.inputRange}
                  />
                  <span style={styles.value}>{simulationSpeed}x</span>
                </div>
              </label>
              
              <button 
                onClick={resetSimulation}
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
                Reset Simulation
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div 
        style={{
          ...styles.canvasContainer,
          ...(draggedPointRef.current !== null ? styles.canvasContainerDragging : {})
        }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        <ChainCanvas
          width={width}
          height={height}
          gravity={gravity}
          autoStart={true}
          style={styles.canvas}
          chainSetup={chainSetup}
        />
      </div>
      
      <div style={styles.instructions}>
        <h3 style={styles.instructionsTitle}>How It Works:</h3>
        <p>This demo showcases a physics-based chain simulation with different configurations and adjustable properties.</p>
        
        <h4>Chain Types:</h4>
        <ul>
          <li><strong>Hanging:</strong> A single chain suspended from a fixed point at the top.</li>
          <li><strong>Pendulum:</strong> Similar to hanging, but with more mass at the end for pendulum-like motion.</li>
          <li><strong>Bridge:</strong> A chain fixed at both ends to create a bridge-like structure.</li>
        </ul>
        
        <h4>Interactive Controls:</h4>
        <ul>
          <li><strong>Chain Links:</strong> Controls the number of segments in the chain.</li>
          <li><strong>Link Length:</strong> Adjusts the distance between each link.</li>
          <li><strong>Gravity:</strong> Changes the gravitational force applied to the chain.</li>
          <li><strong>Stiffness:</strong> Controls how rigid the chain is (higher values make it less stretchy).</li>
          <li><strong>Dampening:</strong> Affects how quickly the chain's motion decays (higher values create more bouncy, pendulum-like motion).</li>
          <li><strong>Simulation Speed:</strong> Adjusts how fast the simulation runs.</li>
          <li><strong>Visual Effects:</strong> Toggles shadows and other visual enhancements.</li>
        </ul>
        
        <h4>Interaction:</h4>
        <p>Click and drag any part of the chain to interact with it. Try different configurations to see how the physics change!</p>
      </div>
    </div>
  );
}; 