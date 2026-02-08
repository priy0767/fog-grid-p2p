import { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';

export default function HostDashboard() {
  const [peerId, setPeerId] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const [file, setFile] = useState(null);
  const [targetPin, setTargetPin] = useState("");
  const [targetResult, setTargetResult] = useState(null);
  
  const peerRef = useRef(null);
  const connectionsRef = useRef([]);

  // 1. PURE JS ENCRYPTION (No API, Safe for HTTP)
  const calculateHeavyHash = (pin) => {
    let hash = 0;
    const pinNum = parseInt(pin);
    // Same math as the worker
    for (let i = 0; i < 150000; i++) {
        hash = (hash + pinNum * i) % 9999999;
        hash = (hash * 33) ^ i;
    }
    return hash;
  };

  const lockFile = () => {
    if (!targetPin || targetPin.length !== 4) {
        alert("Please set a 4-digit PIN (0000-9999) to lock the file.");
        return;
    }
    
    addLog(`🔒 ENCRYPTING FILE (Heavy Computation)...`);
    
    // Slight delay to simulate work on the UI
    setTimeout(() => {
        const result = calculateHeavyHash(targetPin);
        setTargetResult(result);
        addLog(`🔑 LOCK CREATED! HASH ID: ${result}`);
        addLog(`READY TO DISTRIBUTE ATTACK.`);
    }, 500);
  };

  const startJob = () => {
    if (!targetResult) {
        alert("Lock the file first!");
        return;
    }
    if (connectionsRef.current.length === 0) {
        alert("No workers connected!");
        return;
    }

    setIsWorking(true);
    addLog(`🚀 STARTING DISTRIBUTED ATTACK ON PIN RANGE [0000-9999]`);

    const totalRange = 10000;
    const workerCount = connectionsRef.current.length;
    const chunkSize = Math.floor(totalRange / workerCount);

    connectionsRef.current.forEach((conn, index) => {
        const start = index * chunkSize;
        const end = (index === workerCount - 1) ? totalRange - 1 : (start + chunkSize - 1);

        addLog(`📤 NODE ${index+1}: Scanning ${start} - ${end}`);
        
        conn.send({
            type: 'START_WORK',
            start: start,
            end: end,
            targetResult: targetResult
        });
    });
  };

  useEffect(() => {
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      addLog(`SYSTEM ONLINE. HOST ID: ${id}`);
    });

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        addLog(`NEW WORKER: ${conn.peer}`);
        connectionsRef.current.push(conn);
        setWorkers(prev => [...prev, conn.peer]);
      });

      conn.on('data', (data) => {
        if (data.type === 'JOB_DONE') {
            if (data.result) {
                setIsWorking(false);
                addLog(`💎 PASSWORD CRACKED: ${data.result}`);
                alert(`SUCCESS! The PDF PIN is: ${data.result}`);
                connectionsRef.current.forEach(c => c.send({type: 'ABORT'}));
            } else {
                addLog(`✅ Worker finished range (Not found).`);
            }
        }
      });
    });
    return () => peer.destroy();
  }, []);

  const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold">FOG GRID: PDF PIN CRACKER</h1>
        <div className="bg-gray-900 px-4 py-2 rounded text-white border border-gray-700">
            HOST ID: {peerId}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT PANEL */}
        <div className="space-y-6">
            
            <div className="border border-green-800 p-6 rounded bg-gray-900/50">
                <h2 className="text-xl text-white mb-4">1. UPLOAD & LOCK</h2>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-4 text-sm text-gray-400"/>
                {file && (
                    <>
                        <p className="text-xs text-gray-400 mb-1">Set a Demo PIN (0000-9999):</p>
                        <input 
                            type="number" 
                            placeholder="1234" 
                            className="w-full bg-black border border-green-600 p-2 text-white mb-4 text-center tracking-widest"
                            onChange={(e) => setTargetPin(e.target.value)}
                        />
                        <button onClick={lockFile} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded text-sm">
                            🔒 ENCRYPT FILE
                        </button>
                    </>
                )}
            </div>

            <div className="border border-green-800 p-6 rounded bg-gray-900/50">
                <h2 className="text-xl text-white mb-2">2. CLUSTER</h2>
                <div className="text-4xl font-bold mb-2">{workers.length} <span className="text-sm font-normal text-gray-400">NODES</span></div>
                <button 
                    onClick={startJob}
                    disabled={isWorking || !targetResult}
                    className={`w-full py-4 text-lg font-bold rounded transition-all ${isWorking ? 'bg-red-900 text-red-200' : 'bg-green-600 hover:bg-green-500 text-black'}`}
                >
                    {isWorking ? "CRACKING IN PROGRESS..." : "⚡ START DISTRIBUTED ATTACK"}
                </button>
            </div>
        </div>

        {/* RIGHT PANEL: LOGS */}
        <div className="col-span-2 bg-black border border-gray-800 p-4 rounded h-[500px] overflow-y-auto font-mono text-sm">
            {logs.map((log, i) => <div key={i} className="mb-1 border-l-2 border-green-900 pl-2">{log}</div>)}
        </div>
      </div>
    </div>
  );
}