# Loopation Installation and Integration Guide

This guide will help you install and integrate the Loopation library into your React project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Basic Setup](#basic-setup)
4. [Integration with React Projects](#integration-with-react-projects)
5. [Troubleshooting](#troubleshooting)
6. [Next Steps](#next-steps)

## Prerequisites

Before installing Loopation, ensure you have the following:

- Node.js (version 12 or higher)
- npm (version 6 or higher) or yarn
- A React project (version 16.8 or higher)

Loopation is designed to work with React's hooks API, so React 16.8+ is required.

## Installation

### Using npm

```bash
npm install loopation
```

### Using yarn

```bash
yarn add loopation
```

### Peer Dependencies

Loopation has the following peer dependencies:

- react (>=16.8.0)
- react-dom (>=16.8.0)

These should already be installed in your React project.

## Basic Setup

After installation, you can import the components and utilities you need from the library:

```jsx
// Import specific components
import { ChainCanvas, FabricCanvas, ParametricCanvas } from 'loopation';

// Import utility classes
import { Equations, Vector2D } from 'loopation';

// Import hooks for custom integration
import { useChain, useFabric, useAnimationFrame } from 'loopation';
```

## Integration with React Projects

### Adding a Simple Parametric Curve

Here's how to add a simple parametric curve to your React component:

```jsx
import React from 'react';
import { ParametricCanvas, Equations } from 'loopation';

const MyComponent = () => {
  // Create a circle with center at (0,0) and radius 100
  const circle = Equations.circle(0, 0, 100);
  
  return (
    <div>
      <h2>My First Parametric Curve</h2>
      <ParametricCanvas
        width={400}
        height={400}
        curve={(t) => circle.getPointAt(t)}
        pointCount={100}
        lineColor="#3498db"
      />
    </div>
  );
};

export default MyComponent;
```

### Creating a Chain Physics Simulation

```jsx
import React from 'react';
import { ChainCanvas } from 'loopation';

const ChainSimulation = () => {
  const setupChain = (chain) => {
    // Create a chain with 10 segments, 20px each
    chain.createChain(100, 50, 10, 20, 5);
  };

  return (
    <div>
      <h2>Chain Physics Simulation</h2>
      <ChainCanvas
        width={600}
        height={400}
        chainSetup={setupChain}
        gravity={{ x: 0, y: 9.8 }}
      />
    </div>
  );
};

export default ChainSimulation;
```

### Creating an Inverse Kinematics Demo

```jsx
import React, { useRef } from 'react';
import { FabricCanvas } from 'loopation';

const IKDemo = () => {
  const targetRef = useRef(null);

  const handleInit = ({ fabric, createLeg }) => {
    // Create a leg with 3 segments
    const target = createLeg(100, 100, [30, 40, 20], true);
    targetRef.current = target;
  };

  const handleMouseMove = (e) => {
    if (targetRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Move the target to follow the mouse
      targetRef.current.move(x, y);
    }
  };

  return (
    <div>
      <h2>Inverse Kinematics Demo</h2>
      <div onMouseMove={handleMouseMove}>
        <FabricCanvas
          width={600}
          height={400}
          onInit={handleInit}
          iterations={10}
        />
      </div>
    </div>
  );
};

export default IKDemo;
```

### Using Hooks for Custom Integration

For more control, you can use the provided hooks directly:

```jsx
import React, { useRef, useEffect } from 'react';
import { useChain, Vector2D } from 'loopation';

const CustomChainComponent = () => {
  const canvasRef = useRef(null);
  const { chain, isInitialized, renderToCanvas } = useChain({
    gravity: { x: 0, y: 9.8 },
    iterations: 5
  });
  
  useEffect(() => {
    if (isInitialized && chain) {
      // Set up your chain
      chain.createChain(100, 50, 10, 20, 5);
    }
  }, [isInitialized, chain]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId;
    
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
    <canvas 
      ref={canvasRef}
      width={600}
      height={400}
      style={{ border: '1px solid #ccc' }}
    />
  );
};
```

## Integration with Build Systems

### Webpack

Loopation works out of the box with Webpack. No special configuration is needed.

### Create React App

Loopation is fully compatible with Create React App. Simply install and import as shown above.

### Next.js

For Next.js projects, you may need to use dynamic imports with SSR disabled for components that rely on browser APIs:

```jsx
import dynamic from 'next/dynamic';

const ParametricCanvas = dynamic(
  () => import('loopation').then((mod) => mod.ParametricCanvas),
  { ssr: false }
);

const MyComponent = () => {
  return (
    <div>
      <h2>Parametric Curve in Next.js</h2>
      <ParametricCanvas
        width={400}
        height={400}
        curve={(t) => ({ x: Math.cos(t * 2 * Math.PI) * 100, y: Math.sin(t * 2 * Math.PI) * 100 })}
        pointCount={100}
      />
    </div>
  );
};
```

## Troubleshooting

### Common Issues

#### "React hooks can only be called inside the body of a function component"

Make sure you're using the hooks (useChain, useFabric, useAnimationFrame) only within React functional components, not in class components or outside component functions.

#### Canvas not rendering

Check that your canvas has proper dimensions and that you're correctly passing the context to the rendering functions.

#### Performance issues

If you're experiencing performance issues:

1. Reduce the number of points in parametric curves
2. Decrease the number of physics iterations
3. Use `React.memo` to prevent unnecessary re-renders
4. Consider using the canvas directly for complex scenes

### TypeScript Support

Loopation includes TypeScript definitions. If you're having issues with TypeScript:

1. Make sure you're using a compatible version of TypeScript (4.0+)
2. Check that your tsconfig.json includes the necessary lib options:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"]
  }
}
```

## Next Steps

Now that you've installed and integrated Loopation, check out these resources to learn more:

- [Parametric Equations Guide](./ParametricEquations.md)
- [Chain Physics Guide](./ChainPhysics.md)
- [Inverse Kinematics Guide](./InverseKinematics.md)
- [API Reference](./API.md)

You can also explore the examples included with the library to see more advanced usage patterns. 