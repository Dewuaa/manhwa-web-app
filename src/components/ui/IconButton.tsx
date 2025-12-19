'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'ghost' | 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export default function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  active = false,
  className = '',
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const variantClasses = {
    ghost: `text-gray-400 hover:text-white hover:bg-white/5 ${active ? 'text-white bg-white/10' : ''}`,
    filled: `bg-white/10 text-white hover:bg-white/15 ${active ? 'bg-pink-600 hover:bg-pink-700' : ''}`,
    outline: `border border-white/10 text-gray-400 hover:text-white hover:border-white/20 ${active ? 'border-pink-500 text-pink-500' : ''}`,
  };

  return (
    <button
      className={`rounded-xl transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
