'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRGenerator, QRScanner, Button, ThemeToggle } from '@/components';
import { QrCode, Scan } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');
  const [showDiagnostics, setShowDiagnostics] = useState(true);
  const [diagnosticsComplete, setDiagnosticsComplete] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<Array<{name: string, status: string}>>([]);

  useEffect(() => {
    // Auto-run diagnostics on page load
    const timer = setTimeout(() => {
      runDiagnostics();
    }, 1000); // Small delay for smooth UX

    return () => clearTimeout(timer);
  }, []);

  const runDiagnostics = async () => {
    const results = [];

    // WebRTC Support
    try {
      const pc = new RTCPeerConnection();
      pc.close();
      results.push({ name: 'WebRTC Support', status: 'passed' });
    } catch {
      results.push({ name: 'WebRTC Support', status: 'failed' });
    }

    // WebGL Support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      results.push({ name: 'WebGL Support', status: gl ? 'passed' : 'failed' });
    } catch {
      results.push({ name: 'WebGL Support', status: 'failed' });
    }

    // Service Workers
    results.push({
      name: 'Service Workers',
      status: 'serviceWorker' in navigator ? 'passed' : 'failed'
    });

    // IndexedDB Support
    results.push({
      name: 'IndexedDB Support',
      status: 'indexedDB' in window ? 'passed' : 'failed'
    });

    // Audio Context
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        audioContext.close();
        results.push({ name: 'Audio Context', status: 'passed' });
      } else {
        results.push({ name: 'Audio Context', status: 'failed' });
      }
    } catch {
      results.push({ name: 'Audio Context', status: 'failed' });
    }

    // Camera Permissions
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        results.push({ name: 'Camera Permissions', status: 'failed' });
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        results.push({ name: 'Camera Permissions', status: 'passed' });
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        results.push({ name: 'Camera Permissions', status: 'failed' });
      } else if (error.name === 'NotFoundError') {
        results.push({ name: 'Camera Permissions', status: 'skipped' });
      } else {
        results.push({ name: 'Camera Permissions', status: 'failed' });
      }
    }

    // Microphone Permissions
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        results.push({ name: 'Microphone Permissions', status: 'failed' });
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        results.push({ name: 'Microphone Permissions', status: 'passed' });
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        results.push({ name: 'Microphone Permissions', status: 'failed' });
      } else if (error.name === 'NotFoundError') {
        results.push({ name: 'Microphone Permissions', status: 'skipped' });
      } else {
        results.push({ name: 'Microphone Permissions', status: 'failed' });
      }
    }

    // Notification Permissions
    try {
      if (!('Notification' in window)) {
        results.push({ name: 'Notification Permissions', status: 'failed' });
      } else if (Notification.permission === 'granted') {
        results.push({ name: 'Notification Permissions', status: 'passed' });
      } else if (Notification.permission === 'denied') {
        results.push({ name: 'Notification Permissions', status: 'failed' });
      } else {
        // Request permission
        const permission = await Notification.requestPermission();
        results.push({
          name: 'Notification Permissions',
          status: permission === 'granted' ? 'passed' : 'failed'
        });
      }
    } catch {
      results.push({ name: 'Notification Permissions', status: 'failed' });
    }

    // Bot Detection
    const heuristics = [];
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 10));
    const endTime = performance.now();
    const timingVariance = endTime - startTime;
    heuristics.push(timingVariance > 15);

    let mouseMoved = false;
    const mouseHandler = () => { mouseMoved = true; };
    document.addEventListener('mousemove', mouseHandler, { once: true });
    await new Promise(resolve => setTimeout(resolve, 100));
    document.removeEventListener('mousemove', mouseHandler);
    heuristics.push(mouseMoved);

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      heuristics.push(!!gl);
    } catch {
      heuristics.push(false);
    }

    const concurrency = navigator.hardwareConcurrency || 1;
    heuristics.push(concurrency >= 2);

    const userAgent = navigator.userAgent.toLowerCase();
    const isBot = /bot|crawl|spider|scraper/i.test(userAgent);
    heuristics.push(!isBot);

    const humanScore = heuristics.filter(Boolean).length / heuristics.length;
    results.push({
      name: 'Bot Detection',
      status: humanScore >= 0.7 ? 'passed' : humanScore >= 0.4 ? 'skipped' : 'failed'
    });

    // Update state with results
    setDiagnosticResults(results);
    setTimeout(() => {
      setDiagnosticsComplete(true);
      setTimeout(() => {
        setShowDiagnostics(false);
      }, 2500);
    }, 100);
  };

  if (showDiagnostics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
        <div className="diagnostic-overlay">
          <style jsx>{`
            .diagnostic-overlay {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              width: 100%;
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border-radius: 20px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }

            .diagnostic-header {
              text-align: center;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.8);
              border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            }

            .diagnostic-loading {
              text-align: center;
              padding: 3rem 2rem;
            }

            .loading-spinner {
              width: 48px;
              height: 48px;
              border: 4px solid rgba(0, 122, 255, 0.2);
              border-top: 4px solid #007AFF;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 1.5rem;
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            .check-results {
              padding: 1rem;
            }

            .check-item {
              display: flex;
              align-items: center;
              padding: 1rem;
              margin: 0.5rem 0;
              background: rgba(255, 255, 255, 0.7);
              border-radius: 12px;
              border: 1px solid rgba(255, 255, 255, 0.5);
              transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }

            .check-item.show {
              opacity: 1;
              transform: translateY(0) scale(1);
            }

            .status-icon {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              margin-right: 1rem;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              flex-shrink: 0;
            }

            .status-passed { background: linear-gradient(135deg, #34C759, #30DB5B); }
            .status-failed { background: linear-gradient(135deg, #FF3B30, #FF453A); }
            .status-skipped { background: linear-gradient(135deg, #8E8E93, #98989D); }

            .summary {
              margin: 1rem;
              padding: 1.5rem;
              background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(52, 199, 89, 0.1));
              border-radius: 16px;
              text-align: center;
              border: 1px solid rgba(255, 255, 255, 0.3);
            }
          `}</style>

          <div className="diagnostic-header">
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1D1D1F', marginBottom: '0.5rem' }}>
              System Diagnostics
            </h1>
            <p style={{ color: '#86868B', fontSize: '0.875rem' }}>
              Checking your browser capabilities...
            </p>
          </div>

          {!diagnosticsComplete ? (
            <div className="diagnostic-loading">
              <div className="loading-spinner"></div>
              <p style={{ color: '#86868B', marginTop: '1rem' }}>Running diagnostics...</p>
            </div>
          ) : (
            <div className="check-results">
              {diagnosticResults.map((check, index) => (
                <div
                  key={check.name}
                  className={`check-item ${diagnosticsComplete ? 'show' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`status-icon status-${check.status}`}>
                    {check.status === 'passed' ? '✓' : check.status === 'failed' ? '✕' : '○'}
                  </div>
                  <div style={{ flex: 1, fontWeight: '500', color: '#1D1D1F' }}>
                    {check.name}
                  </div>
                </div>
              ))}

              <div className="summary">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1D1D1F' }}>
                  Diagnostics Complete
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-around', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#34C759' }}>
                      {diagnosticResults.filter(r => r.status === 'passed').length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Passed</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#FF3B30' }}>
                      {diagnosticResults.filter(r => r.status === 'failed').length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Failed</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#8E8E93' }}>
                      {diagnosticResults.filter(r => r.status === 'skipped').length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>Skipped</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 dark:bg-black py-8 px-4"
      >
        <ThemeToggle />
        <div className="max-w-md mx-auto">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              FAQR
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Fast QR Code Helper
            </p>
          </motion.header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex gap-3 mb-8 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-inner"
          >
            <Button
              onClick={() => setActiveTab('generate')}
              variant={activeTab === 'generate' ? 'primary' : 'secondary'}
              className={`flex-1 transition-all duration-300 ${
                activeTab === 'generate'
                  ? 'shadow-2xl scale-105 ring-4 ring-blue-500/20'
                  : 'hover:scale-102'
              }`}
            >
              <QrCode className="w-5 h-5 mr-3" />
              <span className="font-semibold">Generate QR</span>
            </Button>
            <Button
              onClick={() => setActiveTab('scan')}
              variant={activeTab === 'scan' ? 'primary' : 'secondary'}
              className={`flex-1 transition-all duration-300 ${
                activeTab === 'scan'
                  ? 'shadow-2xl scale-105 ring-4 ring-blue-500/20'
                  : 'hover:scale-102'
              }`}
            >
              <Scan className="w-5 h-5 mr-3" />
              <span className="font-semibold">Scan QR</span>
            </Button>
          </motion.div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'generate' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'generate' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'generate' ? <QRGenerator /> : <QRScanner />}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
