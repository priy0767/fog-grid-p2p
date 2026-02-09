import { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';

export default function HostDashboard() {
  const [peerId, setPeerId] = useState(null);
  const [workers, setWorkers] = useState([]); // Just for UI count
  const [logs, setLogs] = useState([]);
  const [isWorking, setIsWorking] = useState(false);
  const [file, setFile] = useState(null);
  const [targetPin, setTargetPin] = useState("");
  const [targetResult, setTargetResult] = useState(null);
  
  const peerRef = useRef(null);
  const connectionsRef = useRef([]); // Stores actual DataConnection objects

  // 1. HEAVY MATH LOGIC
  const calculateHeavyHash = (pin) => {
    let hash = 0;
    const pinNum = parseInt(pin);
    for (let i = 0; i < 150000; i++) {
        hash = (hash + pinNum * i) % 9999999;
        hash = (hash * 33) ^ i;
    }
    return hash;
  };

  const lockFile = () => {
    if (!targetPin || targetPin.length !== 4) {
        alert("Please set a 4-digit PIN (0000-9999).");
        return;
    }
    addLog(`🔒 ENCRYPTING FILE (Heavy Computation)...`);
    setTimeout(() => {
        const result = calculateHeavyHash(targetPin);
        setTargetResult(result);
        addLog(`🔑 LOCK CREATED! HASH ID: ${result}`);
        addLog(`READY TO DISTRIBUTE ATTACK.`);
    }, 500);
  };

  const startJob = () => {
    if (!targetResult) { alert("Lock file first!"); return; }
    if (connectionsRef.current.length === 0) { alert("No workers!"); return; }

    setIsWorking(true);
    addLog(`🚀 STARTING DISTRIBUTED ATTACK...`);

    const totalRange = 10000; // 0000 to 9999
    const workerCount = connectionsRef.current.length;
    const chunkSize = Math.floor(totalRange / workerCount);

    connectionsRef.current.forEach((conn, index) => {
        const start = index * chunkSize;
        // Ensure the last worker picks up the remainder
        const end = (index === workerCount - 1) ? totalRange - 1 : (start + chunkSize - 1);

        addLog(`📤 NODE ${index+1} assigned range: ${start} - ${end}`);
        
        conn.send({
            type: 'START_WORK',
            start: start,
            end: end,
            targetResult: targetResult
        });
    });
  };

  useEffect(() => {
    // Prevent double-init in React Strict Mode
    if (peerRef.current) return;

    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      setPeerId(id);
      addLog(`SYSTEM ONLINE. HOST ID: ${id}`);
    });

    peer.on('connection', (conn) => {
      conn.on('open', () => {
        addLog(`🟢 NEW WORKER CONNECTED: ${conn.peer}`);
        connectionsRef.current.push(conn);
        // Update UI state
        setWorkers(prev => [...prev, conn.peer]);
      });

      conn.on('data', (data) => {
        if (data.type === 'JOB_DONE') {
            if (data.result) {
                setIsWorking(false);
                addLog(`💎 PASSWORD CRACKED: ${data.result}`);
                alert(`SUCCESS! PIN FOUND: ${data.result}`);
                // Stop all other workers
                connectionsRef.current.forEach(c => c.send({type: 'ABORT'}));
            } else {
                addLog(`✅ Node finished range (Not found).`);
            }
        }
      });

      // Optional: Handle disconnects
      conn.on('close', () => {
        addLog(`🔴 WORKER DISCONNECTED: ${conn.peer}`);
        connectionsRef.current = connectionsRef.current.filter(c => c.peer !== conn.peer);
        setWorkers(prev => prev.filter(id => id !== conn.peer));
      });
    });

    return () => {
        peer.destroy();
        peerRef.current = null;
    };
  }, []);

  const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold">FOG GRID: MASTER NODE</h1>
        <div className="text-right">
             <p className="text-xs text-gray-500">HOST ID</p>
             <div className="bg-gray-900 px-4 py-2 rounded text-white border border-gray-700 select-all">
                {peerId || "INITIALIZING..."}
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* CONTROLS */}
        <div className="space-y-6">
            {/* STEP 1 */}
            <div className="border border-green-800 p-6 rounded bg-gray-900/30">
                <h2 className="text-xl text-white mb-4">1. TARGET</h2>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-4 text-sm text-gray-400 w-full"/>
                {file && (
                    <>
                        <p className="text-xs text-green-400 mb-1">Set PIN (0000-9999):</p>
                        <input 
                            type="number" 
                            placeholder="e.g. 8500" 
                            className="w-full bg-black border border-green-600 p-2 text-white mb-4 text-center text-xl tracking-widest outline-none focus:border-green-400 transition-colors"
                            onChange={(e) => setTargetPin(e.target.value)}
                        />
                        <button onClick={lockFile} className="w-full bg-green-900/50 hover:bg-green-800 border border-green-600 text-white py-2 rounded transition-all">
                            🔒 LOCK FILE
                        </button>
                    </>
                )}
            </div>

            {/* STEP 2 */}
            <div className="border border-green-800 p-6 rounded bg-gray-900/30">
                <h2 className="text-xl text-white mb-2">2. CLUSTER</h2>
                <div className="flex justify-between items-end mb-4">
                    <span className="text-gray-400">ACTIVE NODES:</span>
                    <span className="text-4xl font-bold text-green-400">{workers.length}</span>
                </div>
                <button 
                    onClick={startJob}
                    disabled={isWorking || !targetResult}
                    className={`w-full py-4 text-lg font-bold rounded shadow-[0_0_15px_rgba(0,255,0,0.2)] transition-all ${
                        isWorking 
                        ? 'bg-red-900/80 text-white animate-pulse cursor-wait' 
                        : 'bg-green-600 hover:bg-green-500 text-black'
                    }`}
                >
                    {isWorking ? "⚠ BRUTE FORCING..." : "⚡ START ATTACK"}
                </button>
            </div>
        </div>

        {/* LOGS */}
        <div className="col-span-2 bg-black border border-green-900 p-4 rounded h-[500px] flex flex-col shadow-inner">
            <div className="flex justify-between border-b border-green-900 pb-2 mb-2">
                <span className="text-gray-500">TERMINAL OUTPUT</span>
                <span className="text-xs text-green-600 animate-pulse">● LIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-sm space-y-1 scrollbar-thin scrollbar-thumb-green-900">
                {logs.map((log, i) => (
                    <div key={i} className="border-l-2 border-green-800 pl-2 hover:bg-green-900/20">
                        {log}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
