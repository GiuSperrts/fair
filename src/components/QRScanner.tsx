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
    if (!videoRef.current) return;

    try {
      setError(null);
      setResult(null);

      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          setResult(result.data);
          stopScanning();
          toast.success('QR code scanned successfully!');
        },
        {
          onDecodeError: (err) => {
            // Ignore decode errors, they're normal
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      scannerRef.current = scanner;
      await scanner.start();
      setIsScanning(true);
      toast.success('Camera started - point at a QR code');
    } catch (err: any) {
      const errorMessage = err?.name === 'NotAllowedError'
        ? 'Camera access denied. Please allow camera permissions and try again.'
        : err?.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : 'Failed to start camera. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error starting scanner:', err);
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
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
              <CameraOff className="w-12 h-12 text-gray-400" />
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