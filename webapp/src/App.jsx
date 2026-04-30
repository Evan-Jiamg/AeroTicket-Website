import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  const [activeForm, setActiveForm] = useState('Ticket');

  return (
    <div className="app-layout">
      <Sidebar activeForm={activeForm} setActiveForm={setActiveForm} />
      <div className="main-content">
        <Dashboard key={activeForm} activeForm={activeForm} />
      </div>
    </div>
  );
}

export default App;
