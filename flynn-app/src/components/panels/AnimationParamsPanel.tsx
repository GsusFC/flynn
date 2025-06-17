'use client';

import { useConfigStore } from '@/store/configStore';
import { getAnimation } from '@/animations/registry';
import { SliderWithInput } from '@/components/features/vector-grid/components/SliderWithInput';
import type { SliderControlDef, ButtonControlDef, ControlDef } from '@/animations/types';
import type { SimpleVectorGridRef } from '@/components/features/vector-grid/simple/simpleTypes';
import React from 'react';

interface AnimationParamsPanelProps {
  gridRef?: React.RefObject<SimpleVectorGridRef>;
}

export const AnimationParamsPanel: React.FC<AnimationParamsPanelProps> = ({ gridRef }) => {
    const animationId = useConfigStore(state => state.animation);
    const setConfig = useConfigStore(state => state.setConfig);
    const config = useConfigStore(state => state);

    const animationMeta = getAnimation(animationId);

    if (!animationMeta || !animationMeta.controls || animationMeta.controls.length === 0) {
        return (
            <div className="pt-2 text-sm text-muted-foreground">
                No hay parámetros configurables para esta animación.
            </div>
        );
    }

    const handleSliderChange = (controlId: string, value: number) => {
        setConfig(prev => ({
            ...prev,
            [controlId]: value
        }));
    };

    const handleButtonClick = (control: ButtonControlDef) => {
        if (control.id === 'triggerPulse') {
            const now = Date.now();
            setConfig({ pulseState: { active: true, startMs: now } });
            setTimeout(() => {
                setConfig(state => ({ pulseState: { active: false, startMs: state.pulseState?.startMs || now } }));
            }, 2000);
        }
    };

    const renderControl = (control: ControlDef) => {
        if (control.type === 'slider') {
            const sliderControl = control as SliderControlDef;
            return (
                <SliderWithInput
                    key={sliderControl.id}
                    label={sliderControl.label}
                    value={config[sliderControl.id] ?? sliderControl.defaultValue}
                    min={sliderControl.min}
                    max={sliderControl.max}
                    step={sliderControl.step}
                    onChange={(value: number) => handleSliderChange(sliderControl.id, value)}
                    showInput
                />
            );
        }
        if (control.type === 'button') {
            const btn = control as ButtonControlDef;
            return (
                <button
                  key={btn.id}
                  className="w-full h-8 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={() => handleButtonClick(btn)}
                >
                  {btn.label}
                </button>
            );
        }
        return null;
    };

    return (
        <div className="grid gap-4 pt-2">
            {animationMeta.controls.map(renderControl)}
        </div>
    );
}; 