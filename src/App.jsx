import { useState } from 'react';
import HostDashboard from './components/Host/HostDashboard';
import WorkerScreen from './components/Workers/WorkerScreen';

function App() {
  const [mode, setMode] = useState(null); // 'HOST' or 'WORKER' or null

  return (
    <div className="bg-black min-h-screen">
      
      {/* 1. SELECTION SCREEN (Show this if no mode selected) */}
      {!mode && (
        <div className="flex flex-col items-center justify-center min-h-screen text-white font-mono">
          <h1 className="text-6xl font-bold text-green-500 mb-2 drop-shadow-[0_0_15px_rgba(0,255,0,0.8)]">
            FOG GRID
          </h1>
          <p className="mb-12 text-gray-400 tracking-widest">DECENTRALIZED COMPUTE CLUSTER</p>

          <div className="flex gap-8">
            {/* HOST BUTTON */}
            <div 
              onClick={() => setMode('HOST')}
              className="group border border-green-600 p-10 rounded-xl cursor-pointer hover:bg-green-900/20 hover:scale-105 transition-all w-80 text-center"
            >
              <div className="text-6xl mb-4 group-hover:animate-bounce">🧠</div>
              <h2 className="text-2xl font-bold mb-2 text-white">INITIALIZE HOST</h2>
              <p className="text-xs text-gray-500">Create a Cluster & Assign Tasks</p>
              <p className="text-green-500 text-xs mt-4 group-hover:opacity-100 opacity-0 transition-opacity">
                 SYSTEM READY
              </p>
            </div>

            {/* WORKER BUTTON */}
            <div 
              onClick={() => setMode('WORKER')}
              className="group border border-blue-600 p-10 rounded-xl cursor-pointer hover:bg-blue-900/20 hover:scale-105 transition-all w-80 text-center"
            >
              <div className="text-6xl mb-4 group-hover:rotate-12 transition-transform">🔨</div>
              <h2 className="text-2xl font-bold mb-2 text-white">JOIN AS NODE</h2>
              <p className="text-xs text-gray-500">Donate CPU Power to Grid</p>
              <p className="text-blue-500 text-xs mt-4 group-hover:opacity-100 opacity-0 transition-opacity">
                 AWAITING INSTRUCTION
              </p>
            </div>
          </div>
          
          <div className="mt-16 text-gray-700 text-xs">v2.0.4 // P2P MESH // WASM ENABLED</div>
        </div>
      )}

      {/* 2. SHOW SELECTED MODE */}
      {mode === 'HOST' && <HostDashboard />}
      {mode === 'WORKER' && <WorkerScreen />}
      
    </div>
  );
}

export default App;