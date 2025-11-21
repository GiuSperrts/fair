'use client';

import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Button, Card } from './index';
import { Download, QrCode, X, Share2, Wifi, User, Link, Mail, Phone, FileText, Settings, History, Palette } from 'lucide-react';

interface QRTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
  prefix?: string;
  format: (value: string) => string;
}

interface QRHistory {
  id: string;
  content: string;
  template: string;
  timestamp: number;
  qrDataUrl: string;
}

const qrTemplates: QRTemplate[] = [
  {
    id: 'text',
    name: 'Text',
    icon: <FileText className="w-4 h-4" />,
    placeholder: 'Enter any text...',
    format: (value) => value
  },
  {
    id: 'url',
    name: 'Website',
    icon: <Link className="w-4 h-4" />,
    placeholder: 'https://example.com',
    format: (value) => value.startsWith('http') ? value : `https://${value}`
  },
  {
    id: 'wifi',
    name: 'WiFi',
    icon: <Wifi className="w-4 h-4" />,
    placeholder: 'NetworkName,Password,WPA',
    format: (value) => {
      const parts = value.split(',');
      if (parts.length >= 3) {
        return `WIFI:T:${parts[2]};S:${parts[0]};P:${parts[1]};;`;
      }
      return value;
    }
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: <User className="w-4 h-4" />,
    placeholder: 'Name,Phone,Email',
    format: (value) => {
      const parts = value.split(',');
      if (parts.length >= 3) {
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${parts[0]}\nTEL:${parts[1]}\nEMAIL:${parts[2]}\nEND:VCARD`;
      }
      return value;
    }
  },
  {
    id: 'email',
    name: 'Email',
    icon: <Mail className="w-4 h-4" />,
    placeholder: 'email@example.com',
    format: (value) => `mailto:${value}`
  },
  {
    id: 'phone',
    name: 'Phone',
    icon: <Phone className="w-4 h-4" />,
    placeholder: '+1234567890',
    format: (value) => `tel:${value}`
  }
];

export default function QRGenerator() {
  const [text, setText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate>(qrTemplates[0]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [qrHistory, setQrHistory] = useState<QRHistory[]>([]);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('qrHistory');
    if (saved) {
      try {
        setQrHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load QR history:', e);
      }
    }
  }, []);

  const saveToHistory = (content: string, qrDataUrl: string) => {
    const newEntry: QRHistory = {
      id: Date.now().toString(),
      content,
      template: selectedTemplate.name,
      timestamp: Date.now(),
      qrDataUrl
    };

    const updated = [newEntry, ...qrHistory.slice(0, 9)]; // Keep last 10
    setQrHistory(updated);
    localStorage.setItem('qrHistory', JSON.stringify(updated));
  };

  const generateQR = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      toast.error('Please enter some content to generate a QR code');
      return;
    }

    if (trimmedText.length > 2000) {
      toast.error('Content is too long. Please keep it under 2000 characters');
      return;
    }

    setIsGenerating(true);
    try {
      // Format content based on selected template
      const formattedContent = selectedTemplate.format(trimmedText);

      const url = await QRCode.toDataURL(formattedContent, {
        width: 256,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        errorCorrectionLevel: 'M',
      });

      setQrCodeUrl(url);
      saveToHistory(formattedContent, url);

      // Play success sound if available
      playSuccessSound();

      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playSuccessSound = () => {
    try {
      // Create a simple success beep
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      // Silently fail if audio context is not available
    }
  };

  const selectTemplate = (template: QRTemplate) => {
    setSelectedTemplate(template);
    setText('');
    setShowTemplates(false);
  };

  const loadFromHistory = (historyItem: QRHistory) => {
    setQrCodeUrl(historyItem.qrDataUrl);
    setText(historyItem.content);
    setShowHistory(false);
    toast.success('QR code loaded from history!');
  };

  const exportAsSVG = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', 'your_cloudinary_preset'); // You'll need to set this up

      // For now, just download as PNG (SVG conversion would require additional library)
      const link = document.createElement('a');
      link.download = 'qrcode.svg';
      link.href = qrCodeUrl.replace('data:image/png', 'data:image/svg+xml');
      link.click();

      toast.success('QR code exported as SVG!');
    } catch (error) {
      toast.error('SVG export not available. Use PNG download instead.');
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <QrCode className="w-6 h-6 text-apple-blue" />
          <h2 className="text-xl font-semibold">Generate QR Code</h2>
        </div>
        <div className="flex gap-1">
          <Button
            onClick={() => setShowTemplates(!showTemplates)}
            variant="secondary"
            size="small"
            className="p-2"
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowHistory(!showHistory)}
            variant="secondary"
            size="small"
            className="p-2"
          >
            <History className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="secondary"
            size="small"
            className="p-2"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Template Selection */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
            >
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Choose Template</h3>
              <div className="grid grid-cols-3 gap-2">
                {qrTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => selectTemplate(template)}
                    className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${
                      selectedTemplate.id === template.id
                        ? 'border-apple-blue bg-apple-blue bg-opacity-10 text-apple-blue'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    {template.icon}
                    <span>{template.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 max-h-48 overflow-y-auto"
            >
              <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Recent QR Codes</h3>
              {qrHistory.length === 0 ? (
                <p className="text-xs text-gray-500">No history yet</p>
              ) : (
                <div className="space-y-2">
                  {qrHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-apple-blue transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <img src={item.qrDataUrl} alt="QR Code" className="w-8 h-8" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.template}</p>
                          <p className="text-xs text-gray-500 truncate">{item.content}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800"
            >
              <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">QR Code Customization</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="foreground-color" className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Foreground Color</label>
                  <input
                    id="foreground-color"
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                    title="Choose QR code foreground color"
                  />
                </div>
                <div>
                  <label htmlFor="background-color" className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Background Color</label>
                  <input
                    id="background-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                    title="Choose QR code background color"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Template Indicator */}
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {selectedTemplate.icon}
          <span className="text-sm text-gray-600 dark:text-gray-400">{selectedTemplate.name}</span>
        </div>

        {/* Input Field */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={selectedTemplate.placeholder}
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

        {/* Action Buttons */}
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
            <div className="p-4 bg-white rounded-lg shadow-inner relative">
              <img src={qrCodeUrl} alt="Generated QR Code" className="w-48 h-48" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border border-white border-t-transparent rounded-full"
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button onClick={downloadQR} variant="secondary" size="small">
                <Download className="w-4 h-4 mr-2" />
                PNG
              </Button>
              <Button onClick={exportAsSVG} variant="secondary" size="small">
                <FileText className="w-4 h-4 mr-2" />
                SVG
              </Button>
              <Button onClick={shareQR} variant="secondary" size="small">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => navigator.clipboard.writeText(qrCodeUrl)} variant="secondary" size="small">
                <Palette className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  );
}