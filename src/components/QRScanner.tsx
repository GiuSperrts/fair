'use client';

import { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button, Card } from './index';
import { Camera, CameraOff, Scan, Copy, X } from 'lucide-react';

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) {
      setError('Video element not found');
      return;
    }

    try {
      setError(null);
      setResult(null);

      // Check if we're on HTTPS (required for camera access)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setError('Camera access requires HTTPS. Please use HTTPS or localhost.');
        toast.error('Camera access requires HTTPS');
        return;
      }

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          setResult(result.data);
          stopScanning();

          // Play success sound
          playScanSound();

          toast.success('QR code scanned successfully!');
        },
        {
          onDecodeError: (err) => {
            // Only log occasional decode errors, not all of them
            if (Math.random() < 0.01) {
              console.log('QR decode error (normal):', err);
            }
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
      setIsScanning(true);
      toast.success('Camera started - point at a QR code');

      // Verify camera is actually streaming
      setTimeout(() => {
        if (videoRef.current && videoRef.current.videoWidth === 0) {
          console.warn('Camera stream may not be active');
        }
      }, 1000);

    } catch (err: any) {
      console.error('Scanner error:', err);
      const errorMessage = err?.name === 'NotAllowedError'
        ? 'Camera access denied. Please allow camera permissions and try again.'
        : err?.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : err?.name === 'NotSupportedError'
        ? 'Camera not supported on this device.'
        : err?.message || 'Failed to start camera. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const copyToClipboard = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        toast.success('Copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
      }
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
    toast.success('Cleared!');
  };

  const playScanSound = () => {
    try {
      // Create a pleasant scan success sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Play a pleasant ascending tone
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Silently fail if audio context is not available
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Scan className="w-6 h-6 text-apple-blue" />
        <h2 className="text-xl font-semibold">Scan QR Code</h2>
      </div>

      <div className="space-y-4">
        <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
            style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
              <CameraOff className="w-12 h-12 text-gray-400" />
            </div>
          )}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 border-2 border-white border-opacity-50 rounded-lg relative">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-white rounded-tl"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-white rounded-tr"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-white rounded-bl"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-white rounded-br"></div>
                  {/* Animated scanning line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
                </div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
                Point camera at QR code
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="flex-1">
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            {error.includes('HTTPS') && (
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Camera access requires a secure connection (HTTPS)
              </p>
            )}
            {error.includes('denied') && (
              <p className="text-xs text-gray-500 mt-1">
                💡 Tip: Check your browser settings to allow camera access
              </p>
            )}
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-sm font-medium mb-1">Scanned Result:</p>
              <p className="text-green-700 dark:text-green-300 break-all">{result}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="secondary" size="small" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button onClick={clearResult} variant="destructive" size="small">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}