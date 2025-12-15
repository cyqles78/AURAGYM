import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  accent?: boolean;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, accent = false, style }) => {
  return (
    <div
      onClick={onClick}
      className={`
        matte-card rounded-[16px] p-4
        transition-all duration-150 ease-out
        ${onClick ? 'cursor-pointer active:scale-[0.98] active:opacity-90' : ''}
        ${className}
      `}
      style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        ...style
      }}
    >
      {children}
    </div>
  );
};