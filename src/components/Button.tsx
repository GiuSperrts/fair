import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseClasses = 'rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 border-2';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-apple-blue to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:from-blue-700 active:to-blue-800 border-apple-blue hover:border-blue-600 shadow-blue-500/25',
    secondary: 'bg-gradient-to-r from-apple-light-gray to-gray-200 text-apple-dark-gray hover:from-gray-200 hover:to-gray-300 active:from-gray-300 active:to-gray-400 border-gray-300 hover:border-gray-400 shadow-gray-400/25 dark:from-gray-600 dark:to-gray-500 dark:text-white dark:border-gray-500 dark:hover:border-gray-400',
    destructive: 'bg-gradient-to-r from-apple-red to-red-600 text-white hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 border-apple-red hover:border-red-600 shadow-red-500/25',
  };

  const sizeClasses = {
    small: 'px-5 py-2.5 text-sm min-h-[40px]',
    medium: 'px-7 py-3.5 text-base min-h-[48px]',
    large: 'px-9 py-4.5 text-lg min-h-[56px]',
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}