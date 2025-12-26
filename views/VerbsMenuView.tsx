import React from 'react';
import { Icons } from '../components/Icon';
import { CATEGORIES, AppStrings } from '../types';

interface VerbsMenuViewProps {
  verb: string;
  onSelect: (category: string, subcategory: string) => void;
  onShowMeanings: () => void;
  strings: AppStrings;
}

export const VerbsMenuView: React.FC<VerbsMenuViewProps> = ({ verb, onSelect, onShowMeanings, strings }) => {
  const renderSubButtons = (
    title: string, 
    category: string, 
    items: { key: string; label: string }[],
    icon: React.ReactNode
  ) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-3">
        {icon}
        <h3 className="font-bold text-slate-800">{title}</h3>
      </div>
      <div className="p-2 grid grid-cols-2 gap-2">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(category, item.label)}
            className="p-3 text-sm rounded-xl hover:bg-red-50 text-slate-700 hover:text-red-700 transition-colors text-center border border-transparent hover:border-red-100"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Verb Header Card */}
      <div className="bg-slate-900 p-4 rounded-xl border-l-4 border-amber-400 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
           <span className="text-2xl font-bold text-white font-mono tracking-wide">{verb}</span>
        </div>
        
        <button 
          onClick={onShowMeanings}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 px-3 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <Icons.Book className="w-4 h-4" />
          <span>{strings.showMeanings}</span>
        </button>
      </div>

      {renderSubButtons(
        strings.tenses, 
        CATEGORIES.TENSES, 
        Object.values(strings.categories.tenses).map((l: string) => ({ key: l, label: l })),
        <Icons.List className="w-5 h-5 text-red-600" />
      )}

      {renderSubButtons(
        strings.forms, 
        CATEGORIES.FORMS, 
        Object.values(strings.categories.forms).map((l: string) => ({ key: l, label: l })),
        <Icons.Noun className="w-5 h-5 text-amber-600" />
      )}

      {renderSubButtons(
        strings.passive, 
        CATEGORIES.PASSIVE, 
        Object.values(strings.categories.passive).map((l: string) => ({ key: l, label: l })),
        <Icons.Settings className="w-5 h-5 text-slate-600" />
      )}
    </div>
  );
};