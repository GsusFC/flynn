'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// Hook personalizado para debounce
const useDebouncedCallback = (callback: (value: number) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((value: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(value);
    }, delay);
  }, [callback, delay]);
};

export interface SliderWithInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
  className?: string;
  disabled?: boolean;
  showInput?: boolean;
  inputWidth?: 'sm' | 'md' | 'lg';
}

export const SliderWithInput: React.FC<SliderWithInputProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = '',
  className = '',
  disabled = false,
  showInput = true,
  inputWidth = 'sm'
}) => {
  // Estado local para el input (permite edición temporal)
  const [inputValue, setInputValue] = useState(value.toString());
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Sincronizar input con prop value cuando no está enfocado
  useEffect(() => {
    if (!isInputFocused) {
      setInputValue(value.toString());
      setHasError(false);
    }
  }, [value, isInputFocused]);

  // Validar y aplicar valor con debounce
  const debouncedOnChange = useDebouncedCallback((newValue: number) => {
    onChange(newValue);
  }, 300);

  // Validar valor
  const validateValue = useCallback((val: string): { isValid: boolean; value: number } => {
    const num = parseFloat(val);
    
    if (isNaN(num)) {
      return { isValid: false, value: 0 };
    }
    
    if (num < min || num > max) {
      return { isValid: false, value: Math.max(min, Math.min(max, num)) };
    }
    
    return { isValid: true, value: num };
  }, [min, max]);

  // Manejar cambio en slider
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  }, [onChange]);

  // Manejar cambio en input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const validation = validateValue(newValue);
    setHasError(!validation.isValid);
    
    if (validation.isValid) {
      debouncedOnChange(validation.value);
    }
  }, [validateValue, debouncedOnChange]);

  // Manejar focus del input
  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  // Manejar blur del input
  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);
    
    const validation = validateValue(inputValue);
    
    if (!validation.isValid) {
      // Corregir valor automáticamente
      const correctedValue = validation.value || value;
      setInputValue(correctedValue.toString());
      setHasError(false);
      onChange(correctedValue);
    }
  }, [inputValue, validateValue, value, onChange]);

  // Manejar teclas especiales
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      setHasError(false);
      e.currentTarget.blur();
    }
  }, [value]);

  // Clases CSS para el input según el tamaño
  const inputWidthClasses = {
    sm: 'w-14',
    md: 'w-16',
    lg: 'w-20'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label arriba - sin valor duplicado */}
      <label className="block text-xs font-medium text-sidebar-foreground">
        {label}
      </label>

      {/* Slider a la izquierda + Input a la derecha en la misma línea */}
      <div className="flex items-center gap-2">
        {/* Slider ocupa la mayor parte del espacio */}
        <div className="flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            disabled={disabled}
            className={`
              w-full h-2 bg-sidebar rounded-lg appearance-none cursor-pointer 
              accent-sidebar-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-1
            `}
          />
        </div>

        {/* Input compacto a la derecha */}
        {showInput && (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              disabled={disabled}
              className={`
                ${inputWidthClasses[inputWidth]}
                px-2 py-1 text-xs text-center
                bg-sidebar border border-sidebar-border rounded
                text-sidebar-foreground
                focus:ring-2 focus:ring-sidebar-ring focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                ${hasError 
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                  : 'hover:border-sidebar-border/80'
                }
              `}
              title={hasError ? `Valor debe estar entre ${min} y ${max}` : ''}
            />
            {suffix && (
              <span className="text-xs text-sidebar-foreground/70 whitespace-nowrap">
                {suffix}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {hasError && (
        <div className="text-xs text-red-500 dark:text-red-400">
          Valor debe estar entre {min} y {max}
        </div>
      )}
    </div>
  );
};

export default SliderWithInput;
