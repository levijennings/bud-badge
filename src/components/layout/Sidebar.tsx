import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarLink {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  badge?: string | number;
}

interface SidebarSection {
  title?: string;
  links: SidebarLink[];
}

interface SidebarProps {
  sections: SidebarSection[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  collapsed = false,
  onCollapsedChange,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  return (
    <aside
      className={`
        bg-gray-50 border-r border-gray-200 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'} relative flex flex-col
        ${className || ''}
      `}
    >
      {/* Collapse Button */}
      <button
        onClick={handleCollapse}
        className="absolute -right-3 top-6 z-20 p-1 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className={sectionIdx > 0 ? 'mt-8' : ''}>
            {section.title && !isCollapsed && (
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {section.title}
              </h3>
            )}

            <div className="space-y-2">
              {section.links.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg
                    font-medium text-sm transition-colors relative
                    ${link.active
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-200'
                    }
                  `}
                  title={isCollapsed ? link.label : undefined}
                >
                  <div className="w-5 h-5 flex-shrink-0">
                    {link.icon}
                  </div>

                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{link.label}</span>

                      {link.badge && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full flex-shrink-0">
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}

                  {isCollapsed && link.badge && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer info - Optional */}
      {!isCollapsed && (
        <div className="border-t border-gray-200 px-4 py-4">
          <p className="text-xs text-gray-500 text-center">
            v1.0.0
          </p>
        </div>
      )}
    </aside>
  );
};

Sidebar.displayName = 'Sidebar';
