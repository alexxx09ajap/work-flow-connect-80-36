
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full w-8 h-8 transition-all duration-300 hover:rotate-12 hover:bg-primary/10"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 transition-all duration-300 hover:text-primary" />
      ) : (
        <Sun className="h-4 w-4 transition-all duration-300 hover:text-yellow-400" />
      )}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
};
