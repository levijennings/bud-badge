import React, { useState } from 'react';
import { ModuleCard, ModuleCardProps } from './ModuleCard';

interface ModuleListProps {
  modules: ModuleCardProps[];
  categories?: string[];
  onModulePress: (moduleId: string) => void;
  loading?: boolean;
  className?: string;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  modules,
  categories,
  onModulePress,
  loading = false,
  className,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Extract unique categories if not provided
  const uniqueCategories = categories || Array.from(new Set(modules.map((m) => m.category)));

  // Filter modules by selected category
  const filteredModules = activeCategory
    ? modules.filter((m) => m.category === activeCategory)
    : modules;

  return (
    <div className={className}>
      {/* Category Filter Tabs */}
      {uniqueCategories.length > 1 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`
              px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap
              transition-colors duration-200 flex-shrink-0
              ${activeCategory === null
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            All
          </button>

          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap
                transition-colors duration-200 flex-shrink-0
                ${activeCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModules.map((module) => (
          <ModuleCard
            key={module.id}
            {...module}
            onPress={onModulePress}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">No modules found in this category</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-64 animate-pulse"
            />
          ))}
        </div>
      )}
    </div>
  );
};

ModuleList.displayName = 'ModuleList';
