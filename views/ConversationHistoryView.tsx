
import React from 'react';
import { Icons } from '../components/Icon';
import { AppStrings, SavedConversationMetadata } from '../types';

interface ConversationHistoryViewProps {
  history: SavedConversationMetadata[];
  strings: AppStrings;
  isAustrian: boolean; // Prop to filter history
  onSelect: (meta: SavedConversationMetadata) => void;
}

export const ConversationHistoryView: React.FC<ConversationHistoryViewProps> = ({ 
  history, 
  strings, 
  isAustrian,
  onSelect 
}) => {
  
  // Filter history based on mode
  const filteredHistory = history.filter(item => {
    // If we are in Austrian mode, show items where isAustrian is true
    // If we are in Standard mode, show items where isAustrian is false or undefined (legacy)
    if (isAustrian) {
      return item.isAustrian === true;
    } else {
      return !item.isAustrian;
    }
  });

  if (filteredHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
          <Icons.Time className="w-10 h-10" />
        </div>
        <p className="text-gray-500 font-medium">{strings.convNoHistory}</p>
        <p className="text-xs text-gray-400 mt-2">
          {isAustrian ? "Showing Austrian History" : "Showing Standard History"}
        </p>
      </div>
    );
  }

  // Sort by date desc
  const sortedHistory = [...filteredHistory].sort((a, b) => b.timestamp - a.timestamp);

  const getLevelColor = (level: string) => {
    switch (level) {
        case 'A1': return 'bg-green-100 text-green-800';
        case 'A2': return 'bg-teal-100 text-teal-800';
        case 'B1': return 'bg-sky-100 text-sky-800';
        case 'B2': return 'bg-blue-100 text-blue-800';
        case 'C1': return 'bg-indigo-100 text-indigo-800';
        case 'C2': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-10">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold text-slate-900">{strings.convHistory}</h2>
        {isAustrian && (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
            🇦🇹 Austrian Mode
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {sortedHistory.map((item) => (
          <button
            key={item.timestamp}
            onClick={() => onSelect(item)}
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-center justify-between text-start group"
          >
            <div className="flex flex-col gap-1">
               <div className="flex items-center gap-2">
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getLevelColor(item.level)}`}>
                   {item.level}
                 </span>
                 <span className="text-xs text-gray-400">
                   {new Date(item.timestamp).toLocaleDateString()}
                 </span>
               </div>
               <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{item.topic}</h3>
            </div>
            <Icons.Back className="w-5 h-5 text-gray-300 transform rotate-180 group-hover:text-emerald-500 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
