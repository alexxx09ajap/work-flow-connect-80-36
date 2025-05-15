
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Only show the theme toggle after component mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };
  
  if (!mounted) return null;

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={handleToggle}
      className={`
        rounded-full w-8 h-8 bg-background transition-all duration-300
        ${isAnimating ? 'animate-pulse' : ''}
        hover:shadow-md hover:border-primary/50
      `}
      title={theme === 'light' ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
    >
      <div className="relative w-4 h-4">
        {theme === 'light' ? (
          <Moon className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${isAnimating ? 'animate-spin' : ''}`} />
        ) : (
          <Sun className={`absolute inset-0 h-4 w-4 transition-all duration-300 ${isAnimating ? 'animate-spin' : ''}`} />
        )}
      </div>
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
};
