import React from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  sections?: FooterSection[];
  companyName?: string;
  year?: number;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  sections,
  companyName = 'Bud Badge',
  year = new Date().getFullYear(),
  className,
}) => {
  return (
    <footer
      className={`
        bg-gray-900 text-gray-300 border-t border-gray-800
        ${className || ''}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand section */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                B
              </div>
              <p className="font-semibold text-white text-lg">
                Bud Badge
              </p>
            </div>
            <p className="text-sm text-gray-400">
              Training & compliance management for dispensary teams.
            </p>
          </div>

          {/* Link sections */}
          {sections && sections.length > 0 ? (
            sections.map((section, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-white text-sm mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx}>
                      <a
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <>
              <div>
                <h3 className="font-semibold text-white text-sm mb-4">
                  Product
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Security
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white text-sm mb-4">
                  Company
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white text-sm mb-4">
                  Legal
                </h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Compliance
                    </a>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8" />

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 text-center md:text-left">
            &copy; {year} {companyName}. All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
              aria-label="Twitter"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-sm text-gray-400 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
