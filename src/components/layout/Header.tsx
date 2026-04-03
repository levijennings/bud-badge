import React, { useState } from 'react';
import { Menu, X, ChevronDown, LogOut, Settings } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

interface Organization {
  id: string;
  name: string;
  logo?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  role: 'owner' | 'manager' | 'budtender';
}

interface HeaderProps {
  organizationName: string;
  navLinks: NavLink[];
  user: User;
  organizations?: Organization[];
  activeOrgId?: string;
  onOrgChange?: (orgId: string) => void;
  onLogout?: () => void;
  onSettings?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  organizationName,
  navLinks,
  user,
  organizations = [],
  activeOrgId,
  onOrgChange,
  onLogout,
  onSettings,
  className,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);

  const hasMultipleOrgs = organizations.length > 1;

  return (
    <header
      className={`
        bg-white border-b border-gray-200 sticky top-0 z-40
        ${className || ''}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo and org name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              B
            </div>

            <div className="hidden sm:flex flex-col">
              <p className="text-sm font-semibold text-gray-900">
                Bud Badge
              </p>
              <p className="text-xs text-gray-600">
                {organizationName}
              </p>
            </div>

            {/* Org Switcher */}
            {hasMultipleOrgs && (
              <div className="relative ml-4 hidden sm:block">
                <button
                  onClick={() => setOrgMenuOpen(!orgMenuOpen)}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Switch org
                  <ChevronDown className="w-4 h-4" />
                </button>

                {orgMenuOpen && (
                  <div className="absolute top-10 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-max">
                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => {
                          onOrgChange?.(org.id);
                          setOrgMenuOpen(false);
                        }}
                        className={`
                          block w-full text-left px-4 py-2 text-sm transition-colors
                          ${activeOrgId === org.id
                            ? 'bg-green-50 text-green-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        {org.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center: Navigation links (desktop only) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`
                  text-sm font-medium transition-colors
                  ${link.active
                    ? 'text-green-600 border-b-2 border-green-600 pb-2'
                    : 'text-gray-700 hover:text-gray-900'
                  }
                `}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side: User menu and mobile toggle */}
          <div className="flex items-center gap-4">
            {/* User Menu (Desktop) */}
            <div className="hidden sm:block relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Avatar
                  src={user.avatar}
                  initials={user.initials}
                  alt={user.name}
                  size="sm"
                  role={user.role}
                  showRole={false}
                />
                <div className="hidden lg:flex flex-col items-start">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-12 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-max">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  {onSettings && (
                    <button
                      onClick={() => {
                        onSettings();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={() => {
                        onLogout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`
                    px-3 py-2 rounded-lg font-medium text-sm transition-colors
                    ${link.active
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Mobile User Section */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 px-3 mb-3">
                <Avatar
                  src={user.avatar}
                  initials={user.initials}
                  alt={user.name}
                  size="md"
                  role={user.role}
                  showRole={false}
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              {onSettings && (
                <button
                  onClick={() => {
                    onSettings();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Settings
                </button>
              )}

              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

Header.displayName = 'Header';
