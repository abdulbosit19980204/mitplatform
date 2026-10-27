'use client';

import React from 'react';
import { useTheme } from '@/lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeSwitcherProps {
  variant?: 'button' | 'switch' | 'cards';
  className?: string;
}

export function ThemeSwitcher({ variant = 'button', className = '' }: ThemeSwitcherProps) {
  const { theme, toggleTheme, setTheme } = useTheme();

  if (variant === 'cards') {
    return (
      <div className={`grid grid-cols-2 gap-4 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`p-4 rounded-xl border text-left transition flex flex-col items-start gap-2.5 ${
            theme === 'light'
              ? 'border-[#2563EB] bg-[#EFF6FF] text-[#0F172A] shadow-sm ring-2 ring-[#2563EB]/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F2036] text-slate-700 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm">Day-mode</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Yorug&apos; interfeys</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`p-4 rounded-xl border text-left transition flex flex-col items-start gap-2.5 ${
            theme === 'dark'
              ? 'border-[#3B82F6] bg-[#162B45] text-[#F1F5F9] shadow-sm ring-2 ring-[#3B82F6]/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F2036] text-slate-700 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-900/60 text-indigo-300 flex items-center justify-center">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm">Night-mode</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Tungi quyuq interfeys</div>
          </div>
        </button>
      </div>
    );
  }

  // Default compact button / toggle
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition border border-transparent dark:border-slate-700/60 ${className}`}
      title={theme === 'light' ? 'Tungi rejimga o‘tish' : 'Kunduzgi rejimga o‘tish'}
      aria-label="Rejimni almashtirish"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-slate-700" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
}
