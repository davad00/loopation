# Loopation API Reference

This document provides a comprehensive reference for all the classes, components, and hooks available in the Loopation library.

## Table of Contents

1. [Core Classes](#core-classes)
   - [Point](#point)
   - [Chain](#chain)
   - [Vector2D](#vector2d)
2. [Constraints](#constraints)
   - [DistanceConstraint](#distanceconstraint)
   - [AngleConstraint](#angleconstraint)
3. [Inverse Kinematics](#inverse-kinematics)
   - [Fabric](#fabric)
   - [Target](#target)
4. [Parametric Equations](#parametric-equations)
   - [ParametricCurve](#parametriccurve)
   - [Equations](#equations)
5. [React Components](#react-components)
   - [ChainCanvas](#chaincanvas)
   - [FabricCanvas](#fabriccanvas)
   - [ParametricCanvas](#parametriccanvas)
6. [React Hooks](#react-hooks)
   - [useAnimationFrame](#useanimationframe)
   - [useChain](#usechain)
   - [useFabric](#usefabric)

## Core Classes

### Point

Represents a physics point with position, velocity, and mass.

#### Constructor

```typescript
constructor(x: number, y: number, options?: PointOptions)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `position` | Vector2D | Current position of the point |
| `prevPosition` | Vector2D | Previous position of the point |
| `velocity` | Vector2D | Current velocity of the point |
| `bodySize` | number | Size of the point for rendering |
| `fixed` | boolean | Whether the point is fixed in place |
| `mass` | number | Mass of the point for physics calculations |

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `update` | `dt: number, gravity: Vector2D` | `void` | Updates the point's position based on physics |
| `applyConstraint` | `newPosition: Vector2D` | `void` | Applies a position constraint to the point |
| `render` | `ctx: CanvasRenderingContext2D, color?: string` | `void` | Renders the point to a canvas context |

### Chain

Manages a collection of points with distance and angle constraints.

#### Constructor

```typescript
constructor(gravity?: Vector2D)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `points` | Point[] | Array of points in the chain |
| `distanceConstraints` | DistanceConstraint[] | Array of distance constraints |
| `angleConstraints` | AngleConstraint[] | Array of angle constraints |

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `addPoint` | `point: Point` | `number` | Adds a point to the chain and returns its index |
| `addDistanceConstraint` | `p1Index: number, p2Index: number, distance?: number` | `void` | Adds a distance constraint between two points |
| `addAngleConstraint` | `p1Index: number, p2Index: number, p3Index: number, minAngle?: number, maxAngle?: number` | `void` | Adds an angle constraint between three points |
| `createChain` | `startX: number, startY: number, count: number, segmentLength: number, bodySize?: number` | `void` | Creates a chain of connected points |
| `update` | `dt: number, iterations?: number` | `void` | Updates the physics simulation for the chain |
| `render` | `ctx: CanvasRenderingContext2D` | `void` | Renders the chain to a canvas context |

### Vector2D

Utility class for 2D vector operations.

#### Constructor

```typescript
constructor(x: number, y: number)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | number | X coordinate of the vector |
| `y` | number | Y coordinate of the vector |

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `set` | `x: number, y: number` | `Vector2D` | Sets the vector coordinates |
| `copy` | `v: Vector2D` | `Vector2D` | Copies values from another vector |
| `clone` | | `Vector2D` | Creates a new vector with the same values |
| `add` | `v: Vector2D` | `Vector2D` | Adds another vector to this one |
| `subtract` | `v: Vector2D` | `Vector2D` | Subtracts another vector from this one |
| `multiplyScalar` | `scalar: number` | `Vector2D` | Multiplies the vector by a scalar |
| `divideScalar` | `scalar: number` | `Vector2D` | Divides the vector by a scalar |
| `length` | | `number` | Returns the length of the vector |
| `normalize` | | `Vector2D` | Normalizes the vector to length 1 |
| `distance` | `v: Vector2D` | `number` | Returns the distance to another vector |
| `dot` | `v: Vector2D` | `number` | Returns the dot product with another vector |
| `angle` | | `number` | Returns the angle of the vector in radians |
| `angleTo` | `v: Vector2D` | `number` | Returns the angle to another vector |
| `rotate` | `angle: number` | `Vector2D` | Rotates the vector by an angle in radians |

## Constraints

### DistanceConstraint

Maintains a fixed distance between two points.

#### Constructor

```typescript
constructor(point1: Point, point2: Point, distance?: number, stiffness?: number)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `point1` | Point | First point in the constraint |
| `point2` | Point | Second point in the constraint |
| `distance` | number | Target distance between points |
| `stiffness` | number | Stiffness of the constraint (0-1) |

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `solve` | | `void` | Solves the constraint by adjusting point positions |

### AngleConstraint

Maintains a specific angle between three points.

#### Constructor

```typescript
constructor(point1: Point, point2: Point, point3: Point, minAngle?: number, maxAngle?: number, stiffness?: number)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `point1` | Point | First point in the constraint |
| `point2` | Point | Middle point (pivot) in the constraint |
| `point3` | Point | Third point in the constraint |
| `minAngle` | number | Minimum allowed angle in radians |
| `maxAngle` | number | Maximum allowed angle in radians |
| `stiffness` | number | Stiffness of the constraint (0-1) |

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `solve` | | `void` | Solves the constraint by adjusting point positions |
| `calculateAngle` | | `number` | Calculates the current angle between the three points |

## Inverse Kinematics

### Fabric

Implements inverse kinematics for simulating legs, arms, and other jointed structures.

#### Constructor

```typescript
constructor()
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `points` | Point[] | Array of points in the fabric |
| `joints` | Joint[] | Array of joints between points |
| `targets` | TargetConstraint[] | Array of target constraints |

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `addPoint` | `point: Point` | `Point` | Adds a point to the fabric |
| `connectPoints` | `point1: Point, point2: Point, length?: number` | `void` | Creates a joint between two points |
| `setTarget` | `point: Point, targetX: number, targetY: number, strength?: number` | `Target` | Creates a target for a point |
| `solve` | `iterations?: number` | `void` | Solves the inverse kinematics system |
| `createLeg` | `x: number, y: number, segments: number[], fixStart?: boolean` | `Target` | Creates a leg structure with the given segments |
| `render` | `ctx: CanvasRenderingContext2D` | `void` | Renders the fabric to a canvas context |

### Target

Represents a target position for inverse kinematics.

#### Constructor

```typescript
constructor(x: number, y: number)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `position` | Vector2D | Position of the target |

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `move` | `x: number, y: number` | `void` | Moves the target to a new position |

## Parametric Equations

### ParametricCurve

Defines a parametric curve with x and y functions of parameter t.

#### Constructor

```typescript
constructor(xFunction: (t: number) => number, yFunction: (t: number) => number)
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `xFunction` | `(t: number) => number` | Function that calculates the x-coordinate for a given t |
| `yFunction` | `(t: number) => number` | Function that calculates the y-coordinate for a given t |

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `getPointAt` | `t: number` | `Vector2D` | Returns the point at parameter value t |
| `getPoints` | `count: number, tStart?: number, tEnd?: number` | `Vector2D[]` | Returns an array of points along the curve |

### Equations

Static utility class with methods for creating common parametric curves.

#### Methods

| Method | Parameters | Return Type | Description |
|--------|------------|-------------|-------------|
| `circle` | `centerX: number, centerY: number, radius: number` | `ParametricCurve` | Creates a circular curve |
| `ellipse` | `centerX: number, centerY: number, radiusX: number, radiusY: number` | `ParametricCurve` | Creates an elliptical curve |
| `lissajous` | `centerX: number, centerY: number, aX: number, aY: number, freqX: number, freqY: number, phase?: number` | `ParametricCurve` | Creates a Lissajous curve |
| `spiral` | `centerX: number, centerY: number, a: number, b: number` | `ParametricCurve` | Creates a spiral curve |
| `wave` | `startX: number, startY: number, width: number, amplitude: number, frequency: number` | `ParametricCurve` | Creates a wave curve |

## React Components

### ChainCanvas

React component for rendering and interacting with a chain simulation.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | number | 400 | Canvas width in pixels |
| `height` | number | 400 | Canvas height in pixels |
| `gravity` | { x: number, y: number } | { x: 0, y: 9.8 } | Gravity vector for the simulation |
| `iterations` | number | 5 | Number of constraint solving iterations per update |
| `fps` | number | 60 | Target frames per second |
| `autoStart` | boolean | true | Whether to start the animation automatically |
| `chainSetup` | (chain: Chain) => void | undefined | Function to set up the chain |
| `className` | string | undefined | Additional CSS class names |
| `style` | React.CSSProperties | undefined | Additional inline styles |

### FabricCanvas

React component for rendering and interacting with inverse kinematics.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | number | 400 | Canvas width in pixels |
| `height` | number | 400 | Canvas height in pixels |
| `iterations` | number | 10 | Number of constraint solving iterations per update |
| `fps` | number | 60 | Target frames per second |
| `autoStart` | boolean | true | Whether to start the animation automatically |
| `onInit` | (params: { fabric: Fabric, createLeg: Function }) => void | undefined | Function called when the fabric is initialized |
| `className` | string | undefined | Additional CSS class names |
| `style` | React.CSSProperties | undefined | Additional inline styles |

### ParametricCanvas

React component for rendering parametric curves.

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
| `style` | React.CSSProperties | {} | Additional inline styles |

## React Hooks

### useAnimationFrame

Hook for handling animation frames in React components.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `callback` | (deltaTime: number) => void | (required) | Function called on each animation frame |
| `options` | { fps?: number, paused?: boolean } | { fps: 60, paused: false } | Animation options |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `pause` | () => void | Function to pause the animation |
| `resume` | () => void | Function to resume the animation |
| `isPaused` | boolean | Whether the animation is currently paused |
| `setFps` | (fps: number) => void | Function to change the target FPS |

### useChain

Hook for using Chain physics in React components.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options` | { gravity?: { x: number, y: number }, iterations?: number, fps?: number, autoStart?: boolean } | { gravity: { x: 0, y: 9.8 }, iterations: 5, fps: 60, autoStart: true } | Chain options |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `chain` | Chain | The Chain instance |
| `isInitialized` | boolean | Whether the chain has been initialized |
| `renderToCanvas` | (ctx: CanvasRenderingContext2D) => void | Function to render the chain to a canvas |
| `pause` | () => void | Function to pause the animation |
| `resume` | () => void | Function to resume the animation |
| `isPaused` | boolean | Whether the animation is currently paused |
| `setFps` | (fps: number) => void | Function to change the target FPS |

### useFabric

Hook for using Fabric (IK) system in React components.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options` | { iterations?: number, fps?: number, autoStart?: boolean } | { iterations: 10, fps: 60, autoStart: true } | Fabric options |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `fabric` | Fabric | The Fabric instance |
| `isInitialized` | boolean | Whether the fabric has been initialized |
| `renderToCanvas` | (ctx: CanvasRenderingContext2D) => void | Function to render the fabric to a canvas |
| `createLeg` | (x: number, y: number, segments: number[], fixStart?: boolean) => Target | Function to create a leg structure |
| `pause` | () => void | Function to pause the animation |
| `resume` | () => void | Function to resume the animation |
| `isPaused` | boolean | Whether the animation is currently paused |
| `setFps` | (fps: number) => void | Function to change the target FPS | 