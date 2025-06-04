import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  coverImage?: string;
  coverContent?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  coverImage,
  coverContent,
  footer,
  onClick
}: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white shadow-xl rounded-lg overflow-hidden dark:border-gray-800 dark:bg-white/[0.03] ${onClick ? 'cursor-pointer hover:shadow-2xl transition-shadow' : ''} ${className}`}
    >
      {coverImage && (
        <div 
          className="bg-cover bg-center h-56 p-4" 
          style={{ backgroundImage: `url(${coverImage})` }}
        >
          {coverContent}
        </div>
      )}
      
      <div className="p-4 text-gray-800 dark:text-white/90">
        {children}
      </div>

      {footer && (
        <div className="px-4 pt-3 pb-4 border-t border-gray-300 bg-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
}
