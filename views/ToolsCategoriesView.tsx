import React from 'react';
import { Icons } from '../components/Icon';
import { TOOL_CATEGORIES } from '../constants';
import { AppStrings } from '../types';

interface ToolsCategoriesViewProps {
  onSelectCategory: (id: string, name: string) => void;
  strings: AppStrings;
}

export const ToolsCategoriesView: React.FC<ToolsCategoriesViewProps> = ({ onSelectCategory, strings }) => {
  
  const getIcon = (name: string) => {
    switch (name) {
      case 'MapPin': return <Icons.Place className="w-6 h-6" />;
      case 'List': return <Icons.List className="w-6 h-6" />;
      case 'Clock': return <Icons.Time className="w-6 h-6" />;
      case 'Particle': return <Icons.Particle className="w-6 h-6" />;
      case 'Noun': return <Icons.Noun className="w-6 h-6" />;
      case 'Check': return <Icons.Check className="w-6 h-6" />;
      default: return <Icons.Tools className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in pb-8">
      <div className="bg-teal-900 text-white p-6 rounded-2xl shadow-lg mb-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
        <h2 className="text-2xl font-bold">{strings.toolsCategories}</h2>
        <p className="text-teal-200 text-sm mt-1">{strings.toolsDesc}</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {TOOL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id, strings.toolCategories[cat.descKey] || cat.id)}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all flex items-center gap-4 group text-start"
          >
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0">
              {getIcon(cat.icon)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-lg">{strings.toolCategories[cat.descKey] || cat.id}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};