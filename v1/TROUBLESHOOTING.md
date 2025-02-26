# Troubleshooting Guide

## Common Installation Issues

### Dependency Conflicts

If you see an error like this:
```
npm error code ERESOLVE
npm error ERESOLVE could not resolve
```

Try the following solutions:

1. **Run the fix-deps script**:
   ```
   npm run fix-deps
   ```
   This script cleans the cache, removes node_modules, and reinstalls dependencies with the `--legacy-peer-deps` flag.

2. **Install with legacy peer deps flag**:
   ```
   npm install --legacy-peer-deps
   ```

3. **Force install** (last resort):
   ```
   npm install --force
   ```

### Missing webpack command

If you see:
```
'webpack' is not recognized as an internal or external command
```

This usually means the dependencies didn't install correctly. Try:

1. Make sure you have a successful installation first:
   ```
   npm run fix-deps
   ```

2. Or install webpack CLI globally:
   ```
   npm install -g webpack-cli
   ```

## React Version Issues

This library is designed to work with React 18, but can also work with other versions. If you're experiencing issues with React versions:

1. Check your package.json to ensure you have React 18.x specified as a dependency.
2. Make sure your application's React version is compatible with the library.
3. If needed, you can force a specific React version in your project:
   ```
   npm install react@18.2.0 react-dom@18.2.0 --save-exact
   ```

## Build Issues

### TypeScript Errors

If you get TypeScript compilation errors:

1. Make sure all dependencies are installed correctly.
2. Check if your TypeScript version is compatible (project uses TypeScript 4.7.x).
3. Try removing the TypeScript cache:
   ```
   rm -rf node_modules/.cache
   ```

### Webpack Build Issues

If webpack fails to build the examples:

1. Check the webpack configuration in `webpack.config.js`.
2. Make sure all loaders mentioned in the config are installed.
3. Try running with verbose output:
   ```
   npx webpack --mode development --display-error-details
   ```

## Running the Examples

If the examples don't start properly:

1. Build the library first:
   ```
   npm run build
   ```

2. Then start the examples:
   ```
   npm run examples:dev
   ```

3. If the browser doesn't open automatically, try accessing:
   ```
   http://localhost:9000
   ```

## Getting Additional Help

If you're still experiencing issues:

1. Create a detailed issue on the GitHub repository.
2. Include your environment information:
   ```
   npm version
   node -v
   ```
3. Provide the full error logs to help with debugging. 