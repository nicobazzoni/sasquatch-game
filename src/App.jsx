import React from 'react';
import './index.css';
import ThreeScene from './components/ThreeScene';

const App = () => {
  return (
    <div className="h-screen bg-gray-900">
      <headerw className="text-center text-white top-1 text-2xl py-4">Sasquatch Stealth Game</headerw>
      <div className='flex-1'>
      <ThreeScene />
      </div>
    </div>
  );
};

export default App;