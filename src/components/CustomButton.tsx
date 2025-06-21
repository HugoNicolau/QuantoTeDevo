
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className,
  ...props 
}) => {
  const baseClasses = "px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-md",
    secondary: "bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-500 border border-slate-300"
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default CustomButton;
