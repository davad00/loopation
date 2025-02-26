import React, { useState } from 'react';
import { ChainDemo } from './ChainDemo';
import { FabricDemo } from './FabricDemo';
import { ParametricDemo } from './ParametricDemo';

interface CombinedDemoProps {
  width?: number;
  height?: number;
}

type Tab = 'chain' | 'fabric' | 'parametric';

export const CombinedDemo: React.FC<CombinedDemoProps> = ({
  width = 800,
  height = 600
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('chain');
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };
  
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      backgroundColor: '#f8f9fa',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '30px',
      padding: '20px 0',
      borderBottom: '1px solid #e9ecef'
    },
    title: {
      fontSize: '32px',
      fontWeight: 700,
      color: '#343a40',
      margin: '0 0 10px 0'
    },
    subtitle: {
      fontSize: '18px',
      color: '#6c757d',
      fontWeight: 400,
      margin: 0
    },
    tabs: {
      display: 'flex',
      justifyContent: 'center' as const,
      marginBottom: '30px',
      borderBottom: '1px solid #dee2e6',
      padding: '0 20px'
    },
    tab: {
      padding: '12px 24px',
      margin: '0 10px',
      cursor: 'pointer',
      border: 'none',
      background: 'transparent',
      fontSize: '16px',
      fontWeight: '500' as const,
      color: '#495057',
      position: 'relative' as const,
      bottom: '-1px',
      transition: 'all 0.2s ease-in-out',
      borderRadius: '4px 4px 0 0'
    },
    activeTab: {
      color: '#007bff',
      borderBottom: '3px solid #007bff',
      backgroundColor: 'rgba(0, 123, 255, 0.05)'
    },
    demoContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    },
    footer: {
      marginTop: '30px',
      textAlign: 'center' as const,
      color: '#6c757d',
      fontSize: '14px',
      padding: '20px 0',
      borderTop: '1px solid #e9ecef'
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Loopation Interactive Demos</h1>
        <p style={styles.subtitle}>Explore the powerful animation capabilities of the Loopation library</p>
      </div>
      
      <div style={styles.tabs}>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'chain' ? styles.activeTab : {})
          }} 
          onClick={() => handleTabChange('chain')}
        >
          Chain Physics
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'fabric' ? styles.activeTab : {})
          }} 
          onClick={() => handleTabChange('fabric')}
        >
          Inverse Kinematics
        </button>
        <button 
          style={{
            ...styles.tab,
            ...(activeTab === 'parametric' ? styles.activeTab : {})
          }} 
          onClick={() => handleTabChange('parametric')}
        >
          Parametric Curves
        </button>
      </div>
      
      <div style={styles.demoContainer}>
        {activeTab === 'chain' && <ChainDemo width={width} height={height} />}
        {activeTab === 'fabric' && <FabricDemo width={width} height={height} />}
        {activeTab === 'parametric' && <ParametricDemo width={width} height={height} />}
      </div>
      
      <div style={styles.footer}>
        <p>Loopation - A React procedural animation library for interactive web experiences</p>
      </div>
    </div>
  );
}; 