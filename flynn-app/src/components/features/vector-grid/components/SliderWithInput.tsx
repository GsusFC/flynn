'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';

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
  className,
  disabled = false,
  showInput = true,
  inputWidth = 'md',
}) => {
  const safeValue = value ?? min;
  const [inputValue, setInputValue] = useState(safeValue.toString());
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [hasError, setHasError] = useState(false);
  const debouncedOnChange = useDebouncedCallback(onChange, 300);

  useEffect(() => {
    if (!isInputFocused) {
      setInputValue(safeValue.toString());
      setHasError(false);
    }
  }, [safeValue, isInputFocused]);
  
  const validateValue = useCallback((val: string): { isValid: boolean; value: number } => {
    const num = parseFloat(val);
    if (isNaN(num)) return { isValid: false, value: 0 };
    if (num < min || num > max) return { isValid: false, value: Math.max(min, Math.min(max, num)) };
    return { isValid: true, value: num };
  }, [min, max]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setInputValue(e.target.value);
    onChange(newValue);
  }, [onChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    const validation = validateValue(newValue);
    setHasError(!validation.isValid);
    if (validation.isValid) {
      debouncedOnChange(validation.value);
    }
  }, [validateValue, debouncedOnChange]);

  const handleInputFocus = useCallback(() => setIsInputFocused(true), []);

  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);
    const validation = validateValue(inputValue);
    if (!validation.isValid) {
      const correctedValue = validation.value || safeValue;
      setInputValue(correctedValue.toString());
      setHasError(false);
      onChange(correctedValue);
    }
  }, [inputValue, validateValue, safeValue, onChange]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
    else if (e.key === 'Escape') {
      setInputValue(safeValue.toString());
      setHasError(false);
      e.currentTarget.blur();
    }
  }, [safeValue]);

  const inputWidthClasses = { sm: 'w-16', md: 'w-20', lg: 'w-24' };

  return (
    <div className={cn('flex w-full items-center justify-between gap-4', className)}>
      <label htmlFor={label} className="text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
        {label}
      </label>
      <div className="flex w-full items-center gap-2">
        <input
          id={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={handleSliderChange}
          disabled={disabled}
          className={cn(
            'h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary', // Pista visible
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary'
          )}
        />
        {showInput && (
          <div className="flex items-center">
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
              className={cn(
                'h-8 text-center text-sm',
                'rounded-md border border-input bg-transparent shadow-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50',
                hasError ? 'border-destructive' : '',
                inputWidthClasses[inputWidth]
              )}
              title={hasError ? `El valor debe estar entre ${min} y ${max}` : ''}
            />
            {suffix && <span className="pl-2 text-sm text-muted-foreground">{suffix}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SliderWithInput;
