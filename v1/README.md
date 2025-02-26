# Loopation

A React procedural animation library providing:
- Distance and angle constraints for dynamic chain simulations
- Inverse kinematics (Fabric) for simulating legs and arms
- Parametric equation tools for drawing complex shapes

## Installation

```bash
npm install loopation
# or
yarn add loopation
```

If you encounter any installation issues, please see the [Troubleshooting Guide](./TROUBLESHOOTING.md).

## Features

### Distance Constraints
Create chains of points connected by distance constraints to simulate ropes, cloth, and other physics-based animations.

### Angle Constraints
Prevent over-bending and control the movement of jointed structures.

### Inverse Kinematics (Fabric)
Simulate legs and arms with target-based inverse kinematics.

### Parametric Equations
Draw complex shapes and position features with parametric equations.

## Running the Examples

To see all the interactive examples and demos:

```bash
# Install dependencies
npm run fix-deps

# Build the library
npm run build

# Run the examples
npm run examples:dev
```

This will start a development server and open the examples in your browser.

## Usage Examples

### Simple Chain

```jsx
import React from 'react';
import { ChainCanvas } from 'loopation';

const ChainExample = () => {
  const setupChain = (chain) => {
    // Create a chain with 10 segments, 20px each
    chain.createChain(100, 50, 10, 20, 5);
  };

  return (
    <ChainCanvas
      width={600}
      height={400}
      chainSetup={setupChain}
      gravity={{ x: 0, y: 9.8 }}
    />
  );
};

export default ChainExample;
```

### Inverse Kinematics (Leg Simulation)

```jsx
import React, { useRef, useEffect } from 'react';
import { FabricCanvas } from 'loopation';

const LegExample = () => {
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
    <div onMouseMove={handleMouseMove}>
      <FabricCanvas
        width={600}
        height={400}
        onInit={handleInit}
        iterations={10}
      />
    </div>
  );
};

export default LegExample;
```

### Parametric Curves

```jsx
import React from 'react';
import { ParametricCanvas, Equations } from 'loopation';

const CurvesExample = () => {
  // Create a spiral parametric curve
  const spiral = Equations.spiral(300, 200, 10, 1);

  return (
    <ParametricCanvas
      width={600}
      height={400}
      curve={spiral}
      pointCount={200}
      tStart={0}
      tEnd={10}
      showPoints={true}
      lineColor="#3498db"
      pointColor="#e74c3c"
    />
  );
};

export default CurvesExample;
```

## API Documentation

### Core Classes

#### `Point`
Represents a physics point with position, velocity, and mass.

#### `Chain`
Manages a collection of points with distance and angle constraints.

#### `Fabric`
Implements inverse kinematics for leg or arm simulations.

### React Components

#### `ChainCanvas`
A React component for rendering and interacting with a chain simulation.

#### `FabricCanvas`
A React component for rendering and interacting with inverse kinematics.

#### `ParametricCanvas` 
A React component for rendering parametric curves.

### React Hooks

#### `useChain`
Hook for using chain physics within custom React components.

#### `useFabric`
Hook for using inverse kinematics within custom React components.

#### `useAnimationFrame`
Utility hook for handling animation frames with configurable FPS.

## Troubleshooting

If you encounter any issues with installation, building, or running the examples, please refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md).

## License

MIT 