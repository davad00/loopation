# Parametric Equations in Loopation

Loopation provides powerful tools for creating and animating parametric curves in React applications. This guide covers everything you need to know about using the parametric equation features.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Basic Usage](#basic-usage)
4. [API Reference](#api-reference)
5. [Predefined Curves](#predefined-curves)
6. [Creating Custom Curves](#creating-custom-curves)
7. [Animation Techniques](#animation-techniques)
8. [Performance Optimization](#performance-optimization)
9. [Examples](#examples)

## Introduction

Parametric equations define curves by expressing the coordinates of points as functions of a parameter. In Loopation, this parameter is typically denoted as `t`. By animating the value of `t`, you can create smooth, continuous motion along these curves.

Parametric curves are ideal for:
- Creating looping animations
- Defining complex motion paths
- Generating mathematical visualizations
- Creating organic, natural-looking movement

## Installation

First, install the Loopation library:

```bash
npm install loopation
# or
yarn add loopation
```

## Basic Usage

Here's a simple example of using a parametric curve to create a circular animation:

```jsx
import React from 'react';
import { ParametricCanvas, Equations } from 'loopation';

const CircleExample = () => {
  // Create a circle with center at (0,0) and radius 100
  const circle = Equations.circle(0, 0, 100);
  
  return (
    <ParametricCanvas
      width={400}
      height={400}
      curve={(t) => circle.getPointAt(t)}
      pointCount={100}
      tStart={0}
      tEnd={1}
      lineColor="#3498db"
    />
  );
};

export default CircleExample;
```

## API Reference

### `ParametricCurve` Class

The core class for defining parametric curves.

#### Constructor

```typescript
constructor(
  xFunction: (t: number) => number,
  yFunction: (t: number) => number
)
```

- `xFunction`: Function that calculates the x-coordinate for a given t value
- `yFunction`: Function that calculates the y-coordinate for a given t value

#### Methods

- `getPointAt(t: number): Vector2D` - Returns the point at parameter value t
- `getPoints(count: number, tStart: number = 0, tEnd: number = 1): Vector2D[]` - Returns an array of points along the curve

### `Equations` Class

A utility class with static methods for creating common parametric curves.

#### Methods

- `circle(centerX: number, centerY: number, radius: number): ParametricCurve`
- `ellipse(centerX: number, centerY: number, radiusX: number, radiusY: number): ParametricCurve`
- `lissajous(centerX: number, centerY: number, aX: number, aY: number, freqX: number, freqY: number, phase: number = 0): ParametricCurve`
- `spiral(centerX: number, centerY: number, a: number, b: number): ParametricCurve`
- `wave(startX: number, startY: number, width: number, amplitude: number, frequency: number): ParametricCurve`

### `ParametricCanvas` Component

A React component for rendering parametric curves.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | number | 500 | Canvas width in pixels |
| `height` | number | 500 | Canvas height in pixels |
| `curve` | (t: number) => Vector2D | (required) | Function that returns a point for parameter t |
| `pointCount` | number | 100 | Number of points to calculate along the curve |
| `tStart` | number | 0 | Starting value for parameter t |
| `tEnd` | number | 2*Math.PI | Ending value for parameter t |
| `showPoints` | boolean | true | Whether to display points along the curve |
| `pointSize` | number | 3 | Size of points in pixels |
| `lineWidth` | number | 2 | Width of the curve line in pixels |
| `lineColor` | string | '#000000' | Color of the curve line |
| `pointColor` | string | '#ff0000' | Color of the points |
| `className` | string | '' | Additional CSS class names |
| `style` | object | {} | Additional inline styles |

## Predefined Curves

Loopation provides several predefined parametric curves through the `Equations` class:

### Circle

```javascript
const circle = Equations.circle(centerX, centerY, radius);
```

### Ellipse

```javascript
const ellipse = Equations.ellipse(centerX, centerY, radiusX, radiusY);
```

### Lissajous Curve

```javascript
const lissajous = Equations.lissajous(centerX, centerY, aX, aY, freqX, freqY, phase);
```

### Spiral

```javascript
const spiral = Equations.spiral(centerX, centerY, a, b);
```

### Wave

```javascript
const wave = Equations.wave(startX, startY, width, amplitude, frequency);
```

## Creating Custom Curves

You can create custom parametric curves by defining your own x and y functions:

```javascript
import { ParametricCurve, Vector2D } from 'loopation';

// Create a heart curve
const heartCurve = new ParametricCurve(
  (t) => 16 * Math.pow(Math.sin(t), 3),
  (t) => 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)
);

// Or directly with an inline function
const customCurve = (t) => {
  return new Vector2D(
    Math.cos(3 * t) * 100,
    Math.sin(2 * t) * 100
  );
};
```

## Animation Techniques

### Basic Animation Loop

```jsx
import React, { useState, useEffect } from 'react';
import { ParametricCanvas, Equations } from 'loopation';

const AnimatedCircle = () => {
  const [time, setTime] = useState(0);
  const circle = Equations.circle(0, 0, 100);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => (prevTime + 0.01) % 1);
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, []);
  
  // Create a moving point on the circle
  const movingPoint = (t) => {
    // Use the current time to determine where on the curve to render
    const point = circle.getPointAt(time);
    return point;
  };
  
  return (
    <ParametricCanvas
      width={400}
      height={400}
      curve={movingPoint}
      pointCount={1}
      showPoints={true}
      pointSize={10}
    />
  );
};
```

### Multiple Objects with Different Offsets

```jsx
import React, { useState, useEffect } from 'react';
import { ParametricCanvas, Equations, Vector2D } from 'loopation';

const MultipleObjectsDemo = () => {
  const [time, setTime] = useState(0);
  const circle = Equations.circle(0, 0, 100);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => (prevTime + 0.01) % 1);
    }, 16);
    
    return () => clearInterval(interval);
  }, []);
  
  // Render multiple objects with different offsets
  const renderObjects = () => {
    const objects = [];
    const count = 5;
    
    for (let i = 0; i < count; i++) {
      const offset = i / count;
      const t = (time + offset) % 1;
      const position = circle.getPointAt(t);
      
      objects.push(
        <circle
          key={i}
          cx={position.x + 200}
          cy={position.y + 200}
          r={10}
          fill={`hsl(${i * 360 / count}, 80%, 60%)`}
        />
      );
    }
    
    return objects;
  };
  
  return (
    <div style={{ position: 'relative' }}>
      <ParametricCanvas
        width={400}
        height={400}
        curve={(t) => circle.getPointAt(t)}
        pointCount={100}
        showPoints={false}
      />
      <svg
        style={{ position: 'absolute', top: 0, left: 0 }}
        width={400}
        height={400}
      >
        {renderObjects()}
      </svg>
    </div>
  );
};
```

### Using Easing Functions

```jsx
import { useEffect, useState } from 'react';
import { ParametricCanvas, Equations } from 'loopation';

// Easing function for smooth animation
const easeInOutCubic = (t) => {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

const EasedAnimation = () => {
  const [time, setTime] = useState(0);
  const spiral = Equations.spiral(0, 0, 10, 1);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => (prevTime + 0.01) % 1);
    }, 16);
    
    return () => clearInterval(interval);
  }, []);
  
  // Apply easing to the time parameter
  const easedTime = easeInOutCubic(time);
  
  return (
    <ParametricCanvas
      width={400}
      height={400}
      curve={(t) => spiral.getPointAt(t * easedTime)}
      pointCount={100}
    />
  );
};
```

## Performance Optimization

When working with parametric curves, especially in animations, consider these optimization techniques:

1. **Limit Point Count**: Use only as many points as needed for smooth curves.
2. **Use RequestAnimationFrame**: For smoother animations than setInterval.
3. **Memoize Calculations**: Cache results for expensive calculations.
4. **Reduce DOM Updates**: Minimize the number of elements being animated.
5. **Use Canvas for Complex Scenes**: For many objects, canvas rendering is more efficient than SVG.

Example of optimized animation:

```jsx
import React, { useRef, useEffect } from 'react';
import { Equations } from 'loopation';

const OptimizedAnimation = () => {
  const canvasRef = useRef(null);
  const circle = Equations.circle(200, 200, 100);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let lastTime = 0;
    
    const animate = (currentTime) => {
      // Calculate delta time for smooth animation regardless of frame rate
      const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
      lastTime = currentTime;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw the curve
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const t = i / 100;
        const point = circle.getPointAt(t);
        
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw moving objects
      const objectCount = 5;
      for (let i = 0; i < objectCount; i++) {
        const offset = i / objectCount;
        const t = ((currentTime / 2000) + offset) % 1;
        const point = circle.getPointAt(t);
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${i * 360 / objectCount}, 80%, 60%)`;
        ctx.fill();
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return <canvas ref={canvasRef} width={400} height={400} />;
};
```

## Examples

### Circular Motion

```jsx
import React from 'react';
import { ParametricCanvas, Equations } from 'loopation';

const CircularMotion = () => {
  const circle = Equations.circle(0, 0, 100);
  
  return (
    <ParametricCanvas
      width={400}
      height={400}
      curve={(t) => circle.getPointAt(t)}
      pointCount={100}
      lineColor="#3498db"
    />
  );
};
```

### Lissajous Pattern

```jsx
import React from 'react';
import { ParametricCanvas, Equations } from 'loopation';

const LissajousPattern = () => {
  const lissajous = Equations.lissajous(0, 0, 100, 100, 3, 2, Math.PI/2);
  
  return (
    <ParametricCanvas
      width={400}
      height={400}
      curve={(t) => lissajous.getPointAt(t)}
      pointCount={200}
      lineColor="#e74c3c"
    />
  );
};
```

### Spiral Animation

```jsx
import React, { useState, useEffect } from 'react';
import { ParametricCanvas, Equations } from 'loopation';

const SpiralAnimation = () => {
  const [time, setTime] = useState(0);
  const spiral = Equations.spiral(0, 0, 0.3, 1);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => (prevTime + 0.01) % 1);
    }, 16);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <ParametricCanvas
      width={400}
      height={400}
      curve={(t) => spiral.getPointAt(t * time * 10)}
      pointCount={200}
      tStart={0}
      tEnd={1}
      lineColor="#9b59b6"
    />
  );
};
```

---

This documentation provides a comprehensive guide to using parametric equations in Loopation. For more examples and advanced usage, check out the demo application included with the library. 