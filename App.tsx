import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { TerminalLine, BootState } from './types';
import { DECRYPTION_PHRASES, HELP_TEXT } from './constants';

// Obfuscation helpers
const verifyChecksum = (str: string): boolean => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash === 3094713; // Checksum for the secret password
};

const decodeData = (str: string): string => {
  try {
    return atob(str);
  } catch (e) {
    return "";
  }
};

const DecryptionEffect: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const completedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          if (!completedRef.current) {
            completedRef.current = true;
            // Small delay before triggering completion to ensure render catches up
            setTimeout(onComplete, 500); 
          }
          return 100;
        }
        // Random increment between 1 and 4 percent
        return Math.min(prev + (Math.random() * 3 + 1), 100);
      });

      // Randomly add a log line
      if (Math.random() > 0.5) {
        const randomPhrase = DECRYPTION_PHRASES[Math.floor(Math.random() * DECRYPTION_PHRASES.length)];
        setLogs(prev => [...prev.slice(-4), `> ${randomPhrase}`]); // Keep last 5 lines
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  const width = 30;
  const filled = Math.floor((progress / 100) * width);
  const bar = '[' + '='.repeat(filled) + '-'.repeat(width - filled) + ']';

  return (
    <div className="my-2 font-mono text-green-400">
      <div className="mb-2 h-32 overflow-hidden flex flex-col justify-end">
        {logs.map((log, i) => (
          <div key={i} className="opacity-80">{log}</div>
        ))}
      </div>
      <div className="font-bold">
        {bar} {Math.floor(progress)}%
      </div>
      <div className="text-xs mt-1 animate-pulse">
        {progress < 100 ? "PROCESSING..." : "COMPLETE"}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [bootState, setBootState] = useState<BootState>(BootState.LOADING);
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever history changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, bootState, isProcessing]);

  // Focus input on click
  const handleContainerClick = () => {
    if (bootState === BootState.READY && !isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Boot sequence simulation
  useEffect(() => {
    const sequence = async () => {
      // Step 1: Loading
      setHistory([{ id: 'boot-1', type: 'system', content: 'Loading kernel...' }]);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 1.5: Detailed boot logs and crash simulation
      const bootLogs = [
        "Verifying file system integrity... OK",
        "Mounting /dev/sda1 [READ-ONLY]... OK",
        "Loading drivers: HID, STORAGE, NET... OK",
        "Initializing gift_registry_v2.0... FAILED",
        "WARN: Checksum mismatch in sector 9",
        "Trying fallback recovery mode...",
        "ACCESS VIOLATION at address 0x0000FFFF",
        "CRITICAL ERROR: KERNEL PANIC - NOT SYNCING",
        "Dumping physical memory to disk..."
      ];

      for (const log of bootLogs) {
        const isError = log.includes("FAILED") || log.includes("ERROR") || log.includes("PANIC") || log.includes("VIOLATION");
        const isWarn = log.includes("WARN");
        
        setHistory(prev => [...prev, { 
          id: Math.random().toString(36).substr(2, 9), 
          type: 'system', 
          content: <span className={isError ? "text-red-500" : isWarn ? "text-yellow-400" : "text-gray-400"}>{log}</span>
        }]);
        
        // Random delay to simulate processing speed
        await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 50));
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));

      // Step 2: Main Error Message
      setHistory(prev => [...prev, { id: 'boot-2', type: 'error', content: 'Error! System crashed.' }]);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Emergency Shell
      setHistory(prev => [...prev, { id: 'boot-3', type: 'system', content: 'Dropping to emergency shell.' }]);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 4: Personal Greeting
      setHistory(prev => [...prev, { id: 'boot-4', type: 'system', content: <span className="text-blue-400">Identity verified: Vyshak detected. Welcome back, Administrator.</span> }]);
      await new Promise(resolve => setTimeout(resolve, 300));

      setBootState(BootState.READY);
      
      // Auto-focus input after boot
      setTimeout(() => {
          if (inputRef.current) inputRef.current.focus();
      }, 100);
    };

    sequence();
  }, []);

  const addToHistory = (content: React.ReactNode, type: 'output' | 'error' | 'system' = 'output') => {
    setHistory(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content
    }]);
  };

  const handleDecryptionComplete = () => {
    setIsProcessing(false);
    // Secret messages encoded to prevent source code inspection
    const h1 = decodeData("R2lmdCBsb2NhdGlvbiBkZWNpcGhlcmVkIQ==");
    const p1 = decodeData("TmF2aWdhdGUgdG8gdGhlIEhSIE1hbmFnZXIgYW5kIHdoaXNwZXIgdGhpcyBhY2Nlc3MgY29kZTo=");
    const code = decodeData("UVVBQ0sgUVVBQ0sgUVVBQ0s=");

    addToHistory(
      <div className="whitespace-pre-wrap font-bold text-green-400 mt-4">
        <div className="text-xl animate-pulse text-green-300">{h1}</div>
        <div className="mt-4 border border-green-800 p-4 bg-green-900/20">
          {p1} <span className="font-bold text-white bg-green-900 px-2 inline-block">{code}</span>
        </div>
      </div>
    );
    // Refocus input after completion if user wants to type more
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const triggerSelfDestruct = async () => {
    setIsProcessing(true);
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    addToHistory('CRITICAL ALERT: MAXIMUM FAILED ATTEMPTS EXCEEDED.', 'error');
    await delay(1000);
    
    addToHistory('SECURITY PROTOCOL 666 INITIATED.', 'error');
    await delay(1000);

    addToHistory('PURGING SYSTEM KERNEL...', 'error');
    await delay(1200);
    
    addToHistory('DELETING GIFT REGISTRY...', 'error');
    await delay(1200);

    addToHistory('FORMATTING DRIVE C:...', 'error');
    await delay(1500);

    addToHistory('SYSTEM HALTED.', 'error');
    await delay(1000);

    setBootState(BootState.DESTROYED);
  };

  const handleCommand = (cmdOriginal: string) => {
    const cmd = cmdOriginal.trim();
    const args = cmd.split(' ');
    const mainCmd = args[0].toLowerCase();

    // Echo the command to history
    setHistory(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type: 'input',
      content: isPasswordMode ? '********' : cmdOriginal,
      prompt: isPasswordMode ? 'Enter Bio_Scan Code:' : 'vyshak@santa-server:~$'
    }]);

    if (isPasswordMode) {
      // Check password using checksum to prevent looking up the answer in the source code
      if (verifyChecksum(cmd.toLowerCase())) {
        setIsProcessing(true);
        addToHistory(
          <DecryptionEffect onComplete={handleDecryptionComplete} />
        );
        setFailedAttempts(0);
      } else {
        const newFailures = failedAttempts + 1;
        setFailedAttempts(newFailures);
        addToHistory('Access Denied.', 'error');
        
        if (newFailures >= 5) {
          triggerSelfDestruct();
        } else {
          addToHistory('⚠️ WARNING: Self-destruct protocol armed.', 'error');
          addToHistory(`${5 - newFailures} attempts remaining before system purge.`, 'error');
        }
      }
      
      // Keep password mode active unless we are destructing, 
      // but exit if successful (handled in effect) or if user wants to abort (not implemented, but good UX to stay in mode)
      // Actually, standard behavior is to exit password prompt on failure in this specific game loop logic 
      // to let them use other commands or try sudo again? 
      // Let's stick to existing logic: exit mode on failure/success to allow other commands.
      if (verifyChecksum(cmd.toLowerCase())) {
         // Success path handled above
      } else {
         setIsPasswordMode(false); 
      }
      return;
    }

    if (!cmd) return;

    switch (mainCmd) {
      case 'help':
        addToHistory(<div className="whitespace-pre-wrap">{HELP_TEXT}</div>);
        break;
      
      case 'clear':
        setHistory([]);
        break;

      case 'ls':
        addToHistory(
          <div className="flex gap-8">
            <span className="text-blue-400">README.txt</span>
            <span className="text-blue-400">biological_scan.log</span>
          </div>
        );
        break;

      case 'whoami':
        addToHistory('vyshak');
        break;

      case 'cat':
        if (args.length < 2) {
          addToHistory('Usage: cat [filename]', 'error');
        } else {
          const filename = args[1];
          if (filename === 'README.txt') {
            addToHistory('The gift location is corrupted. You need to run the recovery tool.');
          } else if (filename === 'biological_scan.log') {
            addToHistory(
              <div className="whitespace-pre-wrap">
{`ENTITY_ID: 8008
Class: Avian
Habitat: Aquatic & Terrestrial
Audio Output: "Quack"
Movement Style: Waddle
Special Feature: Hydrophobic feathers
Identify this creature.`}
              </div>
            );
          } else {
            addToHistory(`cat: ${filename}: No such file or directory`, 'error');
          }
        }
        break;

      case 'sudo':
        if (args[1] === 'recover_gift') {
          setIsPasswordMode(true);
        } else {
          addToHistory(`sudo: ${args[1] || ''}: command not found. Try: recover_gift`, 'error');
        }
        break;

      default:
        addToHistory(
          <div>
            <div>🚫 ACCESS DENIED: Security clearance insufficient to execute '{mainCmd}'.</div>
            <div className="mt-1 text-green-500 opacity-80 text-sm">
              &gt; SYSTEM HINT: Type 'help' to view authorized commands.
            </div>
          </div>, 
          'error'
        );
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  if (bootState === BootState.DESTROYED) {
    return (
      <div className="min-h-screen bg-black text-red-600 font-mono flex flex-col items-center justify-center p-4">
        <h1 className="text-6xl md:text-9xl font-bold mb-4 animate-pulse text-center">FATAL ERROR</h1>
        <div className="text-2xl md:text-4xl mb-8 text-center border-t-2 border-b-2 border-red-600 py-4">SYSTEM DESTROYED</div>
        <p className="text-lg animate-bounce">Please contact your administrator.</p>
        <div className="mt-12 opacity-50 text-sm font-mono text-center">
          <p>STOP: 0x0000DEAD (0xBAD, 0xF00D, 0xDEAD, 0xBEEF)</p>
          <p>SANTA_OS_CRASH_DUMP_COMPLETE</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8 text-lg md:text-xl selection:bg-green-900 selection:text-white"
      onClick={handleContainerClick}
      style={{ fontFamily: "'Fira Code', 'VT323', monospace" }}
    >
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Output History */}
        <div className="space-y-1 mb-2 break-words">
          {history.map((line) => (
            <div key={line.id} className={`${line.type === 'error' ? 'text-red-500' : 'text-green-500'} glow-text`}>
              {line.type === 'input' && (
                <span className="mr-3 opacity-80 text-blue-400">{line.prompt || 'vyshak@santa-server:~$'}</span>
              )}
              {line.content}
            </div>
          ))}
        </div>

        {/* Active Input Line - Hidden during processing */}
        {bootState === BootState.READY && !isProcessing && (
          <div className="flex items-center">
            <span className="mr-3 text-blue-400 shrink-0 glow-text">
              {isPasswordMode ? 'Enter Bio_Scan Code:' : 'vyshak@santa-server:~$'}
            </span>
            <div className="relative flex-grow">
              <input
                ref={inputRef}
                type={isPasswordMode ? "password" : "text"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none outline-none text-green-500 font-mono p-0 m-0 glow-text caret-transparent"
                autoComplete="off"
                autoFocus
              />
              {/* Custom blinking cursor to simulate block cursor */}
              <span 
                className="absolute top-0 pointer-events-none animate-pulse bg-green-500 text-black px-0.5"
                style={{ left: `${input.length}ch` }}
              >
                &nbsp;
              </span>
            </div>
          </div>
        )}
        
        {/* Processing Indicator (optional replacement for input line if desired, but we have the DecryptionEffect above) */}
        {isProcessing && (
           <div className="h-6 w-full animate-pulse bg-green-900/30"></div>
        )}

        {/* Bottom anchor for scrolling */}
        <div ref={scrollRef} />
      </div>
    </div>
  );
};

export default App;