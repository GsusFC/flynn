import { useEffect } from 'react';

interface UseKeyboardControlsProps {
  onTogglePause: () => void;
  onTriggerPulse: () => void;
  isPaused: boolean;
}

export const useKeyboardControls = ({ 
  onTogglePause, 
  onTriggerPulse, 
  isPaused 
}: UseKeyboardControlsProps) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Evitar activar si el usuario está escribiendo en un input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault(); // Evitar scroll de página
          onTogglePause();
          break;
        case 'KeyP':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onTriggerPulse();
          }
          break;
      }
    };

    // Agregar listener global
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onTogglePause, onTriggerPulse]);

  return {
    // Retornamos información útil sobre los controles
    shortcuts: {
      pause: 'Espacio',
      pulse: 'Ctrl/Cmd + P'
    },
    isPaused
  };
};
