
import React from 'react';
import { Icons } from './Icon';
import { AppStrings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
  onSettings?: () => void;
  title?: string;
  showBack?: boolean;
  isChat?: boolean;
  strings: AppStrings;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onBack, 
  onSettings, 
  title,
  showBack,
  isChat = false,
  strings
}) => {
  return (
    // Direction is handled by document.documentElement.dir set in App.tsx
    // Outer container: Full viewport height
    <div className="h-[100dvh] w-full bg-gray-50 font-sans text-slate-900 flex flex-col overflow-hidden">
      
      {/* Header - Fixed Height */}
      <header className="flex-none bg-slate-900 text-white shadow-lg z-50 border-b-4 border-amber-400 pt-safe">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && onBack ? (
              <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-700 rounded-full transition-colors text-amber-400"
                aria-label={strings.back}
              >
                <Icons.Back className="w-6 h-6 transform rtl:rotate-180" /> {/* Rotate only for RTL */}
              </button>
            ) : (
              <div className="w-10" /> 
            )}
            <h1 className="text-xl font-bold flex-1 text-center text-white truncate px-2">
              {title || strings.appName}
            </h1>
          </div>
          
          {onSettings ? (
            <button 
              onClick={onSettings}
              className="p-2 hover:bg-slate-700 rounded-full transition-colors text-white"
              aria-label={strings.settings}
            >
              <Icons.Settings className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </header>

      {/* Main Content */}
      <main 
        className={`flex-1 w-full max-w-md mx-auto flex flex-col relative ${
          isChat 
            ? 'overflow-hidden p-4 pb-safe' 
            : 'overflow-y-auto p-4 pb-safe scroll-smooth'
        }`}
      >
        {children}
      </main>

      {/* Future Ad Space (50px fixed) */}
      <div className="h-[50px] w-full bg-transparent flex-none z-10" />
    </div>
  );
};
