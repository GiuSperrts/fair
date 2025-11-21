'use client';

import { useState, useEffect } from 'react';

interface DiagnosticResult {
  name: string;
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  message: string;
  details?: string;
}

export default function DiagnosticModule() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const checks = [
    { name: 'WebRTC Support', check: checkWebRTC },
    { name: 'WebGL Support', check: checkWebGL },
    { name: 'Service Workers', check: checkServiceWorkers },
    { name: 'IndexedDB Support', check: checkIndexedDB },
    { name: 'Audio Context', check: checkAudioContext },
    { name: 'Camera Permissions', check: checkCameraPermissions },
    { name: 'Microphone Permissions', check: checkMicrophonePermissions },
    { name: 'Notification Permissions', check: checkNotificationPermissions },
    { name: 'Bot Detection', check: checkBotDetection },
  ];

  useEffect(() => {
    runDiagnostics();
  }, []);

  async function runDiagnostics() {
    setIsRunning(true);
    setResults(checks.map(check => ({ name: check.name, status: 'pending', message: 'Checking...' })));

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      try {
        const result = await check.check();
        setResults(prev => prev.map((r, idx) =>
          idx === i ? result : r
        ));
        // Add delay for visual effect
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        setResults(prev => prev.map((r, idx) =>
          idx === i ? { name: check.name, status: 'failed', message: 'Check failed', details: error instanceof Error ? error.message : 'Unknown error' } : r
        ));
      }
    }

    setIsRunning(false);
    setIsComplete(true);
  }

  const passedCount = results.filter(r => r.status === 'passed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;

  return (
    <div className="diagnostic-module">
      <style jsx>{`
        .diagnostic-module {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(0, 122, 255, 0.3);
          border-top: 3px solid #007AFF;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .check-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          margin: 0.5rem 0;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          transform: translateY(20px);
        }

        .check-item.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .status-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin-right: 1rem;
          transition: all 0.3s ease;
        }

        .status-pending { background: #FF9500; }
        .status-passed { background: #34C759; }
        .status-failed { background: #FF3B30; }
        .status-skipped { background: #8E8E93; }

        .summary {
          margin-top: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(52, 199, 89, 0.1));
          border-radius: 16px;
          text-align: center;
        }

        .summary-stats {
          display: flex;
          justify-content: space-around;
          margin-top: 1rem;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 600;
          display: block;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #666;
          margin-top: 0.25rem;
        }
      `}</style>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1D1D1F' }}>
          System Diagnostics
        </h2>
        <p style={{ color: '#86868B', fontSize: '0.875rem' }}>
          Checking your browser capabilities...
        </p>
      </div>

      {isRunning && (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: '#86868B' }}>Running diagnostics...</p>
        </div>
      )}

      <div className="checks-list">
        {results.map((result, index) => (
          <div
            key={result.name}
            className={`check-item ${result.status !== 'pending' ? 'animate-in' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`status-icon status-${result.status}`}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '500', color: '#1D1D1F' }}>{result.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#86868B', marginTop: '0.25rem' }}>
                {result.message}
              </div>
              {result.details && (
                <div style={{ fontSize: '0.75rem', color: '#FF3B30', marginTop: '0.25rem' }}>
                  {result.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isComplete && (
        <div className="summary">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1D1D1F' }}>
            Diagnostics Complete
          </h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-number" style={{ color: '#34C759' }}>{passedCount}</span>
              <div className="stat-label">Passed</div>
            </div>
            <div className="stat">
              <span className="stat-number" style={{ color: '#FF3B30' }}>{failedCount}</span>
              <div className="stat-label">Failed</div>
            </div>
            <div className="stat">
              <span className="stat-number" style={{ color: '#8E8E93' }}>{skippedCount}</span>
              <div className="stat-label">Skipped</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Diagnostic check functions
async function checkWebRTC(): Promise<DiagnosticResult> {
  try {
    const pc = new RTCPeerConnection();
    pc.close();
    return { name: 'WebRTC Support', status: 'passed', message: 'WebRTC is supported' };
  } catch {
    return { name: 'WebRTC Support', status: 'failed', message: 'WebRTC not supported' };
  }
}

async function checkWebGL(): Promise<DiagnosticResult> {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      return { name: 'WebGL Support', status: 'passed', message: 'WebGL is supported' };
    }
    return { name: 'WebGL Support', status: 'failed', message: 'WebGL not supported' };
  } catch {
    return { name: 'WebGL Support', status: 'failed', message: 'WebGL check failed' };
  }
}

async function checkServiceWorkers(): Promise<DiagnosticResult> {
  if ('serviceWorker' in navigator) {
    return { name: 'Service Workers', status: 'passed', message: 'Service Workers supported' };
  }
  return { name: 'Service Workers', status: 'failed', message: 'Service Workers not supported' };
}

async function checkIndexedDB(): Promise<DiagnosticResult> {
  if ('indexedDB' in window) {
    return { name: 'IndexedDB Support', status: 'passed', message: 'IndexedDB is supported' };
  }
  return { name: 'IndexedDB Support', status: 'failed', message: 'IndexedDB not supported' };
}

async function checkAudioContext(): Promise<DiagnosticResult> {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const audioContext = new AudioContext();
      audioContext.close();
      return { name: 'Audio Context', status: 'passed', message: 'Audio Context supported' };
    }
    return { name: 'Audio Context', status: 'failed', message: 'Audio Context not supported' };
  } catch {
    return { name: 'Audio Context', status: 'failed', message: 'Audio Context check failed' };
  }
}

async function checkCameraPermissions(): Promise<DiagnosticResult> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { name: 'Camera Permissions', status: 'failed', message: 'Camera API not supported' };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());

    return { name: 'Camera Permissions', status: 'passed', message: 'Camera access granted' };
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      return { name: 'Camera Permissions', status: 'failed', message: 'Camera access denied', details: 'Please allow camera access in your browser settings' };
    }
    if (error.name === 'NotFoundError') {
      return { name: 'Camera Permissions', status: 'skipped', message: 'No camera detected' };
    }
    return { name: 'Camera Permissions', status: 'failed', message: 'Camera check failed', details: error.message };
  }
}

async function checkMicrophonePermissions(): Promise<DiagnosticResult> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { name: 'Microphone Permissions', status: 'failed', message: 'Audio API not supported' };
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());

    return { name: 'Microphone Permissions', status: 'passed', message: 'Microphone access granted' };
  } catch (error: any) {
    if (error.name === 'NotAllowedError') {
      return { name: 'Microphone Permissions', status: 'failed', message: 'Microphone access denied', details: 'Please allow microphone access in your browser settings' };
    }
    if (error.name === 'NotFoundError') {
      return { name: 'Microphone Permissions', status: 'skipped', message: 'No microphone detected' };
    }
    return { name: 'Microphone Permissions', status: 'failed', message: 'Microphone check failed', details: error.message };
  }
}

async function checkNotificationPermissions(): Promise<DiagnosticResult> {
  try {
    if (!('Notification' in window)) {
      return { name: 'Notification Permissions', status: 'failed', message: 'Notifications not supported' };
    }

    if (Notification.permission === 'granted') {
      return { name: 'Notification Permissions', status: 'passed', message: 'Notifications enabled' };
    }

    if (Notification.permission === 'denied') {
      return { name: 'Notification Permissions', status: 'failed', message: 'Notifications blocked', details: 'Please enable notifications in your browser settings' };
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return { name: 'Notification Permissions', status: 'passed', message: 'Notifications enabled' };
    } else {
      return { name: 'Notification Permissions', status: 'failed', message: 'Notifications denied', details: 'Notifications are required for some features' };
    }
  } catch (error: any) {
    return { name: 'Notification Permissions', status: 'failed', message: 'Notification check failed', details: error.message };
  }
}

async function checkBotDetection(): Promise<DiagnosticResult> {
  const heuristics = [];

  // Timing check - bots often execute too quickly
  const startTime = performance.now();
  await new Promise(resolve => setTimeout(resolve, 10));
  const endTime = performance.now();
  const timingVariance = endTime - startTime;
  heuristics.push(timingVariance > 15); // Should be around 10-15ms for humans

  // Mouse entropy - check if mouse has moved
  let mouseMoved = false;
  const mouseHandler = () => { mouseMoved = true; };
  document.addEventListener('mousemove', mouseHandler, { once: true });
  await new Promise(resolve => setTimeout(resolve, 100));
  document.removeEventListener('mousemove', mouseHandler);
  heuristics.push(mouseMoved);

  // WebGL fingerprint presence
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    heuristics.push(!!gl);
  } catch {
    heuristics.push(false);
  }

  // Concurrency check - bots often have limited concurrency
  const concurrency = navigator.hardwareConcurrency || 1;
  heuristics.push(concurrency >= 2);

  // User agent check - basic bot detection
  const userAgent = navigator.userAgent.toLowerCase();
  const isBot = /bot|crawl|spider|scraper/i.test(userAgent);
  heuristics.push(!isBot);

  const humanScore = heuristics.filter(Boolean).length / heuristics.length;

  if (humanScore >= 0.7) {
    return { name: 'Bot Detection', status: 'passed', message: 'Human interaction detected' };
  } else if (humanScore >= 0.4) {
    return { name: 'Bot Detection', status: 'skipped', message: 'Uncertain detection result' };
  } else {
    return { name: 'Bot Detection', status: 'failed', message: 'Automated interaction suspected' };
  }
}