import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChainDemo } from './ChainDemo';
import { FabricDemo } from './FabricDemo';
import { ParametricDemo } from './ParametricDemo';
import { CombinedDemo } from './CombinedDemo';

// Simple demo selector
const DemoSelector: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = React.useState<string>('combined');

  const renderDemo = () => {
    switch (selectedDemo) {
      case 'chain':
        return <ChainDemo />;
      case 'fabric':
        return <FabricDemo />;
      case 'parametric':
        return <ParametricDemo />;
      case 'combined':
      default:
        return <CombinedDemo />;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Loopation Demos</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Choose a demo:</label>
        <select 
          value={selectedDemo} 
          onChange={(e) => setSelectedDemo(e.target.value)}
          style={{ padding: '8px' }}
        >
          <option value="combined">Combined Demo</option>
          <option value="chain">Chain Demo</option>
          <option value="fabric">Fabric (IK) Demo</option>
          <option value="parametric">Parametric Curves Demo</option>
        </select>
      </div>
      
      <div>
        {renderDemo()}
      </div>
    </div>
  );
};

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<DemoSelector />);
} 