import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({
  variant = 'auto',
  className = '',
  showText = true,
  size = 'md',
}: LogoProps) {
  const isDarkBg = variant === 'dark';
  const textColor = isDarkBg
    ? 'text-white'
    : variant === 'light'
    ? 'text-neutral-900'
    : 'text-neutral-900 dark:text-white';

  const badgeSize =
    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const iconSize =
    size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const fontSize =
    size === 'sm'
      ? 'text-xs'
      : size === 'lg'
      ? 'text-lg tracking-wider'
      : 'text-sm tracking-wide';

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight select-none group ${className}`}
    >
      {/* Official Palette Hubb Bag Emblem */}
      <div
        className={`${badgeSize} rounded-xl bg-white text-black shadow-sm flex items-center justify-center p-1 border border-neutral-200/40 transition-transform duration-200 group-hover:scale-105`}
      >
        <div className="w-full h-full rounded-lg bg-black flex items-center justify-center text-white relative">
          <svg
            className={`${iconSize}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
            {/* Discount / Tag dot inside */}
            <circle cx="12" cy="15" r="1.2" fill="currentColor" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className={`flex flex-col leading-none ${textColor}`}>
          <span className={`font-black uppercase tracking-widest ${fontSize}`}>
            PALETTE
          </span>
          <span className={`font-black uppercase tracking-widest ${fontSize}`}>
            HUBB
          </span>
        </div>
      )}
    </Link>
  );
}
