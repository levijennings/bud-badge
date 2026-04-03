import React, { ImgHTMLAttributes } from 'react';

type UserRole = 'owner' | 'manager' | 'budtender';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
  initials?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  role?: UserRole;
  showRole?: boolean;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({
    src,
    initials,
    alt,
    size = 'md',
    role,
    showRole = true,
    className,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };

    const initialsTextSize = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    };

    const roleDotClasses = {
      owner: 'bg-green-500',
      manager: 'bg-blue-500',
      budtender: 'bg-gray-400',
    };

    const dotSizeClasses = {
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-3.5 h-3.5',
    };

    return (
      <div
        ref={ref}
        className="relative inline-flex"
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className={`
              ${sizeClasses[size]} rounded-full object-cover
              border-2 border-gray-200 flex-shrink-0
              ${className || ''}
            `}
          />
        ) : (
          <div
            className={`
              ${sizeClasses[size]} rounded-full bg-green-500 flex items-center justify-center
              border-2 border-green-300 flex-shrink-0 text-white font-semibold
              ${initialsTextSize[size]}
              ${className || ''}
            `}
          >
            {initials || '?'}
          </div>
        )}

        {showRole && role && (
          <div
            className={`
              absolute bottom-0 right-0 rounded-full border-2 border-white
              ${roleDotClasses[role]}
              ${dotSizeClasses[size]}
            `}
            title={`Role: ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            aria-label={`User role: ${role}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    initials?: string;
    alt: string;
    role?: UserRole;
  }>;
  size?: 'sm' | 'md' | 'lg';
  max?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  size = 'md',
  max = 5,
}) => {
  const displayed = avatars.slice(0, max);
  const remaining = Math.max(0, avatars.length - max);

  return (
    <div className="flex -space-x-2">
      {displayed.map((avatar, idx) => (
        <Avatar
          key={idx}
          src={avatar.src}
          initials={avatar.initials}
          alt={avatar.alt}
          size={size}
          role={avatar.role}
          showRole={false}
          className="ring-2 ring-white"
        />
      ))}

      {remaining > 0 && (
        <div
          className={`
            flex items-center justify-center rounded-full bg-gray-300 text-white
            font-semibold text-xs ring-2 ring-white flex-shrink-0
            ${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-10 h-10' : 'w-12 h-12'}
          `}
          title={`${remaining} more team members`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

AvatarGroup.displayName = 'AvatarGroup';
