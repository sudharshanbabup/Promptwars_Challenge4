import React, { useState } from 'react';
import { SkipLink } from './components/AppShell/SkipLink.jsx';
import { Header } from './components/AppShell/Header.jsx';
import { Nav } from './components/AppShell/Nav.jsx';
import { Footer } from './components/AppShell/Footer.jsx';

import OpsIntelligence from './components/OpsIntelligence/OpsIntelligence.jsx';
import Navigation from './components/Navigation/Navigation.jsx';
import Accessibility from './components/Accessibility/Accessibility.jsx';
import Multilingual from './components/Multilingual/Multilingual.jsx';
import Sustainability from './components/Sustainability/Sustainability.jsx';

/**
 * Main application component. Sets active tabs and renders sub-panels dynamically.
 * 
 * @returns {React.ReactElement}
 */
export default function App() {
  const [activeTabId, setActiveTabId] = useState('ops');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SkipLink />
      <Header />
      <Nav activeTabId={activeTabId} setActiveTabId={setActiveTabId} />

      <main
        id="main"
        tabIndex={-1}
        style={{
          flex: 1,
          padding: 'var(--space-24)',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto'
        }}
      >
        <div role="tabpanel" id={`panel-${activeTabId}`} aria-labelledby={`tab-${activeTabId}`}>
          {activeTabId === 'ops' && <OpsIntelligence />}
          {activeTabId === 'navigation' && <Navigation />}
          {activeTabId === 'accessibility' && <Accessibility />}
          {activeTabId === 'multilingual' && <Multilingual />}
          {activeTabId === 'sustainability' && <Sustainability />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
