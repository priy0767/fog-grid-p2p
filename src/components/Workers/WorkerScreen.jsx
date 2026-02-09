import { useState, useRef, useEffect } from 'react';
import Peer from 'peerjs';

export default function WorkerScreen() {
  const [hostId, setHostId] = useState('');
  const [status, setStatus] = useState('DISCONNECTED');
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const peerRef = useRef(null);
  const stopRef = useRef(false);

  // Clean up connection if component unmounts
  useEffect(() => {
    return () => {
        if (peerRef.current) {
            peerRef.current.destroy();
        }
    };
  }, []);

  // 1. PURE JS HEAVY FUNCTION (No Browser API needed)
  const checkPinHeavy = (pin, targetResult) => {
    let hash = 0;
    const pinNum = parseInt(pin);
    
    // HEAVY WORKLOAD: 150,000 Math operations per PIN
    for (let i = 0; i < 150000; i++) {
        hash = (hash + pinNum * i) % 9999999;
        hash = (hash * 33) ^ i;
    }
    return hash === targetResult;
  };

  const connectToHost = () => {
    if (!hostId) return;
    setStatus('CONNECTING...');
    
    // Destroy previous peer if user is reconnecting
    if (peerRef.current) peerRef.current.destroy();
    
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
      addLog(`📡 NODE ID: ${id}`);
      const conn = peer.connect(hostId);

      // Listeners must be attached AFTER connection opens
      conn.on('open', () => {
        setStatus('CONNECTED');
        addLog(`🟢 CONNECTED TO CLUSTER`);

        // Attach data listener HERE
        conn.on('data', async (data) => {
            if (data.type === 'START_WORK') {
                stopRef.current = false;
                // Delay slightly to let UI update state before freezing thread
                setTimeout(() => {
                    runHeavyCracker(data.start, data.end, data.targetResult, conn);
                }, 100);
            }
            if (data.type === 'ABORT') {
                stopRef.current = true;
                addLog("🛑 STOP COMMAND RECEIVED");
            }
        });

        conn.on('close', () => {
            setStatus('DISCONNECTED');
            addLog("🔴 HOST DISCONNECTED");
        });
      });
      
      conn.on('error', (err) => {
        setStatus('DISCONNECTED');
        addLog(`❌ ERROR: ${err.message}`);
      });
    });

    peer.on('error', (err) => {
        setStatus('DISCONNECTED');
        addLog(`❌ PEER ERROR: ${err.message}`);
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

      {/* Status Box */}
      <div className={`w-full max-w-md p-4 mb-4 rounded border ${status === 'CONNECTED' ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/10'}`}>
        <div className="flex justify-between items-center">
            <span>STATUS: {status}</span>
            {status === 'CONNECTED' && <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>}
        </div>
      </div>

      {/* Connect Box */}
      {status === 'DISCONNECTED' && (
        <div className="w-full max-w-md space-y-4">
          <input 
            type="text" 
            value={hostId}
            onChange={(e) => setHostId(e.target.value)}
            className="w-full bg-black border border-green-700 p-3 text-white rounded focus:outline-none focus:border-green-400"
            placeholder="Enter Host ID..."
          />
          <button onClick={connectToHost} className="w-full bg-green-700 hover:bg-green-600 transition-colors text-white font-bold py-3 rounded shadow-lg">
            CONNECT TO CLUSTER
          </button>
        </div>
      )}

      {/* Working Box */}
      {status === 'CONNECTED' && (
        <div className="w-full max-w-md mb-6 p-4 border border-green-800 rounded bg-black">
            <div className="flex justify-between items-center mb-2">
                 <span className="text-sm">CPU LOAD</span>
                 <span className="text-sm font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-800 h-4 rounded overflow-hidden">
                <div 
                    className="bg-green-500 h-full transition-all duration-200 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-xs text-green-600 mt-2 text-center animate-pulse">Running Heavy Math Calculations...</p>
        </div>
      )}

      {/* Logs Box */}
      <div className="w-full max-w-md h-64 flex flex-col bg-black p-2 rounded border border-gray-700 text-xs shadow-inner">
         <span className="text-gray-500 mb-2 border-b border-gray-800 pb-1">TERMINAL LOGS</span>
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-1">
            {logs.map((log, i) => <div key={i} className="hover:bg-green-900/20 px-1">{log}</div>)}
        </div>
      </div>
    </div>
  );
}
