'use client';

import { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button, Card } from './index';
import { Download, QrCode, X, Share2 } from 'lucide-react';

export default function QRGenerator() {
  const [text, setText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      toast.error('Please enter some text to generate a QR code');
      return;
    }

    if (trimmedText.length > 1000) {
      toast.error('Text is too long. Please keep it under 1000 characters');
      return;
    }

    setIsGenerating(true);
    try {
      const url = await QRCode.toDataURL(trimmedText, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCodeUrl;
    link.click();
    toast.success('QR code downloaded!');
  };

  const shareQR = async () => {
    if (!qrCodeUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR code I generated!',
          files: [file],
        });
        toast.success('QR code shared!');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        toast.success('QR code copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share QR code');
    }
  };

  const clearAll = () => {
    setText('');
    setQrCodeUrl(null);
    toast.success('Cleared!');
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-6 h-6 text-apple-blue" />
        <h2 className="text-xl font-semibold">Generate QR Code</h2>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text, URL, or any content..."
            className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-apple-dark-gray text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-apple-blue focus:border-transparent resize-none"
            rows={3}
          />
          {text && (
            <button
              onClick={() => setText('')}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={generateQR} disabled={!text.trim() || isGenerating} className="flex-1">
            {isGenerating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
              />
            ) : (
              <QrCode className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
          <Button onClick={clearAll} variant="secondary" size="small">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {qrCodeUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="p-4 bg-white rounded-lg shadow-inner">
              <img src={qrCodeUrl} alt="Generated QR Code" className="w-48 h-48" />
            </div>

            <div className="flex gap-2">
              <Button onClick={downloadQR} variant="secondary" size="small" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={shareQR} variant="secondary" size="small" className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}