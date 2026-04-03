import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  closeOnEscape = true,
  closeOnBackdropClick = true,
}) => {
  React.useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={closeOnBackdropClick ? onClose : undefined}
        role="presentation"
      />

      <div
        className={`
          relative bg-white rounded-lg shadow-lg
          max-h-[90vh] overflow-y-auto
          ${sizeClasses[size]} w-full
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';

interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => (
  <div className={`px-6 py-4 ${className || ''}`}>
    {children}
  </div>
);

ModalBody.displayName = 'ModalBody';

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => (
  <div
    className={`
      px-6 py-4 border-t border-gray-200 bg-gray-50
      flex justify-end gap-3
      ${className || ''}
    `}
  >
    {children}
  </div>
);

ModalFooter.displayName = 'ModalFooter';
