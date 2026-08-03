import React from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
