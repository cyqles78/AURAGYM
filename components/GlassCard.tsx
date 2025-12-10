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
        matte-card rounded-[20px] p-5
        transition-transform duration-200 ease-out
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
        ${className}
      `}
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        ...style
      }}
    >
      {children}
    </div>
  );
};