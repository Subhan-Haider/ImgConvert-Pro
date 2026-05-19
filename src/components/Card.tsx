import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps { children: ReactNode; className?: string; glow?: boolean; onClick?: () => void; }

export function Card({ children, className, glow, onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        'glass rounded-2xl p-6 transition-all duration-300',
        glow && 'hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-500/10',
        className,
      )}
    >
      {children}
    </div>
  );
}
