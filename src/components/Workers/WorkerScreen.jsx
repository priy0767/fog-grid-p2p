import { useState, useRef, useEffect } from 'react';
import Peer from 'peerjs';

export default function WorkerScreen() {
  const [hostId, setHostId] = useState('');
  const [status, setStatus] = useState('DISCONNECTED');
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const peerRef = useRef(null);
  const stopRef = useRef(false);

  // 1. PURE JS HEAVY FUNCTION (No Browser API needed)
  // This burns CPU cycles to verify the PIN.
  const checkPinHeavy = (pin, targetResult) => {
    let hash = 0;
    const pinNum = parseInt(pin);
    
    // HEAVY WORKLOAD: 150,000 Math operations per PIN
    // This will heat up your phone!
    for (let i = 0; i < 150000; i++) {
        hash = (hash + pinNum * i) % 9999999;
        hash = (hash * 33) ^ i;
    }
    return hash === targetResult;
  };

  const connectToHost = () => {
    if (!hostId) return;
    setStatus('CONNECTING...');
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      addLog(`📡 ID: ${id}`);
      const conn = peer.connect(hostId);

      conn.on('open', () => {
        setStatus('CONNECTED');
        addLog(`🟢 CONNECTED TO CLUSTER`);
      });

      conn.on('data', async (data) => {
        if (data.type === 'START_WORK') {
            stopRef.current = false;
            // Delay slightly to let UI update
            setTimeout(() => {
                runHeavyCracker(data.start, data.end, data.targetResult, conn);
            }, 100);
        }
        if (data.type === 'ABORT') {
            stopRef.current = true;
            addLog("🛑 STOP COMMAND RECEIVED");
        }
      });
      
      conn.on('error', () => setStatus('DISCONNECTED'));
    });
  };

  const runHeavyCracker = async (start, end, targetResult, conn) => {
    addLog(`🔨 CRACKING RANGE: ${start} - ${end}`);
    const startTime = performance.now();
    
    let current = parseInt(start);
    const stop = parseInt(end);
    let found = null;

    // BATCH PROCESSING
    while (current <= stop && !stopRef.current) {
        // Process a batch of 20 numbers at a time
        for (let i = 0; i < 20; i++) {
            if (current > stop) break;
            
            const pinString = current.toString().padStart(4, '0');
            
            // Run the Heavy Math
            if (checkPinHeavy(pinString, targetResult)) {
                found = pinString;
                break;
            }
            current++;
        }

        // Update Progress Bar
        const percent = ((current - parseInt(start)) / (stop - parseInt(start))) * 100;
        setProgress(Math.floor(percent));

        // Yield to main thread (keeps UI responsive)
        await new Promise(r => setTimeout(r, 0));

        if (found) break;
    }

    const duration = ((performance.now() - startTime) / 1000).toFixed(2);
    
    if (found) {
        addLog(`💎 PASSWORD FOUND: ${found} (${duration}s)`);
        conn.send({ type: 'JOB_DONE', result: found, workerId: peerRef.current.id });
        setProgress(100);
    } else if (stopRef.current) {
        addLog(`🛑 JOB ABORTED`);
    } else {
        addLog(`✅ RANGE COMPLETE (Not Found). (${duration}s)`);
        conn.send({ type: 'JOB_DONE', result: null, workerId: peerRef.current.id });
        setProgress(100);
    }
  };

  const addLog = (msg) => setLogs(prev => [`> ${msg}`, ...prev]);

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">WORKER NODE</h1>

      <div className={`w-full max-w-md p-4 mb-4 rounded border ${status === 'CONNECTED' ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/10'}`}>
        <div className="flex justify-between items-center">
            <span>STATUS: {status}</span>
            {status === 'CONNECTED' && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>}
        </div>
      </div>

      {status === 'DISCONNECTED' && (
        <div className="w-full max-w-md space-y-4">
          <input 
            type="text" 
            value={hostId}
            onChange={(e) => setHostId(e.target.value)}
            className="w-full bg-black border border-green-700 p-3 text-white rounded"
            placeholder="Enter Host ID..."
          />
          <button onClick={connectToHost} className="w-full bg-green-700 text-white font-bold py-3 rounded">
            CONNECT
          </button>
        </div>
      )}

      {status === 'CONNECTED' && (
        <div className="w-full max-w-md mb-6">
            <div className="text-xs text-right mb-1">{progress}% CPU LOAD</div>
            <div className="w-full bg-gray-700 h-4 rounded overflow-hidden">
                <div 
                    className="bg-green-500 h-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Running Heavy Math Calculations...</p>
        </div>
      )}

      <div className="w-full max-w-md h-64 overflow-y-auto bg-black p-2 rounded border border-gray-700 text-xs">
        {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
      </div>
    </div>
  );
}